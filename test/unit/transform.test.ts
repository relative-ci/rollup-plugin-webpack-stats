import { describe, test, expect } from 'vitest';
import path from 'path';

const ROOT_DIR = path.join(__dirname, '../..');

import { bundleToWebpackStats } from '../../src/transform';

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
          isImplicitEntry: false,
          implicitlyLoadedBefore: [],
          importedBindings: {},
          referencedFiles: [],
          moduleIds: [
            path.join(ROOT_DIR, 'src/component-a.js'),
            path.join(ROOT_DIR, 'src/index.js'),
          ],
          modules: {
            [path.join(ROOT_DIR, 'src/component-a.js')]: {
              code: 'export default A = 1;',
              originalLength: 10,
              renderedLength: 8,
              removedExports: [],
              renderedExports: [],
            },
            [path.join(ROOT_DIR, 'src/index.js')]: {
              code: '',
              originalLength: 100,
              renderedLength: 80,
              removedExports: [],
              renderedExports: [],
            },
          },
          imports: [],
          exports: [],
          dynamicImports: [],
        },
        'assets/vendors-abcd1234.js': {
          name: 'vendors',
          fileName: 'assets/vendors-abcd1234.js',
          preliminaryFileName: 'assets/vendors-abcd1234.js',
          type: 'chunk',
          code: 'export default function () {}',
          isEntry: true,
          isDynamicEntry: false,
          facadeModuleId: null,
          map: null,
          isImplicitEntry: false,
          implicitlyLoadedBefore: [],
          importedBindings: {},
          referencedFiles: [],
          moduleIds: [
            path.join(ROOT_DIR, 'node_modules', 'package-a', 'index.js'),
            path.join(ROOT_DIR, 'node_modules', 'package-b', 'index.js'),
          ],
          modules: {
            [path.join(
              ROOT_DIR,
              'node_modules',
              'package-a',
              'index.js'
            )]: {
              code: '',
              originalLength: 10,
              renderedLength: 8,
              removedExports: [],
              renderedExports: [],
            },
            [path.join(
              ROOT_DIR,
              'node_modules',
              'package-b',
              'index.js'
            )]: {
              code: '',
              originalLength: 100,
              renderedLength: 80,
              removedExports: [],
              renderedExports: [],
            },
          },
          imports: [],
          exports: [],
          dynamicImports: [],
        },
        'assets/index-abcd1234.js': {
          name: 'index',
          fileName: 'assets/index-abcd1234.js',
          preliminaryFileName: 'assets/index-abcd1234.js',
          type: 'chunk',
          code: 'export default function () {}',
          isEntry: false,
          isDynamicEntry: true,
          facadeModuleId: null,
          map: null,
          isImplicitEntry: false,
          implicitlyLoadedBefore: [],
          importedBindings: {},
          referencedFiles: [],
          moduleIds: [
            path.join(ROOT_DIR, 'src', 'components/component-b/index.js'),
          ],
          modules: {
            [path.join(
              ROOT_DIR,
              'src',
              'components',
              'component-b',
              'index.js',
            )]: {
              code: '',
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
        'assets/index-efab5678.js': {
          name: 'index',
          fileName: 'assets/index-efab5678.js',
          preliminaryFileName: 'assets/index-efab5678.js',
          type: 'chunk',
          code: 'export default function () {}',
          isEntry: false,
          isDynamicEntry: true,
          facadeModuleId: null,
          map: null,
          isImplicitEntry: false,
          implicitlyLoadedBefore: [],
          importedBindings: {},
          referencedFiles: [],
          moduleIds: [
            path.join(ROOT_DIR, 'src', 'components/component-c/index.js'),
          ],
          modules: {
            [path.join(
              ROOT_DIR,
              'src',
              'components',
              'component-c',
              'index.js',
            )]: {
              code: '',
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
          identifier: `.${path.sep}${path.join(
            'src',
            'component-a.js',
          )}`,
          name: `.${path.sep}${path.join(
            'src',
            'component-a.js',
          )}`,
          size: 8,
        },
        {
          chunks: ['e1c35b4'],
          identifier: `.${path.sep}${path.join(
            'src',
            'index.js'
          )}`,
          name: `.${path.sep}${path.join(
            'src',
            'index.js'
          )}`,
          size: 80,
        },
        {
          chunks: ['95848fd'],
          identifier: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-a',
            'index.js'
          )}`,
          size: 8,
        },
        {
          chunks: ['95848fd'],
          identifier: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          name: `.${path.sep}${path.join(
            'node_modules',
            'package-b',
            'index.js'
          )}`,
          size: 80,
        },
        {
          chunks: ['e7b195f'],
          identifier: `.${path.sep}${path.join(
            'src',
            'components',
            'component-b',
            'index.js',
          )}`,
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
          identifier: `.${path.sep}${path.join(
            'src',
            'components',
            'component-c',
            'index.js',
          )}`,
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
});
