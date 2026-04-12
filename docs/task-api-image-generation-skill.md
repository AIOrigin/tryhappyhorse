# Task-API Image Generation Skill

## Purpose

This workflow generates page-specific hero/social image assets for the `auto-seo` site by calling the task service directly, then saves the generated files into the local site so frontmatter and SEO metadata can use them.

This is the exact workflow used for the current `public/generated/*.png` assets.

---

## Repositories and directories

### Site repository

```bash
/Users/shaozhupeng/workspace/auto-seo
```

### Tool API reference repository

```bash
/Users/shaozhupeng/workspace/elser-quene/elser-tool-api
```

### Page content directory

```bash
/Users/shaozhupeng/workspace/auto-seo/src/content/pages
```

### Generated asset output directory

```bash
/Users/shaozhupeng/workspace/auto-seo/public/generated
```

### Default env file used by this workflow

```bash
/Users/shaozhupeng/workspace/elser-quene/elser-tool-api/.env.local
```

---

## Exact env keys used

The direct task-service path uses these exact keys from the env file:

```bash
TASK_SERVICE_BASE_URL
TASK_SERVICE_API_KEY
```

For optional S3 upload in the repo script, the env file also uses:

```bash
AWS_REGION
S3_BUCKET
CDN_DOMAIN
```

And the process environment must provide:

```bash
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```

The current workflow also uses this fixed user id when creating tasks:

```bash
a67d83ef-cba8-4a19-ad2f-14af05f60bce
```

---

## Exact API calls used

### Create image-generation task

```http
POST {TASK_SERVICE_BASE_URL}/v1/tasks
```

Headers:

```http
Content-Type: application/json
X-API-KEY: <TASK_SERVICE_API_KEY>
X-Correlation-ID: auto-seo-<slug>
```

Payload shape:

```json
{
  "user_id": "a67d83ef-cba8-4a19-ad2f-14af05f60bce",
  "type": "IMAGE_GEN",
  "source": "TOOL",
  "billing_mode": "credits",
  "delay_seconds": 0,
  "input": {
    "prompt": "<page-specific prompt>",
    "aspect_ratio": "16:9",
    "model_name": "gemini-3-pro-image-preview",
    "model_id": "gemini-3-pro-image-preview",
    "generation_count": 1,
    "image_size": "2K",
    "seed": -1
  }
}
```

### Poll task status

```http
GET {TASK_SERVICE_BASE_URL}/v1/tasks/{task_id}
```

Headers:

```http
X-API-KEY: <TASK_SERVICE_API_KEY>
```

Terminal statuses:

```text
SUCCEEDED
FAILED
CANCELLED
EXPIRED
REVOKED
REJECTED
```

The image URL is extracted in this order:

1. `output.data[].url`
2. `output.image_url`

---

## Why the workflow calls the task service directly

The local `elser-tool-api` app exposes higher-level routes like `/v2/image/generate`, but the local app path depends on its own DB/orchestration path.

For current site asset generation, the stable workflow was:

1. read `TASK_SERVICE_BASE_URL` and `TASK_SERVICE_API_KEY`
2. call the task service directly
3. poll status directly
4. download the finished image URL
5. normalize the downloaded bytes into a real PNG
6. save it into `public/generated`

This avoids local DB/orchestration failures while still using the exact task backend.

---

## Current generated asset filenames

These files were generated via the task-service workflow and saved to:

```bash
/Users/shaozhupeng/workspace/auto-seo/public/generated
```

Files:

```bash
home.png
what-is-happyhorse.png
try-happyhorse.png
happyhorse-vs-seedance.png
happyhorse-alternatives.png
happyhorse-prompts.png
happyhorse-github.png
happyhorse-open-source.png
best-ai-video-models.png
```

---

## Current page frontmatter wiring

These page files currently reference generated images through the `images` block:

```bash
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/home.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/what-is-happyhorse.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/try-happyhorse.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/happyhorse-vs-seedance.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/happyhorse-alternatives.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/happyhorse-prompts.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/happyhorse-github.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/happyhorse-open-source.mdx
/Users/shaozhupeng/workspace/auto-seo/src/content/pages/best-ai-video-models.mdx
```

Typical image block:

```yaml
images:
  social_path: /generated/<slug>.png
  hero_path: /generated/<slug>.png
  alt: <page-specific alt>
```

---

## Prompt-writing rules used for this site

Every prompt should:

- match the page intent
- use a cinematic/editorial tone
- avoid text inside the image
- avoid watermark requests
- keep a premium dark product/brand feel
- use `16:9`

Examples:

```text
Creative prompt design hero image with cinematic storyboard thumbnails, visual prompt notebook, framing arrows, mood references, elegant creator workflow scene, dark refined background, no text, no watermark, 16:9 composition
```

```text
Category overview hero image for the best AI video models, cinematic mosaic of motion frames, creator tools and glowing model cards, broad discovery mood, dark premium editorial background, no text, no watermark, 16:9 composition
```

---

## Risks and caveats

1. `TASK_SERVICE_BASE_URL` and `TASK_SERVICE_API_KEY` must be valid.
2. The current workflow assumes image outputs are downloadable from returned URLs.
3. This pipeline does not update frontmatter automatically unless the target pages already point at the expected `/generated/<slug>.png` filenames.
4. The current site metadata no longer hardcodes image width/height, which is intentional because generated image dimensions may vary.
5. The current `.mdx` corpus is treated as markdown-only in runtime rendering, so image generation should not depend on MDX JSX semantics.

---

## Executable script

This repo now includes a reusable script:

```bash
/Users/shaozhupeng/workspace/auto-seo/scripts/generate-assets.mjs
```

Package script:

```bash
npm run generate:assets
```

Examples:

```bash
npm run generate:assets
npm run generate:assets -- --slugs=home,try-happyhorse
npm run generate:assets -- --slugs=home,try-happyhorse --overwrite
npm run generate:assets -- --slugs=home --overwrite --upload-s3
npm run generate:assets -- --slugs=home --overwrite --upload-s3 --s3-prefix=generated
npm run generate:assets -- --env-file=/Users/shaozhupeng/workspace/elser-quene/elser-tool-api/.env.local
```

---

## Recommended operator flow

```bash
cd /Users/shaozhupeng/workspace/auto-seo
npm run generate:assets
npm run build
npm run test:e2e
```

If prompts or page intent changed materially, regenerate the affected slugs only.

If you also want to upload to S3/CDN in the same run:

```bash
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
npm run generate:assets -- --slugs=<slug-list> --overwrite --upload-s3
```

Default uploaded object path:

```text
public/generated/<slug>.png
```

The repo script normalizes downloaded task-service outputs into real PNG files before writing locally or uploading to S3. This avoids mismatches where the upstream asset bytes are WebP but the site expects `.png` files.

Default returned CDN URL shape:

```text
{CDN_DOMAIN}/generated/<slug>.png
```

If the target files already exist and you want to replace them, use:

```bash
npm run generate:assets -- --slugs=<slug-list> --overwrite
```
