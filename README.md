# rollup-plugin-webpack-stats

> **Warning**
> Under active development

[![](https://img.shields.io/npm/v/rollup-plugin-webpack-stats.svg)](https://www.npmjs.com/package/rollup-plugin-webpack-stats)
![](https://img.shields.io/node/v/rollup-plugin-webpack-stats.svg)
[![CI](https://github.com/vio/rollup-plugin-webpack-stats/actions/workflows/main.yml/badge.svg)](https://github.com/vio/rollup-plugin-webpack-stats/actions/workflows/main.yml)

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
