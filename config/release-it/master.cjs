const config = require('./common.cjs');

module.exports = {
  ...config,
  git: {
    ...config.git,
    // eslint-disable-next-line no-template-curly-in-string
    commitMessage: ':package: release ${version}'
  },
  github: {
    ...config.github,
    release: true
  },
  plugins: {
    ...config.plugins,
    '@release-it/conventional-changelog': {
      preset: 'angular'
    }
  }
};
