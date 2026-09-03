import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'SG',
  name: 'Singapore',
  defaultLocale: 'en-SG',
  callingCode: '+65',
  currency: 'SGD',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{6}$', example: '238859' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    {
      name: 'addressLine1',
      label: 'Block and Street',
      required: true,
      order: 2,
      placeholder: '2 Orchard Turn',
    },
    { name: 'addressLine2', label: 'Unit Number', required: false, order: 3 },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 4,
      pattern: '^\\d{6}$',
      placeholder: '238859',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[Singapore {postalCode}]',
  ],
});

export default spec;
