/**
 * Generate MDX Pages from Keyword Matrix
 *
 * Reads keyword-matrix.json and generates MDX files with valid frontmatter
 * and placeholder content for each keyword entry.
 *
 * Usage:
 *   node scripts/generate-pages.mjs
 *   node scripts/generate-pages.mjs --dry-run
 *   node scripts/generate-pages.mjs --pages=comparison
 *   node scripts/generate-pages.mjs --priority=P0
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const PROJECT_ROOT = process.cwd();
const MATRIX_PATH = path.join(PROJECT_ROOT, 'keyword-matrix.json');
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'pages');

function parseArgs(argv) {
  const args = { dryRun: false, pages: '', priority: '', overwrite: false };
  for (const raw of argv) {
    if (raw === '--dry-run') { args.dryRun = true; continue; }
    if (raw === '--overwrite') { args.overwrite = true; continue; }
    if (raw.startsWith('--pages=')) { args.pages = raw.slice(8); continue; }
    if (raw.startsWith('--priority=')) { args.priority = raw.slice(11); continue; }
  }
  return args;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function buildFrontmatter(entry, topic, allSlugs) {
  const isComparison = entry.suggestedPageType === 'comparison';
  const isAlternatives = entry.suggestedPageType === 'alternatives';
  const slug = entry.suggestedSlug;

  // Pick 3-5 related pages from the full slug list (excluding self)
  const otherSlugs = allSlugs.filter(s => s !== slug);
  const relatedPages = [];
  // Always include what-is and homepage reference
  const mustHave = [`/what-is-${topic.toLowerCase()}/`];
  for (const mh of mustHave) {
    const matchSlug = mh.replace(/^\/|\/$/g, '');
    if (otherSlugs.includes(matchSlug)) relatedPages.push(mh);
  }
  // Fill remaining from others
  const shuffled = otherSlugs.sort(() => 0.5 - Math.random());
  for (const s of shuffled) {
    if (relatedPages.length >= 4) break;
    const p = `/${s}/`;
    if (!relatedPages.includes(p)) relatedPages.push(p);
  }
  // Ensure minimum 3
  while (relatedPages.length < 3 && shuffled.length > 0) {
    const s = shuffled.pop();
    const p = `/${s}/`;
    if (!relatedPages.includes(p)) relatedPages.push(p);
  }

  const fm = {
    title: buildTitle(entry, topic),
    description: `Independent guide covering ${entry.keyword}. Honest analysis with verified and unverified claims clearly marked.`,
    h1: buildH1(entry, topic),
    topic,
    page_type: entry.suggestedPageType,
    intent_cluster: entry.intent,
    keyword_primary: entry.keyword,
    keyword_secondary: buildSecondaryKeywords(entry, topic),
    model_name: topic,
    ...(isComparison || isAlternatives ? { competitor_name: entry.competitorName || 'Various' } : {}),
    cta_type: getCTAType(entry.suggestedPageType),
    conversion_target: getConversionTarget(entry.suggestedPageType),
    generation_entry_mode: 'none',
    trend_score: entry.priority === 'P0' ? 92 : entry.priority === 'P1' ? 85 : 78,
    publish_priority: entry.priority === 'P0' ? 'Must' : entry.priority === 'P1' ? 'Should' : 'Backlog',
    route: {
      path: `/${slug}/`,
      slug,
      is_homepage: false,
      is_canonical_app_entry: false,
    },
    canonical_path: `/${slug}/`,
    answer_summary: `A comprehensive guide to ${entry.keyword}, with facts clearly separated into verified, mixed, and unverified claims.`,
    source_urls: ['https://www.bloomberg.com/', 'https://techcrunch.com/'],
    fact_status: 'mixed',
    fact_status_note: `Information about ${entry.keyword} is based on publicly available sources. Some details remain unverified.`,
    last_updated_at: today(),
    disclaimer_text: `Disclaimer: This website is an independent informational resource and is not the official ${topic} website or affiliated with any mentioned product.`,
    images: {
      social_path: `/generated/${slug}.png`,
      hero_path: `/generated/${slug}.png`,
      hero_fit: 'cover',
      hero_frame: isComparison ? 'wide' : 'balanced',
      hero_position: 'center center',
      alt: `${buildH1(entry, topic)} - hero image`,
    },
    related_pages: relatedPages,
    key_facts: buildKeyFacts(entry, topic),
    faq_items: buildFAQItems(entry, topic),
  };

  return fm;
}

function buildTitle(entry, topic) {
  const type = entry.suggestedPageType;
  if (type === 'comparison') return `${topic} vs ${entry.competitorName} — Comprehensive Comparison (${new Date().getFullYear()})`;
  if (type === 'tutorial') return `${entry.keyword} — Complete Guide | ${topic}`;
  if (type === 'use_case') return `${entry.keyword} — Practical Guide | ${topic}`;
  if (type === 'prompt_collection') return `${entry.keyword} — Templates & Examples | ${topic}`;
  if (type === 'alternatives') return `${topic} Alternatives — Best Options Compared`;
  if (type === 'category_comparison') return `${entry.keyword} — Top Picks Ranked`;
  return `${entry.keyword} | ${topic} Guide`;
}

function buildH1(entry, topic) {
  const type = entry.suggestedPageType;
  if (type === 'comparison') return `${topic} vs ${entry.competitorName}`;
  return entry.keyword.charAt(0).toUpperCase() + entry.keyword.slice(1);
}

function buildSecondaryKeywords(entry, topic) {
  const kws = [`${topic} ${entry.intent}`, `${entry.keyword} guide`, `${entry.keyword} ${new Date().getFullYear()}`];
  if (entry.competitorName) kws.push(`${topic} vs ${entry.competitorName} comparison`);
  return kws;
}

function getCTAType(pageType) {
  const map = {
    comparison: 'compare_now', alternatives: 'see_alternatives', tutorial: 'get_tutorial',
    use_case: 'get_tutorial', prompts: 'get_prompts', prompt_collection: 'get_prompts',
    explainer: 'learn_more', brand_info: 'learn_more', tech_analysis: 'learn_more',
    repo_status: 'learn_more', open_source_status: 'learn_more', category_comparison: 'compare_now',
    access: 'try_now', homepage: 'try_now',
  };
  return map[pageType] || 'learn_more';
}

function getConversionTarget(pageType) {
  const map = {
    comparison: 'alternative_evaluation', alternatives: 'alternative_evaluation',
    tutorial: 'creator_activation', use_case: 'creator_activation',
    prompts: 'creator_activation', prompt_collection: 'creator_activation',
    explainer: 'expectation_reset', brand_info: 'expectation_reset',
    tech_analysis: 'expectation_reset', repo_status: 'expectation_reset',
    category_comparison: 'multi_option_discovery', access: 'generation_activation',
    homepage: 'generation_activation',
  };
  return map[pageType] || 'expectation_reset';
}

function buildKeyFacts(entry, topic) {
  return [
    { label: 'Primary intent', value: `This page addresses: ${entry.intent}`, status: 'verified' },
    { label: 'Information status', value: `Based on publicly available information as of ${today()}`, status: 'mixed' },
    { label: 'Recommended action', value: 'Review the facts below, then use the recommended tool to start creating', status: 'verified' },
  ];
}

function buildFAQItems(entry, topic) {
  return [
    { question: `What is ${entry.keyword}?`, answer: `This page provides an independent guide to ${entry.keyword}, with facts clearly labeled as verified, mixed, or unverified.` },
    { question: `Is this the official ${topic} page?`, answer: `No. This is an independent informational resource and is not affiliated with ${topic} or any mentioned product.` },
    { question: 'Where can I try AI video generation?', answer: 'This guide recommends Elser.ai as a practical tool that is available now, regardless of specific model access status.' },
  ];
}

function buildMDXBody(entry, topic) {
  const type = entry.suggestedPageType;

  if (type === 'comparison') {
    return `This is the independent comparison page for ${topic} vs ${entry.competitorName}.

## Quick verdict

Both ${topic} and ${entry.competitorName} are notable tools in the AI video generation space. This comparison focuses on publicly verifiable differences.

## What can be compared with confidence

- Public positioning and market attention
- Stated capabilities (where officially documented)
- Access model and availability

## What should stay cautious

- Exact output quality claims (subjective and context-dependent)
- Pricing details (may change)
- Benchmark rankings (methodology varies)

## Where to go next

If you want to try AI video generation now, check out the recommended tool below. For more context on ${topic}, read [What Is ${topic}?](/what-is-${entry.suggestedSlug?.split('-vs-')[0]}/).
`;
  }

  if (type === 'tutorial') {
    return `A practical guide to ${entry.keyword}.

## Before you start

Make sure you understand what ${topic} is and what access options are currently available. Some features mentioned here may depend on access that is not yet publicly confirmed.

## Step-by-step workflow

1. **Understand the tool** — Review what ${topic} offers and what remains unverified
2. **Prepare your inputs** — Gather text prompts, reference images, or storyboard ideas
3. **Generate** — Use the recommended workflow to create your first output
4. **Iterate** — Refine prompts and settings based on results

## Tips for best results

- Be specific in your prompts: describe subject, setting, motion, camera angle, and mood
- Start with shorter durations and scale up
- Use reference images when available for more consistent output

## Limitations to keep in mind

- Official access status may be unclear — use recommended alternatives if needed
- Output quality varies by prompt specificity and model version
- Always verify copyright and usage rights for commercial projects
`;
  }

  if (type === 'prompt_collection' || type === 'prompts') {
    return `A curated collection of prompts for ${entry.keyword}.

## How to use these prompts

Each prompt follows a structured formula: **Subject + Setting + Motion + Camera + Mood + Duration**. Copy any prompt and adapt it to your specific needs.

## Prompt examples

**Example 1 — Dynamic action:**
> A [subject] moving through [setting], [motion description], shot from [camera angle], [lighting/mood], 5 seconds

**Example 2 — Atmospheric scene:**
> [Setting description] with [atmospheric elements], slow [camera movement], [color palette/mood], ambient lighting, 8 seconds

**Example 3 — Product showcase:**
> [Product] on [surface/background], [rotation or reveal motion], [studio lighting style], clean professional look, 4 seconds

## Tips for better prompts

- Include camera movement: pan, tilt, dolly, orbit, zoom
- Specify lighting: golden hour, studio, neon, natural, dramatic
- Add motion keywords: flowing, sweeping, gentle, dynamic, explosive
- Mention style: cinematic, anime, photorealistic, vintage, minimalist
`;
  }

  // Default body for all other types
  return `An independent guide to ${entry.keyword}.

## Overview

${topic} is generating significant attention in the AI space. This page covers ${entry.intent} with a focus on separating verified information from speculation.

## What we know

- ${topic} has attracted substantial public interest
- Multiple credible sources have reported on its capabilities
- Official details continue to emerge

## What remains unclear

- Some technical specifications are based on early reports
- Access and pricing details may change
- Independent verification of all claims is ongoing

## Recommended next step

If you want to try AI video generation while more details emerge, check out the recommended tool below.
`;
}

function buildHomepageMDX(topic) {
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return {
    frontmatter: {
      title: `${topic} AI Video Guide and Access Hub`,
      description: `Independent ${topic} AI video model guide for people searching what it is, how to try ${topic}, and how it compares with current AI video model references.`,
      h1: `${topic} AI Video Guide`,
      topic,
      page_type: 'homepage',
      intent_cluster: 'brand explainer and navigation hub',
      keyword_primary: `${topic} AI`,
      keyword_secondary: [`${topic} AI video model`, `try ${topic}`, `${topic} guide`],
      model_name: topic,
      cta_type: 'try_now',
      conversion_target: 'generation_activation',
      generation_entry_mode: 'indirect',
      trend_score: 92,
      publish_priority: 'Must',
      route: { path: '/', slug: 'home', is_homepage: true, is_canonical_app_entry: false },
      canonical_path: '/',
      answer_summary: `${topic} is the AI video model people are trying to understand right now. This independent guide gives you the quick answer plus practical next steps.`,
      source_urls: ['https://www.bloomberg.com/', 'https://techcrunch.com/'],
      fact_status: 'mixed',
      fact_status_note: 'Public information confirms breakout attention, but product access details remain mixed.',
      last_updated_at: today(),
      disclaimer_text: `Disclaimer: This website is an independent informational resource and is not the official ${topic} website or service.`,
      images: { social_path: '/generated/home.png', hero_path: '/generated/home.png', hero_fit: 'cover', hero_frame: 'wide', hero_position: 'center center', alt: `${topic} AI video guide homepage` },
      related_pages: [],  // will be filled after all pages generated
      key_facts: [
        { label: 'Site positioning', value: `Independent hub for ${topic} explainer, comparison, prompts, and recommended tools`, status: 'verified' },
        { label: 'Official status', value: `This site is not the official ${topic} website or service`, status: 'verified' },
        { label: 'Public access clarity', value: 'Public information about direct official access remains mixed, so action intent is routed to recommended tools', status: 'mixed' },
      ],
      faq_items: [
        { question: `What is ${topic}?`, answer: `${topic} is a trending AI video model. This site provides an independent guide with facts clearly labeled by verification status.` },
        { question: 'Is this the official website?', answer: `No. This is an independent informational resource not affiliated with ${topic}.` },
        { question: 'How can I try AI video generation?', answer: 'This guide recommends Elser.ai as a practical tool available now.' },
      ],
    },
    body: `${topic} is getting searched as a trending AI video model. This homepage is the fast independent overview before you choose a deeper route.

## What this site covers

- **What it is** — Explainer pages that separate facts from speculation
- **How it compares** — Side-by-side comparisons with leading alternatives
- **How to use it** — Tutorials and prompt templates
- **Where to start** — Recommended tools you can use today

## Why this guide exists

When a new AI model trends, reliable information is hard to find. This site aims to be the honest, independent resource that answers your questions without hype.
`,
  };
}

function buildTryPageMDX(topic) {
  const slug = `try-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  return {
    frontmatter: {
      title: `Try ${topic} — Start Creating AI Videos`,
      description: `The practical entry point for trying ${topic}-style AI video generation with recommended tools.`,
      h1: `Try ${topic}`,
      topic,
      page_type: 'access',
      intent_cluster: 'try and access intent',
      keyword_primary: `try ${topic}`,
      keyword_secondary: [`${topic} access`, `use ${topic}`, `${topic} online`],
      model_name: topic,
      cta_type: 'try_now',
      conversion_target: 'generation_activation',
      generation_entry_mode: 'direct',
      trend_score: 96,
      publish_priority: 'Must',
      route: { path: `/${slug}/`, slug, is_homepage: false, is_canonical_app_entry: true },
      canonical_path: `/${slug}/`,
      answer_summary: `Start creating AI videos now. This page connects you to the best available tools while ${topic} access details are still emerging.`,
      source_urls: ['https://www.bloomberg.com/', 'https://techcrunch.com/'],
      fact_status: 'unknown',
      fact_status_note: `Official ${topic} access status is still unverified. Recommended tools are independently available.`,
      last_updated_at: today(),
      disclaimer_text: `Disclaimer: This website is an independent informational resource and is not the official ${topic} website or service.`,
      images: { social_path: `/generated/${slug}.png`, hero_path: `/generated/${slug}.png`, hero_fit: 'cover', hero_frame: 'balanced', hero_position: 'center center', alt: `Try ${topic} - AI video generation entry point` },
      related_pages: [],
      key_facts: [
        { label: 'What this page does', value: 'Connects you to practical AI video tools while official access details emerge', status: 'verified' },
        { label: 'Official access', value: `Direct official ${topic} access has not been publicly confirmed`, status: 'unknown' },
        { label: 'Recommended alternative', value: 'Elser.ai provides production-ready AI video tools available now', status: 'verified' },
      ],
      faq_items: [
        { question: `Can I use ${topic} right now?`, answer: `Official access status is unclear. This page recommends available alternatives.` },
        { question: 'What tools are recommended?', answer: 'Elser.ai offers AI image animation, anime generation, and more.' },
        { question: 'Is this the official access page?', answer: 'No. This is an independent guide with recommended tools.' },
      ],
    },
    body: `This is the practical entry point for AI video creation.

## What you can do here

While ${topic} access details are still emerging, you can start creating AI videos today using the recommended tools below.

## Recommended workflows

Each tool is designed for a specific creative goal:
- **AI Image Animator** — Turn any still image into video
- **AI Anime Generator** — Create anime-style artwork
- **AI Character Maker** — Design consistent characters
- **AI Storyboard** — Plan your shots visually

## About ${topic} access

Official access to ${topic} has not been publicly confirmed. This page will be updated as more information becomes available.
`,
  };
}

function serializeFrontmatter(fm) {
  const lines = ['---'];

  function serialize(obj, indent = 0) {
    const prefix = '  '.repeat(indent);
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length === 0) { lines.push(`${prefix}${key}: []`); continue; }
        if (typeof value[0] === 'object') {
          lines.push(`${prefix}${key}:`);
          for (const item of value) {
            const entries = Object.entries(item);
            lines.push(`${prefix}  - ${entries[0][0]}: ${JSON.stringify(entries[0][1])}`);
            for (let i = 1; i < entries.length; i++) {
              lines.push(`${prefix}    ${entries[i][0]}: ${JSON.stringify(entries[i][1])}`);
            }
          }
        } else {
          lines.push(`${prefix}${key}:`);
          for (const item of value) {
            lines.push(`${prefix}  - ${JSON.stringify(item)}`);
          }
        }
      } else if (typeof value === 'object') {
        lines.push(`${prefix}${key}:`);
        serialize(value, indent + 1);
      } else if (typeof value === 'string' && (value.includes(':') || value.includes('"') || value.includes("'") || value.includes('#'))) {
        lines.push(`${prefix}${key}: ${JSON.stringify(value)}`);
      } else {
        lines.push(`${prefix}${key}: ${value}`);
      }
    }
  }

  serialize(fm);
  lines.push('---');
  return lines.join('\n');
}

async function fileExists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!await fileExists(MATRIX_PATH)) {
    process.stderr.write(`Error: ${MATRIX_PATH} not found. Run generate-keyword-matrix.mjs first.\n`);
    process.exit(1);
  }

  const matrix = JSON.parse(await readFile(MATRIX_PATH, 'utf8'));
  const topic = matrix.topic;

  // Collect all keyword entries
  let allEntries = [];
  for (const [category, entries] of Object.entries(matrix.categories)) {
    for (const entry of entries) {
      allEntries.push({ ...entry, category });
    }
  }

  // Filter by page type
  if (args.pages) {
    const filter = args.pages.toLowerCase();
    allEntries = allEntries.filter(e => e.suggestedPageType === filter || e.category === filter);
  }

  // Filter by priority
  if (args.priority) {
    allEntries = allEntries.filter(e => e.priority === args.priority.toUpperCase());
  }

  // Collect all slugs for related_pages linking
  const allSlugs = allEntries.map(e => e.suggestedSlug);
  allSlugs.push('home', `try-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '')}`);

  // Build pages
  const pages = [];

  // Core pages
  const homePage = buildHomepageMDX(topic);
  const tryPage = buildTryPageMDX(topic);
  pages.push({ slug: 'home', ...homePage });
  pages.push({ slug: tryPage.frontmatter.route.slug, ...tryPage });

  // Keyword pages
  for (const entry of allEntries) {
    const fm = buildFrontmatter(entry, topic, allSlugs);
    const body = buildMDXBody(entry, topic);
    pages.push({ slug: entry.suggestedSlug, frontmatter: fm, body });
  }

  // Fill homepage related_pages with first 8 keyword pages
  pages[0].frontmatter.related_pages = allEntries.slice(0, 8).map(e => `/${e.suggestedSlug}/`);
  // Fill try page related_pages
  pages[1].frontmatter.related_pages = [`/what-is-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '')}/`, ...allEntries.slice(0, 3).map(e => `/${e.suggestedSlug}/`)];

  if (args.dryRun) {
    process.stdout.write(`\nDry run — ${pages.length} pages to generate for "${topic}":\n\n`);
    for (const page of pages) {
      process.stdout.write(`  ${page.slug}.mdx (${page.frontmatter.page_type})\n`);
    }
    process.stdout.write('\n');
    return;
  }

  // Write files
  let created = 0;
  let skipped = 0;
  for (const page of pages) {
    const filePath = path.join(CONTENT_ROOT, `${page.slug}.mdx`);
    if (!args.overwrite && await fileExists(filePath)) {
      process.stdout.write(`Skipping ${page.slug}.mdx (exists, use --overwrite)\n`);
      skipped++;
      continue;
    }
    const content = `${serializeFrontmatter(page.frontmatter)}\n\n${page.body}`;
    await writeFile(filePath, content, 'utf8');
    process.stdout.write(`Created ${page.slug}.mdx\n`);
    created++;
  }

  process.stdout.write(`\nDone: ${created} created, ${skipped} skipped\n`);
}

await main();
