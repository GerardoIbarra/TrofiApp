const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// TanStack Query v5 / ESM compatibility
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts.push('mjs');

module.exports = config;
