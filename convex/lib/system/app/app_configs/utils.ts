// convex/lib/system/appConfigs/utils.ts
// Utility functions for appConfigs module

import { APPCONFIGS_CONSTANTS } from './constants';
import type { CreateAppConfigData, UpdateAppConfigData } from './types';

export function trimAppConfigData<T extends Partial<CreateAppConfigData | UpdateAppConfigData>>(data: T): T {
  const trimmed = { ...data };
  if ('name' in trimmed && typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as any;
  }
  if ('feature' in trimmed && typeof trimmed.feature === 'string') {
    trimmed.feature = trimmed.feature.trim() as any;
  }
  if ('key' in trimmed && typeof trimmed.key === 'string') {
    trimmed.key = trimmed.key.trim() as any;
  }
  if ('description' in trimmed && typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as any;
  }
  return trimmed;
}

export function validateAppConfigData(data: Partial<CreateAppConfigData | UpdateAppConfigData>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) errors.push('Name is required');
    if (name.length < APPCONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH)
      errors.push(`Name must be at least ${APPCONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    if (name.length > APPCONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH)
      errors.push(`Name cannot exceed ${APPCONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
  }

  return errors;
}
