import path from 'node:path';
import fs from 'node:fs/promises';

export type StatsWriteResponse = {
  filepath: string;
  content: string;
};

export type StatsWrite = (
  filepath: string,
  stats: Record<string, unknown>
) => StatsWriteResponse;

export async function statsWrite<
  T extends Record<string, unknown> = Record<string, unknown>,
>(filepath: string, stats: T): Promise<StatsWriteResponse> {
  const content = JSON.stringify(stats, null, 2);

  // Create base directory if it does not exist
  await fs.mkdir(path.dirname(filepath), { recursive: true });

  await fs.writeFile(filepath, content);

  return {
    filepath,
    content,
  };
}
