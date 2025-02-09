import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: 'module',
                ecmaVersion: 'latest',
            },
            globals: globals.node,
        },
        rules: {
            'eol-last': ['error', 'always'], // Ensure every file has an extra newline at the end
            'quotes': ['error', 'single'], // Enforce single quotes
            'comma-dangle': ['error', 'always-multiline'], // Enforce trailing commas
            'semi': ['error', 'always'], // Enforce semicolons
            'indent': ['error', 4], // Enforce 4 spaces indentation
            'keyword-spacing': ['error', { before: true, after: true }], // Enforce spaces around keywords
            'space-before-blocks': ['error', 'always'], // Enforce spaces before blocks
            'no-multi-spaces': ['error'], // Disallow multiple spaces
            'no-unused-vars': ['warn'], // Warn on unused variables
            'eqeqeq': ['error', 'always'], // Enforce strict equality
            'no-implicit-coercion': ['error'], // Disallow implicit coercion
            'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }], // Strictly disallow consecutive empty lines
            'prefer-const': ['error'], // Prefer const over let
            '@typescript-eslint/no-unused-vars': ['warn'], // Warn on unused variables
            '@typescript-eslint/explicit-function-return-type': ['error'], // Enforce explicit return types
        },
        ignores: ['node_modules', 'dist'],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
