import type { CountryRegistry } from '../core/registry.js';
import { renderLine } from '../core/template.js';
import type {
  AddressFieldName,
  AddressFieldSchema,
  AddressFields,
  AddressInput,
  CountryCodeInput,
  CountrySpec,
  FormatOptions,
} from '../core/types.js';

/**
 * Interchangeable field names, so one form model works across countries: a
 * project that only collects `street` still renders correctly in a country whose
 * template asks for `addressLine1`, and `state`/`province`/`prefecture` are the
 * same administrative level under three different labels.
 */
const ALIASES: Partial<Record<AddressFieldName, readonly AddressFieldName[]>> = {
  addressLine1: ['street'],
  street: ['addressLine1'],
  state: ['province', 'prefecture'],
  province: ['state', 'prefecture'],
  prefecture: ['state', 'province'],
};

function normalizeFields(fields: AddressFields | undefined): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, raw] of Object.entries(fields ?? {})) {
    if (raw === null || raw === undefined) continue;
    const value = String(raw).trim();
    if (value) values[key] = value;
  }

  for (const [target, sources] of Object.entries(ALIASES)) {
    if (values[target] || !sources) continue;
    for (const source of sources) {
      const value = values[source];
      if (value) {
        values[target] = value;
        break;
      }
    }
  }

  return values;
}

const postalPatterns = new Map<string, RegExp | null>();

function compilePattern(pattern: string): RegExp | null {
  const cached = postalPatterns.get(pattern);
  if (cached !== undefined) return cached;

  let compiled: RegExp | null;
  try {
    compiled = new RegExp(pattern);
  } catch {
    compiled = null;
  }
  postalPatterns.set(pattern, compiled);
  return compiled;
}

/** Renders an address as one line per template, dropping lines that came out empty. */
export function formatAddressLinesWith(
  spec: CountrySpec,
  fields: AddressFields | undefined,
  options: FormatOptions = {},
): string[] {
  const templates =
    options.script === 'latin' && spec.addressFormatLatin
      ? spec.addressFormatLatin
      : spec.addressFormat;

  const values = normalizeFields(fields);
  const lines: string[] = [];

  for (const template of templates) {
    const line = renderLine(template, values);
    if (line) lines.push(line);
  }

  if (options.includeCountry) {
    const country = options.countryName ?? values['country'] ?? spec.name;
    if (country) lines.push(country);
  }

  return lines;
}

/** Joins the rendered lines. `single-line` is the default layout (FR-A3). */
export function formatAddressWith(
  spec: CountrySpec,
  fields: AddressFields | undefined,
  options: FormatOptions = {},
): string {
  const lines = formatAddressLinesWith(spec, fields, options);
  return options.layout === 'multi-line'
    ? lines.join('\n')
    : lines.join(options.separator ?? ', ');
}

/** The country's form fields, ordered, as copies the caller may mutate freely. */
export function getAddressFieldsOf(spec: CountrySpec): AddressFieldSchema[] {
  return spec.addressFields
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((field) => ({ ...field }));
}

/**
 * Validates a postal code against the country's pattern (FR-A4).
 *
 * Countries with no published pattern accept any non-empty value, so an
 * unsupported market never blocks a submission. A country that *does* have a
 * pattern rejects the empty string.
 */
export function validatePostalCodeWith(spec: CountrySpec, value: string): boolean {
  const rule = spec.postalCode;
  if (!rule) return true;

  const candidate = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!candidate) return false;

  const pattern = compilePattern(rule.pattern);
  return pattern ? pattern.test(candidate) : true;
}

export interface AddressApi {
  /** FR-A1: the full address as a display string. */
  formatAddress(input: AddressInput, options?: FormatOptions): string;
  /** FR-A3: the same address split into lines. */
  formatAddressLines(input: AddressInput, options?: FormatOptions): string[];
  /** FR-A2: the fields a form for this country should render. */
  getAddressFields(country: CountryCodeInput): AddressFieldSchema[];
  /** FR-A4: postal code validation. */
  validatePostalCode(country: CountryCodeInput, value: string): boolean;
}

/** Binds the address functions to a country registry. */
export function createAddressFormatter(registry: CountryRegistry): AddressApi {
  return {
    formatAddress: (input, options) =>
      formatAddressWith(registry.resolve(input?.country ?? ''), input?.fields, options),
    formatAddressLines: (input, options) =>
      formatAddressLinesWith(registry.resolve(input?.country ?? ''), input?.fields, options),
    getAddressFields: (country) => getAddressFieldsOf(registry.resolve(country)),
    validatePostalCode: (country, value) =>
      validatePostalCodeWith(registry.resolve(country), value),
  };
}
