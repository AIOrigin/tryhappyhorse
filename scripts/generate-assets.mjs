import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { parse as parseYaml } from 'yaml';

const SITE_ROOT = process.cwd();
const CONTENT_ROOT = path.join(SITE_ROOT, 'src', 'content', 'pages');
const OUTPUT_ROOT = path.join(SITE_ROOT, 'public', 'generated');
const DEFAULT_ENV_FILE = path.resolve(SITE_ROOT, '../elser-quene/elser-tool-api/.env.local');
const DEFAULT_USER_ID = 'a67d83ef-cba8-4a19-ad2f-14af05f60bce';
const MODEL_ID = 'gemini-3.1-flash-image-preview';
const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REVOKED', 'REJECTED']);

const PROMPT_OVERRIDES = {
  home:
    'Cinematic editorial hero image for an independent HappyHorse AI video guide homepage, dark navy atmosphere, luminous horse made of flowing light trails, elegant motion, premium AI video product mood, no text, no watermark, 16:9 composition',
  'what-is-happyhorse':
    'Editorial concept image for a mysterious new AI video model, luminous horse silhouette emerging from cinematic data clouds, dark navy premium atmosphere, subtle motion blur, elegant product-discovery mood, no text, no watermark, 16:9 composition',
  'try-happyhorse':
    'Premium anime-video workflow hero image, glowing creation workspace, prompt card, storyboard frames and animated light trails, practical start-now feeling, dark navy cinematic interface mood, no text, no watermark, 16:9 composition',
  'happyhorse-vs-seedance':
    'Split-composition comparison hero image for two competing AI video directions, one side luminous horse energy, the other side sleek cinematic waveforms and motion ribbons, editorial comparison mood, dark refined background, no text, no watermark, 16:9 composition',
  'happyhorse-alternatives':
    'Alternative-path editorial image with branching luminous routes, multiple creative workflow cards, practical decision-making mood, premium dark navy product atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-prompts':
    'Creative prompt design hero image with cinematic storyboard thumbnails, visual prompt notebook, framing arrows, mood references, elegant creator workflow scene, dark refined background, no text, no watermark, 16:9 composition',
  'happyhorse-github':
    'Technical editorial image for repository status and code search intent, abstract code graph, branching git network, terminal glow and cautious discovery mood, dark premium background, no text, no watermark, 16:9 composition',
  'happyhorse-open-source':
    'Open-source status editorial image, abstract code windows, model weights vault, subtle lock and unlock symbolism, cautious transparency mood, dark premium background, no text, no watermark, 16:9 composition',
  'best-ai-video-models':
    'Category overview hero image for the best AI video models, cinematic mosaic of motion frames, creator tools and glowing model cards, broad discovery mood, dark premium editorial background, no text, no watermark, 16:9 composition',

  // Comparison pages
  'happyhorse-vs-sora':
    'Split-screen editorial comparison of two AI video paradigms, left side luminous horse trails representing agile speed, right side monumental geometric architecture representing OpenAI Sora, dark cinematic atmosphere, premium tech face-off mood, no text, no watermark, 16:9 composition',
  'happyhorse-vs-kling':
    'Dual energy comparison image, luminous horse motion trails on one side transitioning into sleek fast-moving video frames on the other representing Kling, shared DNA visual thread connecting both sides, dark navy editorial atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-vs-runway':
    'East meets West editorial hero, left side luminous horse energy with flowing Chinese aesthetics, right side polished Hollywood-style film reel representing Runway, cinematic split composition, dark premium background, no text, no watermark, 16:9 composition',
  'happyhorse-vs-pika':
    'Power versus accessibility comparison, one side intense cinematic horse energy with complex motion, other side playful colorful creative sparks representing Pika, contrasting scales and moods, dark editorial background, no text, no watermark, 16:9 composition',
  'happyhorse-vs-vidu':
    'Chinese AI ecosystem rivalry image, two luminous model architectures facing each other, one horse-shaped energy, one academic crystal structure representing Vidu, competitive evaluation mood, dark premium atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-vs-hailuo':
    'Dual AI model comparison, luminous horse trails alongside flowing cloud-like energy waves representing Hailuo MiniMax, complementary yet competing visual languages, dark cinematic editorial mood, no text, no watermark, 16:9 composition',
  'happyhorse-vs-jimeng':
    'ByteDance ecosystem comparison, luminous horse motion on one side, dynamic short-video content grid with music notes representing Jimeng on the other, social media meets AI generation mood, dark editorial background, no text, no watermark, 16:9 composition',

  // Tutorial pages
  'happyhorse-how-to-use':
    'Beginner-friendly tutorial hero image, glowing step-by-step workflow path with numbered stations, hands-on creation feeling, prompt card and video output preview, welcoming dark navy atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-text-to-video':
    'Text-to-video transformation hero, floating luminous text prompt dissolving into cinematic video frames, creative writing becoming motion pictures, magical transformation energy, dark premium atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-image-to-video':
    'Image-to-video animation hero, still photograph gaining depth and motion with luminous energy trails, frozen frame coming alive, cinematic parallax and motion blur emerging, dark refined background, no text, no watermark, 16:9 composition',
  'happyhorse-api-guide':
    'Developer API integration hero, elegant code terminal with glowing API endpoints, request-response flow visualization, clean architecture diagram feel, technical but premium dark background, no text, no watermark, 16:9 composition',
  'happyhorse-local-deployment':
    'Local deployment hardware hero, powerful GPU cards with luminous processing energy, server rack aesthetic with warm amber glow, technical self-hosting mood, dark premium data center atmosphere, no text, no watermark, 16:9 composition',

  // Use case pages
  'happyhorse-ecommerce-video':
    'Ecommerce product video showcase, floating product displays with cinematic lighting, shopping bag and video play button fusion, commercial yet premium dark atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-product-promo':
    'Product promotional video creation, cinematic product reveal with dramatic lighting, brand storytelling energy, marketing campaign visual, premium dark editorial atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-content-creation':
    'Social media content creator workspace, multiple platform screens with video content flowing, creative energy and productivity, modern creator economy vibe, dark premium atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-ad-creative':
    'Advertising creative production, multiple ad format variations floating in space, A/B testing visual, campaign optimization energy, marketing technology premium dark mood, no text, no watermark, 16:9 composition',
  'happyhorse-animation':
    'Anime and animation creation hero, vibrant anime character mid-action surrounded by storyboard frames, creative animation workflow, colorful yet premium dark atmosphere, no text, no watermark, 16:9 composition',

  // Prompt collection pages
  'happyhorse-cinematic-prompts':
    'Cinematic film production mood board, dramatic camera angles and golden lighting setups, film director viewfinder, movie-quality visual references floating in dark space, no text, no watermark, 16:9 composition',
  'happyhorse-anime-prompts':
    'Anime art style showcase, multiple anime visual styles from shonen action to slice of life, vibrant character poses and dynamic compositions, curated collection feeling, dark premium gallery atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-product-prompts':
    'Product photography and video prompt collection, elegant product shots with studio lighting, 360 spin and lifestyle scene references, commercial visual library mood, dark premium background, no text, no watermark, 16:9 composition',
  'happyhorse-landscape-prompts':
    'Landscape and nature video prompt collection, dramatic mountain vistas, ocean aerial shots, golden hour forest scenes, nature cinematography showcase, curated visual library, dark premium gallery mood, no text, no watermark, 16:9 composition',

  // Brand and tech pages
  'happyhorse-company':
    'Corporate mystery and investigation editorial image, shadowy corporate building with luminous horse logo emerging, anonymous team silhouettes, investigative journalism mood, dark premium atmosphere with golden accent light, no text, no watermark, 16:9 composition',
  'happyhorse-model-architecture':
    'Technical AI model architecture visualization, neural network layers with transformer attention patterns, 15 billion parameter scale visualization, flowing data through denoising steps, scientific yet premium dark atmosphere, no text, no watermark, 16:9 composition',
  'happyhorse-is-it-hype':
    'Hype versus reality editorial image, balance scale with luminous energy on one side and grounded evidence on the other, critical evaluation mood, skeptical yet fair, dark premium editorial atmosphere, no text, no watermark, 16:9 composition',
};

function parseArgs(argv) {
  const args = {
    envFile: DEFAULT_ENV_FILE,
    slugs: null,
    overwrite: false,
    uploadS3: false,
    s3Prefix: 'generated',
    help: false,
  };

  for (const rawArg of argv) {
    if (rawArg === '--help' || rawArg === '-h') {
      args.help = true;
      continue;
    }

    if (rawArg === '--overwrite') {
      args.overwrite = true;
      continue;
    }

    if (rawArg === '--upload-s3') {
      args.uploadS3 = true;
      continue;
    }

    if (rawArg.startsWith('--env-file=')) {
      args.envFile = rawArg.slice('--env-file='.length);
      continue;
    }

    if (rawArg.startsWith('--slugs=')) {
      args.slugs = rawArg
        .slice('--slugs='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      continue;
    }

    if (rawArg.startsWith('--s3-prefix=')) {
      args.s3Prefix = rawArg.slice('--s3-prefix='.length).replace(/^\/+|\/+$/g, '');
      continue;
    }

    throw new Error(`Unknown argument: ${rawArg}`);
  }

  return args;
}

function printHelp() {
  process.stdout.write(`Usage: node ./scripts/generate-assets.mjs [options]\n\n`);
  process.stdout.write(`Options:\n`);
  process.stdout.write(`  --env-file=<path>     Override env file (default: ${DEFAULT_ENV_FILE})\n`);
  process.stdout.write(`  --slugs=a,b,c         Generate only the specified page slugs\n`);
  process.stdout.write(`  --overwrite           Regenerate even if output files already exist\n`);
  process.stdout.write(`  --upload-s3           Upload generated files to S3 using AWS env credentials\n`);
  process.stdout.write(`  --s3-prefix=<path>    CDN/S3 key prefix for uploads (default: generated)\n`);
  process.stdout.write(`  --help                Show this help\n`);
}

async function readEnvFile(filePath) {
  const source = await readFile(filePath, 'utf8');
  const values = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [rawKey, ...rawValue] = line.split('=');
    const key = rawKey.trim().replace(/^export\s+/, '');
    const value = rawValue.join('=').trim().replace(/^['"]|['"]$/g, '');
    values[key] = value;
  }

  return values;
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    throw new Error('Expected frontmatter block at top of file.');
  }

  const frontmatter = parseYaml(match[1]);

  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    throw new Error('Frontmatter must parse to an object.');
  }

  return frontmatter;
}

async function loadPages() {
  const entries = await (await import('node:fs/promises')).readdir(CONTENT_ROOT, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue;
    const filePath = path.join(CONTENT_ROOT, entry.name);
    const source = await readFile(filePath, 'utf8');
    const frontmatter = splitFrontmatter(source);
    const slug = frontmatter?.route?.slug;
    if (typeof slug !== 'string' || !slug) continue;

    pages.push({
      filePath,
      slug,
      title: frontmatter.title,
      answerSummary: frontmatter.answer_summary,
      images: frontmatter.images ?? {},
    });
  }

  return pages;
}

function buildPrompt(page) {
  if (PROMPT_OVERRIDES[page.slug]) {
    return PROMPT_OVERRIDES[page.slug];
  }

  return `Premium editorial hero image for ${page.title}, dark refined background, cinematic product atmosphere, based on this page intent: ${page.answerSummary}, no text, no watermark, 16:9 composition`;
}

async function createTask({ baseUrl, apiKey, correlationId, prompt }) {
  const response = await fetch(`${baseUrl}/v1/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      'X-Correlation-ID': correlationId,
    },
    body: JSON.stringify({
      user_id: DEFAULT_USER_ID,
      type: 'IMAGE_GEN',
      source: 'TOOL',
      billing_mode: 'credits',
      delay_seconds: 0,
      input: {
        prompt,
        aspect_ratio: '16:9',
        model_name: MODEL_ID,
        model_id: MODEL_ID,
        generation_count: 1,
        image_size: '2K',
        seed: -1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Task creation failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const taskId = data.task_id ?? data.id ?? data?.data?.task_id;

  if (!taskId) {
    throw new Error(`Task creation response did not include a task id: ${JSON.stringify(data)}`);
  }

  return taskId;
}

async function pollTask({ baseUrl, apiKey, taskId }) {
  for (let attempt = 0; attempt < 150; attempt += 1) {
    const response = await fetch(`${baseUrl}/v1/tasks/${taskId}`, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Task polling failed for ${taskId}: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    if (TERMINAL_STATUSES.has(data.status)) {
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, Math.min(10_000, 2_000 + attempt * 250)));
  }

  throw new Error(`Timed out waiting for task ${taskId}`);
}

function extractImageUrl(result) {
  const output = result.output ?? {};

  if (Array.isArray(output.data)) {
    for (const item of output.data) {
      if (item && typeof item === 'object' && typeof item.url === 'string' && item.url) {
        return item.url;
      }
    }
  }

  if (typeof output.image_url === 'string' && output.image_url) {
    return output.image_url;
  }

  throw new Error(`Task result did not include an image URL: ${JSON.stringify(result)}`);
}

async function saveRemoteImage(url, outputPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const originalBuffer = Buffer.from(await response.arrayBuffer());
  const normalizedBuffer = await sharp(originalBuffer).png().toBuffer();
  await writeFile(outputPath, normalizedBuffer);
  return {
    buffer: normalizedBuffer,
    contentType: 'image/png',
  };
}

function createS3Client({ region }) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_SESSION_TOKEN) {
    throw new Error(
      'Expected AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN in the process environment for --upload-s3.',
    );
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  });
}

async function uploadToS3({ client, bucket, cdnDomain, keyPrefix, fileName, buffer, contentType }) {
  const normalizedPrefix = keyPrefix.replace(/^\/+|\/+$/g, '');
  const cdnKey = normalizedPrefix ? `${normalizedPrefix}/${fileName}` : fileName;
  const fullKey = `public/${cdnKey}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: buffer,
      ContentType: contentType,
      ACL: 'bucket-owner-full-control',
    }),
  );

  const normalizedCdnDomain = cdnDomain.replace(/\/$/, '');
  return `${normalizedCdnDomain}/${cdnKey}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const env = await readEnvFile(args.envFile);
  const baseUrl = env.TASK_SERVICE_BASE_URL?.replace(/\/$/, '');
  const apiKey = env.TASK_SERVICE_API_KEY;
  const awsRegion = env.AWS_REGION;
  const s3Bucket = env.S3_BUCKET;
  const cdnDomain = env.CDN_DOMAIN;

  if (!baseUrl || !apiKey) {
    throw new Error(`Expected TASK_SERVICE_BASE_URL and TASK_SERVICE_API_KEY in ${args.envFile}`);
  }

  let s3Client = null;

  if (args.uploadS3) {
    if (!awsRegion || !s3Bucket || !cdnDomain) {
      throw new Error(`Expected AWS_REGION, S3_BUCKET, and CDN_DOMAIN in ${args.envFile} for --upload-s3`);
    }

    s3Client = createS3Client({ region: awsRegion });
  }

  await mkdir(OUTPUT_ROOT, { recursive: true });
  const pages = await loadPages();
  const selectedPages = args.slugs ? pages.filter((page) => args.slugs.includes(page.slug)) : pages;

  if (selectedPages.length === 0) {
    throw new Error('No pages selected for asset generation.');
  }

  for (const page of selectedPages) {
    const outputFileName = `${page.slug}.png`;
    const outputPath = path.join(OUTPUT_ROOT, outputFileName);

    if (!args.overwrite) {
      try {
        await access(outputPath);
        process.stdout.write(`Skipping ${page.slug}: ${outputFileName} already exists. Use --overwrite to regenerate.\n`);
        continue;
      } catch {
        // continue to generation
      }
    }

    const prompt = buildPrompt(page);
    process.stdout.write(`Creating task for ${page.slug}...\n`);
    const taskId = await createTask({
      baseUrl,
      apiKey,
      correlationId: `auto-seo-${page.slug}`,
      prompt,
    });

    const result = await pollTask({ baseUrl, apiKey, taskId });

    if (result.status !== 'SUCCEEDED') {
      throw new Error(`Task ${taskId} for ${page.slug} ended with status ${result.status}.`);
    }

    const imageUrl = extractImageUrl(result);
    const { buffer, contentType } = await saveRemoteImage(imageUrl, outputPath);
    process.stdout.write(`Saved ${page.slug} -> ${outputPath}\n`);

    if (s3Client && s3Bucket && cdnDomain) {
      const cdnUrl = await uploadToS3({
        client: s3Client,
        bucket: s3Bucket,
        cdnDomain,
        keyPrefix: args.s3Prefix,
        fileName: outputFileName,
        buffer,
        contentType,
      });
      process.stdout.write(`Uploaded ${page.slug} -> ${cdnUrl}\n`);
    }
  }

  process.stdout.write('Asset generation complete.\n');
}

await main();
