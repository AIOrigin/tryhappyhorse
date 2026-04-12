import type { PageEntry } from '@/lib/content-schema';

type FactStatus = PageEntry['data']['fact_status'];

type FactStatusCalloutProps = {
  status: FactStatus;
  note: string;
};

const copyByStatus: Record<
  FactStatus,
  {
    eyebrow: string;
    title: string;
    detail: string;
  }
> = {
  verified: {
    eyebrow: 'Verified signal',
    title: 'This page is grounded in verified public signals',
    detail: 'The copy can stay direct because the core claims on this page are supported by public evidence.',
  },
  mixed: {
    eyebrow: 'Mixed signal',
    title: 'Some facts are supported, but other details remain uncertain',
    detail:
      'Readers should expect careful wording here because public reporting confirms the topic, while some product details still need cautious treatment.',
  },
  unknown: {
    eyebrow: 'Unknown signal',
    title: 'Important official-status details are still unverified',
    detail:
      'This page deliberately avoids pretending there is confirmed official access, source availability, or repository evidence when that proof is missing.',
  },
};

export function FactStatusCallout({ status, note }: FactStatusCalloutProps) {
  const copy = copyByStatus[status];

  return (
    <section className={`fact-status fact-status--${status}`} aria-labelledby="fact-status-heading">
      <p className="fact-status__eyebrow">{copy.eyebrow}</p>
      <h2 id="fact-status-heading">{copy.title}</h2>
      <p>{note}</p>
      <p className="fact-status__detail">{copy.detail}</p>
    </section>
  );
}
