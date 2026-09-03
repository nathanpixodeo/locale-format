# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-03

First release. Implements the MVP scope of the locale-format SRS 0.1, plus the Phase 2 modules.

### Added

- **Address** — `formatAddress`, `formatAddressLines`, `getAddressFields`, `validatePostalCode`,
  with single-line and multi-line layouts and a Latin line order for CN, JP, KR and TW
  (FR-A1 through FR-A5).
- **Phone** — `formatPhoneDisplay`, `isValidPhone`, `toE164`, `getCallingCode`, `parsePhone`,
  wrapping `libphonenumber-js` (FR-P1 through FR-P4).
- **Currency and numbers** — `formatCurrency`, `formatNumber`, `getCurrencyCode` over a cached
  `Intl.NumberFormat` (FR-C1, FR-C2).
- **Date and time** — `formatDate`, `formatTime`, `formatDateTime` over a cached
  `Intl.DateTimeFormat` (FR-D1).
- **Names** — `getNameOrder`, `formatName` (FR-N1).
- **Country data** — 22 countries (AU, BR, CA, CN, DE, ES, FR, GB, HK, ID, IN, IT, JP, KR, MY, NL,
  PH, SG, TH, TW, US, VN) and a generic fallback schema for every other country (NFR-5).
- **Registry** — `createRegistry`, `defineCountry` and `countries.register(...)` for overriding or
  adding countries without forking the package.
- **Lazy loading** — `loadCountry(code)` resolves one country through a dynamic import, emitting one
  chunk per country (NFR-2).
- Subpath exports for `core`, `address`, `phone`, `currency`, `datetime`, `name`, `data` and
  `data/<code>`, in both ESM and CommonJS with type definitions (NFR-3, NFR-4).

### Notes

- Vietnam's address schema reflects the 2025 administrative reform: `district` is optional, and the
  template drops it — along with its separator — when it is absent.
- `script: 'latin'` reorders address lines; it does not transliterate characters.
- The SRS illustrates a single `addressLine` field; this release ships `addressLine1` and
  `addressLine2`, with `street` as an alias of `addressLine1`.

[0.1.0]: https://github.com/nathanpixodeo/locale-format/releases/tag/v0.1.0
