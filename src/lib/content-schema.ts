import { z } from 'zod';
import { APP_LOCALES, DEFAULT_LOCALE } from './i18n';

const canonicalPathPattern = /^\/.*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const routeMetadataSchema = z.object({
  path: z.string().regex(canonicalPathPattern, 'Route paths must start with /'),
  slug: z.string().min(1),
  is_homepage: z.boolean().default(false),
  is_canonical_app_entry: z.boolean().default(false),
});

export const keyFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  status: z.enum(['verified', 'mixed', 'unknown']),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const imagePathPattern = /^(\/|https?:\/\/).*$/;

export const imageMetadataSchema = z.object({
  social_path: z.string().regex(imagePathPattern, 'Image paths must start with / or https://').optional(),
  hero_path: z.string().regex(imagePathPattern, 'Image paths must start with / or https://').optional(),
  hero_fit: z.enum(['contain', 'cover']).optional(),
  hero_frame: z.enum(['balanced', 'wide', 'immersive']).optional(),
  hero_position: z.string().min(1).optional(),
  alt: z.string().min(1).optional(),
});

export const pageFrontmatterSchema = z
  .object({
    locale: z.enum(APP_LOCALES).default(DEFAULT_LOCALE),
    title: z.string().min(1),
    description: z.string().min(1),
    h1: z.string().min(1),
    topic: z.string().min(1),
    page_type: z.enum([
      'homepage',
      'explainer',
      'comparison',
      'access',
      'alternatives',
      'prompts',
      'repo_status',
      'open_source_status',
      'category_comparison',
      'tutorial',
      'use_case',
      'prompt_collection',
      'tech_analysis',
      'brand_info',
    ]),
    intent_cluster: z.string().min(1),
    keyword_primary: z.string().min(1),
    keyword_secondary: z.array(z.string().min(1)).min(1),
    model_name: z.string().min(1),
    competitor_name: z.string().min(1).optional(),
    cta_type: z.enum(['try_now', 'compare_now', 'get_prompts', 'join_waitlist', 'see_alternatives', 'learn_more', 'get_tutorial']),
    conversion_target: z.enum([
      'generation_activation',
      'alternative_evaluation',
      'commercial_redirection',
      'creator_activation',
      'expectation_reset',
      'multi_option_discovery',
      'secondary_lead_capture',
    ]),
    generation_entry_mode: z.enum(['direct', 'indirect', 'none']).default('none'),
    trend_score: z.number().min(0).max(100),
    publish_priority: z.enum(['Must', 'Should', 'Backlog']),
    route: routeMetadataSchema,
    canonical_path: z.string().regex(canonicalPathPattern, 'Canonical paths must start with /'),
    answer_summary: z.string().min(1),
    source_urls: z.array(z.string().url()).min(1),
    fact_status: z.enum(['verified', 'mixed', 'unknown']),
    fact_status_note: z.string().min(1),
    last_updated_at: z.string().regex(isoDatePattern, 'Dates must use YYYY-MM-DD'),
    disclaimer_text: z.string().min(1),
    images: imageMetadataSchema.optional(),
    related_pages: z.array(z.string().regex(canonicalPathPattern, 'Related page paths must start with /')).min(2),
    key_facts: z.array(keyFactSchema).min(2),
    faq_items: z.array(faqItemSchema).min(2),
  })
  .superRefine((page, ctx) => {
    if (page.route.path !== page.canonical_path) {
      ctx.addIssue({
        code: 'custom',
        message: 'route.path must match canonical_path',
        path: ['route', 'path'],
      });
    }

    if ((page.page_type === 'comparison' || page.page_type === 'alternatives') && !page.competitor_name) {
      ctx.addIssue({
        code: 'custom',
        message: 'competitor_name is required for comparison and alternatives pages',
        path: ['competitor_name'],
      });
    }

    if (page.route.is_homepage && page.canonical_path !== '/') {
      ctx.addIssue({
        code: 'custom',
        message: 'Homepage entries must use the root canonical path',
        path: ['canonical_path'],
      });
    }

    if (page.route.is_canonical_app_entry && page.canonical_path !== '/try-happyhorse/') {
      ctx.addIssue({
        code: 'custom',
        message: 'The canonical app entry must be /try-happyhorse/',
        path: ['route', 'is_canonical_app_entry'],
      });
    }

    if (page.route.is_canonical_app_entry && page.generation_entry_mode !== 'direct') {
      ctx.addIssue({
        code: 'custom',
        message: 'The canonical app entry must use direct generation_entry_mode',
        path: ['generation_entry_mode'],
      });
    }

    if (page.generation_entry_mode === 'direct' && page.cta_type !== 'try_now') {
      ctx.addIssue({
        code: 'custom',
        message: 'Direct generation entry pages must use try_now as the primary CTA',
        path: ['cta_type'],
      });
    }

    if (page.route.path === '/seedance-vs-happyhorse/' || page.canonical_path === '/seedance-vs-happyhorse/') {
      ctx.addIssue({
        code: 'custom',
        message: 'The mirrored Seedance vs HappyHorse route is forbidden. Use /happyhorse-vs-seedance/ only.',
        path: ['canonical_path'],
      });
    }

    if (page.model_name === 'HappyHorse' && page.competitor_name === 'Seedance' && page.page_type === 'comparison') {
      if (page.route.path !== '/happyhorse-vs-seedance/') {
        ctx.addIssue({
          code: 'custom',
          message: 'HappyHorse vs Seedance comparison pages must use /happyhorse-vs-seedance/ as the only route.',
          path: ['route', 'path'],
        });
      }

      if (page.route.slug !== 'happyhorse-vs-seedance') {
        ctx.addIssue({
          code: 'custom',
          message: 'HappyHorse vs Seedance comparison pages must keep the happyhorse-vs-seedance slug.',
          path: ['route', 'slug'],
        });
      }

      if (page.canonical_path !== '/happyhorse-vs-seedance/') {
        ctx.addIssue({
          code: 'custom',
          message: 'HappyHorse vs Seedance comparison pages must keep /happyhorse-vs-seedance/ as canonical_path.',
          path: ['canonical_path'],
        });
      }
    }
  });

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

export type PageEntry = {
  id: string;
  filePath: string;
  body: string;
  data: PageFrontmatter;
};
