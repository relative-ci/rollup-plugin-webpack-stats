import path from 'node:path';
import crypto from 'node:crypto';
import type { ChunkStats } from 'rollup-plugin-stats/extract';

const HASH_LENGTH = 7;

/**
 * Get content byte size
 */
export function getByteSize(content?: string | Uint8Array<ArrayBufferLike>): number {
  if (!content) {
    return 0;
  }

  if (typeof content === 'string') {
    return Buffer.byteLength(content);
  }

  return content?.length || 0;
}

/**
 * Generate a 7 chars hash from a filepath
 */
export function getHash(filepath: string): string {
  const digest = crypto.createHash('sha256');
  return digest.update(Buffer.from(filepath)).digest('hex').substr(0, HASH_LENGTH); 
}

export function getChunkId(chunk: ChunkStats): string {
  let value = chunk.name;

  // Use entry module relative path
  if (chunk.moduleIds?.length > 0) {
    const absoluteModulePath = chunk.moduleIds[chunk.moduleIds.length - 1];
    value = path.relative(process.cwd(), absoluteModulePath);
  }

  return getHash([chunk, value].join('-'));
}

type ExcludeFilepathParam = string | RegExp | ((filepath: string) => boolean);

export type ExcludeFilepathOption = ExcludeFilepathParam | Array<ExcludeFilepathParam>;

export function round(value: number, precision = 2) {
  const multiplier = 10 ^ precision;
  return Math.round(value * multiplier) / multiplier; 
}

const FILE_SIZE = {
  BYTE: {
    symbol: 'B',
    multiplier: 1,
  },
  KILO: {
    symbol: 'KiB',
    multiplier: 1024,
  },
  MEGA: {
    symbol: 'MiB',
    multiplier: 1024 * 1024,
  },
}

export function formatFileSize(value?: number | null): string {
  let unit = FILE_SIZE.BYTE;

  if (typeof value !== 'number') {
    return `0${unit.symbol}`;
  }

  if (value < FILE_SIZE.KILO.multiplier) {
    unit = FILE_SIZE.BYTE;
  } else if (value < FILE_SIZE.MEGA.multiplier) {
    unit = FILE_SIZE.KILO;
  } else {
    unit = FILE_SIZE.MEGA;
  }

  return `${round(value / unit.multiplier, 2)}${unit.symbol}`;
}

const DEFAULT_FILE_NAME = 'webpack-stats.json';

export function resolveFilepath(
  fileName = DEFAULT_FILE_NAME, outputDir?: string): string {
  // Check if the fileName is an absolute path
  if (path.isAbsolute(fileName)) {
    return fileName;
  }

  // If the fileName is not an absolute path, join it with the output directory or the current working directory
  return path.join(outputDir || process.cwd(), fileName);
}
