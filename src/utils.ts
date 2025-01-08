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
