import { defineCountry } from '../../core/define.js';

/**
 * Japan.
 *
 * The native layout runs largest unit first with no separators; the Latin layout
 * reverses it. `addressFormatLatin` only reorders lines — it does not
 * transliterate Kanji to Romaji.
 */
export const spec = defineCountry({
  code: 'JP',
  name: 'Japan',
  defaultLocale: 'ja-JP',
  callingCode: '+81',
  currency: 'JPY',
  nameOrder: 'family-first',
  postalCode: { pattern: '^\\d{3}-\\d{4}$', example: '100-0001' },
  addressFields: [
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 0,
      pattern: '^\\d{3}-\\d{4}$',
      placeholder: '100-0001',
    },
    { name: 'prefecture', label: 'Prefecture', required: true, order: 1 },
    { name: 'city', label: 'City / Ward', required: true, order: 2 },
    { name: 'addressLine1', label: 'Address Line', required: true, order: 3 },
    { name: 'addressLine2', label: 'Building / Room', required: false, order: 4 },
    { name: 'recipient', label: 'Recipient', required: false, order: 5 },
  ],
  addressFormat: [
    '[〒{postalCode}]',
    '[{prefecture}{city}{addressLine1}]',
    '{addressLine2}',
    '{recipient}',
  ],
  addressFormatLatin: [
    '{recipient}',
    '{addressLine2}',
    '{addressLine1}',
    '[{city}, {prefecture} {postalCode}]',
  ],
});

export default spec;
