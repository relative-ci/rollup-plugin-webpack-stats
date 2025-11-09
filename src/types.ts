import type { Plugin as RollupPlugin, OutputOptions as RollupOutputOptions } from 'rollup';
import type { Plugin as VitePlugin } from 'vite';

export type Plugin = RollupPlugin | VitePlugin;
export type OutputOptions = RollupOutputOptions;
