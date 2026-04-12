import type { PageEntry } from '@/lib/content-schema';
import { formatLabel } from '@/lib/page-shell';

type KeyFactsGridProps = {
  facts: PageEntry['data']['key_facts'];
  isHomepage?: boolean;
};

export function KeyFactsGrid({ facts, isHomepage = false }: KeyFactsGridProps) {
  return (
    <section
      className={['section-card', 'key-facts-panel', isHomepage ? 'key-facts-panel--homepage' : ''].filter(Boolean).join(' ')}
      aria-labelledby="key-facts-heading"
    >
      <div className="section-card__header">
        <p className="section-card__eyebrow">Key facts</p>
        <h2 id="key-facts-heading">{isHomepage ? 'What you need to know' : 'Quick facts'}</h2>
      </div>

      <div className="key-facts-grid">
        {facts.map((fact) => (
          <article key={`${fact.label}-${fact.status}`} className="key-fact-card">
            <div className="key-fact-card__header">
              <h3>{fact.label}</h3>
              <span className={`status-pill status-pill--${fact.status}`}>{formatLabel(fact.status)}</span>
            </div>
            <p>{fact.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
