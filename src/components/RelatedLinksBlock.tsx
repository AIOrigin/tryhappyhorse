import type { RelatedPageViewModel } from '@/lib/page-shell';

type RelatedLinksBlockProps = {
  pages: RelatedPageViewModel[];
  isHomepage?: boolean;
};

export function RelatedLinksBlock({ pages, isHomepage = false }: RelatedLinksBlockProps) {
  return (
    <section
      className={['section-card', 'related-links-block', isHomepage ? 'related-links-block--homepage' : ''].filter(Boolean).join(' ')}
      aria-labelledby="related-links-heading"
    >
      <div className="section-card__header">
        <p className="section-card__eyebrow">Related links</p>
        <h2 id="related-links-heading">{isHomepage ? 'Explore more' : 'Related topics'}</h2>
      </div>

      <div className="related-links-grid">
        {pages.map((page) => (
          <a key={page.path} className="related-link-card" href={page.path}>
            <span className="related-link-card__title">{page.title}</span>
            <span className="related-link-card__description">{page.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
