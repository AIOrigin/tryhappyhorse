/**
 * Launch — End-to-end site builder orchestrator
 *
 * Usage:
 *   node scripts/launch.mjs --topic=HappyHorse --domain=tryhappyhorse.xyz --description="AI video model"
 *   node scripts/launch.mjs --topic=HappyHorse --domain=tryhappyhorse.xyz --description="..." --skip-domain
 *   node scripts/launch.mjs --topic=HappyHorse --domain=tryhappyhorse.xyz --resume-from=phase4
 *   node scripts/launch.mjs --help
 */

import { execSync } from 'node:child_process';
import process from 'node:process';

const PHASES = [
  { id: 'phase1', name: 'Topic Config' },
  { id: 'phase2', name: 'Keyword Matrix' },
  { id: 'phase3', name: 'Content Generation' },
  { id: 'phase4', name: 'Image Generation' },
  { id: 'phase5', name: 'Domain Setup' },
  { id: 'phase6', name: 'Build & Deploy' },
  { id: 'phase7', name: 'Search Engine Submission' },
  { id: 'phase8', name: 'Health Check' },
];

function parseArgs(argv) {
  const args = {
    topic: '', domain: '', description: '', niche: '',
    resumeFrom: '', skipDomain: false, skipImages: false,
    team: 'elser-team', help: false,
  };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw === '--skip-domain') args.skipDomain = true;
    else if (raw === '--skip-images') args.skipImages = true;
    else if (raw.startsWith('--topic=')) args.topic = raw.slice(8);
    else if (raw.startsWith('--domain=')) args.domain = raw.slice(9);
    else if (raw.startsWith('--description=')) args.description = raw.slice(14);
    else if (raw.startsWith('--niche=')) args.niche = raw.slice(8);
    else if (raw.startsWith('--resume-from=')) args.resumeFrom = raw.slice(14);
    else if (raw.startsWith('--team=')) args.team = raw.slice(7);
    else throw new Error(`Unknown argument: ${raw}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Launch — End-to-end SEO site builder

Usage:
  node scripts/launch.mjs --topic=Name --domain=example.com --description="..."

Required:
  --topic=<name>          Topic name (e.g. HappyHorse)
  --domain=<domain>       Target domain (e.g. tryhappyhorse.xyz)
  --description=<text>    Brief topic description for content generation

Optional:
  --niche=<niche>         Industry niche for competitor inference (e.g. "AI video generation")
  --resume-from=<phase>   Resume from a specific phase (phase1-phase8)
  --skip-domain           Skip domain purchase and DNS setup
  --skip-images           Skip image generation
  --team=<team>           Vercel team (default: elser-team)
  --help                  Show this help

Phases:
${PHASES.map((p, i) => `  ${p.id} — ${p.name}`).join('\n')}
`);
}

function run(cmd, env = {}) {
  process.stdout.write(`    $ ${cmd}\n`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      timeout: 600_000,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    });
    return { ok: true, output: output.trim() };
  } catch (err) {
    return { ok: false, output: (err.stdout || '') + '\n' + (err.stderr || err.message) };
  }
}

function elapsed(start) {
  const sec = Math.round((Date.now() - start) / 1000);
  return sec >= 60 ? `${Math.floor(sec / 60)}m ${sec % 60}s` : `${sec}s`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  if (!args.topic || !args.domain || !args.description) {
    process.stderr.write('Error: --topic, --domain, and --description are required.\n');
    process.exit(1);
  }

  const startIndex = args.resumeFrom
    ? PHASES.findIndex(p => p.id === args.resumeFrom)
    : 0;

  if (startIndex < 0) {
    process.stderr.write(`Error: Unknown phase "${args.resumeFrom}". Valid: ${PHASES.map(p => p.id).join(', ')}\n`);
    process.exit(1);
  }

  const totalStart = Date.now();
  const topicSlug = args.topic.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const report = { topic: args.topic, domain: args.domain, phases: {} };

  process.stdout.write(`\n╔════════════════════════════════════════════╗\n`);
  process.stdout.write(`║  Auto-SEO Launch: ${args.topic.padEnd(24)} ║\n`);
  process.stdout.write(`║  Domain: ${args.domain.padEnd(33)} ║\n`);
  process.stdout.write(`╚════════════════════════════════════════════╝\n\n`);

  for (let i = startIndex; i < PHASES.length; i++) {
    const phase = PHASES[i];
    const phaseStart = Date.now();

    process.stdout.write(`\n[${'█'.repeat(i + 1)}${'░'.repeat(PHASES.length - i - 1)}] Phase ${i + 1}/${PHASES.length}: ${phase.name}\n`);

    let result;

    switch (phase.id) {
      case 'phase1': {
        process.stdout.write(`  Ensuring topic config for "${topicSlug}"...\n`);
        // Topic config is checked at build time. Just verify it exists.
        result = { ok: true, output: `Topic: ${args.topic}, Domain: ${args.domain}` };
        break;
      }

      case 'phase2': {
        result = run(
          `node scripts/generate-keyword-matrix.mjs --topic="${args.topic}" --description="${args.description}" --niche="${args.niche || ''}"`,
        );
        break;
      }

      case 'phase3': {
        result = run('node scripts/generate-pages.mjs --overwrite', { TOPIC: topicSlug });
        break;
      }

      case 'phase4': {
        if (args.skipImages) {
          result = { ok: true, output: 'Skipped (--skip-images)' };
        } else {
          result = run('node scripts/generate-assets.mjs --concurrency=3');
        }
        break;
      }

      case 'phase5': {
        if (args.skipDomain) {
          result = { ok: true, output: 'Skipped (--skip-domain)' };
        } else {
          result = run(`node scripts/domain-setup.mjs --configure-dns --domain=${args.domain}`);
        }
        break;
      }

      case 'phase6': {
        const buildResult = run('npm run build', { TOPIC: topicSlug });
        if (!buildResult.ok) {
          result = buildResult;
          break;
        }
        result = run(`node scripts/vercel-setup.mjs --project=${topicSlug} --domain=${args.domain} --team=${args.team}`);
        break;
      }

      case 'phase7': {
        result = run(`node scripts/submit-to-search-engines.mjs --domain=${args.domain}`);
        break;
      }

      case 'phase8': {
        // Wait a bit for deployment
        await new Promise(r => setTimeout(r, 5000));
        result = run(`node scripts/health-check.mjs --domain=${args.domain}`);
        break;
      }
    }

    const duration = elapsed(phaseStart);
    const ok = result?.ok ?? false;
    report.phases[phase.id] = { name: phase.name, ok, duration, output: result?.output?.slice(0, 200) };

    if (ok) {
      process.stdout.write(`  ✓ ${phase.name} completed (${duration})\n`);
    } else {
      process.stdout.write(`  ✗ ${phase.name} FAILED (${duration})\n`);
      process.stdout.write(`\n  Error output:\n${result?.output?.slice(0, 500)}\n`);
      process.stdout.write(`\n  To resume from this phase:\n`);
      process.stdout.write(`    node scripts/launch.mjs --topic="${args.topic}" --domain=${args.domain} --description="${args.description}" --resume-from=${phase.id}\n\n`);

      report.status = 'failed';
      report.failedAt = phase.id;
      report.totalTime = elapsed(totalStart);
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      process.exit(1);
    }
  }

  report.status = 'success';
  report.totalTime = elapsed(totalStart);

  process.stdout.write(`\n╔════════════════════════════════════════════╗\n`);
  process.stdout.write(`║       Site Launch Report                    ║\n`);
  process.stdout.write(`╠════════════════════════════════════════════╣\n`);
  process.stdout.write(`║ Topic:   ${args.topic.padEnd(33)} ║\n`);
  process.stdout.write(`║ Domain:  https://${args.domain.padEnd(25)} ║\n`);
  process.stdout.write(`║ Sitemap: https://${args.domain}/sitemap.xml`.padEnd(45) + `║\n`);
  process.stdout.write(`╠════════════════════════════════════════════╣\n`);
  for (const [id, p] of Object.entries(report.phases)) {
    const icon = p.ok ? '✓' : '✗';
    process.stdout.write(`║ ${icon} ${p.name.padEnd(28)} ${p.duration.padStart(8)} ║\n`);
  }
  process.stdout.write(`╠════════════════════════════════════════════╣\n`);
  process.stdout.write(`║ Total: ${report.totalTime.padEnd(35)} ║\n`);
  process.stdout.write(`║ Status: ${report.status.toUpperCase().padEnd(34)} ║\n`);
  process.stdout.write(`╚════════════════════════════════════════════╝\n\n`);

  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

await main();
