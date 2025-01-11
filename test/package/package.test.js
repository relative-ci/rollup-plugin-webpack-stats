import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, test, expect } from 'vitest';
import { rollup } from 'rollup';
import { vol } from 'memfs';

import rollupConfig from './rollup.config';

describe('package test', () => {
  beforeEach(() => {
    vol.reset();
  });

  test('should output bundle stats JSON file when options is an object', async () => {
    const config = rollupConfig[0];
    const bundle = await rollup(config);
    await bundle.generate(config.output);

    const actual = await fs.readFile(path.join(config.output.dir, 'webpack-stats.json'), 'utf8');
    const stats = JSON.parse(actual);
    expect(stats.assets).toBeTruthy();
  });

  test('should output bundle stats JSON file when options is a builder function', async () => {
    const config = rollupConfig[1];
    const bundle = await rollup(config);
    await bundle.generate(config.output);

    const actual = await fs.readFile(path.join(config.output.dir, 'stats-dist2.json'), 'utf8');
    const stats = JSON.parse(actual);
    expect(stats.assets).toBeTruthy();
  });
});
