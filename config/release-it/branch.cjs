const config = require('./common.cjs');

module.exports = {
  ...config,
  git: {
    ...config.git,
    // eslint-disable-next-line no-template-curly-in-string
    commitMessage: 'DROP - release ${version}'
  }
};
