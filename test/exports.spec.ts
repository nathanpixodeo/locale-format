import { describe, expect, it } from 'vitest';
import * as root from '../src/index.js';
import * as core from '../src/core/index.js';
import * as address from '../src/address/index.js';
import * as phone from '../src/phone/index.js';
import * as currency from '../src/currency/index.js';
import * as datetime from '../src/datetime/index.js';
import * as name from '../src/name/index.js';
import * as data from '../src/data/index.js';

/** The API the README documents. Removing one of these is a breaking change. */
const ROOT_API = [
  'ALL_COUNTRIES',
  'LAZY_COUNTRY_CODES',
  'SUPPORTED_COUNTRY_CODES',
  'clearIntlCache',
  'countries',
  'createRegistry',
  'defineCountry',
  'formatAddress',
  'formatAddressLines',
  'formatCurrency',
  'formatDate',
  'formatDateTime',
  'formatName',
  'formatNumber',
  'formatPhoneDisplay',
  'formatTime',
  'genericCountrySpec',
  'getAddressFields',
  'getCallingCode',
  'getCurrencyCode',
  'getNameOrder',
  'loadCountry',
  'isValidPhone',
  'parsePhone',
  'toE164',
  'validatePostalCode',
] as const;

describe('public entry points', () => {
  it('exports the documented root API', () => {
    expect(Object.keys(root).sort()).toEqual([...ROOT_API].sort());
    for (const key of ROOT_API) expect(root[key]).toBeDefined();
  });

  it('exports the core building blocks', () => {
    expect(Object.keys(core).sort()).toEqual([
      'clearIntlCache',
      'createRegistry',
      'defineCountry',
      'genericCountrySpec',
      'getDateTimeFormat',
      'getNumberFormat',
      'renderLine',
    ]);
  });

  it('exports each module factory', () => {
    expect(address.createAddressFormatter).toBeTypeOf('function');
    expect(currency.createNumberFormatter).toBeTypeOf('function');
    expect(datetime.createDateTimeFormatter).toBeTypeOf('function');
    expect(name.createNameFormatter).toBeTypeOf('function');
    expect(phone.parsePhone).toBeTypeOf('function');
  });

  it('exports every bundled country by code', () => {
    for (const spec of data.ALL_COUNTRIES) {
      expect(data[String(spec.code) as keyof typeof data]).toBe(spec);
    }
  });
});
