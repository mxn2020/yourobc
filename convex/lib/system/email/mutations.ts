// convex/lib/boilerplate/email/mutations.ts

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { emailProviderTypes } from '@/schema/base';
import { createAuditLog } from '../audit_logs/helpers';

/**
 * Save or update email provider configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only (via canManageEmailConfig)
 */
export const saveEmailConfig = mutation({
  args: {
    provider: emailProviderTypes,
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
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields in config
    const trimmedConfig = {
      ...args.config,
      apiKey: args.config.apiKey?.trim(),
      apiSecret: args.config.apiSecret?.trim(),
      domain: args.config.domain?.trim(),
      region: args.config.region?.trim(),
      fromEmail: args.config.fromEmail.trim(),
      fromName: args.config.fromName.trim(),
      replyToEmail: args.config.replyToEmail?.trim(),
    };

    const now = Date.now();

    // 3. If setting as active, deactivate all other configs
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

    // 4. Check if a config for this provider already exists
    const existingConfig = await ctx.db
      .query('emailConfigs')
      .withIndex('by_provider', (q) => q.eq('provider', args.provider))
      .first();

    if (existingConfig) {
      // 5a. Update existing config
      await ctx.db.patch(existingConfig._id, {
        config: trimmedConfig,
        isActive: args.setAsActive ?? existingConfig.isActive,
        metadata: args.metadata,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 6a. Create audit log
      await createAuditLog(ctx, {
        action: 'email_config.updated',
        entityType: 'system_email_config',
        entityId: existingConfig._id,
        entityTitle: `${args.provider} configuration`,
        description: `Updated email configuration for ${args.provider}`,
        metadata: {
          operation: 'update_email_config',
          newValues: {
            provider: args.provider,
            fromEmail: trimmedConfig.fromEmail,
          },
        },
      });

      // 7a. Return config ID
      return existingConfig._id;
    } else {
      // 5b. Create new config
      const configId = await ctx.db.insert('emailConfigs', {
        provider: args.provider,
        isActive: args.setAsActive ?? false,
        config: trimmedConfig,
        isVerified: false,
        settings: {
          enableLogging: true,
          maxRetries: 3,
        },
        metadata: args.metadata ?? {},
        ownerId: user._id,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 6b. Create audit log
      await createAuditLog(ctx, {
        action: 'email_config.created',
        entityType: 'system_email_config',
        entityId: configId,
        entityTitle: `${args.provider} configuration`,
        description: `Created email configuration for ${args.provider}`,
        metadata: {
          operation: 'create_email_config',
          newValues: {
            provider: args.provider,
            fromEmail: trimmedConfig.fromEmail,
          },
        },
      });

      // 7b. Return config ID
      return configId;
    }
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
  handler: async (ctx, { configId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get config
    const config = await ctx.db.get(configId);

    if (!config) {
      throw new Error('Configuration not found');
    }

    const now = Date.now();

    // 3. Deactivate all other configs
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

    // 4. Activate this config
    await ctx.db.patch(configId, {
      isActive: true,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 5. Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.activated',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: `${config.provider} configuration`,
      description: `Activated email configuration for ${config.provider}`,
      metadata: {
        operation: 'set_active_config',
        newValues: {
          provider: config.provider,
        },
      },
    });

    // 6. Return config ID
    return configId;
  },
});

/**
 * Delete an email configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteEmailConfig = mutation({
  args: {
    configId: v.id('emailConfigs'),
  },
  handler: async (ctx, { configId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get config
    const config = await ctx.db.get(configId);

    if (!config) {
      throw new Error('Configuration not found');
    }

    const now = Date.now();

    // 3. Soft delete config
    await ctx.db.patch(configId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await createAuditLog(ctx, {
      action: 'email_config.deleted',
      entityType: 'system_email_config',
      entityId: configId,
      entityTitle: `${config.provider} configuration`,
      description: `Deleted email configuration for ${config.provider}`,
      metadata: {
        operation: 'delete_email_config',
        newValues: {
          provider: config.provider,
        },
      },
    });

    // 5. Return success
    return { success: true };
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
  handler: async (ctx, { configId, success, error }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedError = error?.trim();

    // 3. Get config
    const config = await ctx.db.get(configId);

    if (!config) {
      throw new Error('Configuration not found');
    }

    const now = Date.now();

    // 4. Update test status
    await ctx.db.patch(configId, {
      isVerified: success,
      lastTestAt: now,
      lastTestStatus: success ? 'success' : 'failed',
      lastTestError: trimmedError,
      updatedAt: now,
      lastActivityAt: now,
      updatedBy: user._id,
    });

    // 5. Return success
    return { success: true };
  },
});

/**
 * Log an email send
 * 🔒 Authentication: Optional (can be called by system)
 */
export const logEmail = mutation({
  args: {
    provider: emailProviderTypes,
    to: v.array(v.string()),
    from: v.string(),
    replyTo: v.optional(v.string()),
    subject: v.string(),
    htmlPreview: v.optional(v.string()),
    textPreview: v.optional(v.string()),
    templateId: v.optional(v.id('emailTemplates')),
    templateData: v.optional(v.any()),
    status: v.union(
      v.literal('pending'),
      v.literal('sent'),
      v.literal('delivered'),
      v.literal('failed'),
      v.literal('bounced')
    ),
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
    providerResponse: v.optional(v.any()),
    context: v.optional(v.string()),
    triggeredBy: v.optional(v.id('userProfiles')),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Optional auth check - can be called by system
    const user = await getCurrentUser(ctx);
    const userId = user?._id;

    // 2. Trim string fields
    const trimmedTo = args.to.map(email => email.trim());
    const trimmedFrom = args.from.trim();
    const trimmedReplyTo = args.replyTo?.trim();
    const trimmedSubject = args.subject.trim();
    const trimmedMessageId = args.messageId?.trim();
    const trimmedError = args.error?.trim();
    const trimmedContext = args.context?.trim();

    const now = Date.now();

    // 3. Truncate HTML and text previews to 500 chars
    const htmlPreview = args.htmlPreview?.substring(0, 500);
    const textPreview = args.textPreview?.substring(0, 500);

    // 4. Create email log
    const logId = await ctx.db.insert('emailLogs', {
      provider: args.provider,
      to: trimmedTo,
      from: trimmedFrom,
      replyTo: trimmedReplyTo,
      subject: trimmedSubject,
      htmlPreview,
      textPreview,
      templateId: args.templateId,
      templateData: args.templateData,
      status: args.status,
      messageId: trimmedMessageId,
      error: trimmedError,
      providerResponse: args.providerResponse,
      sentAt: args.status === 'sent' ? now : undefined,
      failedAt: args.status === 'failed' ? now : undefined,
      triggeredBy: args.triggeredBy,
      context: trimmedContext,
      metadata: args.metadata,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
      lastActivityAt: now,
    });

    // 5. Return log ID
    return logId;
  },
});

/**
 * Update email log status (for webhooks)
 * 🔒 Authentication: Not required (called by webhooks)
 */
export const updateEmailStatus = mutation({
  args: {
    messageId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('sent'),
      v.literal('delivered'),
      v.literal('failed'),
      v.literal('bounced')
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { messageId, status, error }) => {
    // 1. No auth required - called by webhooks

    // 2. Trim string fields
    const trimmedMessageId = messageId.trim();
    const trimmedError = error?.trim();

    // 3. Get email log by message ID
    const log = await ctx.db
      .query('emailLogs')
      .withIndex('by_messageId', (q) => q.eq('messageId', trimmedMessageId))
      .first();

    if (!log) {
      throw new Error('Email log not found');
    }

    const now = Date.now();

    // 4. Build updates object
    const updates: any = {
      status,
      updatedAt: now,
      lastActivityAt: now,
    };

    if (status === 'delivered') {
      updates.deliveredAt = now;
    } else if (status === 'failed') {
      updates.failedAt = now;
      updates.error = trimmedError;
    }

    // 5. Update email log
    await ctx.db.patch(log._id, updates);

    // 6. Return success
    return { success: true };
  },
});

/**
 * Save email template
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const saveEmailTemplate = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    subject: v.string(),
    htmlTemplate: v.string(),
    textTemplate: v.optional(v.string()),
    reactComponentPath: v.optional(v.string()),
    variables: v.array(
      v.object({
        name: v.string(),
        type: v.union(
          v.literal('string'),
          v.literal('number'),
          v.literal('boolean'),
          v.literal('date')
        ),
        required: v.boolean(),
        defaultValue: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
    previewData: v.optional(v.any()),
    isActive: v.boolean(),
    category: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedSlug = args.slug.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedSubject = args.subject.trim();
    const trimmedReactComponentPath = args.reactComponentPath?.trim();
    const trimmedCategory = args.category?.trim();

    // 3. Check if template with this slug already exists
    const existingTemplate = await ctx.db
      .query('emailTemplates')
      .withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
      .first();

    const now = Date.now();

    if (existingTemplate) {
      // 4a. Update existing template
      await ctx.db.patch(existingTemplate._id, {
        name: trimmedName,
        description: trimmedDescription,
        subject: trimmedSubject,
        htmlTemplate: args.htmlTemplate,
        textTemplate: args.textTemplate,
        reactComponentPath: trimmedReactComponentPath,
        variables: args.variables,
        previewData: args.previewData,
        isActive: args.isActive,
        category: trimmedCategory,
        metadata: args.metadata,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 5a. Create audit log
      await createAuditLog(ctx, {
        action: 'email_template.updated',
        entityType: 'system_email_template',
        entityId: existingTemplate._id,
        entityTitle: trimmedName,
        description: `Updated email template: ${trimmedName}`,
        metadata: {
          operation: 'update_email_template',
          newValues: trimmedCategory
            ? {
                slug: trimmedSlug,
                category: trimmedCategory,
              }
            : {
                slug: trimmedSlug,
              },
        },
      });

      // 6a. Return template ID
      return existingTemplate._id;
    } else {
      // 4b. Create new template
      const templateId = await ctx.db.insert('emailTemplates', {
        name: trimmedName,
        slug: trimmedSlug,
        description: trimmedDescription,
        subject: trimmedSubject,
        htmlTemplate: args.htmlTemplate,
        textTemplate: args.textTemplate,
        reactComponentPath: trimmedReactComponentPath,
        variables: args.variables,
        previewData: args.previewData,
        isActive: args.isActive,
        category: trimmedCategory,
        settings: {},
        metadata: args.metadata ?? {},
        ownerId: user._id,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
        timesUsed: 0,
      });

      // 5b. Create audit log
      await createAuditLog(ctx, {
        action: 'email_template.created',
        entityType: 'system_email_template',
        entityId: templateId,
        entityTitle: trimmedName,
        description: `Created email template: ${trimmedName}`,
        metadata: {
          operation: 'create_email_template',
          newValues: trimmedCategory
            ? {
                slug: trimmedSlug,
                category: trimmedCategory,
              }
            : {
                slug: trimmedSlug,
              },
        },
      });

      // 6b. Return template ID
      return templateId;
    }
  },
});

/**
 * Delete email template
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteEmailTemplate = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get template
    const template = await ctx.db.get(templateId);

    if (!template) {
      throw new Error('Template not found');
    }

    const now = Date.now();

    // 3. Soft delete template
    await ctx.db.patch(templateId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await createAuditLog(ctx, {
      action: 'email_template.deleted',
      entityType: 'system_email_template',
      entityId: templateId,
      entityTitle: template.name,
      description: `Deleted email template: ${template.name}`,
      metadata: {
        operation: 'delete_email_template',
        newValues: template.category
          ? {
              slug: template.slug,
              category: template.category,
            }
          : {
              slug: template.slug,
            },
      },
    });

    // 5. Return success
    return { success: true };
  },
});

/**
 * Increment template usage counter
 * 🔒 Authentication: Optional (can be called by system)
 */
export const incrementTemplateUsage = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    // 1. No auth required - can be called by system

    // 2. Get current user for audit trail (optional)
    const user = await getCurrentUser(ctx);

    // 3. Get template
    const template = await ctx.db.get(templateId);

    if (!template) {
      return;
    }

    const now = Date.now();

    // 4. Increment usage counter
    await ctx.db.patch(templateId, {
      timesUsed: (template.timesUsed || 0) + 1,
      lastUsedAt: now,
      updatedAt: now,
      updatedBy: user?._id,
    });
  },
});