import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * The package ships ESM, so every relative specifier has to carry its file
 * extension. `moduleResolution: "bundler"` makes TypeScript accept an
 * extensionless specifier, so nothing else in the toolchain catches the
 * omission until a consumer's Node runtime fails to resolve it.
 */
const RELATIVE_IMPORTS_NEED_EXTENSION = {
  selector:
    ':matches(ImportDeclaration, ImportExpression, ExportNamedDeclaration, ExportAllDeclaration) > Literal.source[value=/^[.][.]?[/]/][value!=/[.][cm]?js$/]',
  message: 'Relative import specifiers must end in .js — the published ESM resolves them literally.',
};

/**
 * A `.only` left behind silently drops every other test in the file while the
 * run still reports success, which is the one way this suite can go green
 * without having checked anything.
 */
const NO_FOCUSED_TESTS = {
  selector: "MemberExpression[object.name=/^(describe|it|test)$/][property.name='only']",
  message: '`.only` is a debugging aid: it skips the rest of the suite. Remove it.',
};

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      // Illustrative only: React is not a dependency of this package, so the
      // file can be neither resolved nor type-checked here.
      'examples/react/**',
    ],
  },

  /*
   * Plain ESM JavaScript. tsconfig.json deliberately excludes these paths, so
   * they are linted without type information.
   */
  {
    files: ['**/*.mjs', 'eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      eqeqeq: ['error', 'always'],
      // These files exist to write to stdout.
      'no-console': 'off',
    },
  },

  /*
   * TypeScript, linted with type information from tsconfig.json. `src`, `test`
   * and the two root configs are all inside its `include`, so the project
   * service resolves every file without a second tsconfig.
   */
  {
    files: ['src/**/*.ts', 'test/**/*.ts', '*.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-restricted-syntax': ['error', RELATIVE_IMPORTS_NEED_EXTENSION],

      // `verbatimModuleSyntax` emits every import that is not marked `type`, so
      // importing a type as a value produces a runtime import of a binding that
      // does not exist. Both rules turn that into a lint error instead of a
      // module-resolution failure in a consumer's bundler.
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',

      // Interpolating a number is safe and readable, so it is allowed; every
      // other relaxation the rule offers stays shut, because those are the ones
      // that leak "undefined", "true" or "[object Object]" into a formatted
      // string — exactly the failure this package exists to avoid.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: false,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],

      // Rest destructuring is how this package strips its own option keys
      // before handing the remainder to `Intl` (`const { country, locale,
      // ...intl } = options`). The stripped names are the intent, not an
      // oversight; TypeScript's own `noUnusedLocals` exempts them for the same
      // reason. Everything else the rule checks stays at its default.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],

      // Off: the public API is deliberately detachable — `export const
      // formatAddress = address.formatAddress` is the documented entry point,
      // and `test/registry.spec.ts` asserts destructured methods keep working.
      // Every implementation is a closure over its registry and `this` appears
      // nowhere in `src`, so the rule can only produce false positives here.
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  {
    files: ['src/**/*.ts'],
    rules: {
      'no-console': 'error',

      // A library's `.d.ts` is its contract: an inferred return type lets an
      // unrelated refactor widen or narrow the published surface silently.
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Off: the entry points guard their arguments (`input?.country ?? ''`,
      // `parts ?? {}`) because untyped JavaScript callers reach them too, and
      // the documented contract is that they never throw. The type system
      // rightly says those checks are unreachable; deleting them would change
      // runtime behaviour. Kept on for `test` and the build configs, where
      // every value really is typed.
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },

  {
    files: ['test/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', RELATIVE_IMPORTS_NEED_EXTENSION, NO_FOCUSED_TESTS],
    },
  },
);
