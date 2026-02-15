import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
const configs = [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: ['**/dist/'],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];

export default configs;
