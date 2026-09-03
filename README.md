# @nexkit/locale-format

Country-aware display formatting for addresses, phone numbers, currency, dates and personal names.

Every project that opens a new market re-implements the same rules: Japan writes the postal code
first, Vietnam dropped its district tier in 2025, Germany puts the postal code before the city, and
`Nguyen Van A` is a family name followed by a given name. This package holds those rules in one
place so a product team writes `formatAddress(...)` instead of a per-country `if`.

It is a thin abstraction over standards that already exist — `Intl` for numbers and dates,
`libphonenumber-js` for phone numbers — plus a small, patchable table of per-country address rules.

- Dual ESM + CommonJS build, Node 18.17+ and browsers
- Full TypeScript types, with autocomplete on ISO 3166-1 alpha-2 country codes
- Tree-shakeable subpath entries; core + address is under 3KB gzipped
- 22 bundled countries, a generic fallback for the other ~227, and lazy loading per country
- Total functions: no formatter throws on bad input

## Install

```bash
npm install @nexkit/locale-format
```

## Quick start

```ts
import {
  formatAddress,
  getAddressFields,
  toE164,
  formatCurrency,
  getNameOrder,
} from '@nexkit/locale-format';

formatAddress({
  country: 'VN',
  fields: {
    street: '12 Nguyen Trai',
    ward: 'P.Ben Thanh',
    district: 'Q.1',
    city: 'TP.HCM',
  },
});
// "12 Nguyen Trai, P.Ben Thanh, Q.1, TP.HCM"

getAddressFields('JP').map((field) => field.name);
// ['postalCode', 'prefecture', 'city', 'addressLine1', 'addressLine2', 'recipient']

toE164('0901234567', { country: 'VN' }); // "+84901234567"
formatCurrency(1234567, { country: 'VN' }); // "1.234.567 ₫"
getNameOrder('JP'); // "family-first"
```

## Import by module

The root entry wires all 22 countries. Import a subpath to pull in only what you use.

```ts
import { createAddressFormatter } from '@nexkit/locale-format/address';
import { createRegistry } from '@nexkit/locale-format/core';
import VN from '@nexkit/locale-format/data/vn';
import JP from '@nexkit/locale-format/data/jp';

const countries = createRegistry([VN, JP]);
const { formatAddress, getAddressFields } = createAddressFormatter(countries);
```

| Subpath | Contents |
| --- | --- |
| `@nexkit/locale-format` | Everything, pre-wired with all 22 countries |
| `@nexkit/locale-format/core` | Types, `createRegistry`, `defineCountry`, `renderLine`, Intl cache |
| `@nexkit/locale-format/address` | `createAddressFormatter` and the standalone `*With` helpers |
| `@nexkit/locale-format/phone` | Phone functions (registry-free) |
| `@nexkit/locale-format/currency` | `createNumberFormatter` |
| `@nexkit/locale-format/datetime` | `createDateTimeFormatter` |
| `@nexkit/locale-format/name` | `createNameFormatter` |
| `@nexkit/locale-format/data` | `ALL_COUNTRIES`, `loadCountry`, every country by code |
| `@nexkit/locale-format/data/vn` | One country spec (`vn`, `us`, `jp`, … lowercase) |

## API

### Address

```ts
formatAddress(input: AddressInput, options?: FormatOptions): string
formatAddressLines(input: AddressInput, options?: FormatOptions): string[]
getAddressFields(country: CountryCodeInput): AddressFieldSchema[]
validatePostalCode(country: CountryCodeInput, value: string): boolean
```

`AddressInput` is `{ country, fields }`, where `fields` maps field names to values. Numbers are
coerced, `null` and `undefined` are skipped.

`FormatOptions`:

| Option | Default | Meaning |
| --- | --- | --- |
| `layout` | `'single-line'` | `'multi-line'` joins with `\n` |
| `separator` | `', '` | Joiner between lines in single-line layout |
| `script` | `'local'` | `'latin'` uses the Latin line order where one exists (CN, JP, KR, TW) |
| `includeCountry` | `false` | Append the country as a final line |
| `countryName` | spec name | Country name to append |

```ts
formatAddress(jpAddress, { layout: 'multi-line' });
// 〒100-0001
// 東京都千代田区1-1
// Tanaka Taro

formatAddress(jpAddress, { layout: 'multi-line', script: 'latin' });
// Tanaka Taro
// 1-1 Chiyoda
// Chiyoda-ku, Tokyo 100-0001
```

Field names are shared across countries, so one form model works everywhere:

`recipient`, `organization`, `addressLine1`, `addressLine2`, `street`, `sublocality`, `ward`,
`district`, `city`, `state`, `province`, `prefecture`, `postalCode`, `country`.

`street` and `addressLine1` are interchangeable, as are `state`, `province` and `prefecture` — they
name the same administrative level in different countries.

### Phone

Wraps `libphonenumber-js`; no country registry involved.

```ts
formatPhoneDisplay(phone: string, options?: PhoneOptions): string
isValidPhone(phone: string, options?: PhoneOptions): boolean
toE164(phone: string, options?: PhoneOptions): string | null
getCallingCode(country: CountryCodeInput): string
parsePhone(phone: string, options?: PhoneOptions): PhoneInfo | null
```

`PhoneOptions` is `{ country?, format? }` where `format` is `'national'` (default),
`'international'`, `'e164'` or `'rfc3966'`. `country` is only needed for numbers written without a
`+` prefix.

`isValidPhone` rejects a number belonging to a different country when `country` is given, so a US
number cannot pass a Vietnam-only form. `formatPhoneDisplay` returns unparseable input trimmed
rather than blank, which keeps a half-typed number visible in a live-formatting input.

### Currency and numbers

```ts
formatNumber(value: number, options?: NumberFormatOptions): string
formatCurrency(value: number, options?: CurrencyFormatOptions): string
getCurrencyCode(country: CountryCodeInput): string
```

Both option types extend `Intl.NumberFormatOptions` with `country` and `locale`. Locale precedence
is `locale` → the country's `defaultLocale` → the runtime default. Currency precedence is
`currency` → the country's currency; with neither, the value is formatted as a plain number instead
of throwing.

### Date and time

```ts
formatDate(value: DateInput, options?: DateTimeFormatOptions): string
formatTime(value: DateInput, options?: DateTimeFormatOptions): string
formatDateTime(value: DateInput, options?: DateTimeFormatOptions): string
```

`DateInput` is a `Date`, a timestamp or a string. Defaults are `dateStyle: 'medium'` and
`timeStyle: 'short'`; specifying any shape option (`year`, `month`, `dateStyle`, …) replaces the
defaults rather than merging with them.

### Names

```ts
getNameOrder(country: CountryCodeInput): 'given-first' | 'family-first'
formatName(parts: NameParts, options?: NameFormatOptions): string
```

```ts
formatName({ given: 'Taro', family: 'Tanaka' }, { country: 'JP' }); // "Tanaka Taro"
formatName({ given: 'Taro', family: 'Tanaka' }, { country: 'US' }); // "Taro Tanaka"
```

### Registry and custom countries

```ts
import { countries, defineCountry, loadCountry } from '@nexkit/locale-format';

countries.codes();       // ['AU', 'BR', 'CA', ...]
countries.has('VN');     // true
countries.get('XX');     // undefined
countries.resolve('XX'); // generic spec carrying code 'XX'

countries.register(
  defineCountry({
    code: 'NZ',
    name: 'New Zealand',
    defaultLocale: 'en-NZ',
    callingCode: '+64',
    currency: 'NZD',
    nameOrder: 'given-first',
    postalCode: { pattern: '^\\d{4}$', example: '6011' },
    addressFields: [
      { name: 'recipient', label: 'Recipient', required: false, order: 0 },
      { name: 'addressLine1', label: 'Street Address', required: true, order: 1 },
      { name: 'city', label: 'City', required: true, order: 2 },
      { name: 'postalCode', label: 'Postcode', required: true, order: 3, pattern: '^\\d{4}$' },
    ],
    addressFormat: ['{recipient}', '{addressLine1}', '[{city} {postalCode}]'],
  }),
);

await loadCountry('TH'); // dynamic import, one chunk per country
```

`register` also overrides a bundled country, which is the escape hatch when a national rule changes
before this package ships a patch.

### Address templates

`addressFormat` is one template per line:

- `{field}` is replaced by the field's value, or by nothing when it is absent.
- `[ ... ]` is an optional group: it disappears entirely unless at least one field inside it has a
  value. This is what keeps a literal such as Japan's `〒` from surviving on its own.
- Lines that render empty are dropped, and orphaned separators are cleaned up — Vietnam's
  `'[{ward}, {district}]'` renders `P.Ben Thanh` when the abolished district tier is absent.

## Supported countries

| Code | Country | Locale | Calling code | Currency | Name order | Postal code |
| --- | --- | --- | --- | --- | --- | --- |
| AU | Australia | en-AU | +61 | AUD | given-first | `2000` |
| BR | Brazil | pt-BR | +55 | BRL | given-first | `01310-100` |
| CA | Canada | en-CA | +1 | CAD | given-first | `K1A 0B1` |
| CN | China | zh-CN | +86 | CNY | family-first | `100000` |
| DE | Germany | de-DE | +49 | EUR | given-first | `10115` |
| ES | Spain | es-ES | +34 | EUR | given-first | `28001` |
| FR | France | fr-FR | +33 | EUR | given-first | `75008` |
| GB | United Kingdom | en-GB | +44 | GBP | given-first | `SW1A 1AA` |
| HK | Hong Kong | zh-HK | +852 | HKD | family-first | none |
| ID | Indonesia | id-ID | +62 | IDR | given-first | `10110` |
| IN | India | en-IN | +91 | INR | given-first | `110001` |
| IT | Italy | it-IT | +39 | EUR | given-first | `00187` |
| JP | Japan | ja-JP | +81 | JPY | family-first | `100-0001` |
| KR | South Korea | ko-KR | +82 | KRW | family-first | `04524` |
| MY | Malaysia | ms-MY | +60 | MYR | given-first | `50450` |
| NL | Netherlands | nl-NL | +31 | EUR | given-first | `1012 AB` |
| PH | Philippines | en-PH | +63 | PHP | given-first | `1000` |
| SG | Singapore | en-SG | +65 | SGD | given-first | `238859` |
| TH | Thailand | th-TH | +66 | THB | given-first | `10330` |
| TW | Taiwan | zh-TW | +886 | TWD | family-first | `100` |
| US | United States | en-US | +1 | USD | given-first | `94103` |
| VN | Vietnam | vi-VN | +84 | VND | family-first | `700000` |

CN, JP, KR and TW also ship a Latin line order, reachable with `script: 'latin'`.

Any other country resolves to a generic schema — recipient, organization, two address lines, city,
state, postal code — so an unsupported market degrades instead of breaking.

## Behaviour on bad input

No function in this package throws. The contract is:

| Situation | Result |
| --- | --- |
| Unknown country code | Generic schema carrying that code |
| Missing or empty address fields | Those lines are dropped |
| Unparseable phone number | `formatPhoneDisplay` returns the trimmed input; `parsePhone` returns `null`; `toE164` returns `null`; `isValidPhone` returns `false` |
| `NaN` or `Infinity` amount | `''` |
| Invalid date | `''` |
| Country with no postal rule | `validatePostalCode` returns `true` |
| Country with a postal rule, empty value | `validatePostalCode` returns `false` |
| Unrecognised locale or currency | Falls back to the runtime default |

## Known limitations

- **Transliteration is line reordering only.** `script: 'latin'` switches to the Latin line order
  for CN, JP, KR and TW. It does not convert Kanji or Hanzi to Romaji or Pinyin — the field values
  are printed as given. Store Latin values in the fields if you need Latin output.
- **Field names differ slightly from the SRS.** The specification's example shows a single
  `addressLine`; this package ships `addressLine1` and `addressLine2` because several countries need
  both. `street` remains as an alias of `addressLine1`.
- **Administrative data is not exhaustive.** The package carries field structure and postal code
  patterns, not lists of provinces, cities or streets. Vietnam's 2025 reform is modelled by making
  `district` optional so legacy records still render.
- **Postal validation is regex-level.** A code can match the national pattern and still not exist.
- **`Intl` output depends on the runtime's ICU data.** Exact separators and month names may differ
  between Node builds and browsers.

## Compatibility

- Node.js 18.17 or newer; modern browsers via any bundler
- ESM and CommonJS, both with type definitions
- `sideEffects: false`, so unused countries and modules are dropped by any tree-shaking bundler
- `libphonenumber-js` is the only runtime dependency and is only reached through `/phone`

## Development

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # vitest
npm run test:coverage # vitest with the 90% thresholds enforced
npm run build         # tsup, ESM + CJS + .d.ts
npm run check-size    # gzip budgets
npm run verify        # all of the above, also run before publish
```

## License

MIT © Nathan Pixodeo
