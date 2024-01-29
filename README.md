# rollup-plugin-webpack-stats

> **Warning**
> Under active development

[![](https://img.shields.io/npm/v/rollup-plugin-webpack-stats.svg)](https://www.npmjs.com/package/rollup-plugin-webpack-stats)
![](https://img.shields.io/node/v/rollup-plugin-webpack-stats.svg)
[![ci](https://github.com/vio/rollup-plugin-webpack-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/vio/rollup-plugin-webpack-stats/actions/workflows/ci.yml)
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

## Configure

```js
// rollup.config.js
const { webpackStats } = require('rollup-plugin-webpack-stats');

module.exports = {
  plugins: [
    // add it as the last plugin
    webpackStats(),
  ],
};
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import { webpackStats } from 'rollup-plugin-webpack-stats';

export default defineConfig((env) => ({
  plugins: [
    // Output webpack-stats.json file
    webpackStats(),
  ],
}));
```

### Options

- `fileName` - JSON stats file inside rollup/vite output directory

## Resources

- [Vite - Using plugins](https://vitejs.dev/guide/using-plugins)
- [Rollup - Using plugins](https://rollupjs.org/tutorial/#using-plugins)
- [RelativeCI - Vite configuration for better bundle monitoring](https://relative-ci.com/documentation/guides/vite-config)

## [@relative-ci/agent](https://github.com/relative-ci/agent) examples

- [example-vite-github-action](https://github.com/relative-ci/example-vite-github-action)
- [example-vite-cli-github-action](https://github.com/relative-ci/example-vite-cli-github-action)
