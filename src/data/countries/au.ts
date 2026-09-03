import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'AU',
  name: 'Australia',
  defaultLocale: 'en-AU',
  callingCode: '+61',
  currency: 'AUD',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{4}$', example: '2000' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    { name: 'organization', label: 'Company', required: false, order: 1 },
    { name: 'addressLine1', label: 'Street Address', required: true, order: 2 },
    { name: 'addressLine2', label: 'Address Line 2', required: false, order: 3 },
    { name: 'city', label: 'Suburb', required: true, order: 4 },
    {
      name: 'state',
      label: 'State / Territory',
      required: true,
      order: 5,
      placeholder: 'NSW',
    },
    {
      name: 'postalCode',
      label: 'Postcode',
      required: true,
      order: 6,
      pattern: '^\\d{4}$',
      placeholder: '2000',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{organization}',
    '{addressLine1}',
    '{addressLine2}',
    '[{city} {state} {postalCode}]',
  ],
});

export default spec;
