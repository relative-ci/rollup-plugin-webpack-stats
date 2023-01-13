import path from 'path';

import { bundleToWebpackStats } from '../src/transform';

describe('bundleToWebpackStats', () => {
  it('converts rollup bundle to webpack stats', () => {
    expect(
      bundleToWebpackStats({
        'assets/logo-abcd1234.svg': {
          fileName: 'assets/logo-abcd1234.svg',
          type: 'asset',
          source: '<svg></svg>',
          isAsset: true,
        },
        'assets/main-abcd1234.js': {
          name: 'main',
          fileName: 'assets/main-abcd1234.js',
          type: 'chunk',
          code: 'export default function () {}',
          isEntry: true,
          isDynamicEntry: false,
          facadeModuleId: null,
          modules: {
            [path.join(
              __dirname,
              '..',
              'node_modules',
              'package-a',
              'index.js'
            )]: {
              originalLength: 10,
              renderedLength: 8,
              removedExports: [],
              renderedExports: [],
            },
            [path.join(
              __dirname,
              '..',
              '..',
              'node_modules',
              'package-b',
              'index.js'
            )]: {
              originalLength: 10,
              renderedLength: 8,
              removedExports: [],
              renderedExports: [],
            },
          },
          imports: [],
          exports: [],
          dynamicImports: [],
        },
      })
    ).toEqual({
      assets: [
        {
          name: 'assets/logo-abcd1234.svg',
          size: 11,
        },
        {
          name: 'assets/main-abcd1234.js',
          size: 29,
        },
      ],
      chunks: [
        {
          id: 'main',
          initial: true,
          entry: true,
          names: ['main'],
          files: ['assets/main-abcd1234.js'],
        },
      ],
      modules: [
        {
          chunks: ['main'],
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['main'],
          name: `..${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          size: 8,
        },
      ],
    });
  });
});
