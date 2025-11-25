// convex/lib/system/appSettings/utils.ts
import type { CreateAppSettingData, UpdateAppSettingData } from './types';

export function trimAppSettingData<
  T extends Partial<CreateAppSettingData | UpdateAppSettingData>
>(data: T): T {
  const trimmed: T = { ...data };
  if ('name' in trimmed && typeof trimmed.name === 'string') trimmed.name = trimmed.name.trim() as T['name'];
  if ('key' in trimmed && typeof trimmed.key === 'string') trimmed.key = trimmed.key.trim() as T['key'];
  return trimmed;
}

export function validateAppSettingData(
  data: Partial<CreateAppSettingData | UpdateAppSettingData>
): string[] {
  const errors: string[] = [];
  if (data.name !== undefined && typeof data.name === 'string' && !data.name.trim()) errors.push('Name is required');
  if ('key' in data && data.key !== undefined && typeof data.key === 'string' && !data.key.trim()) errors.push('Key is required');
  return errors;
}
