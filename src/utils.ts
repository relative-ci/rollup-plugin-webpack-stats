import path from 'path';
import crypto from 'crypto';
import type { OutputChunk } from 'rollup';

import type { ExcludeFilepathConfig } from './types';

const HASH_LENGTH = 7;

/**
 * Get content byte size
 */
export function getByteSize(content: string | Buffer): number {
  if (typeof content === 'string') {
    return Buffer.from(content).length;
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

export function getChunkId(chunk: OutputChunk): string {
  let value = chunk.name;

  // Use entry module relative path
  if (chunk.moduleIds?.length > 0) {
    const absoluteModulePath = chunk.moduleIds[chunk.moduleIds.length - 1];
    value = path.relative(process.cwd(), absoluteModulePath);
  }

  return getHash([chunk, value].join('-'));
}

/**
 * Check if filepath should be excluded based on a config
 */
export function checkExcludeFilepath(
  filepath: string,
  config?: ExcludeFilepathConfig | Array<ExcludeFilepathConfig>
): boolean {
  if (!config) {
    return false;
  }

  if (Array.isArray(config)) {
    let res = false;

    for (let i = 0; i <= config.length - 1 && res === false; i++) {
      res = checkExcludeFilepath(filepath, config[i]);
    }

    return res;
  }

  if (typeof config === 'function') {
    return config(filepath);
  }

  if (typeof config === 'string') {
    return Boolean(filepath.match(config));
  }

  if ('test' in config) {
    return config.test(filepath);
  }

  return false;
}
