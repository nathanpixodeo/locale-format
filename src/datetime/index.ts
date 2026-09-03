import { getDateTimeFormat } from '../core/intl-cache.js';
import type { CountryRegistry } from '../core/registry.js';
import type { CountryCodeInput } from '../core/types.js';

export type DateInput = Date | number | string;

export interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  /** Supplies the locale when `locale` is not given. */
  country?: CountryCodeInput;
  /** BCP-47 locale. Takes precedence over `country`. */
  locale?: string;
}

/** Option keys that mean the caller has chosen the output shape themselves. */
const SHAPE_KEYS = [
  'dateStyle',
  'timeStyle',
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'fractionalSecondDigits',
  'dayPeriod',
  'timeZoneName',
] as const satisfies readonly (keyof Intl.DateTimeFormatOptions)[];

function hasExplicitShape(options: Intl.DateTimeFormatOptions): boolean {
  return SHAPE_KEYS.some((key) => options[key] !== undefined);
}

function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveLocale(
  registry: CountryRegistry,
  options: DateTimeFormatOptions,
): string | undefined {
  if (options.locale) return options.locale;
  if (options.country) return registry.get(options.country)?.defaultLocale;
  return undefined;
}

function toIntlOptions(options: DateTimeFormatOptions): Intl.DateTimeFormatOptions {
  const { country, locale, ...intl } = options;
  return intl;
}

export interface DateTimeApi {
  /** FR-D1: date only. Defaults to `dateStyle: 'medium'`. */
  formatDate(value: DateInput, options?: DateTimeFormatOptions): string;
  /** Time only. Defaults to `timeStyle: 'short'`. */
  formatTime(value: DateInput, options?: DateTimeFormatOptions): string;
  /** Date and time. Defaults to medium date plus short time. */
  formatDateTime(value: DateInput, options?: DateTimeFormatOptions): string;
}

export function createDateTimeFormatter(registry: CountryRegistry): DateTimeApi {
  function format(
    value: DateInput,
    options: DateTimeFormatOptions,
    defaults: Intl.DateTimeFormatOptions,
  ): string {
    const date = toDate(value);
    if (!date) return '';

    const intl = toIntlOptions(options);
    const shaped = hasExplicitShape(intl) ? intl : { ...defaults, ...intl };
    return getDateTimeFormat(resolveLocale(registry, options), shaped).format(date);
  }

  return {
    formatDate: (value, options = {}) => format(value, options, { dateStyle: 'medium' }),
    formatTime: (value, options = {}) => format(value, options, { timeStyle: 'short' }),
    formatDateTime: (value, options = {}) =>
      format(value, options, { dateStyle: 'medium', timeStyle: 'short' }),
  };
}
