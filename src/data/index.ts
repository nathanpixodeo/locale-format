import type { CountrySpec } from '../core/types.js';

import AU from './countries/au.js';
import BR from './countries/br.js';
import CA from './countries/ca.js';
import CN from './countries/cn.js';
import DE from './countries/de.js';
import ES from './countries/es.js';
import FR from './countries/fr.js';
import GB from './countries/gb.js';
import HK from './countries/hk.js';
import ID from './countries/id.js';
import IN from './countries/in.js';
import IT from './countries/it.js';
import JP from './countries/jp.js';
import KR from './countries/kr.js';
import MY from './countries/my.js';
import NL from './countries/nl.js';
import PH from './countries/ph.js';
import SG from './countries/sg.js';
import TH from './countries/th.js';
import TW from './countries/tw.js';
import US from './countries/us.js';
import VN from './countries/vn.js';

export {
  AU, BR, CA, CN, DE, ES, FR, GB, HK, ID, IN, IT,
  JP, KR, MY, NL, PH, SG, TH, TW, US, VN,
};

export { genericCountrySpec } from '../core/fallback.js';
export { loadCountry, LAZY_COUNTRY_CODES } from './load.js';

/**
 * Every bundled country spec. Importing this pulls in all of them; import the
 * individual specs (or `loadCountry`) when bundle size matters (NFR-2).
 */
export const ALL_COUNTRIES: readonly CountrySpec[] = [
  AU, BR, CA, CN, DE, ES, FR, GB, HK, ID, IN, IT,
  JP, KR, MY, NL, PH, SG, TH, TW, US, VN,
];

/** ISO 3166-1 alpha-2 codes of the bundled countries, sorted. */
export const SUPPORTED_COUNTRY_CODES: readonly string[] = ALL_COUNTRIES.map(
  (spec) => spec.code,
);
