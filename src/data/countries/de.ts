import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'DE',
  name: 'Germany',
  defaultLocale: 'de-DE',
  callingCode: '+49',
  currency: 'EUR',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}$', example: '10115' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    {
      name: 'addressLine1',
      label: 'Street and Number',
      required: true,
      order: 2,
      placeholder: 'Friedrichstrasse 43',
    },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 4,
      pattern: '^\\d{5}$',
      placeholder: '10115',
    },
    { name: 'city', label: 'City', required: true, order: 5 },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{postalCode} {city}]',
  ],
});

export default spec;
