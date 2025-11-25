// convex/lib/system/email/configs/mutations.ts
// Write operations for email configs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { emailValidators, emailFields } from '@/schema/system/email/validators';
import { EMAIL_CONFIGS_CONSTANTS } from './constants';
import { validateEmailConfigData, trimEmailConfigData } from './utils';
import {
  requireCreateEmailConfigAccess,
  requireEditEmailConfigAccess,
  requireDeleteEmailConfigAccess,
} from './permissions';
import type { EmailConfigId } from './types';
import { createAuditLog } from '../../core/audit_logs/helpers';

/**
 * Create or update email provider configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const saveEmailConfig = mutation({
  args: {
    name: v.optional(v.string()),
    provider: emailValidators.provider,
    config: v.object({
      apiKey: v.optional(v.string()),
      apiSecret: v.optional(v.string()),
      domain: v.optional(v.string()),
      region: v.optional(v.string()),
      fromEmail: v.string(),
      fromName: v.string(),
      replyToEmail: v.optional(v.string()),
      additionalSettings: v.optional(v.any()),
    }),
    setAsActive: v.optional(v.boolean()),
    metadata: v.optional(emailFields.configMetadata),
  },
  handler: async (ctx, args): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateEmailConfigAccess(user);

    // 3. VALIDATE: Check data validity
    const configName = args.name?.trim() || `${args.provider} Configuration`;
    const data = { name: configName, provider: args.provider, config: args.config };
    const trimmedData = trimEmailConfigData(data);
    const errors = validateEmailConfigData(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Extract trimmed values
    const trimmedConfig = trimmedData.config;

    const now = Date.now();

    // 5. PROCESS: If setting as active, deactivate all other configs
    if (args.setAsActive) {
      const existingConfigs = await ctx.db
        .query('emailConfigs')
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();

      for (const config of existingConfigs) {
        await ctx.db.patch(config._id, {
          isActive: false,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    }

    // 6. CHECK: If a config for this provider already exists
    const existingConfig = await ctx.db
      .query('emailConfigs')
      .withIndex('by_provider', (q) => q.eq('provider', args.provider))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existingConfig) {
      // 7a. UPDATE: Existing config
      await ctx.db.patch(existingConfig._id, {
        name: configName,
        config: trimmedConfig,
        isActive: args.setAsActive ?? existingConfig.isActive,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 8a. AUDIT: Create audit log
      await createAuditLog(ctx, {
        action: 'email_config.updated',
        entityType: 'system_email_config',
        entityId: existingConfig._id,
        entityTitle: configName,
        description: `Updated email configuration for ${args.provider}`,
        metadata: {
          operation: 'update_email_config',
          newValues: {
            provider: args.provider,
            fromEmail: trimmedConfig.fromEmail,
          },
        },
      });

      // 9a. RETURN: Config ID
      return existingConfig._id;
    } else {
      // 7b. CREATE: Generate IDs and prepare data
      const publicId = await generateUniquePublicId(ctx, 'emailConfigs');

      // 8b. CREATE: Insert new config
      const configId = await ctx.db.insert('emailConfigs', {
        publicId,
        name: configName,
        provider: args.provider,
        isActive: args.setAsActive ?? false,
        config: trimmedConfig,
        isVerified: false,
        status: 'active',
        settings: {
          enableLogging: true,
          maxRetries: 3,
        },
        ownerId: user._id,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 9b. AUDIT: Create audit log
      await createAuditLog(ctx, {
        action: 'email_config.created',
        entityType: 'system_email_config',
        entityId: configId,
        entityTitle: configName,
        description: `Created email configuration for ${args.provider}`,
        metadata: {
          operation: 'create_email_config',
          newValues: {
            provider: args.provider,
            fromEmail: trimmedConfig.fromEmail,
          },
        },
      });

      // 10b. RETURN: Config ID
      return configId;
    }
  },
});

/**
 * Update existing email config
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateEmailConfig = mutation({
  args: {
    configId: v.id('emailConfigs'),
    updates: v.object({
      name: v.optional(v.string()),
      config: v.optional(v.object({
        apiKey: v.optional(v.string()),
        apiSecret: v.optional(v.string()),
        domain: v.optional(v.string()),
        region: v.optional(v.string()),
        fromEmail: v.string(),
        fromName: v.string(),
        replyToEmail: v.optional(v.string()),
        additionalSettings: v.optional(v.any()),
      })),
      status: v.optional(emailValidators.status),
      isActive: v.optional(v.boolean()),
      settings: v.optional(v.object({
        enableLogging: v.optional(v.boolean()),
        rateLimitPerHour: v.optional(v.number()),
        maxRetries: v.optional(v.number()),
      })),
    }),
  },
  handler: async (ctx, { configId, updates }): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Email configuration not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmailConfigAccess(ctx, config, user);

    // 4. VALIDATE: Check update data validity
    const trimmedUpdates = trimEmailConfigData(updates);
    const errors = validateEmailConfigData(trimmedUpdates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    };

    if (trimmedUpdates.name !== undefined) {
      updateData.name = trimmedUpdates.name;
    }
    if (trimmedUpdates.config !== undefined) {
      updateData.config = trimmedUpdates.config;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.settings !== undefined) {
      updateData.settings = updates.settings;
    }

    // Handle isActive separately
    if (updates.isActive !== undefined && updates.isActive) {
      // Deactivate all other configs first
      const existingConfigs = await ctx.db
        .query('emailConfigs')
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();

      for (const existingConfig of existingConfigs) {
        if (existingConfig._id !== configId) {
          await ctx.db.patch(existingConfig._id, {
            isActive: false,
            updatedAt: now,
            updatedBy: user._id,
          });
        }
      }
      updateData.isActive = true;
    } else if (updates.isActive !== undefined) {
      updateData.isActive = false;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(configId, updateData);

    // 7. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.updated',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: updateData.name || config.name,
      description: `Updated email configuration: ${updateData.name || config.name}`,
      metadata: {
        operation: 'update_email_config',
        oldValues: {
          name: config.name,
          status: config.status,
          isActive: config.isActive,
        },
        newValues: {
          name: updateData.name,
          status: updateData.status,
          isActive: updateData.isActive,
        },
        changedFields: Object.keys(updates),
      },
    });

    // 8. RETURN: Config ID
    return configId;
  },
});

/**
 * Set a configuration as active
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const setActiveConfig = mutation({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get config
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Configuration not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmailConfigAccess(ctx, config, user);

    const now = Date.now();

    // 4. PROCESS: Deactivate all other configs
    const existingConfigs = await ctx.db
      .query('emailConfigs')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    for (const existingConfig of existingConfigs) {
      await ctx.db.patch(existingConfig._id, {
        isActive: false,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // 5. UPDATE: Activate this config
    await ctx.db.patch(configId, {
      isActive: true,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.activated',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: config.name,
      description: `Activated email configuration for ${config.provider}`,
      metadata: {
        operation: 'set_active_config',
        newValues: {
          provider: config.provider,
        },
      },
    });

    // 7. RETURN: Config ID
    return configId;
  },
});

/**
 * Update test status after testing connection
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateTestStatus = mutation({
  args: {
    configId: v.id('emailConfigs'),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { configId, success, error }): Promise<{ success: boolean }> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get config
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Configuration not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmailConfigAccess(ctx, config, user);

    // 4. PROCESS: Trim error message
    const trimmedError = error?.trim();

    const now = Date.now();

    // 5. UPDATE: Update test status
    await ctx.db.patch(configId, {
      isVerified: success,
      lastTestAt: now,
      lastTestStatus: success ? 'success' : 'failed',
      lastTestError: trimmedError,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.test_updated',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: config.name,
      description: `Email configuration test ${success ? 'succeeded' : 'failed'}: ${config.name}`,
      metadata: {
        operation: 'test_email_config',
        oldValues: {
          isVerified: config.isVerified,
          lastTestStatus: config.lastTestStatus,
        },
        newValues: {
          isVerified: success,
          lastTestStatus: success ? 'success' : 'failed',
          lastTestError: trimmedError,
        },
        testDetails: {
          provider: config.provider,
          success,
          error: trimmedError || null,
        },
      },
    });

    // 7. RETURN: Success
    return { success: true };
  },
});

/**
 * Delete an email configuration (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteEmailConfig = mutation({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get config
    const config = await ctx.db.get(configId);
    if (!config || config.deletedAt) {
      throw new Error('Configuration not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmailConfigAccess(config, user);

    const now = Date.now();

    // 4. SOFT DELETE: Mark as deleted
    await ctx.db.patch(configId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.deleted',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: config.name,
      description: `Deleted email configuration for ${config.provider}`,
      metadata: {
        operation: 'delete_email_config',
        newValues: {
          provider: config.provider,
        },
      },
    });

    // 6. RETURN: Config ID
    return configId;
  },
});

/**
 * Restore soft-deleted email config
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const restoreEmailConfig = mutation({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const config = await ctx.db.get(configId);
    if (!config) {
      throw new Error('Email configuration not found');
    }
    if (!config.deletedAt) {
      throw new Error('Email configuration is not deleted');
    }

    // 3. AUTHZ: Check edit permission
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required to restore email configurations');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(configId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.restored',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: config.name,
      description: `Restored email configuration: ${config.name}`,
    });

    // 6. RETURN: Config ID
    return configId;
  },
});
