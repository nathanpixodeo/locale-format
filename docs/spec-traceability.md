# Specification traceability

Maps every requirement in locale-format SRS 0.1 to what shipped in 0.1.0.

## Functional requirements

| ID | Requirement | Status | Where |
| --- | --- | --- | --- |
| FR-A1 | Format a full address in the country's line order | Done | `src/address/index.ts`, `formatAddress` |
| FR-A2 | Return the fields a form needs, with label, required flag and placeholder | Done | `getAddressFields`, `AddressFieldSchema` |
| FR-A3 | Single-line and multi-line output | Done | `FormatOptions.layout`, `formatAddressLines` |
| FR-A4 | Validate postal codes against a per-country regex | Done | `validatePostalCode`, `CountrySpec.postalCode` |
| FR-A5 | Basic transliteration support | Partial | `script: 'latin'` switches the line order for CN, JP, KR, TW. Character conversion is out of scope — see below. |
| FR-P1 | Format a phone number for display, with or without the international prefix | Done | `formatPhoneDisplay`, `PhoneOptions.format` |
| FR-P2 | Validate a phone number for a country | Done | `isValidPhone` |
| FR-P3 | Parse to E.164 for storage | Done | `toE164`, `parsePhone` |
| FR-P4 | Suggest the calling code for a country | Done | `getCallingCode` |
| FR-C1 | Format currency by locale | Done | `formatCurrency` |
| FR-C2 | Format numbers by locale | Done | `formatNumber` |
| FR-D1 | Format dates and times by locale | Done | `formatDate`, `formatTime`, `formatDateTime` |
| FR-N1 | Determine display order of family and given names | Done | `getNameOrder`, `formatName` |

## Non-functional requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| NFR-1 | Core bundle under 5KB gzip, tree-shakeable, importable by module | Done | `npm run check-size`: core + address ≈ 2.5KB gzip. `sideEffects: false` is honest — registries are plain values, so no entry has import-time side effects. |
| NFR-2 | Per-country data split into files, loaded on demand | Done | `src/data/countries/*`, `loadCountry`, one chunk per country, plus a public `./data/<code>` subpath |
| NFR-3 | CommonJS and ESM; Node and browser | Done | Dual tsup build with a conditional `exports` map; `platform: 'neutral'`; `engines.node >= 18.17.0` |
| NFR-4 | Complete type definitions with country code autocomplete | Done | `.d.ts` and `.d.cts` per entry; `CountryCode` is the full ISO 3166-1 alpha-2 union, and `CountryCodeInput` still accepts any string so unsupported countries fall back |
| NFR-5 | At least 20 countries, with a fallback for the rest | Done | 22 countries plus `genericCountrySpec`; `registry.resolve` returns the generic schema carrying the requested code |
| NFR-6 | Locale data versioned independently of core logic | Partial | Data is isolated in `src/data/` behind its own subpath exports and has no dependency on the formatting modules, so it can be extracted into a separately versioned package without an API break. It is not yet a separate npm package — see below. |
| NFR-7 | Coverage at or above 90%, snapshot tests per country | Done | `vitest.config.ts` enforces 90% on lines, functions, branches and statements; `test/countries.spec.ts` snapshots all 22 countries' rendered addresses and form schemas |
| NFR-8 | Documentation and a visual playground | Partial | The documentation half is met: `README.md` carries the API reference, the bad-input contract and the known limitations; `adding-a-country.md` covers extending the country table; this file maps the SRS; `CONTRIBUTING.md` and `SECURITY.md` were added after 0.1.0; `examples/node` and `examples/react` are runnable. The playground half is not met — there is no Storybook and no hosted playground — so this stays Partial. |

## Deviations

Three deliberate departures from the specification text.

**FR-A5, transliteration.** The SRS lists this as "Could". What ships is line-order switching:
`script: 'latin'` selects a country's Latin-script template, which changes the order and separators
of the lines. It does not convert Kanji to Romaji or Hanzi to Pinyin. Doing that well needs a
readings dictionary and is a much larger commitment than the requirement's priority justifies;
claiming it without character conversion would be worse than stating the limit. Callers who need
Latin output should store Latin values in the fields.

**Field naming.** The SRS example for Japan shows a single `addressLine`. This package ships
`addressLine1` and `addressLine2`, because Germany, the United States, Singapore and others need a
second line for a unit or building. `street` is an alias of `addressLine1`, so a form modelled on
either name works everywhere.

**NFR-6, independent data versioning.** The SRS suggests a separate `@scope/locale-format-data`
package. Shipping one package keeps installation and version alignment simple at this stage; the
data is already isolated with no imports from the formatting modules, so extracting it later is a
packaging change rather than an API break.

## Definition of done for the MVP

| Criterion | Status |
| --- | --- |
| Correct formatting and validation for 20+ countries, with snapshot tests | Done — 22 countries |
| 100% type-safe with country code autocomplete | Done |
| Each module under 10KB gzip, excluding locale data | Done — largest module 1.0KB; the root entry, which bundles all 22 countries, is 8.2KB |
| README plus minimal React and Node integration examples | Done — `examples/node`, `examples/react` |
