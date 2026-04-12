import type { PageEntry } from '@/lib/content-schema';
import type { CtaViewModel } from '@/lib/page-shell';

type CtaBlockProps = {
  cta: CtaViewModel;
  page: PageEntry;
};

export function CtaBlock({ cta, page }: CtaBlockProps) {
  return (
    <section className="section-card cta-block cta-block--secondary" id={cta.anchorId} aria-labelledby="cta-heading">
      <div className="section-card__header">
        <p className="section-card__eyebrow">Recommended tool</p>
        <h2 id="cta-heading">Ready to create?</h2>
      </div>

      <p className="cta-block__note">{cta.note}</p>
      <a
        className="button-link button-link--secondary"
        href={cta.href}
        rel={cta.isExternal ? 'noreferrer noopener' : undefined}
        data-cta-telemetry="true"
        data-cta-label={cta.label}
        data-cta-href={cta.href}
        data-cta-route={page.data.canonical_path}
        data-cta-page-type={page.data.page_type}
        data-cta-type={page.data.cta_type}
        data-cta-fact-status={page.data.fact_status}
        data-cta-conversion-target={page.data.conversion_target}
      >
        {cta.label}
      </a>
    </section>
  );
}
