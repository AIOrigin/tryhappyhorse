type TelemetryTrackerProps = {
  pageType: string;
  factStatus: string;
  conversionTarget: string;
  isHomepage: boolean;
  isCanonicalAppEntry: boolean;
};

export function TelemetryTracker({
  pageType,
  factStatus,
  conversionTarget,
  isHomepage,
  isCanonicalAppEntry,
}: TelemetryTrackerProps) {
  const payload = JSON.stringify({
    pageType,
    factStatus,
    conversionTarget,
    isHomepage,
    isCanonicalAppEntry,
  });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(() => {
  const config = ${payload};
  const emitTelemetry = (eventName, detail = {}) => {
    window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];

    const telemetryPayload = {
      event: eventName,
      route: window.location.pathname,
      ...detail,
    };

    window.dataLayer.push(telemetryPayload);

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, detail);
    }

    window.dispatchEvent(new CustomEvent('happyhorse-handoff-telemetry', {
      detail: telemetryPayload,
    }));
  };

  const bindCtas = () => {
    if (window.__happyhorseCtaTrackerBound === true) {
      return;
    }

    window.__happyhorseCtaTrackerBound = true;
    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-cta-telemetry]') : null;

      if (!(target instanceof HTMLAnchorElement)) {
        return;
      }

      emitTelemetry('cta_click', {
        cta_label: target.dataset.ctaLabel || target.textContent?.trim() || 'CTA',
        cta_href: target.dataset.ctaHref || target.href,
        page_path: target.dataset.ctaRoute || window.location.pathname,
        page_type: target.dataset.ctaPageType || 'unknown',
        cta_type: target.dataset.ctaType || 'unknown',
        fact_status: target.dataset.ctaFactStatus || 'unknown',
        conversion_target: target.dataset.ctaConversionTarget || 'unknown',
      });
    });
  };

  document.documentElement.dataset.pageType = config.pageType;
  document.documentElement.dataset.factStatus = config.factStatus;
  document.documentElement.dataset.conversionTarget = config.conversionTarget;
  document.documentElement.dataset.isHomepage = String(config.isHomepage);
  document.documentElement.dataset.isCanonicalAppEntry = String(config.isCanonicalAppEntry);

  emitTelemetry('page_context', {
    page_path: window.location.pathname,
    canonical_url: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || window.location.href,
    page_type: config.pageType,
    fact_status: config.factStatus,
    conversion_target: config.conversionTarget,
    is_homepage: config.isHomepage,
    is_canonical_app_entry: config.isCanonicalAppEntry,
  });

  bindCtas();
})();`,
      }}
    />
  );
}
