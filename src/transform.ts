import path from 'path';
import type { OutputBundle } from 'rollup';

import type { ExcludeFilepathOption } from './utils';
import { checkExcludeFilepath, getByteSize, getChunkId } from "./utils";

// https://github.com/relative-ci/bundle-stats/blob/master/packages/plugin-webpack-filter/src/index.ts
export type WebpackStatsFilteredAsset = {
  name: string;
  size?: number;
};

export interface WebpackStatsFilteredChunk {
  id: number | string;
  entry: boolean;
  initial: boolean;
  files?: Array<string>;
  names?: Array<string>;
}

export interface WebpackStatsFilteredModule {
  name: string;
  size?: number;
  chunks: Array<string | number>;
}

export interface WebpackStatsFilteredConcatenatedModule {
  name: string;
  size?: number;
}

export interface WebpackStatsFilteredRootModule
  extends WebpackStatsFilteredModule {
  modules?: Array<WebpackStatsFilteredConcatenatedModule>;
}

export interface WebpackStatsFiltered {
  builtAt?: number;
  hash?: string;
  assets?: Array<WebpackStatsFilteredAsset>;
  chunks?: Array<WebpackStatsFilteredChunk>;
  modules?: Array<WebpackStatsFilteredRootModule>;
}

export type TransformCallback = (data: WebpackStatsFiltered) => WebpackStatsFiltered; 

const defaultTransform: TransformCallback = (data) => {
  return data;
};

export type BundleTransformOptions = {
  /**
   * Extract module original size or rendered size
   * default: false
   */
  moduleOriginalSize?: boolean;
  /**
   * Exclude matching assets
   */
  excludeAssets?: ExcludeFilepathOption;
  /**
   * Exclude matching modules
   */
  excludeModules?: ExcludeFilepathOption;
  /**
   * Callback function to access and mutate the resulting stats after the transformation
   */
  transform?: TransformCallback;
};

export const bundleToWebpackStats = (
  bundle: OutputBundle,
  pluginOptions?: BundleTransformOptions
): WebpackStatsFiltered => {
  const options = { moduleOriginalSize: false, ...pluginOptions } satisfies BundleTransformOptions;
  const { 
    excludeAssets,
    excludeModules,
    moduleOriginalSize,
    transform = defaultTransform,
  } = options;

  const entries = Object.values(bundle);

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];
  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};

  entries.forEach((entry) => {
    if (entry.type === 'chunk') {
      if (checkExcludeFilepath(entry.fileName, excludeAssets)) {
        return;
      }

      assets.push({
        name: entry.fileName,
        size: getByteSize(entry.code),
      });

      const chunkId = getChunkId(entry);

      chunks.push({
        id: chunkId,
        entry: entry.isEntry,
        initial: !entry.isDynamicEntry,
        files: [entry.fileName],
        names: [entry.name],
      });

      Object.entries(entry.modules).forEach(([modulePath, moduleInfo]) => {
        if (checkExcludeFilepath(modulePath, excludeModules)) {
          return;
        }

        // Remove unexpected rollup null prefix
        const normalizedModulePath = modulePath.replace('\u0000', '');

        const relativeModulePath = path.relative(
          process.cwd(),
          normalizedModulePath
        );

        // Match webpack output - add current directory prefix for child modules
        const relativeModulePathWithPrefix = relativeModulePath.match(/^\.\./)
          ? relativeModulePath
          : `.${path.sep}${relativeModulePath}`;

        const moduleEntry = moduleByFileName[relativeModulePathWithPrefix];

        if (moduleEntry) {
          moduleEntry.chunks.push(chunkId);
        } else {
          moduleByFileName[relativeModulePathWithPrefix] = {
            name: relativeModulePathWithPrefix,
            size: moduleOriginalSize
              ? moduleInfo.originalLength
              : moduleInfo.renderedLength,
            chunks: [chunkId],
          };
        }
      });
    } else if (entry.type === 'asset') {
      if (checkExcludeFilepath(entry.fileName, excludeAssets)) {
        return;
      }

      assets.push({
        name: entry.fileName,
        size: getByteSize(entry.source.toString()),
      });
    } else {
      // noop for unknown types
    }
  });

  const stats: WebpackStatsFiltered = {
    builtAt: Date.now(),
    assets,
    chunks,
    modules: Object.values(moduleByFileName),
  };

  let result: WebpackStatsFiltered;

  try {
    result = transform(stats);
  } catch (error) {
    console.error('Custom transform failed! Returning stats without any transforms.', error);
    result = stats;
  }

  return result;
};
