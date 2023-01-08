import { Plugin } from 'rollup';

import { bundleToWebpackStats } from './transform';

const NAME = 'webpackStats';

export const webpackStats = (): Plugin => ({
  name: NAME,
  generateBundle(_, bundle) {
    const output = bundleToWebpackStats(bundle);

    this.emitFile({
      type: 'asset',
      fileName: 'webpack-stats.json',
      source: JSON.stringify(output),
    });
  },
});
