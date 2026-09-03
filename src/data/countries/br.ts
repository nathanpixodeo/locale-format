import { defineCountry } from '../../core/define.js';

export const spec = defineCountry({
  code: 'BR',
  name: 'Brazil',
  defaultLocale: 'pt-BR',
  callingCode: '+55',
  currency: 'BRL',
  nameOrder: 'given-first',
  postalCode: { pattern: '^\\d{5}-?\\d{3}$', example: '01310-100' },
  addressFields: [
    { name: 'recipient', label: 'Recipient', required: false, order: 0 },
    {
      name: 'addressLine1',
      label: 'Street and Number',
      required: true,
      order: 1,
      placeholder: 'Av. Paulista, 1578',
    },
    { name: 'addressLine2', label: 'Complement', required: false, order: 2 },
    { name: 'district', label: 'Neighbourhood (Bairro)', required: false, order: 3 },
    { name: 'city', label: 'City', required: true, order: 4 },
    {
      name: 'state',
      label: 'State',
      required: true,
      order: 5,
      placeholder: 'SP',
    },
    {
      name: 'postalCode',
      label: 'CEP',
      required: true,
      order: 6,
      pattern: '^\\d{5}-?\\d{3}$',
      placeholder: '01310-100',
    },
  ],
  addressFormat: [
    '{recipient}',
    '{addressLine1}',
    '{addressLine2}',
    '{district}',
    '[{postalCode} {city}][ - {state}]',
  ],
});

export default spec;
