// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'lib/escrow-program.ts',
      'src/components/ui_OLD_BACKUP/**',
      'src/infrastructure/mesh/MeshManager.ts',
    ],
  },
]);
