const path = require('path');
const { webpackStats } = require('rollup-plugin-webpack-stats');

module.exports = {
  input: path.join(__dirname, 'src/index.js'),
  output: {
    dir: path.join(__dirname, 'dist'),
  },
  plugins: [
    webpackStats(),
  ],
};
