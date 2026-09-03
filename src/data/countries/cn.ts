import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'CN',
  name: 'China',
  defaultLocale: 'zh-CN',
  callingCode: '+86',
  currency: 'CNY',
  nameOrder: 'family-first',
  postalCode: { pattern: '^\\d{6}$', example: '100000' },
  addressFields: [
    { name: 'province', label: 'Province', required: true, order: 0 },
    { name: 'city', label: 'City', required: true, order: 1 },
    { name: 'district', label: 'District', required: false, order: 2 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 3 },
    { name: 'addressLine2', label: 'Building / Room', required: false, order: 4 },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: false,
      order: 5,
      pattern: '^\\d{6}$',
      placeholder: '100000',
    },
    { name: 'recipient', label: 'Recipient', required: false, order: 6 },
  ],
  addressFormat: [
    '[{province}{city}{district}]',
    '{addressLine1}',
    '{addressLine2}',
    '{postalCode}',
    '{recipient}',
  ],
  addressFormatLatin: [
    '{recipient}',
    '{addressLine2}',
    '{addressLine1}',
    '[{district}, {city}, {province} {postalCode}]',
  ],
});

export default spec;
