// convex/lib/system/appSettings/utils.ts
export function trimAppSettingData(data) {
  const trimmed = { ...data };
  if ('name' in trimmed && typeof trimmed.name === 'string') trimmed.name = trimmed.name.trim();
  if ('key' in trimmed && typeof trimmed.key === 'string') trimmed.key = trimmed.key.trim();
  return trimmed;
}

export function validateAppSettingData(data) {
  const errors = [];
  if (data.name !== undefined && !data.name.trim()) errors.push('Name is required');
  if (data.key !== undefined && !data.key.trim()) errors.push('Key is required');
  return errors;
}
