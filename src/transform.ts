import path from 'node:path';
import { OutputBundle } from 'rollup';

// https://github.com/relative-ci/bundle-stats/blob/master/packages/plugin-webpack-filter/src/index.ts
export type WebpackStatsFilteredAsset = {
  name: string;
  size?: number;
}

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

export interface WebpackStatsFilteredRootModule extends WebpackStatsFilteredModule {
  modules?: Array<WebpackStatsFilteredConcatenatedModule>;
}

export interface WebpackStatsFiltered {
  builtAt?: number;
  hash?: string;
  assets?: Array<WebpackStatsFilteredAsset>;
  chunks?: Array<WebpackStatsFilteredChunk>;
  modules?: Array<WebpackStatsFilteredRootModule>;
}

export const bundleToWebpackStats = (bundle: OutputBundle): WebpackStatsFiltered => {
  const items = Object.values(bundle);

  const assets: Array<WebpackStatsFilteredAsset> = [];
  const chunks: Array<WebpackStatsFilteredChunk> = [];

  const moduleByFileName: Record<string, WebpackStatsFilteredModule> = {};

  items.forEach((item) => {
    if (item.type === 'chunk') {
      assets.push({
        name: item.fileName,
        size: item.code?.length,
      });

      const chunkId = item.name;

      chunks.push({
        id: chunkId,
        entry: item.isEntry,
        initial: false,
        files: [item.fileName],
        names: [item.name]
      });

      Object.entries(item.modules).forEach(([modulePath, moduleInfo]) => {
        const relativeModulePath = path.relative(process.cwd(), modulePath.replace('\u0000', ''));

        const moduleEntry = moduleByFileName[relativeModulePath];

        if (moduleEntry) {
          moduleEntry.chunks.push(chunkId);
        } else {
          moduleByFileName[relativeModulePath] = {
            name: relativeModulePath,
            size: moduleInfo.originalLength,
            chunks: [chunkId],
          };
        }
      });
    } else {
      assets.push({
        name: item.fileName,
        size: item.source?.length,
      });
    }
  });

  const output = {
    assets,
    chunks,
    modules: Object.values(moduleByFileName),
  };

  return output;
};
