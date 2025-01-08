import { Plugin, OutputOptions } from 'rollup';
import extractStats, { type StatsOptions } from 'rollup-plugin-stats/extract';

import type { BundleTransformOptions } from './transform';
import { bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

type WebpackStatsOptions = {
  /**
   * JSON file output fileName
   * default: webpack-stats.json
   */
  fileName?: string;
} & StatsOptions & BundleTransformOptions;

type WebpackStatsOptionsOrBuilder =
  | WebpackStatsOptions
  | ((outputOptions: OutputOptions) => WebpackStatsOptions);

export const webpackStats = (
  options: WebpackStatsOptionsOrBuilder = {}
): Plugin => ({
  name: NAME,
  generateBundle(outputOptions, bundle) {
    const resolvedOptions = typeof options === 'function' ? options(outputOptions) : options;
    const { excludeAssets, excludeModules, source, ...transformOptions } = resolvedOptions;

    const rollupStats = extractStats(bundle, { excludeAssets, excludeModules, source });

    const result = bundleToWebpackStats(rollupStats, transformOptions);

    this.emitFile({
      type: 'asset',
      fileName: resolvedOptions.fileName || 'webpack-stats.json',
      source: JSON.stringify(result),
    });
  },
});
