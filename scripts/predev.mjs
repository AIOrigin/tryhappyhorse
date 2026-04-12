import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

const root = process.cwd();
const nextRoot = path.join(root, '.next');
const serverRoot = path.join(nextRoot, 'server');
const webpackCacheRoot = path.join(nextRoot, 'cache', 'webpack', 'client-development-fallback');

const routesManifestPath = path.join(nextRoot, 'routes-manifest.json');
const prerenderManifestPath = path.join(nextRoot, 'prerender-manifest.json');
const middlewareManifestPath = path.join(serverRoot, 'middleware-manifest.json');
const requiredServerFilesPath = path.join(nextRoot, 'required-server-files.json');

await mkdir(serverRoot, { recursive: true });
await mkdir(webpackCacheRoot, { recursive: true });

const routesManifest = {
  version: 3,
  pages404: true,
  caseSensitive: false,
  basePath: '',
  redirects: [
    {
      source: '/:file((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+)/',
      destination: '/:file',
      internal: true,
      missing: [{ type: 'header', key: 'x-nextjs-data' }],
      statusCode: 308,
      regex: '^(?:/((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/]+\\.\\w+))/$',
    },
    {
      source: '/:notfile((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/\\.]+)',
      destination: '/:notfile/',
      internal: true,
      statusCode: 308,
      regex: '^(?:/((?!\\.well-known(?:/.*)?)(?:[^/]+/)*[^/\\.]+))$',
    },
  ],
  headers: [],
  rewrites: {
    beforeFiles: [],
    afterFiles: [],
    fallback: [],
  },
  dynamicRoutes: [
    {
      page: '/[...slug]',
      regex: '^/(.+?)(?:/)?$',
      routeKeys: { nxtPslug: 'nxtPslug' },
      namedRegex: '^/(?<nxtPslug>.+?)(?:/)?$',
    },
  ],
  staticRoutes: [
    { page: '/', regex: '^/(?:/)?$', routeKeys: {}, namedRegex: '^/(?:/)?$' },
    { page: '/_not-found', regex: '^/_not\\-found(?:/)?$', routeKeys: {}, namedRegex: '^/_not\\-found(?:/)?$' },
    { page: '/privacy-compliance', regex: '^/privacy\\-compliance(?:/)?$', routeKeys: {}, namedRegex: '^/privacy\\-compliance(?:/)?$' },
    { page: '/robots.txt', regex: '^/robots\\.txt(?:/)?$', routeKeys: {}, namedRegex: '^/robots\\.txt(?:/)?$' },
  ],
  dataRoutes: [],
  rsc: {
    header: 'rsc',
    varyHeader: 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch',
    prefetchHeader: 'next-router-prefetch',
    didPostponeHeader: 'x-nextjs-postponed',
    contentTypeHeader: 'text/x-component',
    suffix: '.rsc',
    prefetchSuffix: '.prefetch.rsc',
    prefetchSegmentHeader: 'next-router-segment-prefetch',
    prefetchSegmentSuffix: '.segment.rsc',
    prefetchSegmentDirSuffix: '.segments',
  },
  rewriteHeaders: {
    pathHeader: 'x-nextjs-rewritten-path',
    queryHeader: 'x-nextjs-rewritten-query',
  },
};

const prerenderManifest = {
  version: 4,
  routes: {},
  dynamicRoutes: {},
  notFoundRoutes: [],
  preview: {
    previewModeId: randomBytes(16).toString('hex'),
    previewModeSigningKey: randomBytes(32).toString('hex'),
    previewModeEncryptionKey: randomBytes(32).toString('hex'),
  },
};

const middlewareManifest = {
  version: 3,
  middleware: {},
  functions: {},
  sortedMiddleware: [],
};

async function ensureJsonFile(filePath, value) {
  try {
    await access(filePath);
  } catch {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  }
}

await Promise.all([
  ensureJsonFile(routesManifestPath, routesManifest),
  ensureJsonFile(prerenderManifestPath, prerenderManifest),
  ensureJsonFile(middlewareManifestPath, middlewareManifest),
]);

let requiresBootstrapBuild = false;

try {
  await access(requiredServerFilesPath);
} catch {
  requiresBootstrapBuild = true;
}

if (requiresBootstrapBuild) {
  await new Promise((resolve, reject) => {
    const child = spawn(path.join(root, 'node_modules', '.bin', 'next'), ['build'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_DISABLE_ESLINT: '1',
      },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`Predev bootstrap build failed with exit code ${code ?? 'unknown'}.`));
    });
  });
}

process.stdout.write(`Prepared dev manifests and webpack cache bootstrap${requiresBootstrapBuild ? ', then ran a bootstrap build' : ''}.\n`);
