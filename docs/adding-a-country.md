# Adding or overriding a country

Country data lives in `src/data/countries/<code>.ts`, one file per country, isolated from the
formatting logic. A rule change is a one-file patch.

## At runtime, without forking

```ts
import { countries, defineCountry } from '@nexkit/locale-format';

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
      { name: 'sublocality', label: 'Suburb', required: false, order: 2 },
      { name: 'city', label: 'City', required: true, order: 3 },
      { name: 'postalCode', label: 'Postcode', required: true, order: 4, pattern: '^\\d{4}$' },
    ],
    addressFormat: ['{recipient}', '{addressLine1}', '{sublocality}', '[{city} {postalCode}]'],
  }),
);
```

Registering a code that already exists replaces it. `defineCountry` is an identity function that
exists only to attach the `CountrySpec` type, so a typo in a field name is a compile error.

## In this package

1. Create `src/data/countries/<code>.ts` following the pattern of an existing file: a named `spec`
   export plus a default export of the same value. Both are needed — the named export keeps the
   CommonJS build's shape aligned with its type definitions.
2. Add the import, the re-export, and the `ALL_COUNTRIES` entry in `src/data/index.ts`.
3. Add the loader entry in `src/data/load.ts`. Write the dynamic import literally; a computed
   specifier cannot be code-split by a bundler.
4. Add the entry to the supported-countries table in `README.md`.
5. Run `npm test`. `test/countries.spec.ts` checks the new spec automatically: code shape, locale
   shape, currency shape, a calling code that agrees with `libphonenumber-js`, unique field order,
   a compilable postal pattern that its own example satisfies, and that every token used in a
   template has a matching entry in `addressFields`. Update the snapshot with `npm test -- -u`
   after reviewing the diff.

## Fields

`name` must be one of the shared field identifiers, so a single form model works across countries:

`recipient`, `organization`, `addressLine1`, `addressLine2`, `street`, `sublocality`, `ward`,
`district`, `city`, `state`, `province`, `prefecture`, `postalCode`, `country`.

`street` and `addressLine1` are aliases of each other, as are `state`, `province` and `prefecture`.
Pick whichever name a local form would use; the formatter fills in the other.

| Key | Required | Meaning |
| --- | --- | --- |
| `name` | yes | Field identifier from the list above |
| `label` | yes | Default English label; override through your own i18n layer |
| `required` | yes | Whether the national postal convention requires it |
| `order` | yes | Display order in a form, ascending and unique within the country |
| `pattern` | no | Anchored regex source, mirroring `postalCode.pattern` for the postal field |
| `placeholder` | no | Example value for the input's placeholder |

## Templates

`addressFormat` holds one template per line.

| Syntax | Behaviour |
| --- | --- |
| `{field}` | The field's value, or nothing when absent |
| `[ ... ]` | Optional group: dropped entirely unless a field inside has a value |
| anything else | A literal |

A line that renders empty is dropped. Repeated separators are collapsed and edge punctuation is
trimmed, so `'{city}, {state} {postalCode}'` survives a missing state.

Wrap a group in `[ ... ]` whenever it contains a literal that must not appear alone — Japan's
`'[〒{postalCode}]'` would otherwise print a bare `〒`. Two adjacent groups keep their literals
independent: Brazil's `'[{postalCode} {city}][ - {state}]'` loses the ` - ` when the state is
absent.

`addressFormatLatin` is optional and only needed where the Latin-script line order differs from the
native one, as it does in China, Japan, Korea and Taiwan. It reorders lines; it does not
transliterate characters.
