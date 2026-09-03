import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'IT',
  name: 'Italy',
  defaultLocale: 'it-IT',
  callingCode: '+39',
  currency: 'EUR',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}$', example: '00187' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 2 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    {
      name: 'postalCode',
      label: 'CAP',
      required: true,
      order: 4,
      pattern: '^\\d{5}$',
      placeholder: '00187',
    },
    { name: 'city', label: 'City', required: true, order: 5 },
    { name: 'province', label: 'Province', required: true, order: 6, placeholder: 'RM' },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{postalCode} {city} {province}]',
  ],
});

export default spec;
