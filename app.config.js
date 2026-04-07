const appJson = require('./app.json');

const baseConfig = appJson.expo;
const variant = process.env.APP_VARIANT ?? 'prod';
const isDevVariant = variant === 'dev';

function withSuffix(value, suffix) {
  return value ? `${value}${suffix}` : value;
}

module.exports = {
  ...baseConfig,
  name: isDevVariant ? `${baseConfig.name} Dev` : baseConfig.name,
  scheme: isDevVariant ? `${baseConfig.scheme}-dev` : baseConfig.scheme,
  ios: {
    ...baseConfig.ios,
    bundleIdentifier: isDevVariant
      ? withSuffix(baseConfig.ios?.bundleIdentifier, '.dev')
      : baseConfig.ios?.bundleIdentifier,
  },
  android: {
    ...baseConfig.android,
    package: isDevVariant
      ? withSuffix(baseConfig.android?.package, '.dev')
      : baseConfig.android?.package,
  },
};
