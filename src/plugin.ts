import extractStats, { type StatsOptions } from 'rollup-plugin-stats/extract';

import type { Plugin, OutputOptions } from './types';
import { type BundleTransformOptions, bundleToWebpackStats } from './transform';
import { type StatsWrite, statsWrite } from './write';
import { formatFileSize, getByteSize, resolveFilepath } from './utils';

const PLUGIN_NAME = 'webpackStats';

type WebpackStatsOptions = {
  /**
   * JSON file output fileName
   * default: webpack-stats.json
   */
  fileName?: string;
  /**
   * Custom file writer
   * @default - fs.write(FILENAME, JSON.stringify(STATS, null, 2));
   */
  write?: StatsWrite;
} & Omit<StatsOptions, "source" | "map"> & BundleTransformOptions;

type WebpackStatsOptionsOrBuilder =
  | WebpackStatsOptions
  | ((outputOptions: OutputOptions) => WebpackStatsOptions);

export const webpackStats = (
  options: WebpackStatsOptionsOrBuilder = {}
): Plugin => ({
  name: PLUGIN_NAME,
  async generateBundle(outputOptions, bundle) {
    const resolvedOptions = typeof options === 'function' ? options(outputOptions) : options;
    const { 
      fileName,
      excludeAssets,
      excludeModules,
      write = statsWrite,
      ...transformOptions
    } = resolvedOptions;

    const rollupStats = extractStats(bundle, {
      excludeAssets,
      excludeModules,
      // Extract stats source to compute size
      source: true,
    });
    const stats = bundleToWebpackStats(rollupStats, transformOptions);
    const filepath = resolveFilepath(fileName, outputOptions.dir);

    try {
      const res = await write(filepath, stats as unknown as Record<string, unknown>);
      const outputSize = getByteSize(res.content);

      this.info(`Stats saved to ${res.filepath} (${formatFileSize(outputSize)})`);
    } catch (error: any) { // eslint-disable-line
      // Log error, but do not throw to allow the compilation to continue
      this.warn(error);
    }
  },
});
