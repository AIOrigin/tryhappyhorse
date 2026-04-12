export type TopicConfig = {
  /** Topic identifier, e.g. "happyhorse" */
  id: string;
  /** Display name, e.g. "HappyHorse" */
  topicName: string;
  /** Full site domain with protocol, e.g. "https://tryhappyhorse.xyz" */
  domain: string;
  /** Site <title> and OG site_name, e.g. "HappyHorse AI Video Guide" */
  siteName: string;
  /** Google Tag Manager container ID */
  gtmId: string;
  /** Baidu site verification token (empty string to skip) */
  baiduVerification: string;
  /** IndexNow key (32-char hex) */
  indexNowKey: string;
  /** Google Apps Script or other endpoint for lead magnet email collection */
  leadMagnetFormAction: string;
  /** Handoff / affiliate link configuration */
  handoff: {
    /** Base URL prefix, e.g. "https://www.elser.ai/zh" */
    baseUrl: string;
    /** Primary CTA path, e.g. "/ai-image-animator" */
    primaryPath: string;
    /** UTM source value, usually the domain without protocol */
    utmSource: string;
    /** Product paths for showcase cards */
    paths: {
      imageAnimator: string;
      animeGenerator: string;
      characterMaker: string;
      storyboard: string;
      storyStudio: string;
      templates: string;
    };
  };
};

/**
 * All registered topic configs. Add new topics here.
 */
const TOPIC_CONFIGS: Record<string, TopicConfig> = {
  happyhorse: {
    id: 'happyhorse',
    topicName: 'HappyHorse',
    domain: 'https://tryhappyhorse.xyz',
    siteName: 'HappyHorse AI Video Guide',
    gtmId: 'GTM-WGQVVGFZ',
    baiduVerification: 'codeva-4MsLl56Xlo',
    indexNowKey: '34fb6d41c2891656cec8226e0b25c66d',
    leadMagnetFormAction:
      'https://script.google.com/macros/s/AKfycbwHGiTaGuKl0s6Oae_7zpUQcDWve0xVYREQXQo8L1c096GaGse4pPWluohSUm5cxKZx/exec',
    handoff: {
      baseUrl: 'https://www.elser.ai/zh',
      primaryPath: '/ai-image-animator',
      utmSource: 'tryhappyhorse.xyz',
      paths: {
        imageAnimator: '/ai-image-animator',
        animeGenerator: '/ai-anime-generator',
        characterMaker: '/ai-character-maker',
        storyboard: '/ai-storyboard',
        storyStudio: '/tools/story-studio',
        templates: '/templates',
      },
    },
  },
};

const DEFAULT_TOPIC = 'happyhorse';

let _cached: TopicConfig | null = null;

/**
 * Load topic config from TOPIC env var (or fall back to default).
 * Result is cached for the lifetime of the process.
 */
export function getTopicConfig(): TopicConfig {
  if (_cached) return _cached;

  const topicId = process.env.TOPIC ?? DEFAULT_TOPIC;
  const config = TOPIC_CONFIGS[topicId];

  if (!config) {
    const available = Object.keys(TOPIC_CONFIGS).join(', ');
    throw new Error(
      `Unknown topic "${topicId}". Available topics: ${available}. Set the TOPIC env var to one of these.`,
    );
  }

  _cached = config;
  return config;
}

/**
 * Get the domain as a URL object (no trailing slash).
 */
export function getTopicSiteUrl(): URL {
  return new URL(getTopicConfig().domain);
}
