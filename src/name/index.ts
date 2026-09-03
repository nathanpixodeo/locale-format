import type { CountryRegistry } from '../core/registry.js';
import type { CountryCodeInput, NameOrder } from '../core/types.js';

export interface NameParts {
  given?: string | null | undefined;
  middle?: string | null | undefined;
  family?: string | null | undefined;
}

export interface NameFormatOptions {
  country?: CountryCodeInput;
  /** Overrides the country's convention. */
  order?: NameOrder;
  /** Joiner between parts. Defaults to a single space. */
  separator?: string;
}

export interface NameApi {
  /** FR-N1: whether the family name comes first in this country. */
  getNameOrder(country: CountryCodeInput): NameOrder;
  /** Assembles a display name in the country's order. */
  formatName(parts: NameParts, options?: NameFormatOptions): string;
}

export function createNameFormatter(registry: CountryRegistry): NameApi {
  return {
    getNameOrder: (country) => registry.resolve(country).nameOrder,

    formatName(parts, options = {}) {
      const order =
        options.order ??
        (options.country ? registry.resolve(options.country).nameOrder : 'given-first');

      const { given, middle, family } = parts ?? {};
      const ordered =
        order === 'family-first' ? [family, middle, given] : [given, middle, family];

      return ordered
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join(options.separator ?? ' ');
    },
  };
}
