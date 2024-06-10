import { Plugin, OutputOptions } from 'rollup';

import type { ExcludeFilepathOption } from './types';
import { BundleTransformOptions, bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

interface WebpackStatsOptions extends BundleTransformOptions {
  /**
   * JSON file output fileName
   * default: webpack-stats.json
   */
  fileName?: string;
  /**
   * Exclude matching assets
   */
  excludeAssets?: ExcludeFilepathOption;
  /**
   * Exclude matching modules
   */
  excludeModules?: ExcludeFilepathOption;
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
    const output = bundleToWebpackStats(bundle, resolvedOptions);

    this.emitFile({
      type: 'asset',
      fileName: resolvedOptions.fileName || 'webpack-stats.json',
      source: JSON.stringify(output),
    });
  },
});
