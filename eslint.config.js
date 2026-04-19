// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Hexagonal-lite layer import direction (see architecture.md).
// components/ → src/hooks/ → src/domain/ ← src/infrastructure/ (one-way)

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  // Layer: components/ and app/ — cannot import src/infrastructure/
  //   app/ composes providers only; it must go through src/providers/ for the adapter seam.
  {
    files: ['components/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: ['**/src/infrastructure/**'],
      }],
    },
  },
  // Layer: src/hooks/ — cannot import components/ or src/infrastructure/
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: ['**/components/**', '**/src/infrastructure/**'],
      }],
    },
  },
  // Layer: src/domain/ — pure; no RN, no infra, no hooks, no components
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          'react-native',
          'react-native/**',
          '**/src/infrastructure/**',
          '**/src/hooks/**',
          '**/components/**',
        ],
      }],
    },
  },
]);
