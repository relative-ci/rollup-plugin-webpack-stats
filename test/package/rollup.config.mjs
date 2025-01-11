import { defineConfig } from 'rollup';
import webpackStats from 'rollup-plugin-webpack-stats';

export default defineConfig([
  {
    input: './src/index.js',
    output: {
      dir: 'dist',
    },
    plugins: [webpackStats()],
  },
  {
    input: './src/index.js',
    output: {
      dir: 'dist2',
    },
    plugins: [
      // A contrived demo to show that options can access outputOptions
      webpackStats((outputOptions) => {
        return {
          fileName: `stats-${outputOptions.dir}.json`,
        };
      }),
    ],
  },
]);
