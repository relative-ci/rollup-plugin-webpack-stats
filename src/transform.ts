import path from 'path';
import type { OutputAsset, OutputBundle, OutputChunk, RenderedModule } from 'rollup';

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
  builtAt: number;
  hash?: string;
  assets: Array<WebpackStatsFilteredAsset>;
  chunks: Array<WebpackStatsFilteredChunk>;
  modules: Array<WebpackStatsFilteredRootModule>;
}

export type ChunksParents = Record<string, Array<OutputChunk>>;

/**
 * Recursivily check if a chunk is async based on the chunks parents
 */
export const lookupChunkAsync = (chunk: OutputChunk, chunksParents: ChunksParents):boolean => {
  if (chunk.isDynamicEntry) {
    return true;
  }

  const chunkParents = chunksParents[chunk.fileName];

  /**
   * A sync chunk without parent chunks, is sync
   */
  if (!chunkParents) {
    return false;
  }

  const syncChunksParents = chunkParents.filter((chunkParent) => {
    return chunkParent.isDynamicEntry === false;
  });

  /**
   * A sync chunk with all the parents async, is async
   */
  if (syncChunksParents.length === 0) {
    return true;
  }

  /**
   * Recursively lookup for sync loads on the 2nd level parents
   * - if at least one parent is sync, the chunk is sync
   * - if none of the parents are sync, the chunk is async
   */
  let isAsync = true;

  for (let i = 0; i < syncChunksParents.length && isAsync; i++) {
    isAsync = lookupChunkAsync(syncChunksParents[i], chunksParents);
  }

  return isAsync;
}

type AssetSource = OutputChunk | OutputAsset;
type ChunkSource = OutputChunk;
type ModuleSource = { fileName: string } & RenderedModule;

/**
 * Store transformed sources
 */ 
class TransformSources {
  constructor() {
    this.entries = {};
  }

  entries: Record<string, unknown> = {};

  push(id: string, source: AssetSource | ChunkSource | ModuleSource) {
    this.entries[id] = source;
  }

  /**
   * Get asset source
   */
  getByAsset = (asset: WebpackStatsFilteredAsset): AssetSource => {
    return this.entries[asset.name] as AssetSource;
  }

  /**
   * Get chunk source
   */
  getByChunk = (chunk: WebpackStatsFilteredChunk): ChunkSource => {
    return this.entries[chunk.id] as ChunkSource;
  }

  /**
   * Get module source
   */
  getByModule = (module: WebpackStatsFilteredModule): ModuleSource => {
    return this.entries[module.name] as ModuleSource;
  }
}

export type TransformCallback = (stats: WebpackStatsFiltered, sources: TransformSources, bundle: OutputBundle) => WebpackStatsFiltered; 

const defaultTransform: TransformCallback = (stats) => stats;

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
  const { excludeAssets, excludeModules, moduleOriginalSize, transform = defaultTransform } = options;

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];
  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};
  const sources = new TransformSources();
  const chunksParents: ChunksParents = {};

  const entries = Object.values(bundle);

  // Collect metadata
  entries.forEach((entry) => {
    if (entry.type === 'chunk') {
      entry.imports.forEach((entryImport) => {
        if (!chunksParents[entry.fileName]) {
          chunksParents[entry.fileName] = [];
        }

        const parentChunk = bundle[entryImport];

        console.log({ entryImport, parentChunk });

        chunksParents[entry.fileName].push(parentChunk);
      });
    }
  });

  // Process data
  entries.forEach((entry) => {
    if (entry.type === 'chunk') {
      if (checkExcludeFilepath(entry.fileName, excludeAssets)) {
        return;
      }

      assets.push({
        name: entry.fileName,
        size: getByteSize(entry.code),
      });
      sources.push(entry.fileName, entry);

      const chunkId = getChunkId(entry);

      chunks.push({
        id: chunkId,
        entry: entry.isEntry,
        initial: !lookupChunkAsync(entry, chunksParents),
        files: [entry.fileName],
        names: [entry.name],
      });
      sources.push(chunkId, entry);

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
          sources.push(relativeModulePathWithPrefix, { fileName: modulePath, ...moduleInfo });
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
      sources.push(entry.fileName, entry);
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
    result = transform(stats, sources, bundle);
  } catch (error) {
    console.error('Custom transform failed! Returning stats without any transforms.', error);
    result = stats;
  }

  return result;
};
