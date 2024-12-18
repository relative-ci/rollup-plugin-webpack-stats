import { describe, test, expect } from 'vitest';
import type { OutputChunk } from 'rollup';

import { lookupChunkAsync } from '../../src/transform';

const COMMON_DATA: OutputChunk = {
  name: '',
  fileName: '',
  preliminaryFileName: '',
  sourcemapFileName: '',
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
  moduleIds: [],
  modules: {},
  imports: [],
  exports: [],
  dynamicImports: [],
};

describe('lookupChunkAsync', () => {
  describe('isDynamicEntry === true', () => {
    test('chunk is async', () => {
      /**
       * A ---async---> PARENT?
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'A', isDynamicEntry: true },
          {}
        )
      ).toEqual(true);
    });
  });

  describe('isDynamicEntry === false', () => {
    test("chunk is sync if it doesn't have any parents", () => {
      /**
       * A ---sync---> NO_PARENT
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'A', isDynamicEntry: false },
          {}
        )
      ).toEqual(false);
    });

    test('chunk is async when all chunk parents are async', () => {
      /**
       * C ---sync---> A ---async---> ROOT
       * C ---sync---> B ---async---/
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'C', isDynamicEntry: false },
          {
            C: [
              {
                ...COMMON_DATA,
                fileName: 'A',
                isDynamicEntry: true,
              },
              {
                ...COMMON_DATA,
                fileName: 'B',
                isDynamicEntry: true,
              },
            ],
          }
        )
      ).toEqual(true);
      /**
       * E ---sync---> C ---sync---> A ---async---> ROOT
       * E ---sync---> D ---sync---> B ---async---/
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'E', isDynamicEntry: false },
          {
            E: [
              {
                ...COMMON_DATA,
                fileName: 'C',
                isDynamicEntry: false,
              },
              {
                ...COMMON_DATA,
                fileName: 'D',
                isDynamicEntry: false,
              },
            ],
            D: [
              {
                ...COMMON_DATA,
                fileName: 'B',
                isDynamicEntry: true,
              },
            ],
            C: [
              {
                ...COMMON_DATA,
                fileName: 'A',
                isDynamicEntry: true,
              },
            ],
          }
        )
      ).toEqual(true);
    });

    test.only('chunk is sync when at least one parent is sync', () => {
      /**
       * C ---sync---> A ---async---> ROOT
       * C ---sync---> B --- sync---/
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'C', isDynamicEntry: false },
          {
            C: [
              {
                ...COMMON_DATA,
                fileName: 'A',
                isDynamicEntry: true,
              },
              {
                ...COMMON_DATA,
                fileName: 'B',
                isDynamicEntry: false,
              },
            ],
          }
        )
      ).toEqual(false);
      /**
       * E ---sync--> C ---sync---> A ---async---> ROOT
       * E ---sync--> D ---sync---> B --- sync---/
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'E', isDynamicEntry: false },
          {
            E: [
              {
                ...COMMON_DATA,
                fileName: 'C',
                isDynamicEntry: false,
              },
              {
                ...COMMON_DATA,
                fileName: 'D',
                isDynamicEntry: false,
              },
            ],
            D: [
              {
                ...COMMON_DATA,
                fileName: 'B',
                isDynamicEntry: false,
              },
            ],
            C: [
              {
                ...COMMON_DATA,
                fileName: 'A',
                isDynamicEntry: true,
              },
            ],
          }
        )
      ).toEqual(false);
    });
  });
});
