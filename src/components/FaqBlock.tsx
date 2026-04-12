import type { PageEntry } from '@/lib/content-schema';

type FaqBlockProps = {
  items: PageEntry['data']['faq_items'];
};

export function FaqBlock({ items }: FaqBlockProps) {
  return (
    <section className="section-card" aria-labelledby="faq-heading">
      <div className="section-card__header">
        <p className="section-card__eyebrow">FAQ</p>
        <h2 id="faq-heading">Frequently asked questions</h2>
      </div>

      <div className="faq-grid">
        {items.map((item) => (
          <article key={item.question} className="faq-card">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
