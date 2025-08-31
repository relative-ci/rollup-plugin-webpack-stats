/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig } = require('rollup');
const webpackStatsPlugin = require('rollup-plugin-webpack-stats');

module.exports = defineConfig({
  input: 'src/index.js',
  output: {
    dir: 'dist',
  },
  plugins: [webpackStatsPlugin()],
});
