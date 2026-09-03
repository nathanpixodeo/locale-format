import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'US',
  name: 'United States',
  defaultLocale: 'en-US',
  callingCode: '+1',
  currency: 'USD',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}(?:-\\d{4})?$', example: '94103' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    {
      name: 'addressLine1',
      label: 'Address Line 1',
      required: true,
      order: 2,
      placeholder: '1600 Amphitheatre Pkwy',
    },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    { name: 'city', label: 'City', required: true, order: 4 },
    { name: 'state', label: 'State', required: true, order: 5, placeholder: 'CA' },
    {
      name: 'postalCode',
      label: 'ZIP Code',
      required: true,
      order: 6,
      pattern: '^\\d{5}(?:-\\d{4})?$',
      placeholder: '94103',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{city}, {state} {postalCode}]',
  ],
});

export default spec;
