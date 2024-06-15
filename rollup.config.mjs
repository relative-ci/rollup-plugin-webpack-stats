import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  input: {
    'index': './src/index.ts',
    'transform': './src/transform.ts',
  },
  output: {
    dir: 'dist',
    format: 'commonjs',
    sourcemap: true,
  },
  plugins: [typescript({ tsconfig: './tsconfig.json' })],
  external: ['crypto', 'path'],
});
