import type { CountryCodeInput, CountrySpec } from '../core/types.js';

/**
 * Static map of dynamic imports. Written literally so bundlers can analyse each
 * specifier and emit one chunk per country, which is what lets an app load only
 * the countries it actually reaches at runtime (NFR-2).
 */
const LOADERS: Record<string, () => Promise<unknown>> = {
  AU: () => import('./countries/au.js'),
  BR: () => import('./countries/br.js'),
  CA: () => import('./countries/ca.js'),
  CN: () => import('./countries/cn.js'),
  DE: () => import('./countries/de.js'),
  ES: () => import('./countries/es.js'),
  FR: () => import('./countries/fr.js'),
  GB: () => import('./countries/gb.js'),
  HK: () => import('./countries/hk.js'),
  ID: () => import('./countries/id.js'),
  IN: () => import('./countries/in.js'),
  IT: () => import('./countries/it.js'),
  JP: () => import('./countries/jp.js'),
  KR: () => import('./countries/kr.js'),
  MY: () => import('./countries/my.js'),
  NL: () => import('./countries/nl.js'),
  PH: () => import('./countries/ph.js'),
  SG: () => import('./countries/sg.js'),
  TH: () => import('./countries/th.js'),
  TW: () => import('./countries/tw.js'),
  US: () => import('./countries/us.js'),
  VN: () => import('./countries/vn.js'),
};

/** Codes `loadCountry` can resolve, sorted. */
export const LAZY_COUNTRY_CODES: readonly string[] = Object.keys(LOADERS).sort();

function isSpec(value: unknown): value is CountrySpec {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CountrySpec).code === 'string' &&
    Array.isArray((value as CountrySpec).addressFormat)
  );
}

/**
 * Digs the spec out of the module namespace.
 *
 * In the CommonJS build a dynamic `import()` of a `.cjs` file yields a namespace
 * whose `default` is the whole `module.exports`, so the spec sits one level
 * deeper than it does under ESM. Both shapes are handled here rather than
 * pushing the difference onto callers.
 */
function unwrap(module: unknown): CountrySpec | undefined {
  const namespace = module as { default?: unknown; spec?: unknown } | null | undefined;
  const candidates = [
    namespace?.default,
    namespace?.spec,
    (namespace?.default as { default?: unknown } | undefined)?.default,
  ];
  return candidates.find(isSpec);
}

/**
 * Loads one country spec on demand. Resolves to `undefined` for unknown codes
 * instead of rejecting, so callers can fall back without a try/catch.
 */
export async function loadCountry(
  code: CountryCodeInput,
): Promise<CountrySpec | undefined> {
  const key = typeof code === 'string' ? code.trim().toUpperCase() : '';
  const loader = LOADERS[key];
  if (!loader) return undefined;
  try {
    return unwrap(await loader());
  } catch {
    return undefined;
  }
}
