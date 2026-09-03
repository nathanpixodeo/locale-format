import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'ID',
  name: 'Indonesia',
  defaultLocale: 'id-ID',
  callingCode: '+62',
  currency: 'IDR',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}$', example: '10110' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
    { name: 'ward', label: 'Kelurahan', required: false, order: 2 },
    { name: 'district', label: 'Kecamatan', required: false, order: 3 },
    { name: 'city', label: 'City / Regency', required: true, order: 4 },
    { name: 'province', label: 'Province', required: true, order: 5 },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 6,
      pattern: '^\\d{5}$',
      placeholder: '10110',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '[{ward}, {district}]',
    '[{city}, {province} {postalCode}]',
  ],
});

export default spec;
