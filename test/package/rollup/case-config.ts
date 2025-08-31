import { defineConfig } from 'rollup';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default defineConfig({
  input: 'src/index.js',
  output: {
    dir: 'dist',
  },
  plugins: [webpackStatsPlugin({})],
});
