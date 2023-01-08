# rollup-plugin-webpack-stats

> > **Warning**
> Under active development

Generate rollup stats JSON file with a [bundle-stats](https://github.com/relative-ci/bundle-stats/tree/master/packages/cli) webpack [supported sructure](https://github.com/relative-ci/bundle-stats/blob/master/packages/plugin-webpack-filter/src/index.ts).

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
