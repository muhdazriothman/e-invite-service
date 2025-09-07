// @ts-check
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import importNewlinesPlugin from 'eslint-plugin-import-newlines';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', 'dist/**', 'jest.config.js'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        plugins: {
            import: importPlugin,
            'import-newlines': importNewlinesPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: 'commonjs',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',

            // Import organization rules
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
            'import/newline-after-import': 'error',
            'import/no-duplicates': 'error',
            'import-newlines/enforce': [
                'error',
                {
                    items: 1,
                    maxLen: 100,
                    semi: true,
                },
            ],

            // Code formatting rules (replacing Prettier)
            'quotes': ['error', 'single'],
            'comma-dangle': ['error', 'always-multiline'],
            'semi': ['error', 'always'],
            'indent': ['error', 4],
            'no-trailing-spaces': 'error',
            'eol-last': 'error',
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'comma-spacing': ['error', { before: false, after: true }],
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', 'never'],
            'space-in-parens': ['error', 'never'],
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'spaced-comment': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
            'max-len': ['error', { code: 150, ignoreUrls: true, ignoreStrings: true }],
        },
    },
    {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/test/**/*.ts'],
        rules: {
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
);