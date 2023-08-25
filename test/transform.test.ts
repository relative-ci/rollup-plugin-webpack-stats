import path from 'path';

import { bundleToWebpackStats } from '../src/transform';

describe('bundleToWebpackStats', () => {
  test('converts rollup bundle to webpack stats', () => {
    expect(
      bundleToWebpackStats({
        'assets/logo-abcd1234.svg': {
          name: undefined,
          fileName: 'assets/logo-abcd1234.svg',
          type: 'asset',
          source: '<svg></svg>',
          needsCodeReference: true,
        },
        'assets/main-abcd1234.js': {
          name: 'main',
          fileName: 'assets/main-abcd1234.js',
          preliminaryFileName: 'assets/main-abcd1234.js',
          type: 'chunk',
          code: 'export default function () {}',
          isEntry: true,
          isDynamicEntry: false,
          facadeModuleId: null,
          map: null,
          moduleIds: [],
          isImplicitEntry: false,
          implicitlyLoadedBefore: [],
          importedBindings: {},
          referencedFiles: [],
          modules: {
            [path.join(
              __dirname,
              '..',
              'node_modules',
              'package-a',
              'index.js'
            )]: {
              code: 'export default A = 1;',
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
              code: 'export default B = 2;',
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
