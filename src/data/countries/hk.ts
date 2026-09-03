import { defineCountry } from '../../core/define.js';

/** Hong Kong has no postal code system, so `postalCode` is deliberately absent. */
export const spec = defineCountry({
  code: 'HK',
  name: 'Hong Kong',
  defaultLocale: 'zh-HK',
  callingCode: '+852',
  currency: 'HKD',
  nameOrder: 'family-first',
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    {
      name: 'addressLine1',
      label: 'Flat / Floor / Building',
      required: true,
      order: 1,
    },
    { name: 'addressLine2', label: 'Street', required: false, order: 2 },
    { name: 'district', label: 'District', required: true, order: 3 },
    {
      name: 'state',
      label: 'Region',
      required: true,
      order: 4,
      placeholder: 'Kowloon',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '{addressLine2}',
    '{district}',
    '{state}',
  ],
});

export default spec;
