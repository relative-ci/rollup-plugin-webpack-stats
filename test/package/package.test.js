import { describe, test, expect } from 'vitest';
import { rollup } from 'rollup';

import rollupConfig from './rollup.config';

describe('package test', () => {
  test('should output bundle stats JSON file', async () => {
    const bundle = await rollup(rollupConfig);
    const res = await bundle.generate({ });
    expect(res.output[1]).toMatchObject({
      fileName: 'webpack-stats.json'
    });
  });
});
