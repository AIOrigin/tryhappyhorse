import type { ReactNode } from 'react';

type ProseAccordionProps = {
  heading: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function ProseAccordion({ heading, children, defaultOpen = false }: ProseAccordionProps) {
  return (
    <details className="prose-accordion" open={defaultOpen || undefined}>
      <summary className="prose-accordion__trigger">
        <h2 className="prose-accordion__heading">{heading}</h2>
        <span className="prose-accordion__icon" aria-hidden="true" />
      </summary>
      <div className="prose-accordion__body">{children}</div>
    </details>
  );
}
