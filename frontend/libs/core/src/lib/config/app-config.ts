import { InjectionToken } from '@angular/core';
import type { AppConfig } from '@erp/contracts';

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

export const DEFAULT_APP_CONFIG: AppConfig = {
  environmentName: 'Development',
  apiBaseUrl: 'http://localhost:5080',
};

export function isAppConfig(value: unknown): value is AppConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['apiBaseUrl'] === 'string' &&
    typeof candidate['environmentName'] === 'string'
  );
}

export async function loadAppConfig(
  url = '/config.json',
): Promise<AppConfig> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.warn(
        `Failed to load app config from ${url} (${response.status}); using defaults.`,
      );
      return DEFAULT_APP_CONFIG;
    }
    const json: unknown = await response.json();
    if (!isAppConfig(json)) {
      console.warn(`Invalid app config at ${url}; using defaults.`);
      return DEFAULT_APP_CONFIG;
    }
    return {
      environmentName: json.environmentName,
      apiBaseUrl: json.apiBaseUrl.replace(/\/$/, ''),
    };
  } catch (error) {
    console.warn(`Error loading app config from ${url}; using defaults.`, error);
    return DEFAULT_APP_CONFIG;
  }
}
