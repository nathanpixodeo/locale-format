# Examples

## Node

```bash
npm install
npm run build
node examples/node/index.mjs
```

Prints address, phone, currency, date and name output for several countries, plus the form
metadata `getAddressFields` returns. It imports from `../../dist` so it runs straight from a
checkout; a real project imports `@nexkit/locale-format`.

## React

[`react/AddressForm.jsx`](react/AddressForm.jsx) is a country-aware address form. The country
selector drives `getAddressFields`, which decides which inputs to render, in what order, with what
labels, and which are required — there is no per-country branching in the component. It also shows
live postal code validation and a formatted preview.

Copy the file into a React 18+ app that has the package installed:

```bash
npm install @nexkit/locale-format react react-dom
```
