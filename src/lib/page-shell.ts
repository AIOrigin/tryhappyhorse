import type { PageEntry } from './content-schema';
import { buildSeoViewModel, type SeoViewModel } from './seo';

export type RelatedPageViewModel = {
  path: string;
  title: string;
  description: string;
};

export type CtaViewModel = {
  anchorId: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
  note: string;
  isExternal: boolean;
};

export type IntentHandoffViewModel = {
  title: string;
  description: string;
  href: string;
  label: string;
};

export type HeroMediaViewModel = {
  fit: 'contain' | 'cover';
  frame: 'balanced' | 'wide' | 'immersive';
  position: string;
};

export type PageShellViewModel = {
  cta: CtaViewModel;
  heroMedia: HeroMediaViewModel;
  relatedPages: RelatedPageViewModel[];
  routeDiscoveryPages: RelatedPageViewModel[];
  seo: SeoViewModel;
};

export function pathToSlugParam(path: string) {
  const trimmedPath = path.replace(/^\/|\/$/g, '');
  return trimmedPath.length > 0 ? trimmedPath : undefined;
}

export function formatLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function buildPageShellViewModel(
  page: PageEntry,
  allPages: PageEntry[],
  site: URL,
): PageShellViewModel {
  return {
    cta: buildCtaViewModel(page),
    heroMedia: buildHeroMediaViewModel(page),
    relatedPages: resolveRelatedPages(page, allPages),
    routeDiscoveryPages: resolveRouteDiscoveryPages(allPages),
    seo: buildSeoViewModel(page, site),
  };
}

const NAV_ROUTES = [
  '/what-is-happyhorse/',
  '/happyhorse-vs-seedance/',
  '/try-happyhorse/',
  '/happyhorse-how-to-use/',
  '/happyhorse-prompts/',
  '/best-ai-video-models/',
];

function resolveRouteDiscoveryPages(allPages: PageEntry[]): RelatedPageViewModel[] {
  const pageByPath = new Map(allPages.map((entry) => [entry.data.canonical_path, entry]));

  return NAV_ROUTES.map((routePath) => {
    const page = pageByPath.get(routePath);
    if (!page) return null;
    return { path: routePath, title: page.data.h1, description: page.data.description };
  }).filter((item): item is RelatedPageViewModel => item !== null);
}

function resolveRelatedPages(page: PageEntry, allPages: PageEntry[]): RelatedPageViewModel[] {
  const pageByPath = new Map(allPages.map((entry) => [entry.data.canonical_path, entry]));

  const relatedPages = page.data.related_pages.map((path) => {
    const relatedPage = pageByPath.get(path);

    if (!relatedPage) {
      throw new Error(
        `Page ${page.data.canonical_path} references missing related page ${path}. Keep related_pages aligned with the route inventory.`,
      );
    }

    return {
      path,
      title: relatedPage.data.h1,
      description: relatedPage.data.description,
    };
  });

  if (relatedPages.length < 2) {
    throw new Error(`Page ${page.data.canonical_path} must expose at least 2 related links.`);
  }

  return relatedPages;
}

const UTM_BASE = 'utm_source=tryhappyhorse.xyz&utm_medium=referral';

function elserUrl(path: string, campaign: string) {
  return `https://www.elser.ai/zh${path}?${UTM_BASE}&utm_campaign=${campaign}`;
}

const ELSER_HANDOFFS = {
  primary: elserUrl('/ai-image-animator', 'homepage_hero'),
  animeArt: elserUrl('/ai-anime-generator', 'anime_art'),
  imageToVideo: elserUrl('/ai-image-animator', 'image_to_video'),
  characterMaker: elserUrl('/ai-character-maker', 'character_maker'),
  storyboard: elserUrl('/ai-storyboard', 'storyboard'),
  storyStudio: elserUrl('/tools/story-studio', 'story_studio'),
  templates: elserUrl('/templates', 'templates'),
} as const;

export const tryHappyHorseIntentHandoffs: IntentHandoffViewModel[] = [
  {
    title: 'AI Image Animator',
    description: 'Turn any still image into a cinematic video clip. Upload a photo, illustration, or product shot and bring it to life with AI-powered motion.',
    href: ELSER_HANDOFFS.primary,
    label: 'Try image animation',
  },
  {
    title: 'AI Anime Generator',
    description: 'Create stunning anime-style artwork from text descriptions. Ideal for concept art, character design, and visual storytelling.',
    href: ELSER_HANDOFFS.animeArt,
    label: 'Create anime art',
  },
  {
    title: 'AI Character Maker',
    description: 'Design original characters with consistent style and detail. Perfect for creators building a cast for animation or comics.',
    href: ELSER_HANDOFFS.characterMaker,
    label: 'Design a character',
  },
  {
    title: 'AI Storyboard',
    description: 'Plan your shots, pacing, and scene structure visually before committing to full generation. Great for short films and ads.',
    href: ELSER_HANDOFFS.storyboard,
    label: 'Plan your storyboard',
  },
  {
    title: 'Story Studio',
    description: 'A full multi-shot creation workspace for producing longer sequences with consistent characters and settings.',
    href: ELSER_HANDOFFS.storyStudio,
    label: 'Open Story Studio',
  },
];

function buildHeroMediaViewModel(page: PageEntry): HeroMediaViewModel {
  return {
    fit: page.data.images?.hero_fit ?? 'contain',
    frame:
      page.data.images?.hero_frame ??
      (page.data.route.is_homepage || page.data.page_type === 'comparison' || page.data.page_type === 'category_comparison'
        ? 'wide'
        : 'balanced'),
    position: page.data.images?.hero_position ?? 'center center',
  };
}

function buildExternalCta(cta: Omit<CtaViewModel, 'isExternal'>): CtaViewModel {
  return {
    ...cta,
    isExternal: true,
  };
}

function buildCtaViewModel(page: PageEntry): CtaViewModel {
  if (page.data.route.is_canonical_app_entry) {
    return buildExternalCta({
      anchorId: 'handoff-entry-note',
      eyebrow: 'Recommended tool',
      title: 'Start creating AI videos now',
      description: 'Bring your ideas to life — turn images into cinematic video clips with Elser.ai\'s AI-powered animation tools.',
      href: ELSER_HANDOFFS.primary,
      label: 'Try AI Image Animator',
      note: 'Elser.ai is an independent AI creation platform recommended by this guide.',
    });
  }

  switch (page.data.canonical_path) {
    case '/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Start creating AI videos now',
        description: 'Turn any image into a cinematic video clip with AI-powered animation.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai — an independent AI creation platform.',
      });
    case '/what-is-happyhorse/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'See AI video generation in action',
        description: 'Curious what AI video generation actually looks like? Try animating an image yourself.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai — no HappyHorse account required.',
      });
    case '/happyhorse-vs-seedance/':
    case '/happyhorse-vs-sora/':
    case '/happyhorse-vs-kling/':
    case '/happyhorse-vs-runway/':
    case '/happyhorse-vs-pika/':
    case '/happyhorse-vs-vidu/':
    case '/happyhorse-vs-hailuo/':
    case '/happyhorse-vs-jimeng/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Done comparing? Start creating.',
        description: 'Skip the wait — try AI video generation right now with a tool that\'s available today.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai — works independently of any model discussed above.',
      });
    case '/happyhorse-prompts/':
    case '/happyhorse-cinematic-prompts/':
    case '/happyhorse-anime-prompts/':
    case '/happyhorse-product-prompts/':
    case '/happyhorse-landscape-prompts/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Put these prompts to work',
        description: 'Take your prompt ideas and turn them into real video output with an AI animation tool.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai — prompts above are transferable to most AI video tools.',
      });
    case '/happyhorse-alternatives/':
    case '/best-ai-video-models/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Try a top-rated alternative now',
        description: 'Looking for something you can use today? Elser.ai offers production-ready AI video tools with no waitlist.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Elser.ai is an independent platform — available now, no signup queue.',
      });
    case '/happyhorse-github/':
    case '/happyhorse-open-source/':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Try AI video generation while you wait',
        description: 'Official code and weights aren\'t available yet. In the meantime, you can create AI videos with existing tools.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai — does not require HappyHorse source code or model access.',
      });
  }

  // Fallback by cta_type
  switch (page.data.cta_type) {
    case 'compare_now':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Done comparing? Start creating.',
        description: 'Try AI video generation with a tool that\'s ready to use today.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai.',
      });
    case 'get_prompts':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Put these prompts to work',
        description: 'Turn your prompt ideas into real AI-generated video.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai.',
      });
    case 'see_alternatives':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Try a top-rated alternative now',
        description: 'Production-ready AI video tools with no waitlist.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai.',
      });
    case 'get_tutorial':
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Ready to start creating?',
        description: 'Put what you\'ve learned into practice — animate your first image in under a minute.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai.',
      });
    case 'learn_more':
    case 'join_waitlist':
    case 'try_now':
    default:
      return buildExternalCta({
        anchorId: 'page-cta',
        eyebrow: 'Recommended tool',
        title: 'Start creating AI videos now',
        description: 'Turn any image into a cinematic video clip with AI-powered animation.',
        href: ELSER_HANDOFFS.primary,
        label: 'Try AI Image Animator',
        note: 'Powered by Elser.ai.',
      });
  }
}
