'use client';

import { type FormEvent, useState } from 'react';

type LeadMagnetProps = {
  headline: string;
  description: string;
  formAction: string;
  buttonLabel: string;
  privacyNote: string;
  inputPlaceholder: string;
  inputLabel: string;
  successMessage: string;
};

export function LeadMagnet({
  headline,
  description,
  formAction,
  buttonLabel,
  privacyNote,
  inputPlaceholder,
  inputLabel,
  successMessage,
}: LeadMagnetProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');

    const form = event.currentTarget;
    const email = new FormData(form).get('email') as string;

    try {
      const response = await fetch(formAction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: window.location.pathname }),
        mode: 'no-cors',
      });

      // Google Apps Script with no-cors returns opaque response, treat as success
      if (response.type === 'opaque' || response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      // no-cors fetch may throw on some browsers, still likely succeeded
      setStatus('success');
    }
  }

  return (
    <section className="lead-magnet" id="lead-magnet" aria-labelledby="lead-magnet-heading">
      <div className="lead-magnet__lock" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div className="lead-magnet__content">
        <h2 id="lead-magnet-heading" className="lead-magnet__headline">{headline}</h2>
        <p className="lead-magnet__description">{description}</p>
      </div>

      {status === 'success' ? (
        <p className="lead-magnet__success">{successMessage}</p>
      ) : (
        <form className="lead-magnet__form" onSubmit={handleSubmit}>
          <label className="lead-magnet__label" htmlFor="lead-email">{inputLabel}</label>
          <div className="lead-magnet__input-row">
            <input
              className="lead-magnet__input"
              type="email"
              id="lead-email"
              name="email"
              required
              placeholder={inputPlaceholder}
              autoComplete="email"
              disabled={status === 'submitting'}
            />
            <button
              className="button-link lead-magnet__submit"
              type="submit"
              disabled={status === 'submitting'}
              data-cta-telemetry="true"
              data-cta-label="lead-magnet-submit"
              data-cta-href={formAction}
            >
              {status === 'submitting' ? 'Sending...' : buttonLabel}
            </button>
          </div>
          {status === 'error' ? (
            <p className="lead-magnet__error">Something went wrong. Please try again.</p>
          ) : null}
          <p className="lead-magnet__privacy">{privacyNote}</p>
        </form>
      )}
    </section>
  );
}
