/**
 * Exercises the packed tarball on the oldest Node version this package claims to
 * support.
 *
 * `engines.node` promises Node 18.17, but the development toolchain no longer
 * runs there — vitest 4 pulls in rolldown, which imports `styleText` from
 * `node:util`, added in Node 20.12. Running the test suite on Node 18 is
 * therefore not an option, and it was never the thing that mattered: the promise
 * is about the artifact consumers install, not about the test runner. So CI
 * builds and packs on a current Node, installs the tarball under Node 18, and
 * runs this file against it.
 *
 * It must be copied into the directory where the tarball was installed before it
 * is run. Node resolves a bare specifier by walking up from the importing file,
 * not from the working directory, so a copy left in the repository would resolve
 * `@nexkit/locale-format` to the source tree and prove nothing.
 *
 * Usage: node smoke.mjs <expected-version>
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const expectedVersion = process.argv[2];
assert.ok(expectedVersion, 'Pass the version the tarball is expected to declare as the first argument.');

/* ------------------------------------------------------------------ identity */

const manifest = require('@nexkit/locale-format/package.json');
assert.equal(
  manifest.version,
  expectedVersion,
  `Installed ${manifest.version}, expected ${expectedVersion}. The tarball is stale.`,
);

/* ------------------------------------------------------- root entry, as ESM */

const esm = await import('@nexkit/locale-format');

// The example from the SRS. Pure string templating, so the expected output does
// not move with the runtime's ICU data.
assert.equal(
  esm.formatAddress({
    country: 'VN',
    fields: {
      street: '12 Nguyen Trai',
      ward: 'P.Ben Thanh',
      district: 'Q.1',
      city: 'TP.HCM',
    },
  }),
  '12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM',
);

// The 2025 reform dropped Vietnam's district level; the separator has to go with
// it rather than leaving ", ," behind.
assert.equal(
  esm.formatAddress({
    country: 'VN',
    fields: { street: '12 Nguyen Trai', ward: 'P.Ben Thanh', city: 'TP.HCM' },
  }),
  '12 Nguyen Trai, P.Ben Thanh, TP.HCM',
);

assert.ok(esm.formatAddressLines({ country: 'JP', fields: { city: 'Shibuya' } }).length > 0);

// An unsupported country falls back rather than throwing.
assert.ok(esm.getAddressFields('ZZ').length > 0);

assert.equal(esm.toE164('0901234567', { country: 'VN' }), '+84901234567');
assert.equal(esm.isValidPhone('0901234567', { country: 'VN' }), true);
assert.equal(esm.isValidPhone('123', { country: 'VN' }), false);
assert.equal(esm.getCallingCode('VN'), '+84');
assert.equal(esm.parsePhone('+84901234567')?.country, 'VN');

assert.equal(esm.getCurrencyCode('GB'), 'GBP');
assert.equal(esm.getNameOrder('JP'), 'family-first');
assert.equal(esm.getNameOrder('US'), 'given-first');
assert.equal(esm.formatName({ given: 'Taro', family: 'Yamada' }, { country: 'JP' }), 'Yamada Taro');

assert.equal(esm.validatePostalCode('JP', '150-0002'), true);
assert.equal(esm.validatePostalCode('JP', 'nonsense'), false);
// Permissive where no rule is known — documented behaviour, not an oversight.
assert.equal(esm.validatePostalCode('ZZ', 'anything'), true);

/*
 * Anything routed through Intl depends on the runtime's ICU data, and Node 18
 * ships an older ICU than Node 24. Asserting exact separators or month names
 * here would turn an ICU upgrade into a CI failure, so these check only that a
 * formatter was built and produced digits.
 */
const intlOutputs = [
  esm.formatCurrency(1234567.89, { country: 'VN' }),
  esm.formatNumber(1234567.89, { country: 'DE' }),
  esm.formatDate(new Date('2026-09-03T12:00:00Z'), { country: 'GB', timeZone: 'UTC' }),
  esm.formatTime(new Date('2026-09-03T12:00:00Z'), { country: 'GB', timeZone: 'UTC' }),
  esm.formatDateTime(new Date('2026-09-03T12:00:00Z'), { country: 'GB', timeZone: 'UTC' }),
];
for (const output of intlOutputs) {
  assert.match(output, /\d/, `Expected an Intl-formatted string containing digits, got ${JSON.stringify(output)}`);
}

/* --------------------------------------------------------- subpath entries */

const { createRegistry } = await import('@nexkit/locale-format/core');
const { createAddressFormatter } = await import('@nexkit/locale-format/address');
const { createNumberFormatter } = await import('@nexkit/locale-format/currency');
const { createDateTimeFormatter } = await import('@nexkit/locale-format/datetime');
const { createNameFormatter } = await import('@nexkit/locale-format/name');
const { ALL_COUNTRIES, SUPPORTED_COUNTRY_CODES } = await import('@nexkit/locale-format/data');

const registry = createRegistry(ALL_COUNTRIES);
assert.equal(createAddressFormatter(registry).getAddressFields('VN').length > 0, true);
assert.match(createNumberFormatter(registry).formatNumber(1000, { country: 'DE' }), /\d/);
assert.match(
  createDateTimeFormatter(registry).formatDate(new Date(0), { country: 'GB', timeZone: 'UTC' }),
  /\d/,
);
assert.equal(createNameFormatter(registry).getNameOrder('KR'), 'family-first');

assert.equal(SUPPORTED_COUNTRY_CODES.includes('VN'), true);

// One country reached through its own subpath, both ways it is exported.
const vn = await import('@nexkit/locale-format/data/vn');
assert.equal(vn.spec.code, 'VN');
assert.equal(vn.default, vn.spec);

// Lazy loading resolves a country that was never statically imported.
assert.equal((await esm.loadCountry('TH'))?.code, 'TH');
assert.equal(await esm.loadCountry('ZZ'), undefined);

/* ------------------------------------------------- root entry, as CommonJS */

const cjs = require('@nexkit/locale-format');
assert.equal(
  cjs.formatAddress({ country: 'VN', fields: { ward: 'P.Ben Thanh', city: 'TP.HCM' } }),
  'P.Ben Thanh, TP.HCM',
);
assert.equal(cjs.getCurrencyCode('GB'), 'GBP');
assert.equal(cjs.getNameOrder('JP'), 'family-first');

const cjsAddress = require('@nexkit/locale-format/address');
assert.equal(typeof cjsAddress.createAddressFormatter, 'function');

const cjsVn = require('@nexkit/locale-format/data/vn');
assert.equal(cjsVn.spec.code, 'VN');

console.log(`Smoke test passed on Node ${process.version} against @nexkit/locale-format@${manifest.version}.`);
