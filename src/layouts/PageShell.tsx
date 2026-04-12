import type { CSSProperties, ReactNode } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CtaBlock } from '@/components/CtaBlock';
import { DisclaimerBlock } from '@/components/DisclaimerBlock';
import { ElserShowcase } from '@/components/ElserShowcase';
import { FactStatusCallout } from '@/components/FactStatusCallout';
import { FaqBlock } from '@/components/FaqBlock';
import { GeneratorEntry } from '@/components/GeneratorEntry';
import { KeyFactsGrid } from '@/components/KeyFactsGrid';
import { LeadMagnet } from '@/components/LeadMagnet';
import { ProseAccordion } from '@/components/ProseAccordion';
import { RelatedLinksBlock } from '@/components/RelatedLinksBlock';
import { StructuredDataScripts } from '@/components/StructuredDataScripts';
import { TelemetryTracker } from '@/components/TelemetryTracker';
import type { PageEntry } from '@/lib/content-schema';
import type { PageShellViewModel } from '@/lib/page-shell';
import { getSiteCopy } from '@/lib/site-copy';

type PageShellProps = {
  page: PageEntry;
  viewModel: PageShellViewModel;
  content: ReactNode;
};

export function PageShell({ page, viewModel, content }: PageShellProps) {
  const copy = getSiteCopy(page.data.locale);
  const isHomepage = page.data.route.is_homepage;
  const isCanonicalAppEntry = page.data.route.is_canonical_app_entry;
  const hasHeroMedia = Boolean(viewModel.seo.heroImagePath);
  const heroCta = isHomepage
    ? { href: viewModel.cta.href, label: 'Try AI Image Animator — Free', isExternal: true }
    : { href: '#lead-magnet', label: 'Get the free guide', isExternal: false };
  const routeDiscoveryPages = [
    { path: '/', title: copy.breadcrumbs.homeLabel },
    ...viewModel.routeDiscoveryPages.map((routePage) => ({ path: routePage.path, title: routePage.title })),
  ];

  const heroMediaStyle = {
    '--hero-media-fit': viewModel.heroMedia.fit,
    '--hero-media-position': viewModel.heroMedia.position,
  } as CSSProperties;

  return (
    <>
      <StructuredDataScripts entries={viewModel.seo.jsonLd} />
      <TelemetryTracker
        pageType={page.data.page_type}
        factStatus={page.data.fact_status}
        conversionTarget={page.data.conversion_target}
        isHomepage={isHomepage}
        isCanonicalAppEntry={isCanonicalAppEntry}
      />

      <div className={['page-shell', isHomepage ? 'page-shell--homepage' : ''].filter(Boolean).join(' ')}>
        <div className="page-shell__backdrop" aria-hidden="true" />

        <main className="page-shell__main">
          <header className="route-discovery-bar">
            <nav className="route-discovery-bar__nav" aria-label="Site navigation">
              {routeDiscoveryPages.map((routePage) => {
                const isCurrentRoute = routePage.path === page.data.canonical_path;

                return (
                  <a
                    key={routePage.path}
                    className={['route-discovery-bar__link', isCurrentRoute ? 'route-discovery-bar__link--current' : ''].filter(Boolean).join(' ')}
                    href={routePage.path}
                    aria-current={isCurrentRoute ? 'page' : undefined}
                  >
                    {routePage.title}
                  </a>
                );
              })}
            </nav>
          </header>

          <Breadcrumbs items={viewModel.seo.breadcrumbs} locale={page.data.locale} />

          <section
            className={[
              'hero-card',
              hasHeroMedia ? 'hero-card--with-media' : '',
              isHomepage ? 'hero-card--homepage' : '',
              isCanonicalAppEntry ? 'hero-card--app-entry' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-labelledby="page-heading"
          >
            <div className={[ 'hero-card__lead', hasHeroMedia ? 'hero-card__lead--with-media' : '' ].filter(Boolean).join(' ')}>
              <div className="hero-card__content">
                <h1 id="page-heading">{page.data.h1}</h1>
                <p className="hero-card__summary">{page.data.answer_summary}</p>

                <div className="hero-card__actions">
                  <a
                    className="button-link button-link--hero"
                    href={heroCta.href}
                    rel={heroCta.isExternal ? 'noreferrer noopener' : undefined}
                    data-cta-telemetry="true"
                    data-cta-label={heroCta.label}
                    data-cta-href={heroCta.href}
                    data-cta-route={page.data.canonical_path}
                    data-cta-page-type={page.data.page_type}
                    data-cta-type={page.data.cta_type}
                    data-cta-fact-status={page.data.fact_status}
                    data-cta-conversion-target={page.data.conversion_target}
                  >
                    {heroCta.label}
                  </a>
                </div>
              </div>

              {hasHeroMedia ? (
                <figure
                  className={['hero-card__media', `hero-card__media--${viewModel.heroMedia.frame}`].join(' ')}
                  style={heroMediaStyle}
                >
                  <img src={viewModel.seo.heroImagePath} alt={viewModel.seo.heroImageAlt} loading="eager" decoding="async" />
                </figure>
              ) : null}
            </div>
          </section>

          {isHomepage ? <ElserShowcase /> : null}

          {isHomepage ? (
            <KeyFactsGrid facts={page.data.key_facts} isHomepage />
          ) : (
            <>
              <KeyFactsGrid facts={page.data.key_facts} />
              {isCanonicalAppEntry ? <GeneratorEntry /> : null}
            </>
          )}

          <LeadMagnet
            headline={copy.leadMagnet.headline}
            description={copy.leadMagnet.description}
            formAction={copy.leadMagnet.formAction}
            buttonLabel={copy.leadMagnet.buttonLabel}
            privacyNote={copy.leadMagnet.privacyNote}
            inputPlaceholder={copy.leadMagnet.inputPlaceholder}
            inputLabel={copy.leadMagnet.inputLabel}
            successMessage={copy.leadMagnet.successMessage}
          />

          <div className={[ 'page-shell__fact-status', isHomepage ? 'page-shell__fact-status--homepage' : '' ].filter(Boolean).join(' ')}>
            <FactStatusCallout status={page.data.fact_status} note={page.data.fact_status_note} />
          </div>

          <ProseAccordion heading={copy.pageShell.contextHeading} defaultOpen={isHomepage}>
            <div className="prose-content">{content}</div>
          </ProseAccordion>

          <FaqBlock items={page.data.faq_items} />

          {!isHomepage ? <CtaBlock cta={viewModel.cta} page={page} /> : null}

          <RelatedLinksBlock pages={viewModel.relatedPages} isHomepage={isHomepage} />
          <DisclaimerBlock text={page.data.disclaimer_text} />

          <footer className="site-footer section-card" aria-label="Site footer">
            <div className="site-footer__copy">
              <p className="section-card__eyebrow">{copy.pageShell.siteBaselineEyebrow}</p>
              <p>{copy.pageShell.siteBaselineDescription}</p>
            </div>

            <nav className="site-footer__nav" aria-label={copy.pageShell.footerLinksAriaLabel}>
              <a href="/privacy-compliance/">{copy.pageShell.privacyComplianceLabel}</a>
            </nav>
          </footer>
        </main>
      </div>
    </>
  );
}
