import path from 'path';
import crypto from 'crypto';
import type { OutputChunk } from 'rollup';

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

type ExcludeFilepathParam = string | RegExp | ((filepath: string) => boolean);

export type ExcludeFilepathOption = ExcludeFilepathParam | Array<ExcludeFilepathParam>;

/**
 * Check if filepath should be excluded based on a config
 */
export function checkExcludeFilepath(
  filepath: string,
  option?: ExcludeFilepathOption,
): boolean {
  if (!option) {
    return false;
  }

  if (Array.isArray(option)) {
    let res = false;

    for (let i = 0; i <= option.length - 1 && res === false; i++) {
      res = checkExcludeFilepath(filepath, option[i]);
    }

    return res;
  }

  if (typeof option === 'function') {
    return option(filepath);
  }

  if (typeof option === 'string') {
    return Boolean(filepath.match(option));
  }

  if ('test' in option) {
    return option.test(filepath);
  }

  return false;
}
