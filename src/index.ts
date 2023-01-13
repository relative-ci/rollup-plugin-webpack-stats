import { Plugin } from 'rollup';

import { BundleTransformOptions, bundleToWebpackStats } from './transform';

export { bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

interface WebpackStatsOptions extends BundleTransformOptions {
  /**
   * JSON file output fileName
   * default: webpack-stats.json
   */
  fileName?: string;
}

export const webpackStats = (options: WebpackStatsOptions = {}): Plugin => ({
  name: NAME,
  generateBundle(_, bundle) {
    const output = bundleToWebpackStats(bundle, options);

    this.emitFile({
      type: 'asset',
      fileName: options?.fileName || 'webpack-stats.json',
      source: JSON.stringify(output),
    });
  },
});
