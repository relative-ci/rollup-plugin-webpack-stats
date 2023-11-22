import crypto from 'crypto';
import path from 'path';
import { OutputBundle, OutputChunk } from 'rollup';

const HASH_LENGTH = 7;

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

const getByteSize = (content: string | Buffer): number => {
  if (typeof content === 'string') {
    return Buffer.from(content).length;
  }

  return content?.length || 0;
};


const getHash = (text: string): string => {
  const digest = crypto.createHash('sha256');
  return digest.update(Buffer.from(text)).digest('hex').substr(0, HASH_LENGTH); 
};

const getChunkId = (chunk: OutputChunk): string => {
  let value = chunk.name;

  // Use entry module relative path
  if (chunk.moduleIds?.length > 0) {
    const absoluteModulePath = chunk.moduleIds[chunk.moduleIds.length - 1];
    value = path.relative(process.cwd(), absoluteModulePath);
  }

  return getHash([chunk, value].join('-'));
}

export type BundleTransformOptions = {
  /**
   * Extract module original size or rendered size
   * default: false
   */
  moduleOriginalSize?: boolean;
};

export const bundleToWebpackStats = (
  bundle: OutputBundle,
  customOptions?: BundleTransformOptions
): WebpackStatsFiltered => {
  const options = {
    moduleOriginalSize: false,
    ...customOptions,
  };

  const items = Object.values(bundle);

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];

  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};

  items.forEach(item => {
    if (item.type === 'chunk') {
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
