import { describe, test, expect } from 'vitest';
import path from 'path';

import { bundleToWebpackStats } from '../../src/transform';
import { ROOT_DIR, statsFixtures } from './fixtures/rollup-bundle-stats';

describe('bundleToWebpackStats', () => {
  test('transforms rollup bundle stats to webpack stats', () => {
    expect(bundleToWebpackStats(statsFixtures)).toMatchObject({
      assets: [
        {
          name: 'assets/logo-abcd1234.svg',
          size: 11,
        },
        {
          name: 'assets/main-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/vendors-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-efab5678.js',
          size: 29,
        },
      ],
      chunks: [
        {
          id: 'e1c35b4',
          initial: true,
          entry: true,
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
        },
        {
          id: '95848fd',
          initial: true,
          entry: true,
          names: ['vendors'],
          files: ['assets/vendors-abcd1234.js'],
        },
        {
          id: 'e7b195f',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-abcd1234.js'],
        },
        {
          id: '7cd4868',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-efab5678.js'],
        },
      ],
      modules: [
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'component-a.js')}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'index.js')}`,
          size: 80,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          size: 80,
        },
        {
          chunks: ['e7b195f'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js'
          )}`,
          size: 8,
        },
      ],
    });
  });

  test('transforms rollup bundle stats to webpack stats using custom transformer', () => {
    expect(
      bundleToWebpackStats(statsFixtures, {
        transform: (stats) => {
          const mainChunkIndex = stats.chunks?.findIndex((chunk) =>
            chunk.names?.includes('main')
          );

          if (
            typeof mainChunkIndex !== 'undefined' &&
            stats?.chunks?.[mainChunkIndex]
          ) {
            stats.chunks[mainChunkIndex] = {
              ...stats.chunks[mainChunkIndex],
              initial: !stats.chunks[mainChunkIndex].initial,
            };
          }

          return stats;
        },
      }).chunks
    ).toEqual(
      expect.arrayContaining([
        {
          id: 'e1c35b4',
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
          entry: true,
          initial: false,
        },
      ])
    );
  });

  test('transforms rollup bundle stats to webpack stats using custom transformer with sources', () => {
    expect(
      bundleToWebpackStats(statsFixtures, {
        transform: (stats, sources) => {
          // Collect asset type
          stats.assets = stats.assets?.map((asset) => ({
            ...asset,
            type: sources.getByAsset(asset).type,
          }));

          // Collect chunk type
          stats.chunks = stats.chunks?.map((chunk) => ({
            ...chunk,
            type: sources.getByChunk(chunk).type,
          }));

          // Collect module data
          stats.modules = stats.modules.map((moduleSource) => ({
            ...moduleSource,
            removedExportsLength:
              sources.getByModule(moduleSource).renderedExports.length,
          }));

          return stats;
        },
      })
    ).toMatchObject({
      assets: [
        {
          name: 'assets/logo-abcd1234.svg',
          size: 11,
          type: 'asset',
        },
        {
          name: 'assets/main-abcd1234.js',
          size: 29,
          type: 'chunk',
        },
        {
          name: 'assets/vendors-abcd1234.js',
          size: 29,
          type: 'chunk',
        },
        {
          name: 'assets/index-abcd1234.js',
          size: 29,
          type: 'chunk',
        },
        {
          name: 'assets/index-efab5678.js',
          size: 29,
          type: 'chunk',
        },
      ],
      chunks: [
        {
          id: 'e1c35b4',
          initial: true,
          entry: true,
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
          type: 'chunk',
        },
        {
          id: '95848fd',
          initial: true,
          entry: true,
          names: ['vendors'],
          files: ['assets/vendors-abcd1234.js'],
          type: 'chunk',
        },
        {
          id: 'e7b195f',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-abcd1234.js'],
          type: 'chunk',
        },
        {
          id: '7cd4868',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-efab5678.js'],
          type: 'chunk',
        },
      ],
      modules: [
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'component-a.js')}`,
          size: 8,
          removedExportsLength: 0,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'index.js')}`,
          size: 80,
          removedExportsLength: 0,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          size: 8,
          removedExportsLength: 0,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          size: 80,
          removedExportsLength: 0,
        },
        {
          chunks: ['e7b195f'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js'
          )}`,
          size: 8,
          removedExportsLength: 0,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js'
          )}`,
          size: 8,
          removedExportsLength: 0,
        },
      ],
    });

    expect(
      bundleToWebpackStats(statsFixtures, {
        transform: (stats, sources) => {
          // Collect module identifier
          stats.modules = stats.modules.map((moduleSource) => ({
            ...moduleSource,
            identifier: sources.getByModule(moduleSource).fileName,
          }));

          return stats;
        },
      })
    ).toMatchObject({
      assets: [
        {
          name: 'assets/logo-abcd1234.svg',
          size: 11,
        },
        {
          name: 'assets/main-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/vendors-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-efab5678.js',
          size: 29,
        },
      ],
      chunks: [
        {
          id: 'e1c35b4',
          initial: true,
          entry: true,
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
        },
        {
          id: '95848fd',
          initial: true,
          entry: true,
          names: ['vendors'],
          files: ['assets/vendors-abcd1234.js'],
        },
        {
          id: 'e7b195f',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-abcd1234.js'],
        },
        {
          id: '7cd4868',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-efab5678.js'],
        },
      ],
      modules: [
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'component-a.js')}`,
          identifier: path.join(ROOT_DIR, 'src', 'component-a.js'),
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'index.js')}`,
          identifier: path.join(ROOT_DIR, 'src', 'index.js'),
          size: 80,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          identifier: path.join(
            ROOT_DIR,
            'node_modules',
            'package-a',
            'index.js'
          ),
          size: 8,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          identifier: path.join(
            ROOT_DIR,
            'node_modules',
            'package-b',
            'index.js'
          ),
          size: 80,
        },
        {
          chunks: ['e7b195f'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js'
          )}`,
          identifier: path.join(
            ROOT_DIR,
            'src',
            'components',
            'component-b',
            'index.js'
          ),
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js'
          )}`,
          identifier: path.join(
            ROOT_DIR,
            'src',
            'components',
            'component-c',
            'index.js'
          ),
          size: 8,
        },
      ],
    });
  });

  test('transforms rollup bundle stats to webpack stats using custom transformer with bundle', () => {
    expect(
      bundleToWebpackStats(statsFixtures, {
        transform: (stats, _, bundle) => {
          // Adding arbitary info to the stats object to prove that we have access to bundle
          // @ts-expect-error
          stats.entryCount = Object.keys(bundle).length;

          return stats;
        },
      })
    ).toMatchObject({
      assets: [
        {
          name: 'assets/logo-abcd1234.svg',
          size: 11,
        },
        {
          name: 'assets/main-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/vendors-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-abcd1234.js',
          size: 29,
        },
        {
          name: 'assets/index-efab5678.js',
          size: 29,
        },
      ],
      chunks: [
        {
          id: 'e1c35b4',
          initial: true,
          entry: true,
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
        },
        {
          id: '95848fd',
          initial: true,
          entry: true,
          names: ['vendors'],
          files: ['assets/vendors-abcd1234.js'],
        },
        {
          id: 'e7b195f',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-abcd1234.js'],
        },
        {
          id: '7cd4868',
          initial: false,
          entry: false,
          names: ['index'],
          files: ['assets/index-efab5678.js'],
        },
      ],
      modules: [
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'component-a.js')}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join('src', 'index.js')}`,
          size: 80,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['95848fd'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          size: 80,
        },
        {
          chunks: ['e7b195f'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js'
          )}`,
          size: 8,
        },
      ],
    });
  });
});
