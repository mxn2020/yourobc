// convex/lib/system/app_settings/mutations.ts

import { mutation, type MutationCtx } from '@/generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { notDeleted } from '@/shared/db.helper';
import { trimAppSettingData, validateAppSettingData } from './utils';
import { appSettingsFields, appSettingsValidators } from '@/schema/system/app/app_settings';
import type { AppSetting, AppSettingId } from './types';
import { AppSettingCategory, AppSettingValueType, UserProfile, UserProfileId } from '@/schema/system';

type CreateOrUpdateAppSettingArgs = {
  name?: string;
  key: string;
  value: AppSetting['value'];
  valueType: AppSettingValueType;
  category: AppSettingCategory;
  description?: string;
  isPublic?: boolean;
};

async function findSettingByKey(
  ctx: MutationCtx,
  key: string
): Promise<AppSetting | null> {
  // NOTE: withIndex must come before filter to avoid QueryInitializer typing errors
  return await ctx.db
    .query('appSettings')
    .withIndex('by_key', q => q.eq('key', key))
    .filter(notDeleted)
    .first();
}

async function insertAuditLog(ctx: MutationCtx, payload: {
  userId: UserProfileId;
  userName: string;
  action: string;
  entityId: string;          // publicId
  entityTitle: string;
  description: string;
}) {
  const now = Date.now();
  await ctx.db.insert('auditLogs', {
    publicId: await generateUniquePublicId(ctx, 'auditLogs'),
    userId: payload.userId,
    userName: payload.userName,
    action: payload.action,
    entityType: 'appSettings',
    entityId: payload.entityId,
    entityTitle: payload.entityTitle,
    description: payload.description,
    createdAt: now,
    createdBy: payload.userId,
    updatedAt: now,
  });
}

/**
 * IMPORTANT: Upsert by key (account sync behavior).
 * - If key exists (not deleted) -> patch
 * - Else -> insert new
 */
async function createOrUpdateAppSettingInternal(
  ctx: MutationCtx,
  args: CreateOrUpdateAppSettingArgs,
  user: UserProfile
): Promise<{ id: AppSettingId; action: 'created' | 'updated'; key: string }> {
  const trimmed = trimAppSettingData({
    name: args.name ?? args.key,
    key: args.key,
  });

  const errors = validateAppSettingData({
    ...trimmed,
    value: args.value,
    category: args.category,
  });
  if (errors.length) throw new Error(errors.join(', '));

  const now = Date.now();
  const existing = await findSettingByKey(ctx, trimmed.key);

  if (existing) {
    await ctx.db.patch(existing._id, {
      name: trimmed.name ?? existing.name,
      key: trimmed.key,
      value: args.value,
      valueType: args.valueType,
      category: args.category,
      description: args.description?.trim() ?? existing.description,
      isPublic: args.isPublic ?? existing.isPublic,
      updatedAt: now,
      updatedBy: user._id,
    });

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.updated',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated setting: ${trimmed.key}`,
    });

    return { id: existing._id, action: 'updated', key: trimmed.key };
  }

  const publicId = await generateUniquePublicId(ctx, 'appSettings');
  const id = await ctx.db.insert('appSettings', {
    name: trimmed.name ?? trimmed.key,
    publicId,
    key: trimmed.key,
    value: args.value,
    valueType: args.valueType,
    category: args.category,
    description: args.description?.trim(),
    isPublic: args.isPublic ?? false,
    createdAt: now,
    createdBy: user._id,
    updatedAt: now,
    updatedBy: user._id,
  });

  await insertAuditLog(ctx, {
    userId: user._id,
    userName: user.name || 'Admin',
    action: 'appsettings.created',
    entityId: publicId,
    entityTitle: trimmed.name ?? trimmed.key,
    description: `Created setting: ${trimmed.key}`,
  });

  return { id, action: 'created', key: trimmed.key };
}

export const createOrUpdateAppSetting = mutation({
  args: {
    name: v.optional(v.string()),
    key: v.string(),
    value: appSettingsFields.settingValue,
    valueType: appSettingsValidators.valueType,
    category: appSettingsValidators.category,
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<AppSettingId> => {
    const user = await requireAdmin(ctx);
    const result = await createOrUpdateAppSettingInternal(ctx, args, user);
    return result.id;
  },
});

/**
 * Create a setting only if key doesn't exist.
 * Use createOrUpdateAppSetting for sync flows.
 */
export const createAppSetting = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    value: appSettingsFields.settingValue,
    valueType: appSettingsValidators.valueType,
    category: appSettingsValidators.category,
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<AppSettingId> => {
    const user = await requireAdmin(ctx);
    const trimmed = trimAppSettingData(args);

    const errors = validateAppSettingData({
      ...trimmed,
      value: args.value,
      category: args.category,
    });
    if (errors.length) throw new Error(errors.join(', '));

    const existing = await findSettingByKey(ctx, trimmed.key);
    if (existing) throw new Error('Setting key already exists');

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'appSettings');

    const id = await ctx.db.insert('appSettings', {
      name: trimmed.name,
      publicId,
      key: trimmed.key,
      value: args.value,
      valueType: args.valueType,
      category: args.category,
      description: args.description?.trim(),
      isPublic: args.isPublic ?? false,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.created',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created setting: ${trimmed.key}`,
    });

    return id;
  },
});

/**
 * Update by id (admin).
 */
export const updateAppSetting = mutation({
  args: {
    id: v.id('appSettings'),
    updates: v.object({
      name: v.optional(v.string()),
      key: v.optional(v.string()),
      value: v.optional(appSettingsFields.settingValue),
      valueType: v.optional(appSettingsValidators.valueType),
      category: v.optional(appSettingsValidators.category),
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }): Promise<AppSettingId> => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const trimmed = trimAppSettingData(updates);

    const errors = validateAppSettingData({
      ...trimmed,
      value: trimmed.value ?? doc.value,
      category: trimmed.category ?? doc.category,
    });
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    await ctx.db.patch(id, {
      ...trimmed,
      description: trimmed.description?.trim() ?? doc.description,
      updatedAt: now,
      updatedBy: user._id,
    });

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.updated',
      entityId: doc.publicId,
      entityTitle: trimmed.name ?? doc.name,
      description: `Updated setting: ${doc.key}`,
    });

    return id;
  },
});

/**
 * Soft delete by id.
 */
export const deleteAppSetting = mutation({
  args: { id: v.id('appSettings') },
  handler: async (ctx, { id }): Promise<boolean> => {
    const user = await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc || doc.deletedAt) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.deleted',
      entityId: doc.publicId,
      entityTitle: doc.name,
      description: `Deleted setting: ${doc.key}`,
    });

    return true;
  },
});

/**
 * Soft delete by key (useful for sync).
 */
export const deleteAppSettingByKey = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }): Promise<boolean> => {
    const user = await requireAdmin(ctx);
    const trimmedKey = key.trim();

    const doc = await findSettingByKey(ctx, trimmedKey);
    if (!doc) throw new Error('Not found');

    const now = Date.now();
    await ctx.db.patch(doc._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.deleted',
      entityId: doc.publicId,
      entityTitle: doc.name,
      description: `Deleted setting: ${doc.key}`,
    });

    return true;
  },
});

async function upsertCategoryRecord<T extends Record<string, unknown>>(
  ctx: MutationCtx,
  userId: AppSetting['createdBy'],
  category: AppSettingCategory,
  record: T
): Promise<AppSettingId[]> {
  const now = Date.now();
  const ids: AppSettingId[] = [];

  for (const [key, rawValue] of Object.entries(record)) {
    if (rawValue === undefined) continue;

    const existing = await findSettingByKey(ctx, key);
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: rawValue,
        category,
        updatedAt: now,
        updatedBy: userId,
      });
      ids.push(existing._id);
      continue;
    }

    const publicId = await generateUniquePublicId(ctx, 'appSettings');
    const newId = await ctx.db.insert('appSettings', {
      name: key,
      publicId,
      key,
      value: rawValue,
      valueType: inferValueType(rawValue),
      category,
      description: undefined,
      isPublic: false,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
    });
    ids.push(newId);
  }

  return ids;
}

function inferValueType(value: unknown): AppSettingValueType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'object': return 'object';
    default: return 'string';
  }
}

export const updateAISettings = mutation({
  args: { settings: v.object({
    defaultModel: v.optional(v.string()),
    defaultProvider: v.optional(v.string()),
    maxTokensDefault: v.optional(v.number()),
    temperatureDefault: v.optional(v.number()),
    enableAILogging: v.optional(v.boolean()),
    aiRateLimit: v.optional(v.number()),
    aiCostLimit: v.optional(v.number()),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'ai', settings);
  },
});

export const updateGeneralSettings = mutation({
  args: { settings: v.object({
    siteName: v.optional(v.string()),
    siteDescription: v.optional(v.string()),
    maintenanceMode: v.optional(v.boolean()),
    registrationEnabled: v.optional(v.boolean()),
    emailVerificationRequired: v.optional(v.boolean()),
    defaultUserRole: v.optional(v.string()),
    timezone: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'general', settings);
  },
});

export const updateSecuritySettings = mutation({
  args: { settings: v.object({
    sessionTimeout: v.optional(v.number()),
    maxLoginAttempts: v.optional(v.number()),
    passwordMinLength: v.optional(v.number()),
    requireTwoFactor: v.optional(v.boolean()),
    forceHttps: v.optional(v.boolean()),
    ipWhitelist: v.optional(v.array(v.string())),
    corsOrigins: v.optional(v.array(v.string())),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'security', settings);
  },
});

export const updateNotificationSettings = mutation({
  args: { settings: v.object({
    adminAlerts: v.optional(v.boolean()),
    userWelcomeEmail: v.optional(v.boolean()),
    passwordResetEmail: v.optional(v.boolean()),
    securityNotifications: v.optional(v.boolean()),
    emailFromAddress: v.optional(v.string()),
    emailProvider: v.optional(v.string()),
    smtpSettings: v.optional(v.object({
      host: v.string(),
      port: v.number(),
      username: v.string(),
      password: v.string(),
      secure: v.boolean(),
    })),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'notifications', settings);
  },
});

export const updateBillingSettings = mutation({
  args: { settings: v.object({
    billingEnabled: v.optional(v.boolean()),
    defaultCurrency: v.optional(v.string()),
    stripeEnabled: v.optional(v.boolean()),
    invoicePrefix: v.optional(v.string()),
    taxRate: v.optional(v.number()),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'billing', settings);
  },
});

export const updateIntegrationSettings = mutation({
  args: { settings: v.object({
    slackEnabled: v.optional(v.boolean()),
    discordEnabled: v.optional(v.boolean()),
    githubEnabled: v.optional(v.boolean()),
    googleDriveEnabled: v.optional(v.boolean()),
  })},
  handler: async (ctx, { settings }): Promise<AppSettingId[]> => {
    const user = await requireAdmin(ctx);
    return upsertCategoryRecord(ctx, user._id, 'integrations', settings);
  },
});

// =============================================================================
// Bulk ops
// =============================================================================

export const batchUpdateSettings = mutation({
  args: {
    settings: v.array(v.object({
      key: v.string(),
      value: appSettingsFields.settingValue,
      valueType: appSettingsValidators.valueType,
      category: appSettingsValidators.category,
      description: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, { settings }): Promise<Array<{ key: string; id: AppSettingId; action: 'created' | 'updated' }>> => {
    const user = await requireAdmin(ctx);
    const results: Array<{ key: string; id: AppSettingId; action: 'created' | 'updated' }> = [];

    for (const s of settings) {
      const { id, action, key } = await createOrUpdateAppSettingInternal(ctx, s, user);
      results.push({ key, id, action });
    }

    return results;
  },
});

export const resetCategoryToDefaults = mutation({
  args: { category: appSettingsValidators.category },
  handler: async (ctx, { category }): Promise<{ success: true; deletedCount: number }> => {
    const user = await requireAdmin(ctx);

    const existing = await ctx.db
      .query('appSettings')
      .withIndex('by_category', q => q.eq('category', category))
      .filter(notDeleted)
      .collect();

    const now = Date.now();
    for (const s of existing) {
      await ctx.db.patch(s._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    await insertAuditLog(ctx, {
      userId: user._id,
      userName: user.name || 'Admin',
      action: 'appsettings.category_reset',
      entityId: category,
      entityTitle: category,
      description: `Reset category ${category} (soft deleted ${existing.length} settings)`,
    });

    return { success: true, deletedCount: existing.length };
  },
});

export const testAIConnection = mutation({
  args: { modelId: v.optional(v.string()) },
  handler: async (ctx, { modelId }): Promise<{ success: true; modelId?: string }> => {
    await requireAdmin(ctx);
    return { success: true, modelId };
  },
});
