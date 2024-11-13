# rollup-plugin-webpack-stats

[![](https://img.shields.io/npm/v/rollup-plugin-webpack-stats.svg)](https://www.npmjs.com/package/rollup-plugin-webpack-stats)
[![](https://img.shields.io/npm/dm/rollup-plugin-webpack-stats.svg)](https://www.npmjs.com/package/rollup-plugin-webpack-stats)
![](https://img.shields.io/node/v/rollup-plugin-webpack-stats.svg)
[![ci](https://github.com/relative-ci/rollup-plugin-webpack-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/relative-ci/rollup-plugin-webpack-stats/actions/workflows/ci.yml)
[![Socket Badge](https://socket.dev/api/badge/npm/package/rollup-plugin-webpack-stats)](https://socket.dev/npm/package/rollup-plugin-webpack-stats)

Generate rollup stats JSON file with a [bundle-stats](https://github.com/relative-ci/bundle-stats/tree/master/packages/cli) webpack [supported structure](https://github.com/relative-ci/bundle-stats/blob/master/packages/plugin-webpack-filter/src/index.ts).

## Install

```shell
npm install --dev rollup-plugin-webpack-stats
```

or

```shell
yarn add --dev rollup-plugin-webpack-stats
```

or

```shell
pnpm add -D rollup-plugin-webpack-stats
```

## Configure

```js
// rollup.config.js
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default {
  plugins: [
    // add it as the last plugin
    webpackStatsPlugin(),
  ],
};
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default defineConfig((env) => ({
  plugins: [
    // Output webpack-stats.json file
    webpackStatsPlugin(),
  ],
}));
```

### Options

- `fileName` - JSON stats file inside rollup/vite output directory
- `excludeAssets` - exclude matching assets: `string | RegExp | ((filepath: string) => boolean) | Array<string | RegExp | ((filepath: string) => boolean)>`
- `excludeModules` - exclude matching modules: `string | RegExp | ((filepath: string) => boolean) | Array<string | RegExp | ((filepath: string) => boolean)>`
- `transform` - access and mutate the resulting stats after the conversion: `(stats: WebpackStatsFilterd, sources: TransformSources, bundle: OutputBundle) => WebpackStatsFilterd`

### Examples

#### Output to a custom filename
```js
// rollup.config.js
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

module.exports = {
  plugins: [
    // add it as the last plugin
    webpackStatsPlugin({
      filename: 'artifacts/stats.json',
    }),
  ],
};
```

#### Exclude `.map` files
```js
// rollup.config.js
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default {
  plugins: [
    // add it as the last plugin
    webpackStatsPlugin({
      excludeAssets: /\.map$/,
    }),
  ],
};
```

#### Vite.js - multiple stats files when using plugin-legacy
```js
// for the the modern and legacy outputs
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default defineConfig((env) => ({
  build: {
    rollupOptions: {
      output: {
        plugins: [
          // Output webpack-stats-modern.json file for the modern build
          // Output webpack-stats-legacy.json file for the legacy build
          // Stats are an output plugin, as plugin-legacy works by injecting
          // an additional output, that duplicates the plugins configured here
          webpackStatsPlugin((options) => {
            const isLegacy = options.format === 'system';
            return {
              fileName: `webpack-stats${isLegacy ? '-legacy' : '-modern'}.json`,
            };
          }),
        ],
      },
    },
  },
  plugins: [
    legacy({
      /* Your legacy config here */
    }),
  ],
}));
```

#### Vite.js - update initial flag for chunks where the inital flag is incorrectly set to false
```js
import { defineConfig } from 'vite';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default defineConfig((env) => ({
  build: {
    rollupOptions: {
      output: {
        plugins: [
          webpackStatsPlugin({
            transform: (stats) => {
              // Find the target chunk entry
              const mainChunkIndex = stats.chunks?.findIndex((chunk) => chunk.names?.includes("main"));

              // When the tartget chunk is found, set the initial flag to true
              if (typeof mainChunkIndex !== 'undefined' && stats?.chunks?.[mainChunkIndex]) {
                stats.chunks[mainChunkIndex] = {
                  ...stats.chunks[mainChunkIndex],
                  initial: true,
                };
              }

              // return the modified stats object
              return stats;
            },
          }),
        ],
      },
    },
  },
}));
```

## Resources

- [Vite - Using plugins](https://vitejs.dev/guide/using-plugins)
- [Rollup - Using plugins](https://rollupjs.org/tutorial/#using-plugins)
- [RelativeCI - Vite configuration for better bundle monitoring](https://relative-ci.com/documentation/guides/vite-config)

## [@relative-ci/agent](https://github.com/relative-ci/agent) examples

- [example-vite-github-action](https://github.com/relative-ci/example-vite-github-action)
- [example-vite-cli-github-action](https://github.com/relative-ci/example-vite-cli-github-action)
