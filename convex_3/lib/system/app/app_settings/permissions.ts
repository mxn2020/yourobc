// convex/lib/system/appSettings/permissions.ts
export async function canViewAppSettings(ctx, user) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireViewAppSettingsAccess(ctx, user) {
  if (!(await canViewAppSettings(ctx, user))) throw new Error('No permission');
}

export async function canEditAppSettings(ctx, user) {
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireEditAppSettingsAccess(ctx, user) {
  if (!(await canEditAppSettings(ctx, user))) throw new Error('No permission');
}
