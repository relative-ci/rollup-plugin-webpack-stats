import { describe, test, expect } from 'vitest';
import path from 'path';

import { bundleToWebpackStats } from '../../src/transform';
import fixtures, { statsWithDynamicEntry } from './fixtures/rollup-bundle-stats';


describe('bundleToWebpackStats', () => {
  test('transforms rollup bundle stats to webpack stats', () => {
    expect(bundleToWebpackStats(fixtures)).toMatchObject({
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
          name: `.${path.sep}${path.join(
            'src',
            'component-a.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join(
            'src',
            'index.js'
          )}`,
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
            'index.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js',
          )}`,
          size: 8,
        },
      ],
    });
  });

  test('transforms rollup bundle stats to webpack stats with excludeAssets option', () => {
    expect(bundleToWebpackStats(fixtures, { excludeAssets: 'assets/vendors' })).toMatchObject({
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
          name: `.${path.sep}${path.join(
            'src',
            'component-a.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join(
            'src',
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
            'index.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js',
          )}`,
          size: 8,
        },
      ],
    });
  });

  test('transforms rollup bundle stats to webpack stats with excludeModules option', () => {
    expect(bundleToWebpackStats(fixtures, { excludeModules: '/node_modules/package-b/' })).toMatchObject({
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
          name: `.${path.sep}${path.join(
            'src',
            'component-a.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          name: `.${path.sep}${path.join(
            'src',
            'index.js'
          )}`,
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
          chunks: ['e7b195f'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['7cd4868'],
          name: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js',
          )}`,
          size: 8,
        },
      ],
    });
  });

  test('transforms rollup bundle stats to webpack stats using custom transformer', () => {
    expect(bundleToWebpackStats(statsWithDynamicEntry, { 
      transform: (stats) => {
        const mainChunkIndex = stats.chunks?.findIndex((chunk) => chunk.names?.includes("main"));

        if (typeof mainChunkIndex !== 'undefined' && stats?.chunks?.[mainChunkIndex]) {
          stats.chunks[mainChunkIndex] = {
            ...stats.chunks[mainChunkIndex],
            initial: true,
          };
        }

        return stats;
      },
    })).toMatchObject({
      assets: [
        {
          name: 'assets/main-abcd1234.js',
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
      ]
    });
  });
});
