import type { PageEntry } from './content-schema';
import { getOpenGraphLocale, getStructuredDataLanguage } from './i18n';
import { getSiteCopy } from './site-copy';
import { getTopicConfig } from '@/config/topic-config';

export type BreadcrumbItem = {
  name: string;
  path: string;
  url: string;
};

export type SeoViewModel = {
  title: string;
  description: string;
  robots: string;
  siteName: string;
  openGraphLocale: string;
  themeColor: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType: 'website' | 'article';
  twitterCard: 'summary' | 'summary_large_image';
  twitterTitle: string;
  twitterDescription: string;
  socialImageUrl: string;
  socialImageAlt: string;
  socialImageWidth: number;
  socialImageHeight: number;
  heroImagePath?: string;
  heroImageAlt: string;
  breadcrumbs: BreadcrumbItem[];
  jsonLd: Array<Record<string, unknown>>;
};

export const SITE_NAME = getTopicConfig().siteName;
export const THEME_COLOR = '#0c1224';
export const DEFAULT_SOCIAL_IMAGE_PATH = '/social/default-share.png';
export const DEFAULT_SOCIAL_IMAGE_WIDTH = 1200;
export const DEFAULT_SOCIAL_IMAGE_HEIGHT = 693;

export function buildCanonicalUrl(site: URL, path: string) {
  return new URL(path, site).toString();
}

export function buildBreadcrumbs(page: PageEntry, site: URL): BreadcrumbItem[] {
  const copy = getSiteCopy(page.data.locale);
  const homeCrumb = {
    name: copy.breadcrumbs.homeLabel,
    path: '/',
    url: buildCanonicalUrl(site, '/'),
  };

  if (page.data.route.is_homepage) {
    return [homeCrumb];
  }

  return [
    homeCrumb,
    {
      name: page.data.h1,
      path: page.data.canonical_path,
      url: buildCanonicalUrl(site, page.data.canonical_path),
    },
  ];
}

export function buildSeoViewModel(page: PageEntry, site: URL): SeoViewModel {
  const canonicalUrl = buildCanonicalUrl(site, page.data.canonical_path);
  const breadcrumbs = buildBreadcrumbs(page, site);
  const homepageUrl = buildCanonicalUrl(site, '/');
  const aboutTopics = [...new Set([page.data.topic, page.data.model_name, page.data.competitor_name].filter(Boolean))];
  const openGraphLocale = getOpenGraphLocale(page.data.locale);
  const structuredDataLanguage = getStructuredDataLanguage(page.data.locale);
  const title = page.data.route.is_homepage ? page.data.title : `${page.data.title} | ${SITE_NAME}`;
  const description = page.data.description;
  const robots = 'index,follow';
  const ogType = page.data.route.is_homepage ? 'website' : 'article';
  const socialImagePath = page.data.images?.social_path ?? defaultSocialImagePath(page);
  const socialImageUrl = socialImagePath.startsWith('http') ? socialImagePath : buildCanonicalUrl(site, socialImagePath);
  const socialImageAlt = page.data.images?.alt ?? `${page.data.h1} preview image`;
  const heroImagePath = page.data.images?.hero_path;
  const heroImageAlt = page.data.images?.alt ?? `${page.data.h1} hero image`;
  const twitterCard = 'summary_large_image';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: homepageUrl,
    inLanguage: structuredDataLanguage,
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    headline: page.data.h1,
    description,
    url: canonicalUrl,
    image: socialImageUrl,
    dateModified: page.data.last_updated_at,
    inLanguage: structuredDataLanguage,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: homepageUrl,
    },
    keywords: [page.data.keyword_primary, ...page.data.keyword_secondary].join(', '),
    about: aboutTopics.map((name) => ({
      '@type': 'Thing',
      name,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const faqSchema = page.data.faq_items.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.data.faq_items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  const jsonLd: Array<Record<string, unknown>> = [websiteSchema, webPageSchema, breadcrumbSchema];

  if (faqSchema) {
    jsonLd.push(faqSchema);
  }

  return {
    title,
    description,
    robots,
    siteName: SITE_NAME,
    openGraphLocale,
    themeColor: THEME_COLOR,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogType,
    twitterCard,
    twitterTitle: title,
    twitterDescription: description,
    socialImageUrl,
    socialImageAlt,
    socialImageWidth: DEFAULT_SOCIAL_IMAGE_WIDTH,
    socialImageHeight: DEFAULT_SOCIAL_IMAGE_HEIGHT,
    heroImagePath,
    heroImageAlt,
    breadcrumbs,
    jsonLd,
  };
}

function defaultSocialImagePath(page: PageEntry) {
  if (page.data.route.is_homepage) {
    return '/social/home.png';
  }

  if (page.data.route.slug === 'try-happyhorse') {
    return '/social/try-happyhorse.png';
  }

  if (page.data.route.slug === 'what-is-happyhorse') {
    return '/social/what-is-happyhorse.png';
  }

  if (page.data.route.slug === 'happyhorse-vs-seedance') {
    return '/social/happyhorse-vs-seedance.png';
  }

  return DEFAULT_SOCIAL_IMAGE_PATH;
}
