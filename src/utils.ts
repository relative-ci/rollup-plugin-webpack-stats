import type { ExcludeFilepathConfig } from './types';

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
