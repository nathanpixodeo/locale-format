#!/usr/bin/env node
/**
 * Enforces the size budgets from the specification:
 *   NFR-1  core bundle < 5KB gzip, excluding country data
 *   MVP    every module < 10KB gzip, excluding country data
 *
 * Sizes are measured on the built ESM output with gzip, which is what a CDN or
 * a bundler's reported size will use. No dependency needed — zlib is built in.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const KB = 1024;

/**
 * Each entry is measured with the shared chunks it pulls in, which is what a
 * consumer importing that subpath actually downloads. `core` and `address` are
 * the "core bundle" of NFR-1; the rest carry the 10KB per-module MVP budget.
 * The root entry additionally bundles all 22 country tables, so it is measured
 * against the same 10KB with data included.
 */
const BUDGETS = [
  { label: 'core', entries: ['core/index.js'], limit: 5 * KB },
  { label: 'address', entries: ['address/index.js'], limit: 5 * KB },
  { label: 'core+address', entries: ['core/index.js', 'address/index.js'], limit: 5 * KB },
  { label: 'currency', entries: ['currency/index.js'], limit: 10 * KB },
  { label: 'datetime', entries: ['datetime/index.js'], limit: 10 * KB },
  { label: 'name', entries: ['name/index.js'], limit: 10 * KB },
  { label: 'phone', entries: ['phone/index.js'], limit: 10 * KB },
  { label: 'data (22)', entries: ['data/index.js'], limit: 10 * KB },
  { label: 'index (all)', entries: ['index.js'], limit: 10 * KB },
];

const IMPORT_SPECIFIER = /from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

function exists(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * Follows relative imports from an entry so a chunked build is measured as the
 * bytes a consumer actually downloads, not just the size of the entry stub.
 */
function collect(entry, seen = new Set()) {
  const absolute = join(dist, entry);
  if (seen.has(absolute) || !exists(absolute)) return seen;
  seen.add(absolute);

  const source = readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(IMPORT_SPECIFIER)) {
    const specifier = match[1] ?? match[2];
    if (!specifier || !specifier.startsWith('.')) continue;
    const next = resolve(dirname(absolute), specifier).slice(dist.length + 1).replace(/\\/g, '/');
    collect(next, seen);
  }
  return seen;
}

function gzippedSize(files) {
  const combined = [...files].map((file) => readFileSync(file, 'utf8')).join('\n');
  return gzipSync(combined, { level: 9 }).length;
}

function format(bytes) {
  return `${(bytes / KB).toFixed(2)}KB`;
}

if (!exists(join(dist, 'index.js'))) {
  console.error('dist/index.js not found. Run `npm run build` first.');
  process.exit(1);
}

let failed = false;

for (const { label, entries, limit } of BUDGETS) {
  const files = new Set();
  for (const entry of entries) for (const file of collect(entry)) files.add(file);

  const size = gzippedSize(files);
  const ok = size < limit;
  if (!ok) failed = true;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(9)} ${format(size).padStart(8)} / ${format(limit)}`,
  );
}

const countryDir = join(dist, 'data', 'countries');
if (exists(join(countryDir, 'vn.js'))) {
  const files = new Set();
  for (const file of readdirSync(countryDir)) {
    if (!file.endsWith('.js')) continue;
    for (const reachable of collect(`data/countries/${file}`)) files.add(reachable);
  }
  console.log(`info one country  ${format(gzippedSize(collect('data/countries/vn.js'))).padStart(8)}`);
  console.log(`info all countries${format(gzippedSize(files)).padStart(8)}`);
}

if (failed) {
  console.error('\nSize budget exceeded.');
  process.exit(1);
}
