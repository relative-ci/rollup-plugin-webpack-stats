import { defineConfig } from 'vite';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
  plugins: [webpackStatsPlugin()],
});
