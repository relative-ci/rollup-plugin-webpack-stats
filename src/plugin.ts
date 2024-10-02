import { Plugin, OutputOptions } from 'rollup';

import type { BundleTransformOptions } from './transform';
import { bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

interface WebpackStatsOptions extends BundleTransformOptions {
  /**
   * JSON file output fileName
   * default: webpack-stats.json
   */
  fileName?: string;
}

type WebpackStatsOptionsOrBuilder =
  | WebpackStatsOptions
  | ((outputOptions: OutputOptions) => WebpackStatsOptions);

export const webpackStats = (
  options: WebpackStatsOptionsOrBuilder = {}
): Plugin => ({
  name: NAME,
  generateBundle(outputOptions, bundle) {
    const resolvedOptions =
      typeof options === 'function' ? options(outputOptions) : options;

    const result = bundleToWebpackStats(bundle, resolvedOptions);

    this.emitFile({
      type: 'asset',
      fileName: resolvedOptions.fileName || 'webpack-stats.json',
      source: JSON.stringify(result),
    });
  },
});
