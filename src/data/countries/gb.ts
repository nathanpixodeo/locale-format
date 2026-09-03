import { defineCountry } from '../../core/define.js';

const POSTAL = '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$';

export const spec = defineCountry({
  code: 'GB',
  name: 'United Kingdom',
  defaultLocale: 'en-GB',
  callingCode: '+44',
  currency: 'GBP',
  nameOrder: 'given-first',
  postalCode: { pattern: POSTAL, example: 'SW1A 1AA' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    { name: 'addressLine1', label: 'Address Line 1', required: true, order: 2 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    { name: 'city', label: 'Town / City', required: true, order: 4 },
    { name: 'state', label: 'County', required: false, order: 5 },
    {
      name: 'postalCode',
      label: 'Postcode',
      required: true,
      order: 6,
      pattern: POSTAL,
      placeholder: 'SW1A 1AA',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '{city}',
    '{state}',
    '{postalCode}',
  ],
});

export default spec;
