/**
 * Domain Setup — GoDaddy API
 *
 * Check availability, purchase, and configure DNS for Vercel hosting.
 *
 * Usage:
 *   node scripts/domain-setup.mjs --check --domain=example.com
 *   node scripts/domain-setup.mjs --purchase --domain=example.com --confirm
 *   node scripts/domain-setup.mjs --configure-dns --domain=example.com
 *   node scripts/domain-setup.mjs --full --domain=example.com --confirm
 *
 * Environment:
 *   GODADDY_API_KEY     — GoDaddy API key
 *   GODADDY_API_SECRET  — GoDaddy API secret
 *   GODADDY_ENV         — "production" or "ote" (default: production)
 */

import process from 'node:process';

const VERCEL_A_RECORD = '76.76.21.21';
const VERCEL_CNAME = 'cname.vercel-dns.com';

function getBaseUrl() {
  const env = process.env.GODADDY_ENV || 'production';
  return env === 'ote'
    ? 'https://api.ote-godaddy.com'
    : 'https://api.godaddy.com';
}

function getAuthHeader() {
  const key = process.env.GODADDY_API_KEY;
  const secret = process.env.GODADDY_API_SECRET;
  if (!key || !secret) {
    throw new Error('Missing GODADDY_API_KEY or GODADDY_API_SECRET environment variables.');
  }
  return `sso-key ${key}:${secret}`;
}

function parseArgs(argv) {
  const args = {
    domain: '',
    check: false,
    purchase: false,
    configureDns: false,
    full: false,
    confirm: false,
    help: false,
  };
  for (const raw of argv) {
    if (raw === '--help' || raw === '-h') args.help = true;
    else if (raw === '--check') args.check = true;
    else if (raw === '--purchase') args.purchase = true;
    else if (raw === '--configure-dns') args.configureDns = true;
    else if (raw === '--full') args.full = true;
    else if (raw === '--confirm') args.confirm = true;
    else if (raw.startsWith('--domain=')) args.domain = raw.slice(9);
    else throw new Error(`Unknown argument: ${raw}`);
  }
  if (args.full) {
    args.check = true;
    args.purchase = true;
    args.configureDns = true;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`Domain Setup — GoDaddy API

Usage:
  node scripts/domain-setup.mjs --check --domain=example.com
  node scripts/domain-setup.mjs --purchase --domain=example.com --confirm
  node scripts/domain-setup.mjs --configure-dns --domain=example.com
  node scripts/domain-setup.mjs --full --domain=example.com --confirm

Options:
  --domain=<domain>   Target domain (required)
  --check             Check domain availability and price
  --purchase          Purchase the domain (requires --confirm)
  --configure-dns     Set A and CNAME records for Vercel
  --full              Run all steps: check → purchase → configure DNS
  --confirm           Confirm purchase (safety guard)
  --help              Show this help

Environment:
  GODADDY_API_KEY     GoDaddy API key
  GODADDY_API_SECRET  GoDaddy API secret
  GODADDY_ENV         "production" or "ote" (default: production)
`);
}

// --- API calls ---

async function checkAvailability(domain) {
  const url = `${getBaseUrl()}/v1/domains/available?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(), Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Availability check failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function purchaseDomain(domain) {
  const url = `${getBaseUrl()}/v1/domains/purchase`;

  const body = {
    domain,
    consent: {
      agreedAt: new Date().toISOString(),
      agreedBy: '0.0.0.0',
      agreementKeys: ['DNRA'],
    },
    contactAdmin: defaultContact(),
    contactBilling: defaultContact(),
    contactRegistrant: defaultContact(),
    contactTech: defaultContact(),
    period: 1,
    privacy: false,
    renewAuto: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Purchase failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function getDnsRecords(domain) {
  const url = `${getBaseUrl()}/v1/domains/${encodeURIComponent(domain)}/records`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(), Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DNS query failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function setDnsRecords(domain, records) {
  const url = `${getBaseUrl()}/v1/domains/${encodeURIComponent(domain)}/records`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(records),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DNS update failed (${res.status}): ${text}`);
  }
}

function defaultContact() {
  return {
    nameFirst: process.env.GODADDY_CONTACT_FIRST || 'Domain',
    nameLast: process.env.GODADDY_CONTACT_LAST || 'Admin',
    email: process.env.GODADDY_CONTACT_EMAIL || 'admin@elser.ai',
    phone: process.env.GODADDY_CONTACT_PHONE || '+1.4805058800',
    addressMailing: {
      address1: process.env.GODADDY_CONTACT_ADDRESS || '1 N 1st St',
      city: process.env.GODADDY_CONTACT_CITY || 'San Jose',
      state: process.env.GODADDY_CONTACT_STATE || 'CA',
      postalCode: process.env.GODADDY_CONTACT_ZIP || '95113',
      country: process.env.GODADDY_CONTACT_COUNTRY || 'US',
    },
  };
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) { printHelp(); return; }
  if (!args.domain) {
    process.stderr.write('Error: --domain is required.\n');
    process.exit(1);
  }
  if (!args.check && !args.purchase && !args.configureDns) {
    process.stderr.write('Error: Specify at least one of --check, --purchase, --configure-dns, or --full.\n');
    process.exit(1);
  }

  const report = { domain: args.domain, steps: {} };

  // Step 1: Check availability
  if (args.check) {
    process.stdout.write(`Checking availability for ${args.domain}...\n`);
    try {
      const result = await checkAvailability(args.domain);
      report.steps.check = {
        available: result.available,
        price: result.price ? `${(result.price / 1000000).toFixed(2)} ${result.currency}` : 'unknown',
        definitive: result.definitive,
      };
      process.stdout.write(`  Available: ${result.available}\n`);
      if (result.price) {
        process.stdout.write(`  Price: ${(result.price / 1000000).toFixed(2)} ${result.currency}\n`);
      }

      if (!result.available && args.purchase) {
        process.stderr.write(`Domain ${args.domain} is not available. Cannot purchase.\n`);
        process.stdout.write(JSON.stringify(report, null, 2) + '\n');
        process.exit(1);
      }
    } catch (err) {
      report.steps.check = { error: err.message };
      process.stderr.write(`  Check failed: ${err.message}\n`);
    }
  }

  // Step 2: Purchase
  if (args.purchase) {
    if (!args.confirm) {
      process.stderr.write(`\nSafety guard: Add --confirm to actually purchase ${args.domain}.\n`);
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      process.exit(1);
    }

    process.stdout.write(`\nPurchasing ${args.domain}...\n`);
    try {
      const result = await purchaseDomain(args.domain);
      report.steps.purchase = { success: true, orderId: result.orderId };
      process.stdout.write(`  Purchased! Order ID: ${result.orderId}\n`);
    } catch (err) {
      report.steps.purchase = { success: false, error: err.message };
      process.stderr.write(`  Purchase failed: ${err.message}\n`);
      if (args.configureDns) {
        process.stderr.write(`  Skipping DNS configuration due to purchase failure.\n`);
      }
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      process.exit(1);
    }

    // Wait for domain to propagate in GoDaddy's system
    process.stdout.write('  Waiting 10s for domain registration to propagate...\n');
    await new Promise(r => setTimeout(r, 10000));
  }

  // Step 3: Configure DNS
  if (args.configureDns) {
    process.stdout.write(`\nConfiguring DNS for ${args.domain} → Vercel...\n`);
    try {
      const records = [
        { type: 'A', name: '@', data: VERCEL_A_RECORD, ttl: 600 },
        { type: 'CNAME', name: 'www', data: VERCEL_CNAME, ttl: 600 },
      ];

      await setDnsRecords(args.domain, records);
      report.steps.dns = {
        configured: true,
        records: [
          { type: 'A', name: '@', value: VERCEL_A_RECORD },
          { type: 'CNAME', name: 'www', value: VERCEL_CNAME },
        ],
      };
      process.stdout.write(`  A   @ → ${VERCEL_A_RECORD}\n`);
      process.stdout.write(`  CNAME www → ${VERCEL_CNAME}\n`);
      process.stdout.write(`  DNS configured for Vercel hosting.\n`);
    } catch (err) {
      report.steps.dns = { configured: false, error: err.message };
      process.stderr.write(`  DNS configuration failed: ${err.message}\n`);
    }
  }

  process.stdout.write('\n' + JSON.stringify(report, null, 2) + '\n');
}

await main();
