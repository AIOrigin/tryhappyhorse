import type { MetadataRoute } from 'next';
import { getAllPages, siteUrl } from '@/lib/content';
import { DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await getAllPages(DEFAULT_LOCALE);
  const baseUrl = siteUrl.toString().replace(/\/$/, '');

  return pages.map((page) => ({
    url: `${baseUrl}${page.data.canonical_path}`,
    lastModified: page.data.last_updated_at,
    changeFrequency: page.data.route.is_homepage ? 'daily' : 'weekly',
    priority: page.data.route.is_homepage ? 1.0 : page.data.trend_score >= 90 ? 0.9 : 0.7,
  }));
}
