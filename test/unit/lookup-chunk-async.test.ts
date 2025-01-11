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
  isEntry: false,
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
        * PARENT? ---async---> A
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
    test("chunk is sync if it is a static entry", () => {
      /**
       * ROOT ---sync---> A
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'A', isDynamicEntry: false, isEntry: true },
          {
            A: ['B', 'C'],
          }
        )
      ).toEqual(false);
    });

    test("chunk is sync if it is a static and dynamic entry", () => {
      /**
       * ROOT ---sync---> A
       *
       * @NOTE Under investigation for reasons why both flags can be true
       */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'A', isDynamicEntry: true, isEntry: true },
          {
            A: ['B', 'C'],
          }
        )
      ).toEqual(false);
    });

    test("chunk is sync if it doesn't have any issuers", () => {
      /**
        * NO_PARENT ---sync---> A
        */
      expect(
        lookupChunkAsync(
          { ...COMMON_DATA, fileName: 'A', isDynamicEntry: false },
          {}
        )
      ).toEqual(false);
    });

    test('chunk is async when all chunk issuers are async', () => {
      /**
       * ROOT ----async---> A ---sync---> C
       *      \---async---> B ---sync---> C
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
       * ROOT ---async---> A ---sync---> C ---sync---> E
       *      \--async---> B ---sync---> D ---sync---> E
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

    test('chunk is sync when at least one issuer is sync', () => {
      /**
       * ROOT ----async---> A ---sync---> C
       *      \--- sync---> B ---sync---> C
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
       * ROOT ----async---> A ---sync---> C ---sync---> E
       *      \--- sync---> B ---sync---> D ---sync---> E
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
