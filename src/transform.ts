import path from 'path';
import type { OutputBundle } from 'rollup';

import type { ExcludeFilepathOption } from "./types";
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

export type BundleTransformOptions = {
  /**
   * Extract module original size or rendered size
   * default: false
   */
  moduleOriginalSize?: boolean;
  /**
   * Exclude asset
   */
  excludeAssets?: ExcludeFilepathOption;
  /**
   * Exclude module
   */
  excludeModules?: ExcludeFilepathOption;
};

export const bundleToWebpackStats = (
  bundle: OutputBundle,
  pluginOptions?: BundleTransformOptions
): WebpackStatsFiltered => {
  const options = {
    moduleOriginalSize: false,
    ...pluginOptions,
  };

  const items = Object.values(bundle);

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];

  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};

  items.forEach(item => {
    if (item.type === 'chunk') {
      if (checkExcludeFilepath(item.fileName, options.excludeAssets)) {
        return;
      }

      assets.push({
        name: item.fileName,
        size: getByteSize(item.code),
      });

      const chunkId = getChunkId(item);

      chunks.push({
        id: chunkId,
        entry: item.isEntry,
        initial: !item.isDynamicEntry,
        files: [item.fileName],
        names: [item.name],
      });

      Object.entries(item.modules).forEach(([modulePath, moduleInfo]) => {
        if (checkExcludeFilepath(modulePath, options.excludeModules)) {
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
            size: options.moduleOriginalSize
              ? moduleInfo.originalLength
              : moduleInfo.renderedLength,
            chunks: [chunkId],
          };
        }
      });
    } else if (item.type === 'asset') {
      if (checkExcludeFilepath(item.fileName, options.excludeAssets)) {
        return;
      }

      assets.push({
        name: item.fileName,
        size: getByteSize(item.source.toString()),
      });
    } else {
      // noop for unknown types
    }
  });

  return {
    builtAt: Date.now(),
    assets,
    chunks,
    modules: Object.values(moduleByFileName),
  };
};
