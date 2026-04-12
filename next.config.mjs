import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default function createNextConfig(phase) {
  /** @type {import('next').NextConfig} */
  const config = {
    trailingSlash: true,
    outputFileTracingRoot: repoRoot,
    experimental: {
      devtoolSegmentExplorer: false,
      browserDebugInfoInTerminal: false,
    },
  };

  if (phase === PHASE_PRODUCTION_BUILD) {
    config.output = 'export';
  }

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    config.onDemandEntries = {
      maxInactiveAge: 60_000,
      pagesBufferLength: 5,
    };
  }

  return config;
}
