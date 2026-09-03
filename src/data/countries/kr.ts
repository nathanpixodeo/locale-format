import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'KR',
  name: 'South Korea',
  defaultLocale: 'ko-KR',
  callingCode: '+82',
  currency: 'KRW',
  nameOrder: 'family-first',
  postalCode: { pattern: '^\\d{5}$', example: '04524' },
  addressFields: [
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 0,
      pattern: '^\\d{5}$',
      placeholder: '04524',
    },
    { name: 'province', label: 'Province / Metropolitan City', required: false, order: 1 },
    { name: 'city', label: 'City / District', required: true, order: 2 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 3 },
    { name: 'addressLine2', label: 'Building / Unit', required: false, order: 4 },
    { name: 'recipient', label: 'Recipient', required: false, order: 5 },
  ],
  addressFormat: [
    '[{province} {city}]',
    '{addressLine1}',
    '{addressLine2}',
    '[({postalCode})]',
    '{recipient}',
  ],
  addressFormatLatin: [
    '{recipient}',
    '{addressLine2}',
    '{addressLine1}',
    '[{city}, {province} {postalCode}]',
  ],
});

export default spec;
