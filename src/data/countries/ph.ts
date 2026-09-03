import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'PH',
  name: 'Philippines',
  defaultLocale: 'en-PH',
  callingCode: '+63',
  currency: 'PHP',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{4}$', example: '1000' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
    { name: 'ward', label: 'Barangay', required: false, order: 2 },
    { name: 'city', label: 'City / Municipality', required: true, order: 3 },
    { name: 'province', label: 'Province', required: false, order: 4 },
    {
      name: 'postalCode',
      label: 'ZIP Code',
      required: true,
      order: 5,
      pattern: '^\\d{4}$',
      placeholder: '1000',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '[{ward}, {city}]',
    '[{postalCode} {province}]',
  ],
});

export default spec;
