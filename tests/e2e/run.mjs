import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const siteOrigin = 'https://tryhappyhorse.xyz';
const previewHost = '127.0.0.1';
const previewPort = Number.parseInt(process.env.E2E_PREVIEW_PORT ?? '4173', 10);
const previewOrigin = `http://${previewHost}:${previewPort}`;
const browserDebuggingPort = Number.parseInt(process.env.E2E_BROWSER_DEBUG_PORT ?? '0', 10);
const browserBinaryCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const pageRoutes = [
  '/',
  '/what-is-happyhorse/',
  '/happyhorse-vs-seedance/',
  '/try-happyhorse/',
  '/happyhorse-alternatives/',
  '/happyhorse-prompts/',
  '/happyhorse-github/',
  '/happyhorse-open-source/',
  '/best-ai-video-models/',
];

function routeToDistPath(route) {
  return route === '/' ? '../../out/index.html' : `../../out${route}index.html`;
}

async function readBuiltPage(route) {
  return readFile(new URL(routeToDistPath(route), import.meta.url), 'utf8');
}

async function readBuildArtifact(relativePath) {
  return readFile(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(message);
  }
}

function expectedSocialImageUrl(route) {
  if (route === '/') {
    return `${siteOrigin}/generated/home.png`;
  }

  if (route === '/try-happyhorse/') {
    return `${siteOrigin}/generated/try-happyhorse.png`;
  }

  if (route === '/what-is-happyhorse/') {
    return `${siteOrigin}/generated/what-is-happyhorse.png`;
  }

  if (route === '/happyhorse-vs-seedance/') {
    return `${siteOrigin}/generated/happyhorse-vs-seedance.png`;
  }

  if (route === '/happyhorse-alternatives/') {
    return `${siteOrigin}/generated/happyhorse-alternatives.png`;
  }

  if (route === '/happyhorse-prompts/') {
    return `${siteOrigin}/generated/happyhorse-prompts.png`;
  }

  if (route === '/happyhorse-github/') {
    return `${siteOrigin}/generated/happyhorse-github.png`;
  }

  if (route === '/happyhorse-open-source/') {
    return `${siteOrigin}/generated/happyhorse-open-source.png`;
  }

  if (route === '/best-ai-video-models/') {
    return `${siteOrigin}/generated/best-ai-video-models.png`;
  }

  return `${siteOrigin}/social/default-share.png`;
}

function assertRouteMetadata(route, html) {
  const canonicalUrl = `${siteOrigin}${route}`;
  const expectedTitleNeedle = route === '/' ? '<title>HappyHorse AI Video Guide and Access Hub</title>' : ' | HappyHorse AI Video Guide</title>';
  const socialImageUrl = expectedSocialImageUrl(route);

  assertIncludes(html, 'route-discovery-bar__nav', `Expected ${route} to render the shared route-discovery header.`);
  assertIncludes(html, `<link rel="canonical" href="${canonicalUrl}"`, `Expected ${route} to expose canonical ${canonicalUrl}.`);
  assertIncludes(html, `"url":"${canonicalUrl}"`, `Expected ${route} JSON-LD to use canonical ${canonicalUrl}.`);
  assertIncludes(html, 'BreadcrumbList', `Expected ${route} to include breadcrumb JSON-LD.`);
  assertIncludes(html, '<nav class="breadcrumbs" aria-label="Breadcrumb">', `Expected ${route} to render visible breadcrumbs.`);
  assertIncludes(html, expectedTitleNeedle, `Expected ${route} to render the upgraded title pattern.`);
  assertIncludes(html, '<meta name="theme-color" content="#0c1224"', `Expected ${route} to include the shared theme color.`);
  if (
    !html.includes('<meta name="twitter:card" content="summary"') &&
    !html.includes('<meta name="twitter:card" content="summary_large_image"')
  ) {
    throw new Error(`Expected ${route} to include Twitter card metadata.`);
  }
  assertIncludes(html, '<meta property="og:site_name" content="HappyHorse AI Video Guide"', `Expected ${route} to include shared Open Graph site metadata.`);
  assertIncludes(html, `<meta property="og:image" content="${socialImageUrl}"`, `Expected ${route} to include an og:image tag.`);
  assertIncludes(html, `<meta name="twitter:image" content="${socialImageUrl}"`, `Expected ${route} to include a twitter:image tag.`);
  assertIncludes(html, 'GTM-WGQVVGFZ', `Expected ${route} to include the GTM container ID.`);

  if (route === '/') {
    assertIncludes(html, '"position":1,"name":"Home","item":"https://tryhappyhorse.xyz/"', 'Expected homepage breadcrumb JSON-LD to contain only Home.');
    return;
  }

  assertIncludes(html, '<a href="/">Home</a>', `Expected ${route} breadcrumbs to link back to homepage.`);
  assertIncludes(html, `"position":2`, `Expected ${route} breadcrumb JSON-LD to include the current page as position 2.`);
}

function assertRelatedLinkCount(route, html, minimum) {
  const matchCount = [...html.matchAll(/class="related-link-card"/g)].length;

  if (matchCount < minimum) {
    throw new Error(`Expected ${route} to expose at least ${minimum} related links, found ${matchCount}.`);
  }
}

function assertSitemapRoutes(sitemapXml) {
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedLocs = [
    `${siteOrigin}/`,
    `${siteOrigin}/best-ai-video-models/`,
    `${siteOrigin}/happyhorse-alternatives/`,
    `${siteOrigin}/happyhorse-github/`,
    `${siteOrigin}/happyhorse-open-source/`,
    `${siteOrigin}/happyhorse-prompts/`,
    `${siteOrigin}/happyhorse-vs-seedance/`,
    `${siteOrigin}/privacy-compliance/`,
    `${siteOrigin}/try-happyhorse/`,
    `${siteOrigin}/what-is-happyhorse/`,
  ];

  if (locs.length !== expectedLocs.length) {
    throw new Error(`Expected sitemap to include ${expectedLocs.length} URLs, found ${locs.length}.`);
  }

  for (const loc of expectedLocs) {
    if (!locs.includes(loc)) {
      throw new Error(`Expected sitemap to include ${loc}.`);
    }
  }
}

const externalCommand = process.env.E2E_COMMAND;

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: process.env,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited with signal ${signal}.`));
        return;
      }

      if ((code ?? 1) !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 1}.`));
        return;
      }

      resolve();
    });
  });
}

async function ensureBuiltOutput() {
  try {
  await access(new URL('../../out/index.html', import.meta.url));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await runCommand('npm', ['run', 'build']);
      return;
    }

    throw error;
  }
}

function runExternalCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`External E2E command exited with signal ${signal}.`));
        return;
      }

      if ((code ?? 1) !== 0) {
        reject(new Error(`External E2E command exited with code ${code ?? 1}.`));
        return;
      }

      resolve();
    });
  });
}

async function findBrowserBinary() {
  for (const candidate of browserBinaryCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Could not find a supported local browser binary. Checked: ${browserBinaryCandidates.join(', ')}`);
}

function startBrowserProcess(browserBinary, userDataDirectory) {
  return spawn(
    browserBinary,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${browserDebuggingPort}`,
      `--user-data-dir=${userDataDirectory}`,
      'about:blank',
    ],
    {
      env: process.env,
    },
  );
}

async function readDebuggingPort(userDataDirectory, browserProcess) {
  const activePortPath = join(userDataDirectory, 'DevToolsActivePort');
  const deadline = Date.now() + 30_000;
  let browserFailure = '';

  browserProcess.stderr.on('data', (chunk) => {
    browserFailure += chunk;
  });

  while (Date.now() < deadline) {
    if (browserProcess.exitCode !== null) {
      throw new Error(browserFailure.trim() || `Browser process exited with code ${browserProcess.exitCode}.`);
    }

    try {
      const fileContents = await readFile(activePortPath, 'utf8');
      const [portLine] = fileContents.split('\n');
      const parsedPort = Number.parseInt(portLine ?? '', 10);

      if (Number.isInteger(parsedPort) && parsedPort > 0) {
        return parsedPort;
      }
    } catch {
      // Keep polling until the browser exposes the debugging port.
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for the browser debugging port at ${activePortPath}. ${browserFailure.trim()}`.trim());
}

class ChromeDevToolsPage {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.pendingMessages = new Map();
    this.nextCommandId = 0;
    this.loadEventWaiters = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const handleOpen = () => {
        cleanup();
        resolve();
      };
      const handleError = (error) => {
        cleanup();
        reject(error instanceof Error ? error : new Error(String(error)));
      };
      const handleClose = () => {
        cleanup();
        reject(new Error('Browser DevTools socket closed before it connected.'));
      };
      const cleanup = () => {
        this.socket.removeEventListener('open', handleOpen);
        this.socket.removeEventListener('error', handleError);
        this.socket.removeEventListener('close', handleClose);
      };

      this.socket.addEventListener('open', handleOpen);
      this.socket.addEventListener('error', handleError);
      this.socket.addEventListener('close', handleClose);
      this.socket.addEventListener('message', (event) => {
        this.handleMessage(event);
      });
    });

    await this.send('Page.enable');
    await this.send('Runtime.enable');
  }

  handleMessage(event) {
    const payload = JSON.parse(typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8'));

    if (payload.id) {
      const pendingEntry = this.pendingMessages.get(payload.id);

      if (!pendingEntry) {
        return;
      }

      this.pendingMessages.delete(payload.id);

      if (payload.error) {
        pendingEntry.reject(new Error(payload.error.message || `DevTools command ${payload.id} failed.`));
        return;
      }

      pendingEntry.resolve(payload.result ?? {});
      return;
    }

    if (payload.method === 'Page.loadEventFired') {
      const waiters = this.loadEventWaiters.splice(0, this.loadEventWaiters.length);

      for (const waiter of waiters) {
        waiter();
      }
    }
  }

  send(method, params = {}) {
    const id = ++this.nextCommandId;

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForLoadEvent(timeoutMs = 30_000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.loadEventWaiters = this.loadEventWaiters.filter((waiter) => waiter !== handleLoad);
        reject(new Error(`Timed out waiting for browser load event after ${timeoutMs}ms.`));
      }, timeoutMs);

      const handleLoad = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      this.loadEventWaiters.push(handleLoad);
    });
  }

  async navigate(url) {
    const loadEventPromise = this.waitForLoadEvent();
    await this.send('Page.navigate', { url });
    await loadEventPromise;
    await delay(100);
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || `Browser evaluation failed for expression: ${expression}`);
    }

    return result.result?.value;
  }

  close() {
    this.socket.close();
  }
}

async function createBrowserHarness() {
  const tempDirectory = await mkdtemp(join(tmpdir(), 'auto-seo-e2e-browser-'));
  const browserBinary = await findBrowserBinary();
  const browserProcess = startBrowserProcess(browserBinary, tempDirectory);
  const debuggingPort = await readDebuggingPort(tempDirectory, browserProcess);
  const targetsResponse = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
  const targets = await targetsResponse.json();
  const pageTarget = targets.find((target) => target.type === 'page' && typeof target.webSocketDebuggerUrl === 'string');

  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Could not find a debuggable browser page target.');
  }

  const page = new ChromeDevToolsPage(pageTarget.webSocketDebuggerUrl);
  await page.connect();

  return {
    browserProcess,
    page,
    tempDirectory,
  };
}

async function waitForServerReady() {
  const deadline = Date.now() + 30_000;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${previewOrigin}/`, {
        redirect: 'manual',
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(`Preview server responded with status ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await delay(250);
  }

  throw new Error(
    `Timed out waiting for preview server at ${previewOrigin}. ${lastError instanceof Error ? lastError.message : ''}`.trim(),
  );
}

function startPreviewServer() {
  return spawn('npm', ['run', 'preview', '--', '--host', previewHost, '--port', String(previewPort)], {
    stdio: 'inherit',
    env: process.env,
  });
}

async function stopPreviewServer(serverProcess) {
  if (!serverProcess || serverProcess.exitCode !== null || serverProcess.killed) {
    return;
  }

  serverProcess.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => {
      serverProcess.once('exit', resolve);
    }),
    delay(5_000).then(() => {
      if (serverProcess.exitCode === null && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }),
  ]);
}

async function waitForBrowserCondition(browserPage, expression, timeoutMessage) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    const result = await browserPage.evaluate(`(() => Boolean(${expression}))()`);

    if (result === true) {
      return;
    }

    await delay(100);
  }

  throw new Error(timeoutMessage);
}

async function readRouteSnapshot(browserHarness, route) {
  await browserHarness.page.navigate(`${previewOrigin}${route}`);
  await waitForBrowserCondition(
    browserHarness.page,
    `window.location.pathname === ${JSON.stringify(route)} && document.body !== null`,
    `Timed out waiting for route ${route} to load in the browser.`,
  );
  await waitForBrowserCondition(
    browserHarness.page,
    `Array.isArray(window.dataLayer) && window.dataLayer.some((entry) => entry && entry.event === 'page_context')`,
    `Timed out waiting for ${route} to push page_context telemetry.`,
  );

    return browserHarness.page.evaluate(`({
      route: window.location.pathname,
      title: document.title,
      dataLayerEvents: Array.isArray(window.dataLayer) ? window.dataLayer.map((entry) => entry && typeof entry.event === 'string' ? entry.event : '').filter(Boolean) : [],
      heroImageCount: document.querySelectorAll('.hero-card__media img').length,
      hasRouteDiscoveryNav: Boolean(document.querySelector('.route-discovery-bar__nav[aria-label="Route discovery"]')),
      routeDiscoveryLinkCount: document.querySelectorAll('.route-discovery-bar__link').length,
      hasBreadcrumbNav: Boolean(document.querySelector('nav.breadcrumbs[aria-label="Breadcrumb"]')),
      hasHomeBreadcrumbLink: Array.from(document.querySelectorAll('nav.breadcrumbs a')).some((anchor) => anchor.getAttribute('href') === '/'),
      hasHeroSecondaryLink: Boolean(document.querySelector('.hero-card__secondary-link')),
      relatedLinkCount: document.querySelectorAll('.related-link-card').length,
      bodyText: document.body?.innerText ?? '',
    })`);
}

function assertBodyTextIncludes(route, snapshot, needle, message) {
  assertIncludes(snapshot.bodyText, needle, message ?? `Expected ${route} body text to include ${needle}.`);
}

function assertBrowserRouteMetadata(route, snapshot) {
  if (snapshot.route !== route) {
    throw new Error(`Expected browser to land on ${route}, but it loaded ${snapshot.route}.`);
  }

  if (!snapshot.title) {
    throw new Error(`Expected ${route} to render a document title in the browser.`);
  }

  if (!snapshot.dataLayerEvents.includes('page_context')) {
    throw new Error(`Expected ${route} to push a page_context event into dataLayer.`);
  }

  if (!snapshot.hasBreadcrumbNav) {
    throw new Error(`Expected ${route} to render visible breadcrumbs in the browser.`);
  }

  if (!snapshot.hasRouteDiscoveryNav || snapshot.routeDiscoveryLinkCount < pageRoutes.length) {
    throw new Error(`Expected ${route} to render the shared route-discovery navigation in the browser.`);
  }

  if (snapshot.relatedLinkCount < (route === '/' ? 8 : 2)) {
    throw new Error(
      `Expected ${route} to render at least ${route === '/' ? 8 : 2} related-link cards in the browser, found ${snapshot.relatedLinkCount}.`,
    );
  }

  if (route !== '/' && !snapshot.hasHomeBreadcrumbLink) {
    throw new Error(`Expected ${route} breadcrumbs to include a Home link in the browser.`);
  }

  if (['/', '/try-happyhorse/', '/what-is-happyhorse/', '/happyhorse-vs-seedance/'].includes(route) && snapshot.heroImageCount < 1) {
    throw new Error(`Expected ${route} to render visible hero media in the browser.`);
  }
}

function buildHandoffStateResultScript() {
  return `({
    heading: document.querySelector('#generator-entry-heading')?.textContent?.trim() ?? '',
    primaryLabel: document.querySelector('.generator-entry__primary')?.textContent?.trim() ?? '',
    primaryHref: document.querySelector('.generator-entry__primary')?.getAttribute('href') ?? '',
    intentCardCount: document.querySelectorAll('.generator-intent-card').length,
    telemetryEvents: Array.isArray(window.__happyhorseTelemetryEvents) ? window.__happyhorseTelemetryEvents.slice() : [],
    bodyText: document.body?.innerText ?? '',
  })`;
}

async function readHandoffState(browserPage) {
  return browserPage.evaluate(buildHandoffStateResultScript());
}

async function readTryPageHandoffSnapshot(browserHarness) {
  await browserHarness.page.navigate(`${previewOrigin}/try-happyhorse/`);
  await waitForBrowserCondition(
    browserHarness.page,
    `document.body?.innerText?.includes('Choose the Elser tool that fits your intent')`,
    'Timed out waiting for the /try-happyhorse/ handoff surface to render in the browser.',
  );

  return readHandoffState(browserHarness.page);
}

async function captureTryPageCtaTelemetry(browserHarness) {
  await browserHarness.page.navigate(`${previewOrigin}/try-happyhorse/`);
  await waitForBrowserCondition(
    browserHarness.page,
    `document.body?.innerText?.includes('Start from one idea')`,
    'Timed out waiting for the try-page handoff CTA to render in the browser.',
  );

  await browserHarness.page.evaluate(`(() => {
      window.__happyhorseTelemetryEvents = [];
      window.addEventListener('happyhorse-handoff-telemetry', (event) => {
        const nextEvent = event && event.detail && typeof event.detail.event === 'string' ? event.detail.event : 'unknown';
        window.__happyhorseTelemetryEvents.push(nextEvent);
      }, { once: false });

      const primaryCta = document.querySelector('[data-cta-href="https://www.elser.ai/anime"]');

      if (!(primaryCta instanceof HTMLAnchorElement)) {
        throw new Error('The try-page primary handoff CTA is not available in the browser.');
      }

      primaryCta.addEventListener('click', (event) => event.preventDefault(), { once: true });
      primaryCta.click();
      return true;
    })()`);

  await waitForBrowserCondition(
    browserHarness.page,
    `Array.isArray(window.__happyhorseTelemetryEvents) && window.__happyhorseTelemetryEvents.includes('cta_click')`,
    'Timed out waiting for the try-page CTA click telemetry to emit in the browser.',
  );

  return readHandoffState(browserHarness.page);
}

async function runBrowserBackedSmokeCheck() {
  if (process.platform !== 'darwin') {
    throw new Error('Default browser-backed E2E requires the local Chrome browser harness in this environment.');
  }

  await ensureBuiltOutput();
  const previewServer = startPreviewServer();
  const browserHarness = await createBrowserHarness();

  try {
    await waitForServerReady();

    for (const route of pageRoutes) {
      const snapshot = await readRouteSnapshot(browserHarness, route);

      assertBrowserRouteMetadata(route, snapshot);
    }

    const homepageSnapshot = await readRouteSnapshot(browserHarness, '/');
    const tryHappyHorseSnapshot = await readRouteSnapshot(browserHarness, '/try-happyhorse/');
    const comparisonSnapshot = await readRouteSnapshot(browserHarness, '/happyhorse-vs-seedance/');

    assertBodyTextIncludes('/', homepageSnapshot, 'Create your anime short', 'Expected the homepage action framing to render in a real browser.');
    assertBodyTextIncludes('/', homepageSnapshot, 'Jump across the main HappyHorse routes', 'Expected the homepage route-discovery header to render in a real browser.');
    assertBodyTextIncludes('/', homepageSnapshot, 'Why HappyHorse is drawing attention', 'Expected the slimmer homepage context section to render in a real browser.');

    if (homepageSnapshot.hasHeroSecondaryLink) {
      throw new Error('Expected the homepage hero to keep only one primary CTA.');
    }

    if (homepageSnapshot.bodyText.includes('Support routes for deeper checks')) {
      throw new Error('Expected the homepage to remove the old support-routes section from the body.');
    }

    assertBodyTextIncludes('/try-happyhorse/', tryHappyHorseSnapshot, 'Choose the Elser tool that fits your intent', 'Expected the try-page handoff heading to render in a real browser.');
    assertBodyTextIncludes('/happyhorse-vs-seedance/', comparisonSnapshot, 'this is the page to use', 'Expected the canonical comparison answer to render in a real browser.');

    const handoffState = await readTryPageHandoffSnapshot(browserHarness);

    if (handoffState.heading !== 'Choose the Elser tool that fits your intent') {
      throw new Error(`Expected /try-happyhorse/ to render the new handoff heading, received ${handoffState.heading}.`);
    }

    if (handoffState.primaryLabel !== 'Start from one idea' || handoffState.primaryHref !== 'https://www.elser.ai/anime') {
      throw new Error(
        `Expected /try-happyhorse/ to expose the primary Elser handoff, received label=${handoffState.primaryLabel} href=${handoffState.primaryHref}.`,
      );
    }

    if (handoffState.intentCardCount < 4) {
      throw new Error(`Expected /try-happyhorse/ to render at least 4 supporting handoff cards, received ${handoffState.intentCardCount}.`);
    }

    for (const label of ['Generate anime art', 'Animate your image', 'Make a character', 'Start storyboarding']) {
      if (!handoffState.bodyText.includes(label)) {
        throw new Error(`Expected /try-happyhorse/ to render the supporting handoff label ${label}.`);
      }
    }

    const telemetryState = await captureTryPageCtaTelemetry(browserHarness);

    if (!telemetryState.telemetryEvents.includes('cta_click')) {
      throw new Error('Expected the try-page primary handoff to emit cta_click telemetry in the browser.');
    }
  } finally {
    browserHarness.page.close();
    await stopPreviewServer(browserHarness.browserProcess);
    await stopPreviewServer(previewServer);
    await rm(browserHarness.tempDirectory, { recursive: true, force: true });
  }
}

async function runBuiltSmokeCheck() {
  await ensureBuiltOutput();

  const [homepageBundle, catchAllBundle] = await Promise.all([
    readBuildArtifact('.next/server/app/page.js'),
    readBuildArtifact('.next/server/app/[...slug]/page.js'),
  ]);

  for (const [name, bundle] of [
    ['homepage bundle', homepageBundle],
    ['catch-all bundle', catchAllBundle],
  ]) {
    if (bundle.includes('vendor-chunks/esprima')) {
      throw new Error(`Expected ${name} to stop referencing vendor-chunks/esprima after runtime parser cleanup.`);
    }

    if (bundle.includes('gray-matter')) {
      throw new Error(`Expected ${name} to stop referencing gray-matter in the app runtime path.`);
    }

    if (bundle.includes('next-mdx-remote/rsc')) {
      throw new Error(`Expected ${name} to stop referencing next-mdx-remote/rsc in the app runtime path.`);
    }
  }

  const builtPages = Object.fromEntries(await Promise.all(pageRoutes.map(async (route) => [route, await readBuiltPage(route)])));
  const homepageHtml = builtPages['/'];
  const accessPageHtml = builtPages['/try-happyhorse/'];
  const comparisonPageHtml = builtPages['/happyhorse-vs-seedance/'];
  const whatIsPageHtml = builtPages['/what-is-happyhorse/'];
  const alternativesPageHtml = builtPages['/happyhorse-alternatives/'];
  const promptsPageHtml = builtPages['/happyhorse-prompts/'];
  const githubPageHtml = builtPages['/happyhorse-github/'];
  const openSourcePageHtml = builtPages['/happyhorse-open-source/'];
  const bestAiVideoModelsPageHtml = builtPages['/best-ai-video-models/'];
  const sitemapAliasXml = await readFile(new URL('../../out/sitemap.xml', import.meta.url), 'utf8');
  const sitemapIndexXml = await readFile(new URL('../../out/sitemap-index.xml', import.meta.url), 'utf8');
  const sitemapXml = await readFile(new URL('../../out/sitemap-0.xml', import.meta.url), 'utf8');

  for (const route of pageRoutes) {
    assertRouteMetadata(route, builtPages[route]);
    assertRelatedLinkCount(route, builtPages[route], route === '/' ? 8 : 2);
  }

  assertIncludes(sitemapAliasXml, `${siteOrigin}/sitemap-0.xml`, 'Expected /sitemap.xml to point at sitemap-0.xml.');
  assertIncludes(sitemapIndexXml, `${siteOrigin}/sitemap-0.xml`, 'Expected sitemap index to point at sitemap-0.xml.');
  assertSitemapRoutes(sitemapXml);

  if (!homepageHtml.includes('<title>HappyHorse AI Video Guide and Access Hub</title>')) {
    throw new Error('Expected out/index.html to contain the shared-shell homepage title.');
  }

  if (!homepageHtml.includes('Create your anime short')) {
    throw new Error('Expected out/index.html to include the stronger homepage action framing.');
  }

  if (!homepageHtml.includes('Jump across the main HappyHorse routes')) {
    throw new Error('Expected out/index.html to include the shared route-discovery header copy.');
  }

  if (!homepageHtml.includes('Disclaimer: This website is an independent informational and comparison resource and is not the official HappyHorse website or service.')) {
    throw new Error('Expected out/index.html to include the homepage disclaimer text.');
  }

  if (
    !homepageHtml.includes('data-cta-telemetry') ||
    !homepageHtml.includes('data-cta-route="/"') ||
    !homepageHtml.includes('data-cta-page-type="homepage"') ||
    !homepageHtml.includes('data-cta-type="try_now"')
  ) {
    throw new Error('Expected out/index.html to expose CTA telemetry hooks with homepage route context.');
  }

  if (!homepageHtml.includes('Mixed signal')) {
    throw new Error('Expected out/index.html to render mixed-status uncertainty treatment.');
  }

  for (const route of pageRoutes.filter((route) => route !== '/')) {
    assertIncludes(homepageHtml, `href="${route}"`, `Expected homepage to link to ${route}.`);
  }

  if (homepageHtml.includes('hero-card__secondary-link')) {
    throw new Error('Expected out/index.html to keep the homepage hero to one primary CTA without a competing secondary hero link.');
  }

  if (homepageHtml.includes('Support routes for deeper checks')) {
    throw new Error('Expected out/index.html to remove the old support-routes section from the homepage body.');
  }

  assertIncludes(homepageHtml, 'Why HappyHorse is drawing attention', 'Expected homepage to render the slimmer overview context section.');
  assertIncludes(homepageHtml, 'src="/generated/home.png"', 'Expected the homepage hero to render a visible image asset.');
  assertIncludes(whatIsPageHtml, 'src="/generated/what-is-happyhorse.png"', 'Expected /what-is-happyhorse/ to render a visible hero image asset.');

  if (
    !accessPageHtml.includes('<title>Try HappyHorse') ||
    !accessPageHtml.includes(' | HappyHorse AI Video Guide</title>')
  ) {
    throw new Error('Expected /try-happyhorse/ to render through the shared shell.');
  }

  if (!accessPageHtml.includes('Unknown signal')) {
    throw new Error('Expected /try-happyhorse/ to render the unknown-status uncertainty callout.');
  }

  if (!accessPageHtml.includes('Choose the Elser tool that fits your intent')) {
    throw new Error('Expected /try-happyhorse/ to render the handoff UI at the canonical CTA slot.');
  }

  if (!accessPageHtml.includes('https://www.elser.ai/anime')) {
    throw new Error('Expected /try-happyhorse/ to include the primary Elser handoff URL.');
  }

  for (const handoffUrl of [
    'https://www.elser.ai/ai-anime-generator',
    'https://www.elser.ai/ai-image-animator',
    'https://www.elser.ai/ai-character-maker',
    'https://www.elser.ai/ai-storyboard',
    'https://www.elser.ai/tools/story-studio',
  ]) {
    assertIncludes(accessPageHtml, handoffUrl, `Expected /try-happyhorse/ to include the supporting handoff URL ${handoffUrl}.`);
  }

  if (!accessPageHtml.includes('happyhorse-handoff-telemetry')) {
    throw new Error('Expected /try-happyhorse/ to include telemetry hooks for the handoff CTA flow.');
  }

  if (
    !accessPageHtml.includes('data-cta-telemetry') ||
    !accessPageHtml.includes('data-cta-route="/try-happyhorse/"') ||
    !accessPageHtml.includes('data-cta-page-type="access"') ||
    !accessPageHtml.includes('data-cta-type="try_now"')
  ) {
    throw new Error('Expected /try-happyhorse/ to expose CTA telemetry hooks with app-route context.');
  }

  if (!accessPageHtml.includes('application/ld+json')) {
    throw new Error('Expected /try-happyhorse/ to include JSON-LD output.');
  }

  if (!accessPageHtml.includes('https://tryhappyhorse.xyz/try-happyhorse/')) {
    throw new Error('Expected /try-happyhorse/ to include the canonical URL.');
  }

  if (!accessPageHtml.includes('Related links') || !accessPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /try-happyhorse/ to include related links and disclaimer blocks.');
  }

  assertIncludes(accessPageHtml, 'src="/generated/try-happyhorse.png"', 'Expected /try-happyhorse/ to render a visible hero image asset.');

  if (
    !comparisonPageHtml.includes('<title>HappyHorse vs Seedance') ||
    !comparisonPageHtml.includes(' | HappyHorse AI Video Guide</title>')
  ) {
    throw new Error('Expected /happyhorse-vs-seedance/ to render the canonical comparison title.');
  }

  if (!comparisonPageHtml.includes('this is the page to use')) {
    throw new Error('Expected /happyhorse-vs-seedance/ to answer the comparison query directly.');
  }

  if (!comparisonPageHtml.includes('/seedance-vs-happyhorse/')) {
    throw new Error('Expected /happyhorse-vs-seedance/ to explain why the mirrored route is absent.');
  }

  if (!comparisonPageHtml.includes('Open Story Studio')) {
    throw new Error('Expected /happyhorse-vs-seedance/ to route the shared compare_now CTA into Story Studio.');
  }

  if (!comparisonPageHtml.includes('/what-is-happyhorse/') || !comparisonPageHtml.includes('/happyhorse-alternatives/')) {
    throw new Error('Expected /happyhorse-vs-seedance/ to link onward to explainer and alternatives journeys.');
  }

  assertIncludes(
    comparisonPageHtml,
    'https://www.elser.ai/tools/story-studio',
    'Expected /happyhorse-vs-seedance/ to include the Story Studio handoff URL.',
  );

  if (!comparisonPageHtml.includes('Related links') || !comparisonPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /happyhorse-vs-seedance/ to include related links and disclaimer blocks.');
  }

  assertIncludes(comparisonPageHtml, 'src="/generated/happyhorse-vs-seedance.png"', 'Expected /happyhorse-vs-seedance/ to render a visible hero image asset.');

  if (!alternativesPageHtml.includes('<title>HappyHorse Alternatives, Where to Go When Access Is Still Unclear | HappyHorse AI Video Guide</title>')) {
    throw new Error('Expected /happyhorse-alternatives/ to render the refined alternatives-focused title.');
  }

  if (!alternativesPageHtml.includes('Try the all-in-one alternative')) {
    throw new Error('Expected /happyhorse-alternatives/ to keep one primary see_alternatives CTA.');
  }

  if (!alternativesPageHtml.includes('/happyhorse-vs-seedance/') || !alternativesPageHtml.includes('https://www.elser.ai/ai-animation-generator')) {
    throw new Error('Expected /happyhorse-alternatives/ to link visibly to the comparison route and Elser handoff.');
  }

  if (!alternativesPageHtml.includes('Related links') || !alternativesPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /happyhorse-alternatives/ to include related links and disclaimer blocks.');
  }

  if (!promptsPageHtml.includes('<title>HappyHorse-Style Prompt Templates for AI Video Creators | HappyHorse AI Video Guide</title>')) {
    throw new Error('Expected /happyhorse-prompts/ to render the refined prompt-page title.');
  }

  if (!promptsPageHtml.includes('HappyHorse-style AI video prompt')) {
    throw new Error('Expected /happyhorse-prompts/ to include creator-facing prompt examples.');
  }

  if (!promptsPageHtml.includes('Browse Elser templates')) {
    throw new Error('Expected /happyhorse-prompts/ to keep the shared get_prompts CTA into the Elser template handoff.');
  }

  if (!promptsPageHtml.includes('not official HappyHorse prompts')) {
    throw new Error('Expected /happyhorse-prompts/ to keep explicit non-official framing.');
  }

  if (!promptsPageHtml.includes('https://www.elser.ai/templates') || !promptsPageHtml.includes('/happyhorse-alternatives/')) {
    throw new Error('Expected /happyhorse-prompts/ to include the Elser template handoff and route-safe internal links.');
  }

  if (!promptsPageHtml.includes('Related links') || !promptsPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /happyhorse-prompts/ to include related links and disclaimer blocks.');
  }

  if (!githubPageHtml.includes('<title>HappyHorse GitHub Status, Repo Signals and Safe Next Steps | HappyHorse AI Video Guide</title>')) {
    throw new Error('Expected /happyhorse-github/ to render the refined repo-status title.');
  }

  if (!githubPageHtml.includes('Verified signals vs unknown repository status')) {
    throw new Error('Expected /happyhorse-github/ to separate verified GitHub intent from unknown official-repo status.');
  }

  if (!githubPageHtml.includes('Why this is not the same as the open-source page')) {
    throw new Error('Expected /happyhorse-github/ to explain how it differs from the open-source page.');
  }

  if (!githubPageHtml.includes('See the animation workflow')) {
    throw new Error('Expected /happyhorse-github/ to keep the shared soft-fallback CTA into Elser.');
  }

  assertIncludes(githubPageHtml, 'https://www.elser.ai/ai-animation-generator', 'Expected /happyhorse-github/ to include the Elser fallback URL.');

  if (!githubPageHtml.includes('not claim that an official HappyHorse GitHub repository exists')) {
    throw new Error('Expected /happyhorse-github/ to keep explicit non-official repository language.');
  }

  if (!githubPageHtml.includes('Related links') || !githubPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /happyhorse-github/ to include related links and disclaimer blocks.');
  }

  if (!openSourcePageHtml.includes('<title>Is HappyHorse Open Source? Code, Weights and License Status | HappyHorse AI Video Guide</title>')) {
    throw new Error('Expected /happyhorse-open-source/ to render the refined open-source title.');
  }

  if (!openSourcePageHtml.includes('What this page means by open source')) {
    throw new Error('Expected /happyhorse-open-source/ to define open-source status beyond simple repo hunting.');
  }

  if (!openSourcePageHtml.includes('What is still unverified')) {
    throw new Error('Expected /happyhorse-open-source/ to separate unknown code, weights, and licensing status from verified claims.');
  }

  if (!openSourcePageHtml.includes('Why this page is not the GitHub-status page')) {
    throw new Error('Expected /happyhorse-open-source/ to explain how it differs from /happyhorse-github/.');
  }

  if (!openSourcePageHtml.includes('See the animation workflow')) {
    throw new Error('Expected /happyhorse-open-source/ to keep the shared soft-fallback CTA for unverified access.');
  }

  if (!openSourcePageHtml.includes('/happyhorse-alternatives/') || !openSourcePageHtml.includes('https://www.elser.ai/ai-animation-generator')) {
    throw new Error('Expected /happyhorse-open-source/ to route visitors toward alternatives and the Elser fallback path.');
  }

  if (!openSourcePageHtml.includes('should not imply source release, weight availability, or public licensing')) {
    throw new Error('Expected /happyhorse-open-source/ to keep explicit non-official and unverified-claims language.');
  }

  if (!openSourcePageHtml.includes('Related links') || !openSourcePageHtml.includes('Disclaimer')) {
    throw new Error('Expected /happyhorse-open-source/ to include related links and disclaimer blocks.');
  }

  if (!bestAiVideoModelsPageHtml.includes('<title>Best AI Video Models, Where HappyHorse Fits in the Category | HappyHorse AI Video Guide</title>')) {
    throw new Error('Expected /best-ai-video-models/ to render the refined category-support title.');
  }

  if (!bestAiVideoModelsPageHtml.includes('Open Story Studio')) {
    throw new Error('Expected /best-ai-video-models/ to keep one shared category CTA into Story Studio.');
  }

  if (!bestAiVideoModelsPageHtml.includes('How HappyHorse fits inside the category')) {
    throw new Error('Expected /best-ai-video-models/ to explain how the category route supports the HappyHorse campaign.');
  }

  if (!bestAiVideoModelsPageHtml.includes('stay support-only')) {
    throw new Error('Expected /best-ai-video-models/ to state that it should not replace the main campaign hub.');
  }

  if (
    !bestAiVideoModelsPageHtml.includes('/happyhorse-vs-seedance/') ||
    !bestAiVideoModelsPageHtml.includes('/happyhorse-alternatives/') ||
    !bestAiVideoModelsPageHtml.includes('https://www.elser.ai/tools/story-studio')
  ) {
    throw new Error('Expected /best-ai-video-models/ to link visibly back into the HappyHorse comparison, alternatives, and Elser action paths.');
  }

  if (!bestAiVideoModelsPageHtml.includes('Related links') || !bestAiVideoModelsPageHtml.includes('Disclaimer')) {
    throw new Error('Expected /best-ai-video-models/ to include related links and disclaimer blocks.');
  }

  if (!githubPageHtml.includes('narrower repo-status question directly')) {
    throw new Error('Expected /happyhorse-github/ to remain focused on repo-status intent.');
  }

  if (!openSourcePageHtml.includes('source code, model weights, and licensing terms')) {
    throw new Error('Expected /happyhorse-open-source/ to stay focused on broader open-source availability intent.');
  }

  try {
    await access(new URL('../../out/seedance-vs-happyhorse/index.html', import.meta.url));
    throw new Error('Forbidden mirrored route /seedance-vs-happyhorse/ exists in out output.');
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
      throw error;
    }
  }
}

if (externalCommand) {
  await runExternalCommand(externalCommand);
} else {
  await runBrowserBackedSmokeCheck();
  await runBuiltSmokeCheck();
}
