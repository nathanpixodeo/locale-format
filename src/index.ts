import { createAddressFormatter } from './address/index.js';
import { createRegistry, type CountryRegistry } from './core/registry.js';
import { createNumberFormatter } from './currency/index.js';
import { ALL_COUNTRIES } from './data/index.js';
import { createDateTimeFormatter } from './datetime/index.js';
import { createNameFormatter } from './name/index.js';

/**
 * The 22 bundled countries plus anything the host application registers.
 *
 * Built from a plain array rather than through import-time registration calls,
 * so the module has no side effects and bundlers can drop whatever an app never
 * references.
 */
export const countries: CountryRegistry = createRegistry(ALL_COUNTRIES);

const address = createAddressFormatter(countries);
const number = createNumberFormatter(countries);
const datetime = createDateTimeFormatter(countries);
const name = createNameFormatter(countries);

export const formatAddress = address.formatAddress;
export const formatAddressLines = address.formatAddressLines;
export const getAddressFields = address.getAddressFields;
export const validatePostalCode = address.validatePostalCode;

export const formatNumber = number.formatNumber;
export const formatCurrency = number.formatCurrency;
export const getCurrencyCode = number.getCurrencyCode;

export const formatDate = datetime.formatDate;
export const formatTime = datetime.formatTime;
export const formatDateTime = datetime.formatDateTime;

export const getNameOrder = name.getNameOrder;
export const formatName = name.formatName;

export {
  formatPhoneDisplay,
  getCallingCode,
  isValidPhone,
  parsePhone,
  toE164,
} from './phone/index.js';

export { defineCountry } from './core/define.js';
export { createRegistry, type CountryRegistry } from './core/registry.js';
export { genericCountrySpec } from './core/fallback.js';
export { clearIntlCache } from './core/intl-cache.js';
export {
  ALL_COUNTRIES,
  LAZY_COUNTRY_CODES,
  SUPPORTED_COUNTRY_CODES,
  loadCountry,
} from './data/index.js';

export type {
  AddressFieldName,
  AddressFieldSchema,
  AddressFields,
  AddressInput,
  AddressLayout,
  AddressScript,
  CountryCode,
  CountryCodeInput,
  CountrySpec,
  FormatOptions,
  NameOrder,
  PostalCodeSpec,
} from './core/types.js';

export type { AddressApi } from './address/index.js';
export type { CurrencyApi, CurrencyFormatOptions, NumberFormatOptions } from './currency/index.js';
export type { DateInput, DateTimeApi, DateTimeFormatOptions } from './datetime/index.js';
export type { NameApi, NameFormatOptions, NameParts } from './name/index.js';
export type { PhoneFormat, PhoneInfo, PhoneOptions } from './phone/index.js';
