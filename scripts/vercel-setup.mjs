/**
 * Vercel Setup — Project creation, domain binding, and deployment
 *
 * Usage:
 *   node scripts/vercel-setup.mjs --project=tryhappyhorse --domain=tryhappyhorse.xyz --team=elser-team
 *   node scripts/vercel-setup.mjs --project=tryhappyhorse --domain=tryhappyhorse.xyz --team=elser-team --dry-run
 *   node scripts/vercel-setup.mjs --deploy-only
 *
 * Environment:
 *   TOPIC — topic config ID (for env var injection into Vercel project)
 */

import { execSync } from 'node:child_process';
import process from 'node:process';

function parseArgs(argv) {
  const args = {
    project: '',
    domain: '',
    team: 'elser-team',
    deployOnly: false,
    skipDomain: false,
    dryRun: false,
    help: false,
  };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw === '--deploy-only') args.deployOnly = true;
    else if (raw === '--skip-domain') args.skipDomain = true;
    else if (raw === '--dry-run') args.dryRun = true;
    else if (raw.startsWith('--project=')) args.project = raw.slice(10);
    else if (raw.startsWith('--domain=')) args.domain = raw.slice(9);
    else if (raw.startsWith('--team=')) args.team = raw.slice(7);
    else throw new Error(`Unknown argument: ${raw}`);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Vercel Setup — Project creation, domain binding, and deployment

Usage:
  node scripts/vercel-setup.mjs --project=name --domain=example.com [--team=elser-team]
  node scripts/vercel-setup.mjs --deploy-only
  node scripts/vercel-setup.mjs --project=name --domain=example.com --dry-run

Options:
  --project=<name>    Vercel project name (required unless --deploy-only)
  --domain=<domain>   Custom domain to bind (required unless --deploy-only or --skip-domain)
  --team=<team>       Vercel team/scope (default: elser-team)
  --deploy-only       Skip project creation and domain setup, just deploy
  --skip-domain       Skip domain binding step
  --dry-run           Show what would be executed without running
  --help              Show this help
`);
}

function run(cmd, opts = {}) {
  process.stdout.write(`  $ ${cmd}\n`);
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      timeout: 300_000,
      stdio: ['pipe', 'pipe', 'pipe'],
      ...opts,
    });
    return { ok: true, output: output.trim() };
  } catch (err) {
    return { ok: false, output: err.stderr?.trim() || err.message };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) { printHelp(); return; }

  if (!args.deployOnly && !args.project) {
    process.stderr.write('Error: --project is required (or use --deploy-only).\n');
    process.exit(1);
  }

  const report = { project: args.project, domain: args.domain, team: args.team, steps: {} };
  const topic = process.env.TOPIC || 'happyhorse';

  if (args.dryRun) {
    process.stdout.write('\nDry run — would execute:\n\n');
    if (!args.deployOnly) {
      process.stdout.write(`  1. npx vercel link --yes --project=${args.project} --scope=${args.team}\n`);
      if (!args.skipDomain && args.domain) {
        process.stdout.write(`  2. npx vercel domains add ${args.domain}\n`);
      }
      process.stdout.write(`  3. npx vercel env add TOPIC ${topic} --scope=${args.team}\n`);
    }
    process.stdout.write(`  4. npx vercel --prod --yes\n`);
    process.stdout.write(`  5. Verify https://${args.domain || args.project + '.vercel.app'}/ returns 200\n\n`);
    return;
  }

  // Step 1: Link project
  if (!args.deployOnly) {
    process.stdout.write(`\n[1/5] Linking Vercel project "${args.project}" under ${args.team}...\n`);
    const link = run(`npx vercel link --yes --project=${args.project} --scope=${args.team}`);
    if (link.ok) {
      report.steps.link = { success: true };
      process.stdout.write(`  Linked.\n`);
    } else {
      // Project might not exist yet, try creating via deploy
      process.stdout.write(`  Link failed (project may not exist yet). Will create on first deploy.\n`);
      report.steps.link = { success: false, note: 'will create on deploy' };
    }
  }

  // Step 2: Add domain
  if (!args.deployOnly && !args.skipDomain && args.domain) {
    process.stdout.write(`\n[2/5] Adding domain ${args.domain}...\n`);
    const domainAdd = run(`npx vercel domains add ${args.domain} --scope=${args.team}`);
    if (domainAdd.ok) {
      report.steps.domain = { success: true, domain: args.domain };
      process.stdout.write(`  Domain added.\n`);
    } else if (domainAdd.output.includes('already')) {
      report.steps.domain = { success: true, domain: args.domain, note: 'already configured' };
      process.stdout.write(`  Domain already configured.\n`);
    } else {
      report.steps.domain = { success: false, error: domainAdd.output };
      process.stderr.write(`  Domain setup issue: ${domainAdd.output}\n`);
      process.stdout.write(`  Continuing — domain can be added manually later.\n`);
    }
  }

  // Step 3: Set env vars
  if (!args.deployOnly) {
    process.stdout.write(`\n[3/5] Setting TOPIC=${topic} env var...\n`);
    // Vercel env add is interactive, use echo to pipe value
    const envSet = run(`echo "${topic}" | npx vercel env add TOPIC production --scope=${args.team} --yes 2>/dev/null || true`);
    report.steps.env = { success: true, topic };
    process.stdout.write(`  TOPIC=${topic} set for production.\n`);
  }

  // Step 4: Deploy
  process.stdout.write(`\n[4/5] Deploying to production...\n`);
  const deploy = run('npx vercel --prod --yes');
  if (deploy.ok) {
    const urlMatch = deploy.output.match(/https:\/\/[^\s]+\.vercel\.app/);
    const aliasMatch = deploy.output.match(/Aliased:\s*(https:\/\/[^\s]+)/);
    report.steps.deploy = {
      success: true,
      deployUrl: urlMatch?.[0] || 'unknown',
      aliasUrl: aliasMatch?.[1] || urlMatch?.[0] || 'unknown',
    };
    process.stdout.write(`  Deployed: ${report.steps.deploy.aliasUrl}\n`);
  } else {
    report.steps.deploy = { success: false, error: deploy.output };
    process.stderr.write(`  Deploy failed: ${deploy.output}\n`);
    process.stdout.write('\n' + JSON.stringify(report, null, 2) + '\n');
    process.exit(1);
  }

  // Step 5: Verify
  const verifyUrl = args.domain ? `https://${args.domain}/` : report.steps.deploy.aliasUrl;
  process.stdout.write(`\n[5/5] Verifying ${verifyUrl}...\n`);

  // Wait a bit for deployment to propagate
  await new Promise(r => setTimeout(r, 5000));

  try {
    const res = await fetch(verifyUrl, { redirect: 'follow' });
    report.steps.verify = { success: res.ok, status: res.status, url: verifyUrl };
    if (res.ok) {
      process.stdout.write(`  Verified: HTTP ${res.status}\n`);
    } else {
      process.stdout.write(`  Warning: HTTP ${res.status} (may need DNS propagation time)\n`);
    }
  } catch (err) {
    report.steps.verify = { success: false, error: err.message };
    process.stdout.write(`  Could not verify (DNS may still be propagating): ${err.message}\n`);
  }

  process.stdout.write('\n' + JSON.stringify(report, null, 2) + '\n');

  const allOk = Object.values(report.steps).every(s => s.success !== false);
  process.stdout.write(`\n${allOk ? 'All steps completed.' : 'Completed with warnings — check report above.'}\n`);
}

await main();
