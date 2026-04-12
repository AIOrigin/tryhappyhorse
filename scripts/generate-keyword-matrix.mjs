/**
 * Generate Keyword Matrix
 *
 * Reads a topic name + description, outputs a structured keyword-matrix.json
 * with 6 categories of keywords and suggested page slugs/types.
 *
 * Usage:
 *   node scripts/generate-keyword-matrix.mjs --topic="HappyHorse" --description="AI video model" --niche="AI video generation"
 *   node scripts/generate-keyword-matrix.mjs --topic="HappyHorse" --description="AI video model" --dry-run
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const OUTPUT_PATH = path.join(process.cwd(), 'keyword-matrix.json');

const PAGE_TYPE_MAP = {
  brandAwareness: 'explainer',
  features: 'tutorial',
  comparisons: 'comparison',
  useCases: 'use_case',
  technical: 'tech_analysis',
  controversy: 'brand_info',
};

const CTA_TYPE_MAP = {
  brandAwareness: 'learn_more',
  features: 'get_tutorial',
  comparisons: 'compare_now',
  useCases: 'get_tutorial',
  technical: 'learn_more',
  controversy: 'learn_more',
};

function parseArgs(argv) {
  const args = { topic: '', description: '', niche: '', dryRun: false, competitors: '' };
  for (const raw of argv) {
    if (raw === '--dry-run') { args.dryRun = true; continue; }
    if (raw.startsWith('--topic=')) { args.topic = raw.slice(8); continue; }
    if (raw.startsWith('--description=')) { args.description = raw.slice(14); continue; }
    if (raw.startsWith('--niche=')) { args.niche = raw.slice(8); continue; }
    if (raw.startsWith('--competitors=')) { args.competitors = raw.slice(14); continue; }
  }
  return args;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateMatrix(topic, description, niche, competitorList) {
  const slug = slugify(topic);
  const competitors = competitorList.length > 0
    ? competitorList
    : inferCompetitors(niche);

  const matrix = {
    topic,
    description,
    niche,
    generatedAt: new Date().toISOString(),
    categories: {
      brandAwareness: [
        { keyword: `what is ${topic}`, intent: 'brand explainer', suggestedSlug: `what-is-${slug}`, suggestedPageType: 'explainer', priority: 'P0' },
        { keyword: `${topic} company`, intent: 'background investigation', suggestedSlug: `${slug}-company`, suggestedPageType: 'brand_info', priority: 'P1' },
        { keyword: `is ${topic} open source`, intent: 'open source status', suggestedSlug: `${slug}-open-source`, suggestedPageType: 'explainer', priority: 'P1' },
        { keyword: `${topic} github`, intent: 'repo status', suggestedSlug: `${slug}-github`, suggestedPageType: 'repo_status', priority: 'P2' },
        { keyword: `is ${topic} hype`, intent: 'controversy evaluation', suggestedSlug: `${slug}-is-it-hype`, suggestedPageType: 'brand_info', priority: 'P1' },
      ],
      features: [
        { keyword: `how to use ${topic}`, intent: 'getting started', suggestedSlug: `${slug}-how-to-use`, suggestedPageType: 'tutorial', priority: 'P0' },
        { keyword: `${topic} text to video`, intent: 'text-to-video tutorial', suggestedSlug: `${slug}-text-to-video`, suggestedPageType: 'tutorial', priority: 'P0' },
        { keyword: `${topic} image to video`, intent: 'image-to-video tutorial', suggestedSlug: `${slug}-image-to-video`, suggestedPageType: 'tutorial', priority: 'P1' },
        { keyword: `${topic} API`, intent: 'developer guide', suggestedSlug: `${slug}-api-guide`, suggestedPageType: 'tutorial', priority: 'P1' },
        { keyword: `${topic} local deployment`, intent: 'self-hosting', suggestedSlug: `${slug}-local-deployment`, suggestedPageType: 'tutorial', priority: 'P2' },
        { keyword: `${topic} prompts`, intent: 'prompt templates', suggestedSlug: `${slug}-prompts`, suggestedPageType: 'prompts', priority: 'P0' },
      ],
      comparisons: competitors.map((comp, i) => ({
        keyword: `${topic} vs ${comp}`,
        intent: 'head-to-head comparison',
        suggestedSlug: `${slug}-vs-${slugify(comp)}`,
        suggestedPageType: 'comparison',
        priority: i < 3 ? 'P0' : 'P1',
        competitorName: comp,
      })).concat([
        { keyword: `best ${niche || 'AI'} tools ${new Date().getFullYear()}`, intent: 'category roundup', suggestedSlug: `best-${slugify(niche || 'ai')}-tools`, suggestedPageType: 'category_comparison', priority: 'P1' },
        { keyword: `${topic} alternatives`, intent: 'alternatives discovery', suggestedSlug: `${slug}-alternatives`, suggestedPageType: 'alternatives', priority: 'P0' },
      ]),
      useCases: [
        { keyword: `${topic} for ecommerce video`, intent: 'ecommerce', suggestedSlug: `${slug}-ecommerce-video`, suggestedPageType: 'use_case', priority: 'P1' },
        { keyword: `${topic} for content creators`, intent: 'content creation', suggestedSlug: `${slug}-content-creation`, suggestedPageType: 'use_case', priority: 'P1' },
        { keyword: `${topic} ad creative`, intent: 'advertising', suggestedSlug: `${slug}-ad-creative`, suggestedPageType: 'use_case', priority: 'P1' },
        { keyword: `${topic} product promo`, intent: 'marketing', suggestedSlug: `${slug}-product-promo`, suggestedPageType: 'use_case', priority: 'P2' },
        { keyword: `${topic} animation`, intent: 'animation creation', suggestedSlug: `${slug}-animation`, suggestedPageType: 'use_case', priority: 'P1' },
      ],
      technical: [
        { keyword: `${topic} model architecture`, intent: 'technical deep dive', suggestedSlug: `${slug}-model-architecture`, suggestedPageType: 'tech_analysis', priority: 'P2' },
      ],
      controversy: [
        { keyword: `is ${topic} real or hype`, intent: 'controversy', suggestedSlug: `${slug}-is-it-hype`, suggestedPageType: 'brand_info', priority: 'P1' },
      ],
    },
  };

  // Add prompt collection pages
  const promptStyles = ['cinematic', 'anime', 'product', 'landscape'];
  for (const style of promptStyles) {
    matrix.categories.features.push({
      keyword: `${topic} ${style} prompts`,
      intent: `${style} prompt templates`,
      suggestedSlug: `${slug}-${style}-prompts`,
      suggestedPageType: 'prompt_collection',
      priority: 'P1',
    });
  }

  // Add core pages that always exist
  matrix.corePagesRequired = [
    { slug: 'home', pageType: 'homepage', priority: 'P0' },
    { slug: `try-${slug}`, pageType: 'access', priority: 'P0' },
  ];

  // Summary stats
  const allKeywords = Object.values(matrix.categories).flat();
  matrix.stats = {
    totalKeywords: allKeywords.length,
    p0Count: allKeywords.filter(k => k.priority === 'P0').length,
    p1Count: allKeywords.filter(k => k.priority === 'P1').length,
    p2Count: allKeywords.filter(k => k.priority === 'P2').length,
    competitorCount: competitors.length,
    totalPages: allKeywords.length + matrix.corePagesRequired.length,
  };

  // Deduplicate by slug
  const seenSlugs = new Set();
  for (const cat of Object.keys(matrix.categories)) {
    matrix.categories[cat] = matrix.categories[cat].filter(k => {
      if (seenSlugs.has(k.suggestedSlug)) return false;
      seenSlugs.add(k.suggestedSlug);
      return true;
    });
  }

  return matrix;
}

function inferCompetitors(niche) {
  const competitorsByNiche = {
    'AI video generation': ['Sora', 'Seedance', 'Kling', 'Runway', 'Pika', 'Vidu', 'Hailuo', 'Jimeng'],
    'AI image generation': ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Flux', 'Ideogram'],
    'AI coding': ['GitHub Copilot', 'Cursor', 'Windsurf', 'Devin', 'Claude Code'],
    'AI chatbot': ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek'],
  };

  for (const [key, comps] of Object.entries(competitorsByNiche)) {
    if (niche.toLowerCase().includes(key.toLowerCase())) return comps;
  }

  return ['Competitor A', 'Competitor B', 'Competitor C'];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.topic) {
    process.stderr.write('Usage: node scripts/generate-keyword-matrix.mjs --topic="TopicName" --description="..." [--niche="..."] [--competitors="A,B,C"] [--dry-run]\n');
    process.exit(1);
  }

  const competitors = args.competitors ? args.competitors.split(',').map(s => s.trim()).filter(Boolean) : [];
  const matrix = generateMatrix(args.topic, args.description, args.niche || '', competitors);

  if (args.dryRun) {
    process.stdout.write(`\nDry run — keyword matrix for "${args.topic}":\n\n`);
    for (const [category, keywords] of Object.entries(matrix.categories)) {
      process.stdout.write(`  ${category} (${keywords.length} keywords):\n`);
      for (const kw of keywords) {
        process.stdout.write(`    [${kw.priority}] ${kw.keyword} → /${kw.suggestedSlug}/ (${kw.suggestedPageType})\n`);
      }
    }
    process.stdout.write(`\n  Core pages: ${matrix.corePagesRequired.map(p => p.slug).join(', ')}\n`);
    process.stdout.write(`\n  Stats: ${matrix.stats.totalPages} total pages (${matrix.stats.p0Count} P0, ${matrix.stats.p1Count} P1, ${matrix.stats.p2Count} P2)\n\n`);
    return;
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(matrix, null, 2), 'utf8');
  process.stdout.write(`Keyword matrix saved to ${OUTPUT_PATH}\n`);
  process.stdout.write(`Total: ${matrix.stats.totalPages} pages (${matrix.stats.p0Count} P0, ${matrix.stats.p1Count} P1, ${matrix.stats.p2Count} P2)\n`);
}

await main();
