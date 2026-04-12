import { rm } from 'node:fs/promises';
import path from 'node:path';

const targets = ['.next', 'out', 'dist', '.astro', 'tsconfig.tsbuildinfo'];

await Promise.all(
  targets.map(async (target) => {
    const absolutePath = path.join(process.cwd(), target);
    await rm(absolutePath, { recursive: true, force: true });
  }),
);

process.stdout.write(`Cleaned: ${targets.join(', ')}\n`);
