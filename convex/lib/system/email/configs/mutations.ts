// convex/lib/system/email/configs/mutations.ts
// Write operations for email configs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, generateUniquePublicId } from '@/shared/auth.helper';
import { emailConfigsValidators } from '@/schema/system/email/configs/validators';
import { EMAIL_CONFIGS_CONSTANTS } from './constants';
import { validateEmailConfigData } from './utils';
import {
  requireCreateEmailConfigAccess,
  requireEditEmailConfigAccess,
  requireDeleteEmailConfigAccess,
} from './permissions';
import type { EmailConfigId } from './types';
import { createAuditLog } from '../../audit_logs/helpers';

/**
 * Create new email provider configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const createEmailConfig = mutation({
  args: {
    data: v.object({
      name: v.string(),
      provider: emailConfigsValidators.provider,
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
      status: v.optional(emailConfigsValidators.status),
    }),
  },
  handler: async (ctx, { data }): Promise<EmailConfigId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateEmailConfigAccess(user);

    // 3. VALIDATE: Check data validity
    const errors = validateEmailConfigData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'emailConfigs');
    const now = Date.now();

    // Trim string fields
    const trimmedConfig = {
      ...data.config,
      apiKey: data.config.apiKey?.trim(),
      apiSecret: data.config.apiSecret?.trim(),
      domain: data.config.domain?.trim(),
      region: data.config.region?.trim(),
      fromEmail: data.config.fromEmail.trim(),
      fromName: data.config.fromName.trim(),
      replyToEmail: data.config.replyToEmail?.trim(),
    };

    // If setting as active, deactivate all other configs
    if (data.setAsActive) {
      const existingConfigs = await ctx.db
        .query('emailConfigs')
        .withIndex('by_active', (q) => q.eq('isActive', true))
        .collect();

      for (const config of existingConfigs) {
        await ctx.db.patch(config._id, {
          isActive: false,
          updatedAt: now,
          updatedBy: user._id,
        });
      }
    }

    // 5. CREATE: Insert into database
    const configId = await ctx.db.insert('emailConfigs', {
      publicId,
      name: data.name.trim(),
      provider: data.provider,
      isActive: data.setAsActive ?? false,
      config: trimmedConfig,
      isVerified: false,
      status: data.status || 'active',
      settings: {
        enableLogging: true,
        maxRetries: 3,
      },
      metadata: {},
      ownerId: user._id,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.created',
      entityType: 'system_email_config',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created email configuration: ${data.name.trim()}`,
      metadata: {
        provider: data.provider,
        fromEmail: trimmedConfig.fromEmail,
      },
    });

    // 7. RETURN: Return entity ID
    return configId;
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
      status: v.optional(emailConfigsValidators.status),
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
    const errors = validateEmailConfigData(updates);
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

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.config !== undefined) {
      updateData.config = {
        ...updates.config,
        apiKey: updates.config.apiKey?.trim(),
        apiSecret: updates.config.apiSecret?.trim(),
        domain: updates.config.domain?.trim(),
        region: updates.config.region?.trim(),
        fromEmail: updates.config.fromEmail.trim(),
        fromName: updates.config.fromName.trim(),
        replyToEmail: updates.config.replyToEmail?.trim(),
      };
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
      metadata: { changes: updates },
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

    // 6. RETURN: Success
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
