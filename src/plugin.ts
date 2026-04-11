import type { OutputBundle } from 'rollup-plugin-stats';
import extractStats, { type StatsOptions } from 'rollup-plugin-stats/extract';

import { type BundleTransformOptions, bundleToWebpackStats } from './transform';
import { type StatsWrite, statsWrite } from './write';
import { formatFileSize, getByteSize, resolveFilepath } from './utils';

const PLUGIN_NAME = 'webpackStats';

/**
 * A subset of resolved output options provided to the `generateBundle` hook by Vite/Rolldown/Rollup,
 * containing only the fields this plugin uses to generate a stats file for a specific output.
 */
export type OutputOptions = {
  /** Output directory for the generated files. */
  dir?: string | undefined;

  /** Output format */
  format?:
    | 'es'
    | 'esm'
    | 'module'
    | 'cjs'
    | 'commonjs'
    | 'iife'
    | 'umd'
    | 'amd'
    | 'system'
    | 'systemjs'
    | undefined;
};

/**
 * Subset of the Vite/Rolldown/Rollup plugin hook context (`this`) used by this plugin.
 */
type PluginContext = {
  /** Log an informational message through Vite/Rolldown/Rollup's logging pipeline. */
  info: (message: string) => void;

  /** Log a warning through Vite/Rolldown/Rollup's logging pipeline without stopping the build. */
  warn: (message: string) => void;
};

/**
 * Minimum plugin interface compatible with Vite/Rolldown/Rollup.
 */
export type Plugin = {
  /** Unique identifier for the plugin, used in error messages and logs. */
  name: string;

  /**
   * Hook called after the bundle has been fully generated but before it is
   * written to disk. Receives the resolved output options and the complete
   * output bundle map.
   */
  generateBundle?: (
    this: PluginContext,
    outputOptions: OutputOptions,
    bundle: OutputBundle,
    isWrite: boolean
  ) => void | Promise<void>;
};

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
} & Omit<StatsOptions, 'source' | 'map'> &
  BundleTransformOptions;

type WebpackStatsOptionsOrBuilder =
  | WebpackStatsOptions
  | ((outputOptions: OutputOptions) => WebpackStatsOptions);

export const webpackStats = (
  options: WebpackStatsOptionsOrBuilder = {}
): Plugin => ({
  name: PLUGIN_NAME,
  async generateBundle(outputOptions, bundle) {
    const resolvedOptions =
      typeof options === 'function' ? options(outputOptions) : options;
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
      const res = await write(
        filepath,
        stats as unknown as Record<string, unknown>
      );
      const outputSize = getByteSize(res.content);

      this.info(
        `Stats saved to ${res.filepath} (${formatFileSize(outputSize)})`
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      // Log error, but do not throw to allow the compilation to continue
      this.warn(message);
    }
  },
});
