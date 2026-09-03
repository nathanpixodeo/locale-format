/**
 * Node.js example.
 *
 * From the repository root:
 *   npm run build && node examples/node/index.mjs
 *
 * In a real project the import specifier is '@nexkit/locale-format'.
 */
import {
  countries,
  formatAddress,
  formatAddressLines,
  formatCurrency,
  formatDateTime,
  formatName,
  formatPhoneDisplay,
  getAddressFields,
  getNameOrder,
  isValidPhone,
  loadCountry,
  toE164,
  validatePostalCode,
} from '../../dist/index.js';

const line = (label, value) => console.log(`${label.padEnd(28)} ${value}`);

console.log('\n--- Address ---');
line(
  'Vietnam',
  formatAddress({
    country: 'VN',
    fields: {
      street: '12 Nguyen Trai',
      ward: 'P.Ben Thanh',
      district: 'Q.1',
      city: 'TP.HCM',
    },
  }),
);

line(
  'Vietnam (post-2025 data)',
  formatAddress({
    country: 'VN',
    fields: { street: '12 Nguyen Trai', ward: 'P.Ben Thanh', city: 'TP.HCM' },
  }),
);

line(
  'United States',
  formatAddress({
    country: 'US',
    fields: {
      recipient: 'Jane Doe',
      addressLine1: '1600 Amphitheatre Pkwy',
      city: 'Mountain View',
      state: 'CA',
      postalCode: '94043',
    },
  }),
);

const japan = {
  country: 'JP',
  fields: {
    postalCode: '100-0001',
    prefecture: 'Tokyo',
    city: 'Chiyoda-ku',
    addressLine1: '1-1 Chiyoda',
    recipient: 'Tanaka Taro',
  },
};

console.log('\nJapan, native line order:');
console.log(formatAddressLines(japan).join('\n'));

console.log('\nJapan, Latin line order:');
console.log(formatAddressLines(japan, { script: 'latin' }).join('\n'));

console.log('\n--- Form metadata ---');
for (const field of getAddressFields('JP')) {
  console.log(
    `  ${field.name.padEnd(14)} ${field.label.padEnd(22)} ${field.required ? 'required' : 'optional'}` +
      (field.pattern ? `  ${field.pattern}` : ''),
  );
}

console.log('\n--- Postal codes ---');
line("validatePostalCode('JP', '100-0001')", validatePostalCode('JP', '100-0001'));
line("validatePostalCode('JP', '1000001')", validatePostalCode('JP', '1000001'));

console.log('\n--- Phone ---');
line('formatPhoneDisplay', formatPhoneDisplay('0901234567', { country: 'VN' }));
line('international', formatPhoneDisplay('0901234567', { country: 'VN', format: 'international' }));
line('toE164', toE164('0901234567', { country: 'VN' }));
line('isValidPhone (VN number, VN)', isValidPhone('0901234567', { country: 'VN' }));
line('isValidPhone (US number, VN)', isValidPhone('+12133734253', { country: 'VN' }));

console.log('\n--- Currency, numbers, dates ---');
line('formatCurrency VN', formatCurrency(1234567, { country: 'VN' }));
line('formatCurrency US', formatCurrency(1234.5, { country: 'US' }));
line('formatCurrency DE', formatCurrency(1234.5, { country: 'DE' }));
line('formatDateTime JP', formatDateTime('2024-03-15T09:30:00Z', { country: 'JP', timeZone: 'UTC' }));
line('formatDateTime GB', formatDateTime('2024-03-15T09:30:00Z', { country: 'GB', timeZone: 'UTC' }));

console.log('\n--- Names ---');
line("getNameOrder('JP')", getNameOrder('JP'));
line('formatName JP', formatName({ given: 'Taro', family: 'Tanaka' }, { country: 'JP' }));
line('formatName US', formatName({ given: 'Taro', family: 'Tanaka' }, { country: 'US' }));

console.log('\n--- Registry ---');
line('countries.codes()', countries.codes().join(' '));
line("countries.resolve('ZW').code", countries.resolve('ZW').code);
line("await loadCountry('TH')", (await loadCountry('TH')).name);
console.log();
