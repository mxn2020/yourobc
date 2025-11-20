// convex/lib/boilerplate/email/templates/mutations.ts
// Write operations for email templates module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, generateUniquePublicId } from '@/shared/auth.helper';
import { emailTemplatesValidators } from '@/schema/boilerplate/email/templates/validators';
import { EMAIL_TEMPLATES_CONSTANTS } from './constants';
import { validateEmailTemplateData } from './utils';
import {
  requireCreateEmailTemplateAccess,
  requireEditEmailTemplateAccess,
  requireDeleteEmailTemplateAccess,
} from './permissions';
import type { EmailTemplateId } from './types';
import { createAuditLog } from '../../audit_logs/helpers';

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
        type: emailTemplatesValidators.variableType,
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
  handler: async (ctx, args): Promise<EmailTemplateId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    requireCreateEmailTemplateAccess(user);

    // 3. VALIDATE: Check data validity
    const errors = validateEmailTemplateData(args);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Trim string fields
    const trimmedName = args.name.trim();
    const trimmedSlug = args.slug.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedSubject = args.subject.trim();
    const trimmedReactComponentPath = args.reactComponentPath?.trim();
    const trimmedCategory = args.category?.trim();

    // 5. CHECK: If template with this slug already exists
    const existingTemplate = await ctx.db
      .query('emailTemplates')
      .withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    const now = Date.now();

    if (existingTemplate) {
      // 6a. UPDATE: Existing template
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
        metadata: args.metadata ?? existingTemplate.metadata,
        updatedAt: now,
        lastActivityAt: now,
        updatedBy: user._id,
      });

      // 7a. AUDIT: Create audit log
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

      // 8a. RETURN: Template ID
      return existingTemplate._id;
    } else {
      // 6b. CREATE: Generate publicId and prepare data
      const publicId = await generateUniquePublicId(ctx, 'emailTemplates');

      // 7b. CREATE: Insert new template
      const templateId = await ctx.db.insert('emailTemplates', {
        publicId,
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
        status: 'active',
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

      // 8b. AUDIT: Create audit log
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

      // 9b. RETURN: Template ID
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
          type: emailTemplatesValidators.variableType,
          required: v.boolean(),
          defaultValue: v.optional(v.string()),
          description: v.optional(v.string()),
        })
      )),
      previewData: v.optional(v.any()),
      isActive: v.optional(v.boolean()),
      category: v.optional(v.string()),
      status: v.optional(emailTemplatesValidators.status),
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
    const errors = validateEmailTemplateData(updates);
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
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.subject !== undefined) {
      updateData.subject = updates.subject.trim();
    }
    if (updates.htmlTemplate !== undefined) {
      updateData.htmlTemplate = updates.htmlTemplate;
    }
    if (updates.textTemplate !== undefined) {
      updateData.textTemplate = updates.textTemplate;
    }
    if (updates.reactComponentPath !== undefined) {
      updateData.reactComponentPath = updates.reactComponentPath?.trim();
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
    if (updates.category !== undefined) {
      updateData.category = updates.category?.trim();
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
      metadata: { changes: updates },
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
 * 🔒 Authentication: Optional (can be called by system)
 */
export const incrementTemplateUsage = mutation({
  args: {
    templateId: v.id('emailTemplates'),
  },
  handler: async (ctx, { templateId }) => {
    // 1. AUTH: Optional - can be called by system
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
      updatedBy: user?._id,
    });
  },
});
