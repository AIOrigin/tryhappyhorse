/**
 * Sites — Multi-site management CLI
 *
 * Usage:
 *   node scripts/sites.mjs list
 *   node scripts/sites.mjs add --domain=tryhappyhorse.xyz --topic=happyhorse
 *   node scripts/sites.mjs status tryhappyhorse.xyz
 *   node scripts/sites.mjs remove tryhappyhorse.xyz
 */

import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const REGISTRY_PATH = path.join(process.cwd(), 'sites-registry.json');

async function loadRegistry() {
  try {
    return JSON.parse(await readFile(REGISTRY_PATH, 'utf8'));
  } catch {
    return [];
  }
}

async function saveRegistry(registry) {
  await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n', 'utf8');
}

function printHelp() {
  process.stdout.write(`Sites — Multi-site management CLI

Usage:
  node scripts/sites.mjs list                              List all registered sites
  node scripts/sites.mjs add --domain=X --topic=Y          Register a new site
  node scripts/sites.mjs status <domain>                   Run health check on a site
  node scripts/sites.mjs remove <domain>                   Remove from registry

Options:
  --domain=<domain>  Domain name
  --topic=<topic>    Topic ID
  --pages=<count>    Page count (for add)
  --help             Show this help
`);
}

async function cmdList() {
  const registry = await loadRegistry();
  if (registry.length === 0) {
    process.stdout.write('No sites registered. Use "sites.mjs add" to register one.\n');
    return;
  }

  process.stdout.write(`\n${'Domain'.padEnd(30)} ${'Topic'.padEnd(15)} ${'Pages'.padEnd(8)} ${'Deployed'.padEnd(22)} Status\n`);
  process.stdout.write(`${'─'.repeat(85)}\n`);

  for (const site of registry) {
    const deployed = site.deployedAt ? new Date(site.deployedAt).toISOString().slice(0, 16) : 'unknown';
    process.stdout.write(
      `${site.domain.padEnd(30)} ${site.topic.padEnd(15)} ${String(site.pageCount || '?').padEnd(8)} ${deployed.padEnd(22)} ${site.status || 'unknown'}\n`,
    );
  }
  process.stdout.write('\n');
}

async function cmdAdd(args) {
  const domain = args.find(a => a.startsWith('--domain='))?.slice(9);
  const topic = args.find(a => a.startsWith('--topic='))?.slice(8);
  const pages = parseInt(args.find(a => a.startsWith('--pages='))?.slice(8) || '0', 10);

  if (!domain || !topic) {
    process.stderr.write('Error: --domain and --topic are required.\n');
    process.exit(1);
  }

  const registry = await loadRegistry();
  const existing = registry.findIndex(s => s.domain === domain);

  const entry = {
    domain,
    topic,
    pageCount: pages || 0,
    deployedAt: new Date().toISOString(),
    lastChecked: null,
    status: 'registered',
  };

  if (existing >= 0) {
    registry[existing] = { ...registry[existing], ...entry };
    process.stdout.write(`Updated ${domain}.\n`);
  } else {
    registry.push(entry);
    process.stdout.write(`Added ${domain}.\n`);
  }

  await saveRegistry(registry);
}

async function cmdStatus(domain) {
  if (!domain) {
    process.stderr.write('Error: domain argument required. Usage: sites.mjs status <domain>\n');
    process.exit(1);
  }

  process.stdout.write(`Running health check for ${domain}...\n\n`);

  try {
    const output = execSync(`node scripts/health-check.mjs --domain=${domain}`, {
      encoding: 'utf8',
      timeout: 120_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    process.stdout.write(output);

    // Update registry
    const registry = await loadRegistry();
    const site = registry.find(s => s.domain === domain);
    if (site) {
      site.lastChecked = new Date().toISOString();
      site.status = 'healthy';
      await saveRegistry(registry);
    }
  } catch (err) {
    process.stdout.write(err.stdout || '');
    process.stderr.write(err.stderr || err.message);

    const registry = await loadRegistry();
    const site = registry.find(s => s.domain === domain);
    if (site) {
      site.lastChecked = new Date().toISOString();
      site.status = 'unhealthy';
      await saveRegistry(registry);
    }
    process.exit(1);
  }
}

async function cmdRemove(domain) {
  if (!domain) {
    process.stderr.write('Error: domain argument required.\n');
    process.exit(1);
  }
  const registry = await loadRegistry();
  const filtered = registry.filter(s => s.domain !== domain);
  if (filtered.length === registry.length) {
    process.stdout.write(`${domain} not found in registry.\n`);
    return;
  }
  await saveRegistry(filtered);
  process.stdout.write(`Removed ${domain} from registry.\n`);
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  switch (command) {
    case 'list': return cmdList();
    case 'add': return cmdAdd(argv.slice(1));
    case 'status': return cmdStatus(argv[1]);
    case 'remove': return cmdRemove(argv[1]);
    default:
      process.stderr.write(`Unknown command: ${command}\n`);
      printHelp();
      process.exit(1);
  }
}

await main();
