import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'IN',
  name: 'India',
  defaultLocale: 'en-IN',
  callingCode: '+91',
  currency: 'INR',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{6}$', example: '110001' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
    { name: 'addressLine2', label: 'Locality', required: false, order: 2 },
    { name: 'city', label: 'City', required: true, order: 3 },
    {
      name: 'postalCode',
      label: 'PIN Code',
      required: true,
      order: 4,
      pattern: '^\\d{6}$',
      placeholder: '110001',
    },
    { name: 'state', label: 'State', required: true, order: 5 },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '{addressLine2}',
    '[{city} {postalCode}]',
    '{state}',
  ],
});

export default spec;
