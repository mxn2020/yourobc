// convex/lib/system/email/email_templates/mutations.ts
// Write operations for email templates module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { emailValidators, emailFields } from '@/schema/system/email/validators';
import { EMAIL_TEMPLATES_CONSTANTS } from './constants';
import { validateEmailTemplateData, trimEmailTemplateData } from './utils';
import {
  requireCreateEmailTemplateAccess,
  requireEditEmailTemplateAccess,
  requireDeleteEmailTemplateAccess,
} from './permissions';
import type { EmailTemplateId } from './types';
import { createAuditLog } from '../../auditLogs/helpers';

/**
 * Create or update email template
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
        type: emailValidators.variableType,
        required: v.boolean(),
        defaultValue: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
    previewData: v.optional(v.any()),
    isActive: v.boolean(),
    category: v.optional(v.string()),
    metadata: v.optional(emailFields.templateMetadata),
  },
  handler: async (ctx, args): Promise<EmailTemplateId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateEmailTemplateAccess(user);

    // 3. VALIDATE: Check data validity
    const trimmedData = trimEmailTemplateData(args);
    const errors = validateEmailTemplateData(trimmedData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. CHECK: If template with this slug already exists
    const existingTemplate = await ctx.db
      .query('emailTemplates')
      .withIndex('by_slug', (q) => q.eq('slug', trimmedData.slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    const now = Date.now();

    if (existingTemplate) {
      // 5a. UPDATE: Existing template
      await ctx.db.patch(existingTemplate._id, {
        name: trimmedData.name,
        description: trimmedData.description,
        subject: trimmedData.subject,
        htmlTemplate: trimmedData.htmlTemplate,
        textTemplate: trimmedData.textTemplate,
        reactComponentPath: trimmedData.reactComponentPath,
        variables: args.variables,
        previewData: args.previewData,
        isActive: args.isActive,
        category: trimmedData.category,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 6a. AUDIT: Create audit log
      await createAuditLog(ctx, {
        action: 'email_template.updated',
        entityType: 'system_email_template',
        entityId: existingTemplate._id,
        entityTitle: trimmedData.name,
        description: `Updated email template: ${trimmedData.name}`,
        metadata: {
          operation: 'update_email_template',
          newValues: trimmedData.category
            ? {
                slug: trimmedData.slug,
                category: trimmedData.category,
              }
            : {
                slug: trimmedData.slug,
              },
        },
      });

      // 7a. RETURN: Template ID
      return existingTemplate._id;
    } else {
      // 5b. CREATE: Generate publicId and prepare data
      const publicId = await generateUniquePublicId(ctx, 'emailTemplates');

      // 6b. CREATE: Insert new template
      const templateId = await ctx.db.insert('emailTemplates', {
        publicId,
        name: trimmedData.name,
        slug: trimmedData.slug,
        description: trimmedData.description,
        subject: trimmedData.subject,
        htmlTemplate: trimmedData.htmlTemplate,
        textTemplate: trimmedData.textTemplate,
        reactComponentPath: trimmedData.reactComponentPath,
        variables: args.variables,
        previewData: args.previewData,
        isActive: args.isActive,
        status: 'active',
        category: trimmedData.category,
        settings: {},
        ownerId: user._id,
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
        timesUsed: 0,
      });

      // 7b. AUDIT: Create audit log
      await createAuditLog(ctx, {
        action: 'email_template.created',
        entityType: 'system_email_template',
        entityId: templateId,
        entityTitle: trimmedData.name,
        description: `Created email template: ${trimmedData.name}`,
        metadata: {
          operation: 'create_email_template',
          newValues: trimmedData.category
            ? {
                slug: trimmedData.slug,
                category: trimmedData.category,
              }
            : {
                slug: trimmedData.slug,
              },
        },
      });

      // 8b. RETURN: Template ID
      return templateId;
    }
  },
});

/**
 * Update existing email template
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const updateEmailTemplate = mutation({
  args: {
    templateId: v.id('emailTemplates'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      subject: v.optional(v.string()),
      htmlTemplate: v.optional(v.string()),
      textTemplate: v.optional(v.string()),
      reactComponentPath: v.optional(v.string()),
      variables: v.optional(v.array(
        v.object({
          name: v.string(),
          type: emailValidators.variableType,
          required: v.boolean(),
          defaultValue: v.optional(v.string()),
          description: v.optional(v.string()),
        })
      )),
      previewData: v.optional(v.any()),
      isActive: v.optional(v.boolean()),
      category: v.optional(v.string()),
      status: v.optional(emailValidators.status),
    }),
  },
  handler: async (ctx, { templateId, updates }): Promise<EmailTemplateId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const template = await ctx.db.get(templateId);
    if (!template || template.deletedAt) {
      throw new Error('Email template not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmailTemplateAccess(ctx, template, user);

    // 4. VALIDATE: Check update data validity
    const trimmedUpdates = trimEmailTemplateData(updates);
    const errors = validateEmailTemplateData(trimmedUpdates);
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
    if (trimmedUpdates.description !== undefined) {
      updateData.description = trimmedUpdates.description;
    }
    if (trimmedUpdates.subject !== undefined) {
      updateData.subject = trimmedUpdates.subject;
    }
    if (trimmedUpdates.htmlTemplate !== undefined) {
      updateData.htmlTemplate = trimmedUpdates.htmlTemplate;
    }
    if (trimmedUpdates.textTemplate !== undefined) {
      updateData.textTemplate = trimmedUpdates.textTemplate;
    }
    if (trimmedUpdates.reactComponentPath !== undefined) {
      updateData.reactComponentPath = trimmedUpdates.reactComponentPath;
    }
    if (updates.variables !== undefined) {
      updateData.variables = updates.variables;
    }
    if (updates.previewData !== undefined) {
      updateData.previewData = updates.previewData;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }
    if (trimmedUpdates.category !== undefined) {
      updateData.category = trimmedUpdates.category;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(templateId, updateData);

    // 7. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_template.updated',
      entityType: 'system_email_template',
      entityId: templateId,
      entityTitle: updateData.name || template.name,
      description: `Updated email template: ${updateData.name || template.name}`,
      // metadata: { changes: updates },
    });

    // 8. RETURN: Template ID
    return templateId;
  },
});

/**
 * Delete email template (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const deleteEmailTemplate = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }): Promise<EmailTemplateId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get template
    const template = await ctx.db.get(templateId);
    if (!template || template.deletedAt) {
      throw new Error('Template not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmailTemplateAccess(template, user);

    const now = Date.now();

    // 4. SOFT DELETE: Mark as deleted
    await ctx.db.patch(templateId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
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

    // 6. RETURN: Template ID
    return templateId;
  },
});

/**
 * Restore soft-deleted email template
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const restoreEmailTemplate = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }): Promise<EmailTemplateId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const template = await ctx.db.get(templateId);
    if (!template) {
      throw new Error('Email template not found');
    }
    if (!template.deletedAt) {
      throw new Error('Email template is not deleted');
    }

    // 3. AUTHZ: Check permission
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw new Error('Permission denied: Admin access required to restore email templates');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(templateId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await createAuditLog(ctx, {
      action: 'email_template.restored',
      entityType: 'system_email_template',
      entityId: templateId,
      entityTitle: template.name,
      description: `Restored email template: ${template.name}`,
    });

    // 6. RETURN: Template ID
    return templateId;
  },
});

/**
 * Increment template usage counter
 * 🔒 Authentication: Required
 *
 * Note: Currently requires authentication. If system-level tracking is needed
 * without user context, create a separate internal mutation.
 */
export const incrementTemplateUsage = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    // 1. AUTH: Require authentication
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Get template
    const template = await ctx.db.get(templateId);
    if (!template || template.deletedAt) {
      return;
    }

    const now = Date.now();

    // 3. UPDATE: Increment usage counter
    await ctx.db.patch(templateId, {
      timesUsed: (template.timesUsed || 0) + 1,
      lastUsedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});
