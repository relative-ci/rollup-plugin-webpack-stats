import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, test, expect } from 'vitest';
import { build as vite } from 'vite';
import { vol } from 'memfs';

import viteConfigs from './case-options.mjs';

describe('package - vite options', () => {
  beforeEach(() => {
    vol.reset();
  });

  test('should output bundle stats JSON file when options is an object', async () => {
    const config = viteConfigs[0];
    await vite(config);

    const actual = await fs.readFile(path.join(config.build.outDir, 'webpack-stats.json'), 'utf8');
    const stats = JSON.parse(actual);
    expect(stats).toMatchObject({
      assets: [
        {
          name: 'assets/index.js',
          size: 739,
        },
      ],
    })
  });

  test('should output bundle stats JSON file when options is a builder function', async () => {
    const config = viteConfigs[1];
    await vite(config);

    const actual = await fs.readFile(path.join(config.build.outDir, 'stats-dist2.json'), 'utf8');
    const stats = JSON.parse(actual);
    expect(stats).toMatchObject({
      assets: [
        {
          name: 'assets/index.js',
          size: 739,
        },
      ],
    })
  });
});
