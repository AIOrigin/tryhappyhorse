import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const siteOrigin = 'https://tryhappyhorse.xyz';
const contentRoot = path.join(process.cwd(), 'src/content/pages');
const outputRoot = path.join(process.cwd(), 'out');

async function listContentFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listContentFiles(entryPath);
      return /\.mdx?$/i.test(entry.name) ? [entryPath] : [];
    }),
  );
  return files.flat().sort();
}

async function getRoutes() {
  const filePaths = await listContentFiles(contentRoot);
  const routes = [];

  for (const filePath of filePaths) {
    const source = await readFile(filePath, 'utf8');
    const { data } = matter(source);

    if (typeof data.canonical_path !== 'string') {
      throw new Error(`Missing canonical_path in ${filePath}`);
    }

    const isHomepage = data.route?.is_homepage === true;
    const trendScore = typeof data.trend_score === 'number' ? data.trend_score : 50;

    routes.push({
      path: data.canonical_path,
      lastmod: data.last_updated_at || new Date().toISOString().split('T')[0],
      changefreq: isHomepage ? 'daily' : 'weekly',
      priority: isHomepage ? '1.0' : trendScore >= 90 ? '0.9' : '0.7',
    });
  }

  routes.push({
    path: '/privacy-compliance/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.3',
  });

  const seen = new Set();
  return routes.filter((r) => {
    if (seen.has(r.path)) return false;
    seen.add(r.path);
    return true;
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function buildUrlset(routes) {
  const entries = routes.map(
    (r) =>
      `<url>\n<loc>${siteOrigin}${r.path}</loc>\n<lastmod>${r.lastmod}T00:00:00.000Z</lastmod>\n<changefreq>${r.changefreq}</changefreq>\n<priority>${r.priority}</priority>\n</url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

const routes = await getRoutes();
const sitemap = buildUrlset(routes);

await writeFile(path.join(outputRoot, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(outputRoot, 'sitemap-0.xml'), sitemap, 'utf8');
