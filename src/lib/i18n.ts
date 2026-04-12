export const APP_LOCALES = ['en'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

type LocaleDefinition = {
  label: string;
  htmlLang: string;
  openGraphLocale: string;
  structuredDataLanguage: string;
};

const LOCALE_DEFINITIONS: Record<AppLocale, LocaleDefinition> = {
  en: {
    label: 'English',
    htmlLang: 'en',
    openGraphLocale: 'en_US',
    structuredDataLanguage: 'en',
  },
};

export function isAppLocale(value: string): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

export function resolveLocale(value?: string): AppLocale {
  return value && isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleDefinition(locale: AppLocale = DEFAULT_LOCALE) {
  return LOCALE_DEFINITIONS[locale];
}

export function getHtmlLang(locale: AppLocale = DEFAULT_LOCALE) {
  return getLocaleDefinition(locale).htmlLang;
}

export function getOpenGraphLocale(locale: AppLocale = DEFAULT_LOCALE) {
  return getLocaleDefinition(locale).openGraphLocale;
}

export function getStructuredDataLanguage(locale: AppLocale = DEFAULT_LOCALE) {
  return getLocaleDefinition(locale).structuredDataLanguage;
}
