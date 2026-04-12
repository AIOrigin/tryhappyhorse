import { DEFAULT_LOCALE, type AppLocale } from './i18n';

type SiteCopy = {
  metadata: {
    siteDescription: string;
  };
  breadcrumbs: {
    ariaLabel: string;
    homeLabel: string;
  };
  pageShell: {
    updatedPrefix: string;
    contextEyebrow: string;
    contextHeading: string;
    siteBaselineEyebrow: string;
    siteBaselineDescription: string;
    footerLinksAriaLabel: string;
    privacyComplianceLabel: string;
  };
  leadMagnet: {
    headline: string;
    description: string;
    formAction: string;
    buttonLabel: string;
    privacyNote: string;
    inputPlaceholder: string;
    inputLabel: string;
    successMessage: string;
  };
  privacyCompliance: {
    title: string;
    backToAppLabel: string;
    eyebrow: string;
  };
};

const SITE_COPY: Record<AppLocale, SiteCopy> = {
  en: {
    metadata: {
      siteDescription: 'Independent HappyHorse AI video guide, comparison, and Elser.ai handoff hub.',
    },
    breadcrumbs: {
      ariaLabel: 'Breadcrumb',
      homeLabel: 'Home',
    },
    pageShell: {
      updatedPrefix: 'Updated',
      contextEyebrow: 'Deep dive',
      contextHeading: 'Learn more',
      siteBaselineEyebrow: 'About this site',
      siteBaselineDescription:
        'This site is an independent HappyHorse guide. Review the privacy and compliance baseline for outbound tool handoffs, click telemetry, and expectation setting.',
      footerLinksAriaLabel: 'Footer links',
      privacyComplianceLabel: 'Privacy & compliance',
    },
    leadMagnet: {
      headline: 'Unlock the HappyHorse Prompt Library',
      description: 'Get 50+ tested AI video prompts, comparison cheat sheets, and workflow templates delivered to your inbox.',
      formAction: 'https://script.google.com/macros/s/AKfycbwHGiTaGuKl0s6Oae_7zpUQcDWve0xVYREQXQo8L1c096GaGse4pPWluohSUm5cxKZx/exec',
      buttonLabel: 'Send me the prompts',
      privacyNote: 'Free. No spam. Unsubscribe anytime.',
      inputPlaceholder: 'you@example.com',
      inputLabel: 'Email address',
      successMessage: 'Check your inbox — the prompts are on the way.',
    },
    privacyCompliance: {
      title: 'Privacy & Compliance Baseline',
      backToAppLabel: 'Back to Try HappyHorse',
      eyebrow: 'Privacy & compliance baseline',
    },
  },
};

export function getSiteCopy(locale: AppLocale = DEFAULT_LOCALE) {
  return SITE_COPY[locale];
}
