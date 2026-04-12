import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadataFromSeo } from '@/lib/metadata';
import { renderMdx } from '@/lib/mdx';
import { buildPageShellViewModel } from '@/lib/page-shell';
import { getAllPages, getHomepage, siteUrl } from '@/lib/content';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { PageShell } from '@/layouts/PageShell';

export async function generateMetadata(): Promise<Metadata> {
  const [homepage, allPages] = await Promise.all([getHomepage(DEFAULT_LOCALE), getAllPages(DEFAULT_LOCALE)]);
  const seo = buildPageShellViewModel(homepage, allPages, siteUrl).seo;
  return buildMetadataFromSeo(seo);
}

export default async function HomePage() {
  const [homepage, allPages] = await Promise.all([getHomepage(DEFAULT_LOCALE), getAllPages(DEFAULT_LOCALE)]);

  if (!homepage) {
    notFound();
  }

  const [content, viewModel] = await Promise.all([
    renderMdx(homepage.body),
    Promise.resolve(buildPageShellViewModel(homepage, allPages, siteUrl)),
  ]);

  return <PageShell page={homepage} viewModel={viewModel} content={content} />;
}
