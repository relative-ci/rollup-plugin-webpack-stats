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

- `fileName` - the JSON filepath relative to the build folder or absolute(default: `webpack-stats.json`)
- `transform` - access and mutate the resulting stats after the conversion: `(stats: WebpackStatsFilterd, sources: TransformSources, bundle: OutputBundle) => WebpackStatsFilterd`
- `moduleOriginalSize` - extract module original size or rendered size (default: `false`)
- `write` - format and write the stats to disk(default: `fs.write(filename, JSON.stringify(stats, null, 2))`)
- rollup stats options ([rollup-plugin-stats](https://github.com/relative-ci/rollup-plugin-stats#options))
    - `excludeAssets` - exclude matching assets: `string | RegExp | ((filepath: string) => boolean) | Array<string | RegExp | ((filepath: string) => boolean)>`
    - `excludeModules` - exclude matching modules: `string | RegExp | ((filepath: string) => boolean) | Array<string | RegExp | ((filepath: string) => boolean)>`

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

## Related projects

### [bundle-stats](https://github.com/relative-ci/bundle-stats)

Analyze bundle stats(bundle size, assets, modules, packages) and compare the results between different builds. Support for webpack, rspack, vite, rolldown and rollup.

### [rollup-plugin-stats](https://github.com/relative-ci/rollup-webpack-stats)

Output vite/rollup/rolldown stats.

### :cyclone: [relative-ci.com](https://relative-ci.com?utm_medium=rollup-plugin-webpack-stats)

#### Automated bundle analysis, reviews and monitoring - Quickly identify and fix bundle regressions before shipping to production.

- :crystal_ball: In-depth bundle stats analysis for every build
- :chart_with_upwards_trend: Monitor bundle stats changes and identify opportunities for optimizations
- :bell: Quick feedback with [rule based automated review flow](https://relative-ci.com/documentation/setup/configure/integrations/github-commit-status-review?utm_medium=rollup-plugin-webpack-stats), [GitHub Pull Request comments](https://relative-ci.com/documentation/setup/configure/integrations/github-pull-request-comment?utm_medium=rollup-plugin-webpack-stats), [GitHub check reports](https://relative-ci.com/documentation/setup/configure/integrations/github-check-report?utm_medium=rollup-plugin-webpack-stats), or [Slack messages](https://relative-ci.com/documentation/setup/configure/integrations/slack-notification?utm_medium=rollup-plugin-webpack-stats)
- :wrench: Support for **webpack**, **vite**, **rspack**, **rollup**, **rolldown**
- :hammer: Support for all major CI services(CircleCI, GitHub Actions, Gitlab CI, Jenkins, Travis CI)
- :nut_and_bolt: Support for **npm**, **yarn** and **pnpm**; support for monorepos
- :two_hearts: [**Always free** for **Open Source**](https://relative-ci.com/open-source?utm_medium=rollup-plugin-webpack-stats)

[:rocket: Get started](https://relative-ci.com?utm_medium=rollup-plugin-webpack-stats)

