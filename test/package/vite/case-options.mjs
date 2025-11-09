import { basename } from 'path';
import { defineConfig } from 'vite';
import webpackStats from 'rollup-plugin-webpack-stats';

const baseConfig = {
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
};

export default defineConfig([
  {
    ...baseConfig,
    plugins: [webpackStats()],
  },
  {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      outDir: 'dist2',
    },
    plugins: [
      // A contrived demo to show that plugin options can access vite outputOptions
      webpackStats((outputOptions) => {
        return {
          fileName: `stats-${basename(outputOptions.dir)}.json`,
        };
      }),
    ],
  },
]);
