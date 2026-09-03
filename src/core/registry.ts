import { genericCountrySpec } from './fallback.js';
import type { CountryCodeInput, CountrySpec } from './types.js';

export interface CountryRegistry {
  /** The spec for `code`, or `undefined` when the country is not registered. */
  get(code: CountryCodeInput): CountrySpec | undefined;
  /** Whether `code` has a dedicated spec. */
  has(code: CountryCodeInput): boolean;
  /** The spec for `code`, falling back to the generic schema. Never throws. */
  resolve(code: CountryCodeInput): CountrySpec;
  /** Registered country codes, sorted. */
  codes(): CountryCodeInput[];
  /** Adds or replaces specs. Returns the registry for chaining. */
  register(...specs: CountrySpec[]): CountryRegistry;
}

/** Bounds memory when callers pass a stream of unknown country codes. */
const FALLBACK_CACHE_LIMIT = 64;

function normalize(code: CountryCodeInput | null | undefined): string {
  return typeof code === 'string' ? code.trim().toUpperCase() : '';
}

/**
 * Builds an isolated country lookup. Kept as a value rather than a module-level
 * singleton so entry points can wire their own set of countries without import
 * side effects, which is what makes `sideEffects: false` safe for tree-shaking.
 */
export function createRegistry(specs: Iterable<CountrySpec> = []): CountryRegistry {
  const table = new Map<string, CountrySpec>();
  const fallbacks = new Map<string, CountrySpec>();

  for (const spec of specs) table.set(normalize(spec.code), spec);

  function fallbackFor(code: string): CountrySpec {
    if (!code) return genericCountrySpec;
    const cached = fallbacks.get(code);
    if (cached) return cached;
    const spec: CountrySpec = { ...genericCountrySpec, code };
    if (fallbacks.size < FALLBACK_CACHE_LIMIT) fallbacks.set(code, spec);
    return spec;
  }

  const registry: CountryRegistry = {
    get: (code) => table.get(normalize(code)),
    has: (code) => table.has(normalize(code)),
    resolve(code) {
      const key = normalize(code);
      return table.get(key) ?? fallbackFor(key);
    },
    codes: () => [...table.keys()].sort(),
    register(...added) {
      for (const spec of added) table.set(normalize(spec.code), spec);
      return registry;
    },
  };

  return registry;
}
