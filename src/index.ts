import { Plugin } from 'rollup';

import { BundleTransformOptions, bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

interface WebpackStatsOptions extends BundleTransformOptions {}

export const webpackStats = (options: WebpackStatsOptions): Plugin => ({
  name: NAME,
  generateBundle(_, bundle) {
    const output = bundleToWebpackStats(bundle, options);

    this.emitFile({
      type: 'asset',
      fileName: 'webpack-stats.json',
      source: JSON.stringify(output),
    });
  },
});
