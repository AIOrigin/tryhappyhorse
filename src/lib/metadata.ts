import type { Metadata } from 'next';
import type { SeoViewModel } from './seo';

export function buildMetadataFromSeo(seo: SeoViewModel): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    robots: seo.robots,
    alternates: {
      canonical: seo.canonicalUrl,
    },
    openGraph: {
      type: seo.ogType,
      siteName: seo.siteName,
      locale: seo.openGraphLocale,
      url: seo.ogUrl,
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [
        {
          url: seo.socialImageUrl,
          alt: seo.socialImageAlt,
        },
      ],
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.twitterTitle,
      description: seo.twitterDescription,
      images: [seo.socialImageUrl],
    },
  };
}
