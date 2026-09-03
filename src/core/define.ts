import type { CountrySpec } from './types.js';

/**
 * Identity helper that types a country spec at its definition site, so a typo in
 * a field name or a missing property is reported in the data file itself.
 *
 * ```ts
 * export default defineCountry({ code: 'VN', ... });
 * ```
 */
export function defineCountry(spec: CountrySpec): CountrySpec {
  return spec;
}
