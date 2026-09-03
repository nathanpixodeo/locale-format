import { describe, expect, it } from 'vitest';
import { formatAddressWith, getAddressFieldsOf, validatePostalCodeWith } from '../src/address/index.js';
import { ALL_COUNTRIES, LAZY_COUNTRY_CODES, SUPPORTED_COUNTRY_CODES, loadCountry } from '../src/data/index.js';
import { countries, getCallingCode } from '../src/index.js';

const EXPECTED_COUNTRY_COUNT = 22;

/** Sample values for every field name, so each template renders in full. */
const SAMPLE: Record<string, string> = {
  recipient: 'Recipient',
  organization: 'Organization',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2',
  street: 'Street',
  sublocality: 'Sublocality',
  ward: 'Ward',
  district: 'District',
  city: 'City',
  state: 'State',
  province: 'Province',
  prefecture: 'Prefecture',
  country: 'Country',
};

function sampleFields(spec: (typeof ALL_COUNTRIES)[number]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const field of spec.addressFields) {
    fields[field.name] =
      field.name === 'postalCode'
        ? (spec.postalCode?.example ?? '00000')
        : (SAMPLE[field.name] ?? field.name);
  }
  return fields;
}

describe('bundled country data', () => {
  it('ships the agreed country set', () => {
    expect(ALL_COUNTRIES).toHaveLength(EXPECTED_COUNTRY_COUNT);
    expect(SUPPORTED_COUNTRY_CODES).toHaveLength(EXPECTED_COUNTRY_COUNT);
    expect(countries.codes()).toHaveLength(EXPECTED_COUNTRY_COUNT);
    expect(LAZY_COUNTRY_CODES).toEqual([...SUPPORTED_COUNTRY_CODES].sort());
  });

  it('has no duplicate codes', () => {
    expect(new Set(SUPPORTED_COUNTRY_CODES).size).toBe(EXPECTED_COUNTRY_COUNT);
  });

  it.each(ALL_COUNTRIES.map((spec) => [spec.code, spec] as const))(
    '%s is internally consistent',
    (code, spec) => {
      expect(code).toMatch(/^[A-Z]{2}$/);
      expect(spec.name).not.toBe('');
      expect(spec.defaultLocale).toMatch(/^[a-z]{2}(-[A-Za-z]{2,4})*$/);
      expect(spec.currency).toMatch(/^[A-Z]{3}$/);
      expect(spec.callingCode).toBe(getCallingCode(code));
      expect(spec.addressFields.length).toBeGreaterThan(0);
      expect(spec.addressFormat.length).toBeGreaterThan(0);

      // Every field the templates reference must exist in the form schema, or a
      // form built from the schema could never fill the address in.
      const declared = new Set(spec.addressFields.map((field) => field.name));
      const templates = [...spec.addressFormat, ...(spec.addressFormatLatin ?? [])];
      for (const token of templates.join(' ').matchAll(/\{([A-Za-z0-9_]+)\}/g)) {
        expect(declared, `${code} template references ${token[0]}`).toContain(token[1]);
      }

      // Field order must be unique so forms render deterministically.
      const orders = spec.addressFields.map((field) => field.order);
      expect(new Set(orders).size).toBe(orders.length);

      if (spec.postalCode) {
        const { pattern, example } = spec.postalCode;
        expect(() => new RegExp(pattern)).not.toThrow();
        expect(validatePostalCodeWith(spec, example)).toBe(true);
        const postalField = spec.addressFields.find((field) => field.name === 'postalCode');
        expect(postalField?.pattern).toBe(pattern);
      }
    },
  );

  it.each(ALL_COUNTRIES.map((spec) => [spec.code, spec] as const))(
    '%s renders every declared field',
    (_code, spec) => {
      const rendered = formatAddressWith(spec, sampleFields(spec), { layout: 'multi-line' });
      expect(rendered).not.toBe('');
      expect(rendered).not.toMatch(/[{}[\]]/);
      expect(rendered).not.toMatch(/,\s*,/);
      expect(rendered.split('\n').every((line) => line === line.trim())).toBe(true);
    },
  );

  it('matches the recorded address snapshots', () => {
    const snapshot: Record<string, string[]> = {};
    for (const spec of ALL_COUNTRIES) {
      const fields = sampleFields(spec);
      snapshot[String(spec.code)] = [
        formatAddressWith(spec, fields),
        formatAddressWith(spec, fields, { script: 'latin' }),
      ];
    }
    expect(snapshot).toMatchSnapshot();
  });

  it('matches the recorded form schemas', () => {
    const snapshot: Record<string, unknown> = {};
    for (const spec of ALL_COUNTRIES) snapshot[String(spec.code)] = getAddressFieldsOf(spec);
    expect(snapshot).toMatchSnapshot();
  });
});

describe('loadCountry (NFR-2)', () => {
  it('loads a spec on demand', async () => {
    const spec = await loadCountry('VN');
    expect(spec?.code).toBe('VN');
    expect(spec).toBe(countries.get('VN'));
  });

  it('normalises the code', async () => {
    expect((await loadCountry(' jp '))?.code).toBe('JP');
  });

  it('resolves to undefined for unknown or invalid codes', async () => {
    expect(await loadCountry('XX')).toBeUndefined();
    expect(await loadCountry('')).toBeUndefined();
    expect(await loadCountry(undefined as unknown as string)).toBeUndefined();
  });

  it('can load every advertised code', async () => {
    const loaded = await Promise.all(LAZY_COUNTRY_CODES.map((code) => loadCountry(code)));
    expect(loaded.map((spec) => spec?.code)).toEqual([...LAZY_COUNTRY_CODES]);
  });
});
