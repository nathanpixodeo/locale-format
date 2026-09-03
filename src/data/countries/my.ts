import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'MY',
  name: 'Malaysia',
  defaultLocale: 'ms-MY',
  callingCode: '+60',
  currency: 'MYR',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}$', example: '50450' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 2 },
    {
      name: 'postalCode',
      label: 'Postcode',
      required: true,
      order: 3,
      pattern: '^\\d{5}$',
      placeholder: '50450',
    },
    { name: 'city', label: 'City', required: true, order: 4 },
    { name: 'state', label: 'State', required: true, order: 5 },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '{addressLine2}',
    '[{postalCode} {city}]',
    '{state}',
  ],
});

export default spec;
