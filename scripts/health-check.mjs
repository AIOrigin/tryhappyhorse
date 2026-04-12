/**
 * Site Health Check — SEO and accessibility validation
 *
 * Usage:
 *   node scripts/health-check.mjs --domain=tryhappyhorse.xyz
 *   node scripts/health-check.mjs --domain=tryhappyhorse.xyz --verbose
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const CONTENT_ROOT = path.join(process.cwd(), 'src/content/pages');

function parseArgs(argv) {
  const args = { domain: '', verbose: false, help: false };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw === '--verbose' || raw === '-v') args.verbose = true;
    else if (raw.startsWith('--domain=')) args.domain = raw.slice(9);
    else throw new Error(`Unknown argument: ${raw}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Site Health Check — SEO and accessibility validation

Usage:
  node scripts/health-check.mjs --domain=tryhappyhorse.xyz
  node scripts/health-check.mjs --domain=tryhappyhorse.xyz --verbose

Options:
  --domain=<domain>  Domain to check (required)
  --verbose          Show details for passing checks too
  --help             Show this help
`);
}

async function getPagePaths() {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const source = await readFile(path.join(CONTENT_ROOT, entry.name), 'utf8');
    const { data } = matter(source);
    if (data.canonical_path) paths.push(data.canonical_path);
  }
  paths.push('/privacy-compliance/');
  return [...new Set(paths)].sort();
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return { url, status: res.status, ok: res.ok, headers: Object.fromEntries(res.headers) };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message };
  }
}

async function checkPage(url) {
  const issues = [];

  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      issues.push({ severity: 'critical', check: 'http_status', message: `HTTP ${res.status}` });
      return issues;
    }

    const html = await res.text();

    // Canonical
    if (!html.includes('rel="canonical"')) {
      issues.push({ severity: 'critical', check: 'canonical', message: 'Missing <link rel="canonical">' });
    }

    // Meta description
    if (!html.includes('name="description"')) {
      issues.push({ severity: 'critical', check: 'meta_description', message: 'Missing meta description' });
    }

    // OG title
    if (!html.includes('og:title')) {
      issues.push({ severity: 'warning', check: 'og_title', message: 'Missing og:title' });
    }

    // OG image
    if (!html.includes('og:image')) {
      issues.push({ severity: 'warning', check: 'og_image', message: 'Missing og:image' });
    }

    // JSON-LD
    if (!html.includes('application/ld+json')) {
      issues.push({ severity: 'warning', check: 'json_ld', message: 'Missing JSON-LD structured data' });
    }

    // Title tag
    if (!html.includes('<title>') && !html.includes('<title ')) {
      issues.push({ severity: 'critical', check: 'title', message: 'Missing <title> tag' });
    }

  } catch (err) {
    issues.push({ severity: 'critical', check: 'fetch', message: err.message });
  }

  return issues;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }
  if (!args.domain) { process.stderr.write('Error: --domain is required.\n'); process.exit(1); }

  const origin = `https://${args.domain.replace(/^https?:\/\//, '')}`;
  const pagePaths = await getPagePaths();

  process.stdout.write(`Health check for ${origin}\n`);
  process.stdout.write(`Checking ${pagePaths.length} pages...\n\n`);

  const report = { domain: args.domain, timestamp: new Date().toISOString(), total: 0, passed: 0, warnings: 0, failed: 0, details: [] };

  // 1. Check sitemap
  process.stdout.write('Checking sitemap.xml...\n');
  const sitemapCheck = await checkUrl(`${origin}/sitemap.xml`);
  if (sitemapCheck.ok) {
    const sitemapBody = await fetch(`${origin}/sitemap.xml`).then(r => r.text());
    const locCount = (sitemapBody.match(/<loc>/g) || []).length;
    const isUrlset = sitemapBody.includes('<urlset');
    if (!isUrlset) {
      report.details.push({ page: 'sitemap.xml', severity: 'warning', message: 'Sitemap is sitemapindex, not direct urlset' });
      report.warnings++;
    } else if (locCount < pagePaths.length) {
      report.details.push({ page: 'sitemap.xml', severity: 'warning', message: `Sitemap has ${locCount} URLs but ${pagePaths.length} pages exist` });
      report.warnings++;
    } else {
      if (args.verbose) process.stdout.write(`  ✓ sitemap.xml: ${locCount} URLs\n`);
      report.passed++;
    }
  } else {
    report.details.push({ page: 'sitemap.xml', severity: 'critical', message: `HTTP ${sitemapCheck.status}: ${sitemapCheck.error || 'not accessible'}` });
    report.failed++;
  }
  report.total++;

  // 2. Check robots.txt
  process.stdout.write('Checking robots.txt...\n');
  const robotsCheck = await checkUrl(`${origin}/robots.txt`);
  if (robotsCheck.ok) {
    const robotsBody = await fetch(`${origin}/robots.txt`).then(r => r.text());
    if (!robotsBody.includes('Sitemap:')) {
      report.details.push({ page: 'robots.txt', severity: 'warning', message: 'Missing Sitemap reference' });
      report.warnings++;
    } else {
      if (args.verbose) process.stdout.write(`  ✓ robots.txt: OK\n`);
      report.passed++;
    }
  } else {
    report.details.push({ page: 'robots.txt', severity: 'warning', message: 'Not accessible' });
    report.warnings++;
  }
  report.total++;

  // 3. Check each page
  process.stdout.write(`Checking ${pagePaths.length} pages...\n`);
  for (const pagePath of pagePaths) {
    const url = `${origin}${pagePath}`;
    const issues = await checkPage(url);
    report.total++;

    if (issues.length === 0) {
      report.passed++;
      if (args.verbose) process.stdout.write(`  ✓ ${pagePath}\n`);
    } else {
      const hasCritical = issues.some(i => i.severity === 'critical');
      if (hasCritical) report.failed++; else report.warnings++;
      for (const issue of issues) {
        report.details.push({ page: pagePath, severity: issue.severity, message: `${issue.check}: ${issue.message}` });
        const icon = issue.severity === 'critical' ? '✗' : '⚠';
        process.stdout.write(`  ${icon} ${pagePath}: ${issue.message}\n`);
      }
    }
  }

  // 4. Summary
  process.stdout.write(`\n${'─'.repeat(50)}\n`);
  process.stdout.write(`Total: ${report.total} checks\n`);
  process.stdout.write(`  Passed:   ${report.passed}\n`);
  process.stdout.write(`  Warnings: ${report.warnings}\n`);
  process.stdout.write(`  Failed:   ${report.failed}\n`);
  process.stdout.write(`${'─'.repeat(50)}\n`);

  if (report.failed > 0) {
    process.stdout.write(`\nResult: FAIL (${report.failed} critical issues)\n`);
  } else if (report.warnings > 0) {
    process.stdout.write(`\nResult: PASS with ${report.warnings} warnings\n`);
  } else {
    process.stdout.write(`\nResult: PASS — all checks clean\n`);
  }

  // Write report
  process.stdout.write('\n' + JSON.stringify(report, null, 2) + '\n');
  process.exit(report.failed > 0 ? 1 : 0);
}

await main();
