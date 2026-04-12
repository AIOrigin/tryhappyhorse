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

      if (entry.isDirectory()) {
        return listContentFiles(entryPath);
      }

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

    routes.push(data.canonical_path);
  }

  routes.push('/privacy-compliance/');

  return Array.from(new Set(routes)).sort();
}

function buildUrlset(routes) {
  const entries = routes.map((route) => `  <url><loc>${siteOrigin}${route}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function buildSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${siteOrigin}/sitemap-0.xml</loc>\n  </sitemap>\n</sitemapindex>`;
}

const routes = await getRoutes();
const sitemapUrlset = buildUrlset(routes);
const sitemapIndex = buildSitemapIndex();

await writeFile(path.join(outputRoot, 'sitemap-0.xml'), sitemapUrlset, 'utf8');
await writeFile(path.join(outputRoot, 'sitemap.xml'), sitemapIndex, 'utf8');
await writeFile(path.join(outputRoot, 'sitemap-index.xml'), sitemapIndex, 'utf8');
