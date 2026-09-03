import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'TW',
  name: 'Taiwan',
  defaultLocale: 'zh-TW',
  callingCode: '+886',
  currency: 'TWD',
  nameOrder: 'family-first',
  postalCode: { pattern: '^\\d{3}(?:\\d{2})?$', example: '100' },
  addressFields: [
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: false,
      order: 0,
      pattern: '^\\d{3}(?:\\d{2})?$',
      placeholder: '100',
    },
    { name: 'city', label: 'City / County', required: true, order: 1 },
    { name: 'district', label: 'District / Township', required: true, order: 2 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 3 },
    { name: 'addressLine2', label: 'Building / Floor', required: false, order: 4 },
    { name: 'recipient', label: 'Recipient', required: false, order: 5 },
  ],
  addressFormat: [
    '{postalCode}',
    '[{city}{district}]',
    '{addressLine1}',
    '{addressLine2}',
    '{recipient}',
  ],
  addressFormatLatin: [
    '{recipient}',
    '{addressLine2}',
    '{addressLine1}',
    '[{district}, {city} {postalCode}]',
  ],
});

export default spec;
