import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: {
    'index.js': './src/index.ts',
    'transform.js': './src/transform.ts',
  },
  output: {
    dir: 'dist',
    format: 'commonjs',
    sourcemap: true,
  },
  plugins: [typescript({ tsconfig: './tsconfig.json' })],
  external: ['crypto', 'path'],
});
