// Needed for firebase
// See here: https://docs.expo.dev/guides/using-firebase/#configure-metro

const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('cjs');

module.exports = defaultConfig;