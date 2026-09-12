// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      react: {
        version: '19.2.3',
      },
    },
    ignores: ['dist/*', '.expo/*'],
  },
]);
