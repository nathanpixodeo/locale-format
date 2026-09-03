# Security policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |
| anything earlier | Nothing earlier was published |

The package is pre-1.0 and single-track. Fixes go into the next 0.1.x release; there are no
maintained backport branches.

## What the attack surface actually is

A generic policy would be worse than an accurate description of what this code does, so:

- **No network access.** Nothing is fetched, sent or reported anywhere.
- **No filesystem, child process or environment access.**
- **No `eval` and no `new Function`.** The only dynamic import is `loadCountry`, and its specifiers
  are written literally in a static map — a country code selects a loader, it is never interpolated
  into an import path.
- **One runtime dependency**, `libphonenumber-js`, imported only by the `/phone` module.
- **Every public function is total.** Bad input produces a documented fallback rather than an
  exception, so malformed input is not a crash vector. The contract is the "Behaviour on bad input"
  table in [`README.md`](README.md).
- **No credentials, no secrets, no persistent state.** Registries and the `Intl` cache are in-memory
  values for the life of the process.

This library formats strings for display. It does not escape or sanitise them, and it makes no
attempt to: a formatted address is whatever the caller put in the fields, joined by the country's
template. Escaping is the job of whatever renders the result. Passing `formatAddress` output to
`innerHTML` is an XSS bug in the application, exactly as it would be for any other string.

## The one class of issue worth reporting

Postal code validation compiles a per-country regular expression and runs it against the submitted
value, so catastrophic backtracking — ReDoS — is the plausible failure mode. The patterns shipped
today are anchored, bounded and free of nested quantifiers, and each source string is compiled once
and cached, but a future country's pattern could introduce one without anyone noticing. If you find
an input that makes `validatePostalCode` take superlinear time against a bundled pattern, that is a
report worth sending.

A pattern you supply yourself through `defineCountry` or `countries.register` is compiled and run
the same way. That regex is yours, and so is its cost.

Beyond that, a supply-chain issue in `libphonenumber-js` reaches this package too. Report those
upstream; if the fix needs a version bump here, open a normal issue.

## Reporting

Report privately, not in a public issue.

1. Preferred: GitHub's private vulnerability reporting —
   <https://github.com/nathanpixodeo/locale-format/security/advisories/new>
2. Fallback: nathanpixodeo@gmail.com

Include the package version, the runtime and its version, and the smallest input that reproduces the
problem.

## What to expect

This is a small package maintained by one person, so no service level is promised and there is no
bounty. Realistically: an acknowledgement within about a week, then an assessment of whether the
issue is exploitable in practice, and — if it is — a patch release on 0.1.x with the fix noted in
[`CHANGELOG.md`](CHANGELOG.md). You will be credited there unless you would rather not be.

Please leave a reasonable window before publishing details. Ninety days is the usual convention, and
less is fine once a fix has shipped. If a report goes unanswered for a month, treat that as the
window having expired rather than as a request for silence.
