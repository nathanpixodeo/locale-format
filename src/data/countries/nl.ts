import { defineCountry } from '../../core/define.js';

const POSTAL = '^\\d{4} ?[A-Z]{2}$';

export const spec = defineCountry({
  code: 'NL',
  name: 'Netherlands',
  defaultLocale: 'nl-NL',
  callingCode: '+31',
  currency: 'EUR',
  nameOrder: 'given-first',
  postalCode: { pattern: POSTAL, example: '1012 AB' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    {
      name: 'addressLine1',
      label: 'Street and Number',
      required: true,
      order: 2,
      placeholder: 'Damrak 1',
    },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    {
      name: 'postalCode',
      label: 'Postcode',
      required: true,
      order: 4,
      pattern: POSTAL,
      placeholder: '1012 AB',
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
