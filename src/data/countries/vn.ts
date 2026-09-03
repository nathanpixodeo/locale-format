import { defineCountry } from '../../core/define.js';

/**
 * Vietnam.
 *
 * The 2025 administrative reform removed the district (quan/huyen) tier, leaving
 * ward/commune directly under province. `district` is kept as an optional field
 * so historical records still render, and the template drops it when absent.
 */
export const spec = defineCountry({
  code: 'VN',
  name: 'Vietnam',
  defaultLocale: 'vi-VN',
  callingCode: '+84',
  currency: 'VND',
  nameOrder: 'family-first',
  postalCode: { pattern: '^\\d{6}$', example: '700000' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    {
      name: 'street',
      label: 'Street Address',
      required: true,
      order: 1,
      placeholder: '12 Nguyen Trai',
    },
    {
      name: 'ward',
      label: 'Ward / Commune',
      required: true,
      order: 2,
      placeholder: 'P.Ben Thanh',
    },
    {
      name: 'district',
      label: 'District (legacy, abolished in 2025)',
      required: false,
      order: 3,
      placeholder: 'Q.1',
    },
    {
      name: 'city',
      label: 'Province / City',
      required: true,
      order: 4,
      placeholder: 'TP.HCM',
    },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: false,
      order: 5,
      pattern: '^\\d{6}$',
      placeholder: '700000',
    },
  ],
  addressFormat: ['{recipient}', '{street}', '[{ward}, {district}]', '[{city} {postalCode}]'],
});

export default spec;
