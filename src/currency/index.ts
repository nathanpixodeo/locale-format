import { getNumberFormat } from '../core/intl-cache.js';
import type { CountryRegistry } from '../core/registry.js';
import type { CountryCodeInput } from '../core/types.js';

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** Supplies the locale and, for currency, the currency code. */
  country?: CountryCodeInput;
  /** BCP-47 locale. Takes precedence over `country`. */
  locale?: string;
}

export type CurrencyFormatOptions = NumberFormatOptions;

/**
 * Locale precedence: explicit `locale`, then the country's default, then the
 * runtime default. An unrecognised country falls through to the runtime default
 * instead of being forced to English.
 */
function resolveLocale(
  registry: CountryRegistry,
  options: NumberFormatOptions,
): string | undefined {
  if (options.locale) return options.locale;
  if (options.country) return registry.get(options.country)?.defaultLocale;
  return undefined;
}

function toIntlOptions(options: NumberFormatOptions): Intl.NumberFormatOptions {
  const { country, locale, ...intl } = options;
  return intl;
}

export interface CurrencyApi {
  /** FR-C2: locale-aware thousands and decimal separators. */
  formatNumber(value: number, options?: NumberFormatOptions): string;
  /** FR-C1: currency amount with the locale's symbol placement. */
  formatCurrency(value: number, options?: CurrencyFormatOptions): string;
  /** ISO 4217 code for a country, `''` when unknown. */
  getCurrencyCode(country: CountryCodeInput): string;
}

export function createNumberFormatter(registry: CountryRegistry): CurrencyApi {
  return {
    formatNumber(value, options = {}) {
      if (!Number.isFinite(value)) return '';
      return getNumberFormat(resolveLocale(registry, options), toIntlOptions(options)).format(
        value,
      );
    },

    formatCurrency(value, options = {}) {
      if (!Number.isFinite(value)) return '';

      const currency =
        options.currency ||
        (options.country ? registry.get(options.country)?.currency : undefined) ||
        '';

      const intl = toIntlOptions(options);
      if (currency) {
        intl.style = 'currency';
        intl.currency = currency;
      } else {
        // No currency to attach: fall back to a plain number rather than
        // throwing inside Intl.
        intl.style = intl.style === 'currency' ? 'decimal' : (intl.style ?? 'decimal');
        delete intl.currency;
      }

      return getNumberFormat(resolveLocale(registry, options), intl).format(value);
    },

    getCurrencyCode: (country) => registry.resolve(country).currency,
  };
}
