/**
 * Submit site URLs to search engines.
 *
 * Usage:
 *   node scripts/submit-to-search-engines.mjs
 *   node scripts/submit-to-search-engines.mjs --engines=indexnow,baidu
 *   node scripts/submit-to-search-engines.mjs --engines=indexnow --domain=tryhappyhorse.xyz
 *
 * Environment:
 *   BAIDU_PUSH_TOKEN   — Baidu push API token (optional, skip if not set)
 *   INDEXNOW_KEY       — Override IndexNow key (optional, reads from topic config)
 *   SITE_ORIGIN        — Override site origin (optional, reads from topic config)
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const CONTENT_ROOT = path.join(process.cwd(), 'src/content/pages');

const ALL_ENGINES = ['indexnow', 'baidu'];

function parseArgs(argv) {
  const args = { engines: null, domain: '', help: false };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw.startsWith('--engines=')) args.engines = raw.slice(10).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    else if (raw.startsWith('--domain=')) args.domain = raw.slice(9);
    else throw new Error(`Unknown argument: ${raw}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Submit site URLs to search engines.

Usage:
  node scripts/submit-to-search-engines.mjs
  node scripts/submit-to-search-engines.mjs --engines=indexnow,baidu
  node scripts/submit-to-search-engines.mjs --domain=tryhappyhorse.xyz

Options:
  --engines=<list>  Comma-separated: indexnow, baidu (default: all available)
  --domain=<domain> Override domain (default: from SITE_ORIGIN env or topic config)
  --help            Show this help

Environment:
  SITE_ORIGIN        Site origin URL (e.g. https://tryhappyhorse.xyz)
  BAIDU_PUSH_TOKEN   Baidu push API token
  INDEXNOW_KEY       IndexNow verification key
`);
}

function getSiteOrigin(domainOverride) {
  if (domainOverride) return `https://${domainOverride.replace(/^https?:\/\//, '')}`;
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/$/, '');

  // Try loading from topic config (dynamic import would need TS, just use env)
  return 'https://tryhappyhorse.xyz';
}

function getDomain(origin) {
  return new URL(origin).hostname;
}

function getIndexNowKey() {
  return process.env.INDEXNOW_KEY || '34fb6d41c2891656cec8226e0b25c66d';
}

async function getAllUrls(origin) {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const urls = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const source = await readFile(path.join(CONTENT_ROOT, entry.name), 'utf8');
    const { data } = matter(source);
    if (data.canonical_path) urls.push(`${origin}${data.canonical_path}`);
  }

  urls.push(`${origin}/privacy-compliance/`);
  return [...new Set(urls)].sort();
}

// --- Engine implementations ---

async function submitIndexNow(urls, origin) {
  const domain = getDomain(origin);
  const key = getIndexNowKey();

  const payload = {
    host: domain,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList: urls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const ok = res.ok || res.status === 202;
    return {
      engine: 'indexnow',
      covers: ['Bing', 'Yandex', 'Naver', 'Seznam'],
      status: ok ? 'submitted' : 'error',
      httpStatus: res.status,
      urlCount: urls.length,
      message: ok ? 'Batch submitted successfully' : await res.text(),
    };
  } catch (err) {
    return { engine: 'indexnow', status: 'error', message: err.message, urlCount: 0 };
  }
}

async function submitBaidu(urls, origin) {
  const token = process.env.BAIDU_PUSH_TOKEN;
  if (!token) {
    return {
      engine: 'baidu',
      status: 'skipped',
      message: 'BAIDU_PUSH_TOKEN not set. Set it to enable Baidu push.',
      urlCount: 0,
    };
  }

  const domain = getDomain(origin);
  const endpoint = `http://data.zz.baidu.com/urls?site=${domain}&token=${token}`;
  const body = urls.join('\n');

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });

    const result = await res.json().catch(() => ({}));
    const ok = res.ok && result.success > 0;

    return {
      engine: 'baidu',
      status: ok ? 'submitted' : 'error',
      httpStatus: res.status,
      urlCount: result.success || 0,
      remaining: result.remain,
      message: ok ? `${result.success} URLs pushed (${result.remain} remaining today)` : JSON.stringify(result),
    };
  } catch (err) {
    return { engine: 'baidu', status: 'error', message: err.message, urlCount: 0 };
  }
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  const origin = getSiteOrigin(args.domain);
  const engines = args.engines || ALL_ENGINES;
  const urls = await getAllUrls(origin);

  process.stdout.write(`Site: ${origin}\n`);
  process.stdout.write(`URLs: ${urls.length}\n`);
  process.stdout.write(`Engines: ${engines.join(', ')}\n\n`);

  const results = [];

  for (const engine of engines) {
    process.stdout.write(`Submitting to ${engine}...\n`);

    let result;
    switch (engine) {
      case 'indexnow':
        result = await submitIndexNow(urls, origin);
        break;
      case 'baidu':
        result = await submitBaidu(urls, origin);
        break;
      default:
        result = { engine, status: 'unknown', message: `Unknown engine: ${engine}` };
    }

    results.push(result);

    const icon = result.status === 'submitted' ? '✓' : result.status === 'skipped' ? '○' : '✗';
    process.stdout.write(`  ${icon} ${engine}: ${result.status} — ${result.message}\n`);
  }

  process.stdout.write('\n' + JSON.stringify(results, null, 2) + '\n');

  const anySuccess = results.some(r => r.status === 'submitted');
  process.exit(anySuccess ? 0 : 1);
}

await main();
