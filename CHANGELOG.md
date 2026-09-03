# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-09-03

Repository, tooling and documentation only. No change to the public API, and no country's output
moves.

### Fixed

- **A raw U+0000 byte in `src/core/intl-cache.ts`.** The cache key joined its two halves with a NUL
  character typed straight into the template literal. One NUL in a file's first 8000 bytes makes Git
  classify it as binary, which `* text=auto` does not override, so the file had no reviewable diff,
  was skipped by `git grep`, and could not be merged textually. Published bundles were never
  affected — esbuild escaped the byte on the way into `dist` — so nothing changes for callers. Both
  this and an unescaped U+00A0 in `src/core/template.ts` are now written as escapes, leaving the
  emitted code and the runtime cache key byte-for-byte identical.
- Eight further findings from the new lint pass, none of them behavioural: a redundant assertion on
  a type guard, two pairs of dead `void` statements, an unnecessary assertion in a test, a template
  expression that could interpolate `undefined`, and two non-null assertions replaced by
  destructuring.

### Added

- **Linting** — ESLint with a flat, type-aware config over `typescript-eslint`, wired into
  `npm run verify` so the same gate covers local runs, CI and `prepublishOnly`. CI lints in its own
  job: the result cannot vary by Node version, and ESLint requires a newer Node than this package's
  own floor.
- **Node 18 in the CI matrix** — `engines.node` claims 18.17, so the floor is now tested rather than
  assumed. The matrix is 18, 20, 22 and 24.
- **Dependabot** — weekly npm and GitHub Actions updates. Development dependencies are grouped into
  one pull request; `libphonenumber-js` is always reviewed on its own, because its phone-numbering
  metadata is what validation depends on.
- **Release workflow** — publishes from a `v*` tag with `npm publish --provenance`, after running
  `npm run verify` and refusing to publish when the tag and `package.json` disagree on the version.
- **Issue and pull request templates** — including a dedicated country-data form that asks for the
  authoritative source up front.
- **`CONTRIBUTING.md`** — setup, the rule that a country-data change must cite the national postal
  operator or a government page, snapshot discipline, the size budgets, the ICU-dependence trap in
  tests, and the commit convention.
- **`SECURITY.md`** — the actual threat model (no network, no filesystem, no `eval`, one runtime
  dependency, total functions), ReDoS in postal patterns as the one class of issue worth reporting,
  and how to report privately.
- Version, CI and licence badges in `README.md`.

### Changed

- `README.md` records under "Known limitations" that `getAddressFields` returns English labels only,
  and that the way to translate them is to map each field's stable `name` to your own catalogue.
  This was already noted in `docs/adding-a-country.md`, but not where callers look for it.
- `docs/spec-traceability.md` restates NFR-8 against the documentation now in the repository. It
  stays Partial: there is still no Storybook and no hosted playground.

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

[Unreleased]: https://github.com/nathanpixodeo/locale-format/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/nathanpixodeo/locale-format/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/nathanpixodeo/locale-format/releases/tag/v0.1.0
