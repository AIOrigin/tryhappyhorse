import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const SITE_ROOT = process.cwd();
const OUTPUT_ROOT = path.join(SITE_ROOT, 'public', 'generated');
const DEFAULT_ENV_FILE = path.resolve(SITE_ROOT, '../elser-quene/elser-tool-api/.env.local');

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

async function main() {
  const env = await readEnvFile(DEFAULT_ENV_FILE);
  const awsRegion = env.AWS_REGION;
  const s3Bucket = env.S3_BUCKET;
  const cdnDomain = env.CDN_DOMAIN?.replace(/\/$/, '');
  const s3Prefix = 'generated';

  if (!awsRegion || !s3Bucket || !cdnDomain) {
    throw new Error('Expected AWS_REGION, S3_BUCKET, and CDN_DOMAIN in env file');
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_SESSION_TOKEN) {
    throw new Error('Expected AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_SESSION_TOKEN in environment');
  }

  const s3Client = new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  });

  const entries = await readdir(OUTPUT_ROOT, { withFileTypes: true });
  const pngFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.png'));

  const results = {};

  for (const file of pngFiles) {
    const filePath = path.join(OUTPUT_ROOT, file.name);
    const buffer = await readFile(filePath);
    const cdnKey = `${s3Prefix}/${file.name}`;
    const fullKey = `public/${cdnKey}`;

    process.stdout.write(`Uploading ${file.name}...`);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: fullKey,
        Body: buffer,
        ContentType: 'image/png',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const cdnUrl = `${cdnDomain}/${cdnKey}`;
    results[file.name] = cdnUrl;
    process.stdout.write(` -> ${cdnUrl}\n`);
  }

  process.stdout.write(`\nUploaded ${Object.keys(results).length} files.\n`);
  process.stdout.write(`\nCDN URL mapping:\n`);
  for (const [fileName, url] of Object.entries(results)) {
    const slug = fileName.replace('.png', '');
    process.stdout.write(`  ${slug}: ${url}\n`);
  }
}

await main();
