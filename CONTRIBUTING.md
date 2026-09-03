# Contributing

Bug reports, country data corrections and pull requests are all welcome. This file covers what the
project expects from a change. The reasoning behind the design is in [`README.md`](README.md) and
[`docs/spec-traceability.md`](docs/spec-traceability.md).

## Setup

```bash
npm ci
npm run verify
```

`npm ci` rather than `npm install`: the lockfile is committed and CI installs from it, so a
dependency resolving to a different version locally is a problem to investigate, not a convenience.

`npm run verify` is the single gate: the typecheck, the test suite with its coverage thresholds, the
build and the bundle-size budgets, in one command, which `prepublishOnly` runs again before a
publish. Steps get added to that chain over time, so run `verify` rather than a hand-picked subset,
and read `package.json` if you need to know exactly what it covers today.

While iterating, the pieces are available individually: `npm run typecheck`, `npm test`,
`npm run test:watch`, `npm run test:coverage`, `npm run build` and `npm run check-size`.

Develop on Node 20 or newer. `engines.node` says 18.17, and that is a real promise to consumers, but
it applies to the published package rather than to the toolchain — vitest needs Node 20.12 for
`styleText`, so the test suite cannot run on 18 at all. CI covers both halves: `verify` runs the full
chain on Node 20, 22 and 24, and `node18-artifact` builds and packs on Node 22, then installs that
tarball on exactly 18.17.0 and runs `scripts/smoke.mjs` against it. That smoke test is what keeps the
floor honest, so a change to the exports map, to either module format, or to the lazy-loading chunks
should be reflected there — nothing else exercises the published artifact as a consumer would.

## Changing country data

This is the most likely contribution, and the one the code cannot check for you.

Read [`docs/adding-a-country.md`](docs/adding-a-country.md) first. It covers the file layout, the
shared field identifiers, the address template syntax, and every place a new country has to be
registered.

**A change to per-country data must cite an authoritative source in the pull request: the national
postal operator, or a government page that defines the rule.** For the fields that are not postal —
the currency code, the calling code — cite the body that publishes them instead, ISO 4217 or
ITU-T E.164. A line order, a required field or a postal code pattern cannot be verified by reading
the code, and a reviewer has no way to check it against anything else. The citation is the review.
A change that arrives without one will be asked for one before anything else is discussed. Having
lived in a country or received post there is useful context, but it is not a source, and neither is
another formatting library — they are as likely to be wrong as we are.

If the rule changed on a date — as Vietnam's district tier did in 2025 — say what the date was and
what happens to records written under the old rule. Existing data has to keep rendering.

`test/countries.spec.ts` checks that a spec is internally consistent: the code shape, a calling code
that agrees with `libphonenumber-js`, unique field order, a postal pattern that compiles and matches
its own example, and every template token backed by a declared field. It cannot check that the rule
is true. That is what the citation is for.

## Snapshots

`test/countries.spec.ts` snapshots the rendered address and the form schema for all 22 countries
into `test/__snapshots__/countries.spec.ts.snap`.

Do not run `npm test -- -u` to make a failing snapshot go away. A changed snapshot means changed
output for every application already using that country, which is the whole point of recording it.
Read the diff first and decide whether the new output is the correct one. If it is, update the
snapshot and explain the change in the pull request. If you cannot account for the diff line by
line, the change is not ready.

## Tests

`Intl` output depends on the runtime's ICU data, so a test that asserts exact ICU-produced text —
a thousands separator, a month name, a currency symbol's position, the difference between a space
and a non-breaking space — passes on one Node build and fails on another. Assert what the library
actually controls instead: that the digits are present, that a value round-trips, that a function
falls back rather than throwing. `test/currency.spec.ts` has a `digits()` helper for exactly this,
and `test/datetime.spec.ts` pins `timeZone: 'UTC'` so results do not drift by machine. Pin the time
zone in any new date test.

The suite does still carry a few exact-output assertions for the most stable cases. Those are a
liability that has not bitten yet, not a pattern to copy; a new one will be sent back for the
ICU-independent form.

Coverage thresholds are enforced by `npm run test:coverage`, not suggested. Country data files are
declarative tables covered by the snapshot suite; the thresholds target the logic.

## Size budgets

[`scripts/check-size.mjs`](scripts/check-size.mjs) is a hard gate, not advice. `core` plus `address`
must stay under 5KB gzip — around 2.5KB today — and every other module under 10KB, measured on the
built ESM output including the chunks each entry pulls in.

If a change pushes an entry over its budget, the budget does not move. Either the change gets
smaller, or it belongs behind a subpath a consumer opts into. A new runtime dependency needs to be
argued for before it is written; there is currently one, and it is reached only through `/phone`.

## Commits and pull requests

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
feat(data): add New Zealand
fix(address): drop the separator when the state is absent
docs: record the label i18n limitation
```

Use `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci` or `chore`. A breaking change
takes a `!` after the type and a `BREAKING CHANGE:` footer saying what a consumer has to change.

Commits must not carry `Co-Authored-By` trailers.

A pull request should say what changed and why, cite a source for any data change, and call out any
snapshot diff. Add a `CHANGELOG.md` entry under `## [Unreleased]` for anything a consumer would
notice; an internal refactor that changes no output does not need one.

## Reporting a vulnerability

See [`SECURITY.md`](SECURITY.md). Do not open a public issue for a security report.
