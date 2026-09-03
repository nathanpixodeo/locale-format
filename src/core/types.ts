/**
 * ISO 3166-1 alpha-2 country codes (officially assigned).
 *
 * Kept as a literal union so editors autocomplete country codes and typos are
 * caught at compile time (NFR-4). It is type-only and costs nothing at runtime.
 */
export type CountryCode =
  | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR'
  | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE'
  | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ'
  | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD'
  | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR'
  | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM'
  | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI'
  | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF'
  | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS'
  | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU'
  | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT'
  | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN'
  | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK'
  | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME'
  | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ'
  | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA'
  | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU'
  | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM'
  | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS'
  | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI'
  | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV'
  | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK'
  | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA'
  | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI'
  | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';

/**
 * A country code argument. Accepts any string so unsupported countries fall back
 * to the generic schema (NFR-5) while `CountryCode` still drives autocomplete.
 */
export type CountryCodeInput = CountryCode | (string & {});

/** Address field identifiers understood by the formatter. */
export type AddressFieldName =
  | 'recipient'
  | 'organization'
  | 'addressLine1'
  | 'addressLine2'
  | 'street'
  | 'sublocality'
  | 'ward'
  | 'district'
  | 'city'
  | 'state'
  | 'province'
  | 'prefecture'
  | 'postalCode'
  | 'country';

/** Metadata a project needs to render one input in an address form (FR-A2). */
export interface AddressFieldSchema {
  /** Field identifier, e.g. `postalCode`. */
  name: AddressFieldName;
  /** Default English label. Override it through your own i18n layer. */
  label: string;
  /** Whether the country's postal convention requires this field. */
  required: boolean;
  /** Display order within the form, ascending. */
  order: number;
  /** Anchored validation regex source, present for postal codes. */
  pattern?: string;
  /** Example value suitable for a placeholder attribute. */
  placeholder?: string;
}

/** Raw address values keyed by field name. Non-string values are coerced. */
export type AddressFields = Partial<
  Record<AddressFieldName, string | number | null | undefined>
>;

export interface AddressInput {
  country: CountryCodeInput;
  fields: AddressFields;
}

export type AddressLayout = 'single-line' | 'multi-line';

/**
 * `local` uses the country's native line order, `latin` uses the Latin-script
 * line order where one is defined (JP, KR, CN, TW).
 */
export type AddressScript = 'local' | 'latin';

export interface FormatOptions {
  /** Defaults to `single-line`. */
  layout?: AddressLayout;
  /** Joiner for `single-line`. Defaults to `', '`. */
  separator?: string;
  /** Defaults to `local`. */
  script?: AddressScript;
  /** Append the country name as a final line. */
  includeCountry?: boolean;
  /** Country name to append. Defaults to the spec's English name. */
  countryName?: string;
}

export type NameOrder = 'given-first' | 'family-first';

export interface PostalCodeSpec {
  /** Anchored regex source, e.g. `^\\d{3}-\\d{4}$`. */
  pattern: string;
  example: string;
}

/** Everything this library knows about one country. */
export interface CountrySpec {
  /** Uppercase ISO 3166-1 alpha-2 code. `ZZ` marks the generic fallback spec. */
  code: CountryCodeInput;
  /** English country name. Empty on the generic fallback. */
  name: string;
  /** BCP-47 locale used as the default for Intl-based formatting. */
  defaultLocale: string;
  /** Calling code including the leading plus, e.g. `+84`. */
  callingCode: string;
  /** ISO 4217 currency code. */
  currency: string;
  nameOrder: NameOrder;
  addressFields: AddressFieldSchema[];
  /**
   * One template per address line. `{field}` interpolates a value; `[...]`
   * marks an optional group that disappears when every field inside it is empty.
   */
  addressFormat: string[];
  /** Line templates for Latin-script rendering, where the order differs. */
  addressFormatLatin?: string[];
  postalCode?: PostalCodeSpec;
}
