import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadataFromSeo } from '@/lib/metadata';
import { renderMdx } from '@/lib/mdx';
import { buildPageShellViewModel } from '@/lib/page-shell';
import { getAllPages, getPageByPath, pathToSlugSegments, siteUrl, slugSegmentsToPath } from '@/lib/content';
import { DEFAULT_LOCALE } from '@/lib/i18n';
import { PageShell } from '@/layouts/PageShell';

type CatchAllPageProps = {
  params: Promise<{ slug: string[] }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await getAllPages(DEFAULT_LOCALE);

  return pages
    .filter((page) => !page.data.route.is_homepage)
    .map((page) => ({
      slug: pathToSlugSegments(page.data.route.path),
    }));
}

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const [{ slug }, allPages] = await Promise.all([params, getAllPages(DEFAULT_LOCALE)]);
  const page = await getPageByPath(slugSegmentsToPath(slug), DEFAULT_LOCALE);

  if (!page || page.data.route.is_homepage) {
    return {};
  }

  const seo = buildPageShellViewModel(page, allPages, siteUrl).seo;
  return buildMetadataFromSeo(seo);
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const [{ slug }, allPages] = await Promise.all([params, getAllPages(DEFAULT_LOCALE)]);
  const page = await getPageByPath(slugSegmentsToPath(slug), DEFAULT_LOCALE);

  if (!page || page.data.route.is_homepage) {
    notFound();
  }

  const [content, viewModel] = await Promise.all([
    renderMdx(page.body),
    Promise.resolve(buildPageShellViewModel(page, allPages, siteUrl)),
  ]);

  return <PageShell page={page} viewModel={viewModel} content={content} />;
}
