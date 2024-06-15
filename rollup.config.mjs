import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

const INPUT = {
  'index': './src/index.ts',
  'transform': './src/transform.ts',
};

const OUTPUT_DIR = 'dist';

export default defineConfig([
  {
    input: INPUT,
    output: {
      dir: OUTPUT_DIR,
      format: 'esm',
      entryFileNames: '[name].esm.js',
      sourcemap: true,
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
    external: ['crypto', 'path'],
  },
  {
    input: INPUT,
    output: {
      dir: OUTPUT_DIR,
      format: 'commonjs',
      entryFileNames: '[name].cjs.js',
      sourcemap: true,
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })],
    external: ['crypto', 'path'],
  },
]);
