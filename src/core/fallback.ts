import type { CountrySpec } from './types.js';

/**
 * Schema used for any country without a dedicated spec (NFR-5).
 *
 * `ZZ` is the ISO 3166-1 code reserved for "unknown". Registries hand back a
 * copy carrying the requested code, so `resolve('XX').code === 'XX'`.
 */
export const genericCountrySpec: CountrySpec = {
  code: 'ZZ',
  name: '',
  defaultLocale: 'en',
  callingCode: '',
  currency: '',
  nameOrder: 'given-first',
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Organization', required: false, order: 1 },
    { name: 'addressLine1', label: 'Address Line 1', required: true, order: 2 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    { name: 'city', label: 'City', required: true, order: 4 },
    { name: 'state', label: 'State / Region', required: false, order: 5 },
    { name: 'postalCode', label: 'Postal Code', required: false, order: 6 },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{city} {state} {postalCode}]',
  ],
};
