import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'TH',
  name: 'Thailand',
  defaultLocale: 'th-TH',
  callingCode: '+66',
  currency: 'THB',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}$', example: '10330' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
    { name: 'ward', label: 'Sub-district (Khwaeng / Tambon)', required: true, order: 2 },
    { name: 'district', label: 'District (Khet / Amphoe)', required: true, order: 3 },
    { name: 'province', label: 'Province', required: true, order: 4 },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 5,
      pattern: '^\\d{5}$',
      placeholder: '10330',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '[{ward}, {district}]',
    '[{province} {postalCode}]',
  ],
});

export default spec;
