import type { Metadata } from 'next';
import { StructuredDataScripts } from '@/components/StructuredDataScripts';
import { TelemetryTracker } from '@/components/TelemetryTracker';
import { buildCanonicalUrl, SITE_NAME } from '@/lib/seo';
import { siteUrl } from '@/lib/content';
import { DEFAULT_LOCALE, getOpenGraphLocale, getStructuredDataLanguage } from '@/lib/i18n';
import { getSiteCopy } from '@/lib/site-copy';

const siteCopy = getSiteCopy(DEFAULT_LOCALE);
const canonicalUrl = buildCanonicalUrl(siteUrl, '/privacy-compliance/');
const pageTitle = `${siteCopy.privacyCompliance.title} | ${SITE_NAME}`;
const description =
  'Privacy and compliance baseline for the independent HappyHorse guide, including outbound Elser handoffs, CTA telemetry expectations, and third-party destination framing.';

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: pageTitle,
  headline: siteCopy.privacyCompliance.title,
  description,
  url: canonicalUrl,
  inLanguage: getStructuredDataLanguage(DEFAULT_LOCALE),
  isPartOf: {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: buildCanonicalUrl(siteUrl, '/'),
  },
};

export const metadata: Metadata = {
  title: pageTitle,
  description,
  robots: 'index,follow',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    siteName: SITE_NAME,
    type: 'article',
    title: pageTitle,
    description,
    url: canonicalUrl,
    locale: getOpenGraphLocale(DEFAULT_LOCALE),
  },
  twitter: {
    card: 'summary',
    title: pageTitle,
    description,
  },
};

export default function PrivacyCompliancePage() {
  return (
    <>
      <StructuredDataScripts entries={[pageSchema]} />
      <TelemetryTracker
        pageType="legal"
        factStatus="verified"
        conversionTarget="policy_acknowledgement"
        isHomepage={false}
        isCanonicalAppEntry={false}
      />

      <main className="legal-shell">
        <a className="legal-shell__back-link" href="/try-happyhorse/">
          {siteCopy.privacyCompliance.backToAppLabel}
        </a>

        <section className="legal-card legal-card--hero">
          <p className="legal-card__eyebrow">{siteCopy.privacyCompliance.eyebrow}</p>
          <h1>How this site handles outbound handoffs, basic telemetry, and user expectations</h1>
          <p className="legal-card__lead">
            This site is an independent guide and handoff experience. It is not the official HappyHorse website,
            product, API, or signup portal.
          </p>
        </section>

        <section className="legal-card">
          <h2>Independent and non-official positioning</h2>
          <p>
            tryhappyhorse.xyz is an informational, comparison, and workflow site. It helps visitors understand the
            current HappyHorse topic, compare options, and reach a practical external workflow when they are ready.
            References to HappyHorse are descriptive only and should not be read as an official relationship,
            endorsement, or managed access program.
          </p>
        </section>

        <section className="legal-card">
          <h2>Outbound handoff behavior</h2>
          <p>
            The primary CTAs on this site may send visitors to specific <code>elser.ai</code> pages when the user intent
            is clear. The site keeps the explainer copy, breadcrumbs, FAQs, and related links here for discovery, while
            the practical tool handoff happens on the external destination.
          </p>
        </section>

        <section className="legal-card">
          <h2>Third-party destination expectations</h2>
          <p>
            When you click through to an Elser page, you are leaving this site and moving under the destination’s own
            product, privacy, and account rules. This site does not represent that external product as an official
            HappyHorse property, and it does not claim feature parity or affiliation simply because a handoff exists.
          </p>
        </section>

        <section className="legal-card">
          <h2>Telemetry and event collection expectations</h2>
          <p>
            The site may emit lightweight interaction events such as page context and CTA clicks so we can understand
            which internal page and which outbound handoff people use. This baseline does not promise a full analytics
            inventory, retention window, or third-party processing map beyond the visible event hooks already present in
            the frontend.
          </p>
        </section>

        <section className="legal-card">
          <h2>Internal discovery links and support content</h2>
          <p>
            Breadcrumbs, related links, FAQs, and support pages remain on this site to preserve the explanatory and SEO
            discovery path. Those internal links are not the primary action surface; they exist so visitors can keep
            researching without losing the non-official context.
          </p>
        </section>
      </main>
    </>
  );
}
