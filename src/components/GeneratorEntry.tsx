import { tryHappyHorseIntentHandoffs } from '@/lib/page-shell';

const [primaryHandoff, ...supportingHandoffs] = tryHappyHorseIntentHandoffs;

export function GeneratorEntry() {
  return (
    <section className="section-card generator-entry" id="handoff-entry-note" aria-labelledby="generator-entry-heading">
      <div className="section-card__header">
        <p className="section-card__eyebrow">Recommended tools</p>
        <h2 id="generator-entry-heading">Choose the right AI video tool for your project</h2>
      </div>

      <div className="generator-entry__intro">
        <p className="generator-entry__lede">
          While HappyHorse access details are still being confirmed, you can start creating AI videos today.
          Each tool below is designed for a specific creative workflow — pick the one that matches your goal.
        </p>
      </div>

      <div className="generator-entry__workspace">
        <article className="generator-entry__featured">
          <p className="generator-entry__featured-label">Most popular</p>
          <h3>{primaryHandoff.title}</h3>
          <p>{primaryHandoff.description}</p>
          <a
            className="button-link generator-entry__primary"
            href={primaryHandoff.href}
            rel="noreferrer noopener"
            data-cta-telemetry="true"
            data-cta-label={primaryHandoff.label}
            data-cta-href={primaryHandoff.href}
            data-cta-route="/try-happyhorse/"
            data-cta-page-type="access"
            data-cta-type="try_now"
            data-cta-conversion-target="generation_activation"
          >
            {primaryHandoff.label}
          </a>
          <p className="generator-entry__supporting-copy">
            Powered by Elser.ai — an independent AI creation platform.
          </p>
        </article>

        <div className="generator-entry__intent-grid" aria-label="AI video creation tools">
          {supportingHandoffs.map((handoff) => (
            <article key={handoff.href} className="generator-intent-card">
              <h3>{handoff.title}</h3>
              <p>{handoff.description}</p>
              <a
                className="generator-intent-card__link"
                href={handoff.href}
                rel="noreferrer noopener"
                data-cta-telemetry="true"
                data-cta-label={handoff.label}
                data-cta-href={handoff.href}
                data-cta-route="/try-happyhorse/"
                data-cta-page-type="access"
                data-cta-type="try_now"
                data-cta-conversion-target="generation_activation"
              >
                {handoff.label} →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
