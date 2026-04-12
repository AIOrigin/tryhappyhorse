import { tryHappyHorseIntentHandoffs } from '@/lib/page-shell';

const FEATURED_WORKFLOWS = tryHappyHorseIntentHandoffs.slice(0, 4);
const PRIMARY_CTA_HREF = tryHappyHorseIntentHandoffs[0].href;

export function ElserShowcase() {
  return (
    <section className="elser-showcase" aria-labelledby="elser-showcase-heading">
      <div className="elser-showcase__header">
        <p className="section-card__eyebrow">Recommended tool</p>
        <h2 id="elser-showcase-heading">Create AI videos — no waitlist, no setup</h2>
        <p className="elser-showcase__description">
          HappyHorse is generating buzz, but public access is still unclear.
          If you want to start making AI-powered videos right now, Elser.ai offers
          production-ready tools for image animation, anime art, character design, and more.
        </p>
      </div>

      <div className="elser-showcase__grid">
        {FEATURED_WORKFLOWS.map((workflow) => (
          <a
            key={workflow.href}
            className="elser-showcase__card"
            href={workflow.href}
            rel="noreferrer noopener"
            data-cta-telemetry="true"
            data-cta-label={workflow.label}
            data-cta-href={workflow.href}
            data-cta-route="/"
            data-cta-page-type="homepage"
            data-cta-type="try_now"
            data-cta-conversion-target="generation_activation"
          >
            <h3 className="elser-showcase__card-title">{workflow.title}</h3>
            <p className="elser-showcase__card-description">{workflow.description}</p>
            <span className="elser-showcase__card-action">
              {workflow.label} <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </div>

      <div className="elser-showcase__footer">
        <a
          className="button-link"
          href={PRIMARY_CTA_HREF}
          rel="noreferrer noopener"
          data-cta-telemetry="true"
          data-cta-label="Try AI Image Animator"
          data-cta-href={PRIMARY_CTA_HREF}
          data-cta-route="/"
          data-cta-page-type="homepage"
          data-cta-type="try_now"
          data-cta-conversion-target="generation_activation"
        >
          Try AI Image Animator — Free
        </a>
        <p className="elser-showcase__note">
          Powered by Elser.ai. This site is an independent guide — not affiliated with Elser.ai or HappyHorse.
        </p>
      </div>
    </section>
  );
}
