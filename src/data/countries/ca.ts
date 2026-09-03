import { defineCountry } from '../../core/define.js';

const POSTAL = '^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z] ?\\d[ABCEGHJ-NPRSTV-Z]\\d$';

export const spec = defineCountry({
  code: 'CA',
  name: 'Canada',
  defaultLocale: 'en-CA',
  callingCode: '+1',
  currency: 'CAD',
  nameOrder: 'given-first',
  postalCode: { pattern: POSTAL, example: 'K1A 0B1' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    { name: 'addressLine1', label: 'Address Line 1', required: true, order: 2 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    { name: 'city', label: 'City', required: true, order: 4 },
    { name: 'province', label: 'Province', required: true, order: 5, placeholder: 'ON' },
    {
      name: 'postalCode',
      label: 'Postal Code',
      required: true,
      order: 6,
      pattern: POSTAL,
      placeholder: 'K1A 0B1',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{city}, {province} {postalCode}]',
  ],
});

export default spec;
