import path from 'path';
import type { Stats, AssetStats, ChunkStats, ModuleStats } from 'rollup-plugin-stats/extract';

import { getByteSize, getChunkId } from "./utils";

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

export type ChunksIssuers = Record<string, Array<ChunkStats>>;

/**
 * Recursivily check if a chunk is async based on the chunks issuers
 */
export const lookupChunkAsync = (chunk: ChunkStats, chunksIssuers: ChunksIssuers):boolean => {
  if (chunk.isEntry) {
    return false;
  }

  if (chunk.isDynamicEntry) {
    return true;
  }

  const chunkIssuers = chunksIssuers[chunk.fileName];

  /**
   * A sync chunk without issuer chunks, is sync
   */
  if (!chunkIssuers) {
    return false;
  }

  const syncChunksIssuers = chunkIssuers.filter((chunkIssuer) => {
    return chunkIssuer.isDynamicEntry === false;
  });

  /**
   * A sync chunk with all the chunk issuer async, is async
   */
  if (syncChunksIssuers.length === 0) {
    return true;
  }

  /**
   * Recursively lookup for sync loads on the 2nd level issuers
   * - if at least one issuer is sync, the chunk is sync
   * - if none of the issuers are sync, the chunk is async
   */
  let isAsync = true;

  for (let i = 0; i < syncChunksIssuers.length && isAsync; i++) {
    isAsync = lookupChunkAsync(syncChunksIssuers[i], chunksIssuers);
  }

  return isAsync;
}

type AssetSource = ChunkStats | AssetStats;
type ChunkSource = ChunkStats;
type ModuleSource = { fileName: string } & ModuleStats;

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

export type TransformCallback = (stats: WebpackStatsFiltered, sources: TransformSources, bundle: Stats) => WebpackStatsFiltered; 

const defaultTransform: TransformCallback = (stats) => stats;

export type BundleTransformOptions = {
  /**
   * Extract module original size or rendered size
   * default: false
   */
  moduleOriginalSize?: boolean;
  /**
   * Callback function to access and mutate the resulting stats after the transformation
   */
  transform?: TransformCallback;
};

export const bundleToWebpackStats = (
  bundle: Stats,
  pluginOptions?: BundleTransformOptions
): WebpackStatsFiltered => {
  const options = { moduleOriginalSize: false, ...pluginOptions } satisfies BundleTransformOptions;
  const { moduleOriginalSize, transform = defaultTransform } = options;

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];
  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};
  const sources = new TransformSources();
  const chunksIssuers: ChunksIssuers = {};

  const entries = Object.values(bundle);

  // Collect metadata
  entries.forEach((entry) => {
    if (entry.type === 'chunk') {
      entry.imports?.forEach((chunkImportFileName) => {
        // Skip circular references
        if (chunksIssuers[entry.fileName]?.find((chunkIssuer) => chunkIssuer.fileName === chunkImportFileName)) {
          return;
        }

        if (!chunksIssuers[chunkImportFileName]) {
          chunksIssuers[chunkImportFileName] = [];
        }

        chunksIssuers[chunkImportFileName].push(entry);
      });
    }
  });

  // Process data
  entries.forEach((entry) => {
    if (entry.type === 'chunk') {
      assets.push({
        name: entry.fileName,
        size: getByteSize(entry.code),
      });
      sources.push(entry.fileName, entry);

      const chunkId = getChunkId(entry);
      const chunkAsync = lookupChunkAsync(entry, chunksIssuers);

      chunks.push({
        id: chunkId,
        entry: entry.isEntry,
        initial: !chunkAsync,
        files: [entry.fileName],
        names: [entry.name],
      });
      sources.push(chunkId, entry);

      Object.entries(entry.modules).forEach(([modulePath, moduleInfo]) => {
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
      assets.push({
        name: entry.fileName,
        size: getByteSize(entry.source),
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
