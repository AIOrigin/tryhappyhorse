# Task API Image Generation

## Purpose

Generate page-specific image assets for the `auto-seo` site by calling the task service directly, then save the resulting files into the local site so page frontmatter and SEO metadata can use them.

This skill reflects the exact workflow currently used for the generated assets under `public/generated/*.png`.

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

The direct task-service workflow uses these exact keys:

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

Fixed user id currently used:

```bash
a67d83ef-cba8-4a19-ad2f-14af05f60bce
```

---

## Exact API calls

### Create image task

```http
POST {TASK_SERVICE_BASE_URL}/v1/tasks
```

Headers:

```http
Content-Type: application/json
X-API-KEY: <TASK_SERVICE_API_KEY>
X-Correlation-ID: auto-seo-<slug>
```

Payload:

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

### Poll task

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

Image URL extraction order:

1. `output.data[].url`
2. `output.image_url`

---

## Why this does not use local `/v2/image/generate`

The local `elser-tool-api` app exposes higher-level image routes, but the local path depends on its own DB/orchestration layer.

For site asset generation, the stable path was:

1. read `TASK_SERVICE_BASE_URL` and `TASK_SERVICE_API_KEY`
2. call the task service directly
3. poll status directly
4. download the returned image URL
5. normalize the downloaded bytes into a real PNG
6. save it into `public/generated`

---

## Current generated filenames

These are the current generated assets:

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

Saved under:

```bash
/Users/shaozhupeng/workspace/auto-seo/public/generated
```

---

## Current frontmatter wiring

Target pages live under:

```bash
/Users/shaozhupeng/workspace/auto-seo/src/content/pages
```

Typical image block:

```yaml
images:
  social_path: /generated/<slug>.png
  hero_path: /generated/<slug>.png
  alt: <page-specific alt>
```

---

## Prompt-writing rules

Every prompt should:

- match page intent
- use a cinematic/editorial tone
- avoid text inside the image
- avoid watermarks
- keep a premium dark product feel
- use `16:9`

Example:

```text
Creative prompt design hero image with cinematic storyboard thumbnails, visual prompt notebook, framing arrows, mood references, elegant creator workflow scene, dark refined background, no text, no watermark, 16:9 composition
```

---

## Executable script in this repo

```bash
/Users/shaozhupeng/workspace/auto-seo/scripts/generate-assets.mjs
```

Package entrypoint:

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

If target files already exist and you want to replace them:

```bash
npm run generate:assets -- --slugs=<slug-list> --overwrite
```

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

### Verified real-world test

This workflow was tested with a real upload using:

```bash
npm run generate:assets -- --slugs=home --overwrite --upload-s3
```

Verified uploaded URL:

```bash
https://assets.dev.tool.elser.ai/generated/home.png
```

Verified checks performed:

- local regenerated file signature is real PNG
- CDN URL returns `200`
- CDN `Content-Type` is `image/png`

---

## Caveats

1. The current defaults assume this exact sibling repo layout.
2. The workflow assumes task-service outputs are directly downloadable and appropriate to save as `<slug>.png`.
3. S3 upload uses standard AWS env credentials from the shell, not from the `.env.local` file.
4. This is for repo-level asset generation, not a runtime user-facing feature.

### Practical note

If the task service returns WebP bytes behind a generic URL, the repo script will still convert them into a real PNG before saving locally or uploading to S3. That normalization step is intentional and required for this site's current `/generated/*.png` contract.
