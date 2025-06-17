import nextPlugin from '@next/eslint-plugin-next'
import reactCompilerPlugin from 'eslint-plugin-react-compiler'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactPlugin from 'eslint-plugin-react'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import globals from 'globals'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.next/',
      'src/types/',
    ]
  },

  // Base recommended ESLint rules
  js.configs.recommended,

  { ...reactPlugin.configs.flat.recommended, settings: { react: { version: 'detect' } } },
  reactCompilerPlugin.configs.recommended,

  // Global variables
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,

        // Custom global types here
        ImageItem: 'readonly',
        SearchParams: 'readonly',
      }
    }
  },

  // Configuration for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json',
        // Make sure to include all type definition files
        tsconfigRootDir: __dirname
      }
    },
  },

  // Next.js configuration
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      // Next.js core-web-vitals rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-unwanted-polyfillio': 'warn'
    }
  },

  // Your custom configuration
  {
    // Add plugins
    plugins: {
      // 'react-compiler': reactCompilerPlugin,
      'react-hooks': reactHooksPlugin,
      'react': reactPlugin,
      'jsx-a11y': jsxA11yPlugin
    },

    // Apply to all TypeScript and JavaScript files
    files: ['**/*.{ts,tsx,js,jsx}'],

    // Your custom rules
    rules: {
      'semi': ['error', 'never'],
      'brace-style': ['error', '1tbs'],
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx', '.ts'] }],
      'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
      'curly': 'error',
      'linebreak-style': 'off',
      'no-underscore-dangle': 'off',
      'no-restricted-syntax': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'max-len': 'off',
      'indent': 'off',
      'import/prefer-default-export': 'off',
      'no-await-in-loop': 'off',
      'comma-dangle': 'off',
      'implicit-arrow-linebreak': 'off',
      'func-names': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'no-param-reassign': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/display-name': 'off',
      'no-nested-ternary': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'object-curly-newline': 'off',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'react/prop-types': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'jsx-quotes': ['error', 'prefer-double'],
      'no-multiple-empty-lines': 'error',
      'no-multi-spaces': 'error',
      'padded-blocks': ['error', 'never'],
      'no-irregular-whitespace': 'error',
      'react-compiler/react-compiler': 'error',
    }
  }
]
