const path = require('path');
const { webpackStats } = require('rollup-plugin-webpack-stats');

module.exports = [
  {
    input: path.join(__dirname, 'src/index.js'),
    output: {
      dir: 'dist',
    },
    plugins: [webpackStats()],
  },
  {
    input: path.join(__dirname, 'src/index.js'),
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
];
