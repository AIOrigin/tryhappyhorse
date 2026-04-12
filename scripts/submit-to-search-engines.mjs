/**
 * Submit all site URLs to search engines via IndexNow and direct APIs.
 *
 * Covers: Bing, Yandex, Naver, Seznam (via IndexNow)
 * Baidu requires manual setup — see instructions at bottom.
 *
 * Usage: node scripts/submit-to-search-engines.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const SITE_ORIGIN = 'https://tryhappyhorse.xyz';
const INDEXNOW_KEY = '34fb6d41c2891656cec8226e0b25c66d';
const CONTENT_ROOT = path.join(process.cwd(), 'src/content/pages');

async function getAllUrls() {
  const entries = await readdir(CONTENT_ROOT, { withFileTypes: true });
  const urls = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const source = await readFile(path.join(CONTENT_ROOT, entry.name), 'utf8');
    const { data } = matter(source);
    if (data.canonical_path) {
      urls.push(`${SITE_ORIGIN}${data.canonical_path}`);
    }
  }

  urls.push(`${SITE_ORIGIN}/privacy-compliance/`);
  return urls.sort();
}

async function submitIndexNow(urls) {
  // IndexNow accepts batch submissions to any of these engines
  // One submission notifies all participating engines
  const endpoint = 'https://api.indexnow.org/indexnow';

  const payload = {
    host: 'tryhappyhorse.xyz',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  process.stdout.write(`Submitting ${urls.length} URLs to IndexNow (Bing + Yandex + Naver + Seznam)...\n`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (response.ok || response.status === 202) {
    process.stdout.write(`IndexNow: ${response.status} — submitted successfully.\n`);
  } else {
    const text = await response.text();
    process.stdout.write(`IndexNow: ${response.status} — ${text}\n`);
  }
}

async function submitBingDirectly(urls) {
  // Bing also has a direct URL submission API (no auth needed for anonymous submit)
  const endpoint = 'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=free';

  // This endpoint requires Bing Webmaster Tools API key for batch
  // Use IndexNow as primary method instead
  process.stdout.write(`Bing: Using IndexNow protocol (covers Bing automatically).\n`);
}

async function main() {
  const urls = await getAllUrls();
  process.stdout.write(`Found ${urls.length} URLs to submit.\n\n`);

  // List all URLs
  urls.forEach((url) => process.stdout.write(`  ${url}\n`));
  process.stdout.write('\n');

  // Submit via IndexNow (covers Bing, Yandex, Naver, Seznam)
  await submitIndexNow(urls);

  process.stdout.write('\n=== Manual steps required ===\n\n');

  process.stdout.write('Baidu (百度):\n');
  process.stdout.write('  1. Register at https://ziyuan.baidu.com/site/\n');
  process.stdout.write('  2. Add site: tryhappyhorse.xyz\n');
  process.stdout.write('  3. Verify ownership (HTML tag or CNAME)\n');
  process.stdout.write(`  4. Submit sitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
  process.stdout.write('  5. Use API push for faster indexing:\n');
  process.stdout.write('     POST http://data.zz.baidu.com/urls?site=tryhappyhorse.xyz&token=YOUR_TOKEN\n\n');

  process.stdout.write('Bing Webmaster Tools (optional, IndexNow already covers Bing):\n');
  process.stdout.write('  1. Go to https://www.bing.com/webmasters/\n');
  process.stdout.write('  2. Add site or import from GSC\n');
  process.stdout.write(`  3. Submit sitemap: ${SITE_ORIGIN}/sitemap.xml\n\n`);

  process.stdout.write('Yandex Webmaster (optional, IndexNow already covers Yandex):\n');
  process.stdout.write('  1. Go to https://webmaster.yandex.com/\n');
  process.stdout.write('  2. Add site and verify\n');
  process.stdout.write(`  3. Submit sitemap: ${SITE_ORIGIN}/sitemap.xml\n\n`);

  process.stdout.write('Done.\n');
}

await main();
