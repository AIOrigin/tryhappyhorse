import { cache } from 'react';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { ZodError } from 'zod';
import { pageFrontmatterSchema, type PageEntry } from './content-schema';
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from './i18n';

const SITE_ORIGIN = 'https://tryhappyhorse.xyz';
const CONTENT_ROOT = path.join(process.cwd(), 'src/content/pages');

export const siteUrl = new URL(SITE_ORIGIN);

function splitFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return {
      data: {},
      content: source,
    };
  }

  const [, frontmatterText] = match;
  const parsed = frontmatterText.trim().length > 0 ? parseYaml(frontmatterText) : {};

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Frontmatter must parse to an object.');
  }

  return {
    data: parsed,
    content: source.slice(match[0].length),
  };
}

async function listContentFiles(directory: string): Promise<string[]> {
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

function toEntryId(filePath: string) {
  return path.relative(CONTENT_ROOT, filePath).replace(/\\/g, '/');
}

function inferLocaleFromEntryId(entryId: string): AppLocale {
  const [topLevelSegment] = entryId.split('/');
  return topLevelSegment && isAppLocale(topLevelSegment) ? topLevelSegment : DEFAULT_LOCALE;
}

function buildLocaleKey(locale: AppLocale, value: string) {
  return `${locale}:${value}`;
}

function validatePageCollection(pages: PageEntry[]) {
  const byLocalizedCanonicalPath = new Map<string, PageEntry>();
  const byLocalizedSlug = new Map<string, PageEntry>();
  const homepageEntriesByLocale = new Map<AppLocale, PageEntry[]>();
  const canonicalAppEntriesByLocale = new Map<AppLocale, PageEntry[]>();
  const pagePathsByLocale = new Map<AppLocale, Set<string>>();

  for (const page of pages) {
    const localizedCanonicalPathKey = buildLocaleKey(page.data.locale, page.data.canonical_path);
    const localizedSlugKey = buildLocaleKey(page.data.locale, page.data.route.slug);

    if (byLocalizedCanonicalPath.has(localizedCanonicalPathKey)) {
      throw new Error(`Duplicate canonical_path detected for locale ${page.data.locale}: ${page.data.canonical_path}`);
    }

    if (byLocalizedSlug.has(localizedSlugKey)) {
      throw new Error(`Duplicate route.slug detected for locale ${page.data.locale}: ${page.data.route.slug}`);
    }

    byLocalizedCanonicalPath.set(localizedCanonicalPathKey, page);
    byLocalizedSlug.set(localizedSlugKey, page);
    pagePathsByLocale.set(page.data.locale, (pagePathsByLocale.get(page.data.locale) ?? new Set<string>()).add(page.data.canonical_path));

    if (page.data.route.is_homepage) {
      homepageEntriesByLocale.set(page.data.locale, [...(homepageEntriesByLocale.get(page.data.locale) ?? []), page]);
    }

    if (page.data.route.is_canonical_app_entry) {
      canonicalAppEntriesByLocale.set(page.data.locale, [...(canonicalAppEntriesByLocale.get(page.data.locale) ?? []), page]);
    }
  }

  const defaultLocaleHomepages = homepageEntriesByLocale.get(DEFAULT_LOCALE) ?? [];
  const defaultLocaleCanonicalAppEntries = canonicalAppEntriesByLocale.get(DEFAULT_LOCALE) ?? [];

  if (defaultLocaleHomepages.length !== 1) {
    throw new Error(`Expected exactly 1 homepage entry for locale ${DEFAULT_LOCALE}, found ${defaultLocaleHomepages.length}.`);
  }

  if (defaultLocaleCanonicalAppEntries.length !== 1) {
    throw new Error(
      `Expected exactly 1 canonical app entry for locale ${DEFAULT_LOCALE}, found ${defaultLocaleCanonicalAppEntries.length}.`,
    );
  }

  for (const [locale, homepageEntries] of homepageEntriesByLocale) {
    if (homepageEntries.length > 1) {
      throw new Error(`Expected at most 1 homepage entry for locale ${locale}, found ${homepageEntries.length}.`);
    }
  }

  for (const [locale, canonicalAppEntries] of canonicalAppEntriesByLocale) {
    if (canonicalAppEntries.length > 1) {
      throw new Error(`Expected at most 1 canonical app entry for locale ${locale}, found ${canonicalAppEntries.length}.`);
    }
  }

  for (const page of pages) {
    const localePaths = pagePathsByLocale.get(page.data.locale) ?? new Set<string>();
    const defaultLocalePaths = pagePathsByLocale.get(DEFAULT_LOCALE) ?? new Set<string>();

    for (const relatedPath of page.data.related_pages) {
      if (!localePaths.has(relatedPath) && !defaultLocalePaths.has(relatedPath)) {
        throw new Error(
          `Page ${page.data.locale}:${page.data.canonical_path} references missing related page ${relatedPath}. Keep related_pages aligned with the route inventory.`,
        );
      }
    }
  }
}

const getAllLocalizedPages = cache(async (): Promise<PageEntry[]> => {
  const filePaths = await listContentFiles(CONTENT_ROOT);

  const pages = await Promise.all(
    filePaths.map(async (filePath) => {
      const entryId = toEntryId(filePath);
      const source = await readFile(filePath, 'utf8');
      const { data, content } = splitFrontmatter(source);

      try {
        return {
          id: entryId,
          filePath,
          body: content,
          data: pageFrontmatterSchema.parse({
            locale: inferLocaleFromEntryId(entryId),
            ...data,
          }),
        } satisfies PageEntry;
      } catch (error) {
        if (error instanceof ZodError) {
          throw new Error(`Invalid frontmatter in ${filePath}: ${error.issues.map((issue) => issue.message).join('; ')}`);
        }

        throw error;
      }
    }),
  );

  validatePageCollection(pages);

  return pages;
});

export const getAllPages = cache(async (locale: AppLocale = DEFAULT_LOCALE): Promise<PageEntry[]> => {
  const pages = await getAllLocalizedPages();
  return pages.filter((entry) => entry.data.locale === locale);
});

export async function getHomepage(locale: AppLocale = DEFAULT_LOCALE) {
  const pages = await getAllPages(locale);
  const homepage = pages.find((entry) => entry.data.route.is_homepage);

  if (!homepage) {
    throw new Error(`Expected a homepage entry in the pages collection for locale ${locale}.`);
  }

  return homepage;
}

export async function getPageByPath(canonicalPath: string, locale: AppLocale = DEFAULT_LOCALE) {
  const pages = await getAllPages(locale);
  return pages.find((entry) => entry.data.canonical_path === canonicalPath);
}

export function pathToSlugSegments(routePath: string) {
  const trimmedPath = routePath.replace(/^\/|\/$/g, '');
  return trimmedPath.length > 0 ? trimmedPath.split('/') : [];
}

export function slugSegmentsToPath(slug?: string[]) {
  return slug && slug.length > 0 ? `/${slug.join('/')}/` : '/';
}

export function getStaticSiteRoutes(pages: PageEntry[]) {
  return ['/', ...pages.filter((page) => !page.data.route.is_homepage).map((page) => page.data.canonical_path), '/privacy-compliance/'];
}
