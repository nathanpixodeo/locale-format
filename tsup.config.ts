import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/address/index.ts',
    'src/phone/index.ts',
    'src/currency/index.ts',
    'src/datetime/index.ts',
    'src/name/index.ts',
    'src/data/index.ts',
    'src/data/countries/*.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  target: 'es2022',
  // `neutral` keeps the output free of Node- or browser-specific assumptions so the
  // same build runs in SSR and in the browser (NFR-3).
  platform: 'neutral',
  // libphonenumber-js stays external: only consumers that import `/phone` pay for it.
  external: ['libphonenumber-js'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  esbuildOptions(options) {
    // Keeps the shared chunks out of the package root, where they would sit
    // next to the public entry points and read like part of the API.
    options.chunkNames = 'chunks/[name]-[hash]';
  },
});
