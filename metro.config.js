const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TanStack Query v5 / ESM compatibility
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts.push('mjs');

// Fix Hermes bytecode compilation for private class fields (#x, #y etc.)
config.transformer.unstable_transformProfile = 'hermes-stable';

module.exports = config;
