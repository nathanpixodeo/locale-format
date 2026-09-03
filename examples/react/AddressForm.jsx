/**
 * React example: a country-aware address form.
 *
 * `getAddressFields` drives which inputs exist, in which order, with which labels
 * and which are required — so switching the country selector rebuilds the form
 * without a single per-country branch in this component.
 *
 * Drop this file into a React 18+ app that has @nexkit/locale-format installed.
 */
import { useMemo, useState } from 'react';
import {
  countries,
  formatAddressLines,
  getAddressFields,
  validatePostalCode,
} from '@nexkit/locale-format';

const COUNTRY_CODES = countries.codes();

export default function AddressForm() {
  const [country, setCountry] = useState('VN');
  const [values, setValues] = useState({});

  const fields = useMemo(() => getAddressFields(country), [country]);
  const preview = useMemo(
    () => formatAddressLines({ country, fields: values }),
    [country, values],
  );

  const postalCode = values.postalCode ?? '';
  const postalCodeInvalid = postalCode !== '' && !validatePostalCode(country, postalCode);

  const missingRequired = fields
    .filter((field) => field.required && !(values[field.name] ?? '').trim())
    .map((field) => field.label);

  function handleCountryChange(event) {
    setCountry(event.target.value);
    // Field names differ between countries; clearing avoids carrying a value
    // into a form where its field no longer exists.
    setValues({});
  }

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <label>
        Country
        <select value={country} onChange={handleCountryChange}>
          {COUNTRY_CODES.map((code) => (
            <option key={code} value={code}>
              {countries.resolve(code).name}
            </option>
          ))}
        </select>
      </label>

      {fields.map((field) => {
        const invalid = field.name === 'postalCode' && postalCodeInvalid;
        return (
          <label key={field.name}>
            {field.label}
            {field.required ? ' *' : ''}
            <input
              name={field.name}
              value={values[field.name] ?? ''}
              placeholder={field.placeholder ?? ''}
              aria-required={field.required}
              aria-invalid={invalid || undefined}
              onChange={(event) => handleChange(field.name, event.target.value)}
            />
            {invalid ? <span role="alert">Does not match this country&apos;s postal code format</span> : null}
          </label>
        );
      })}

      <section>
        <h3>Preview</h3>
        <address>
          {preview.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </address>
      </section>

      <button type="submit" disabled={missingRequired.length > 0 || postalCodeInvalid}>
        Save
      </button>

      {missingRequired.length > 0 ? <p>Still required: {missingRequired.join(', ')}</p> : null}
    </form>
  );
}
