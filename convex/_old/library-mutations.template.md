// convex/lib/boilerplate/[module_name]/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { [MODULE]_CONSTANTS } from './constants';
import {
  requireEditAccess,
  requireDeleteAccess,
  requireTeamManagementAccess,
} from './permissions';
import { statusTypes, sortOrderValidator } from '@/schema/base';
import { {module}Validators } from '@/schema/[addon]/{category}/validators';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { validate[Entity]Data } from './utils';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * VALIDATORS PATTERN - SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ALWAYS import validators from validators.ts (grouped validators):
 * - Module-specific: import { {module}Validators } from '@/schema/[addon]/{category}/validators'
 * - Base validators: import { statusTypes, sortOrderValidator } from '@/schema/base'
 *
 * WHY USE VALIDATORS IN MUTATIONS:
 * ✓ Type-safe - no string typos possible
 * ✓ Same validators as schema - guaranteed consistency
 * ✓ Single source of truth for allowed values
 * ✓ Easy to update in one place
 * ✓ No need for 'as any' type casts
 *
 * EXAMPLE USAGE:
 * args: {
 *   status: v.optional({module}Validators.status),
 *   priority: v.optional(statusTypes.priority),
 *   visibility: v.optional({module}Validators.visibility),
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * ⚠️  REQUIRED: MAIN DISPLAY FIELD IN EVERY TABLE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Every table MUST include ONE main display field for audit logs, UI display, and search:
 * - name: v.string() → users, organizations, products, categories, clients
 * - title: v.string() → posts, articles, projects, invoices, documents, events
 * - displayName: v.string() → settings, configurations (when "name" is ambiguous)
 *
 * WHY THIS IS REQUIRED:
 * 1. Audit logs need 'entityTitle' (without it, logs show "undefined")
 * 2. UI components need a primary label for display
 * 3. Search functionality relies on this field
 *
 * SCHEMA REQUIREMENTS:
 * - Field: name/title/displayName: v.string()
 * - Index: .index('by_name', ['name']) or .index('by_title', ['title'])
 *
 * See code examples below for usage patterns in create/update/delete mutations.
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * AUDIT LOGGING PATTERN - USING THE MAIN DISPLAY FIELD
 * ═══════════════════════════════════════════════════════════════════════
 *
 * When creating audit logs, the 'entityTitle' parameter MUST use your
 * entity's main display field (name, title, or displayName).
 *
 * PATTERN: entityTitle captures the display value at time of action
 * ────────────────────────────────────────────────────────────────────
 *
 * USAGE PATTERNS:
 *
 * 1. During CREATE mutations:
 *    entityTitle: data.name      // if using 'name' field
 *    entityTitle: data.title     // if using 'title' field
 *    entityTitle: data.displayName  // if using 'displayName' field
 *
 * 2. During UPDATE mutations:
 *    entityTitle: updates.name || {entity}.name      // if using 'name'
 *    entityTitle: updates.title || {entity}.title    // if using 'title'
 *    entityTitle: updates.displayName || {entity}.displayName  // if using 'displayName'
 *
 * 3. During DELETE mutations:
 *    entityTitle: {entity}.name       // if using 'name' field
 *    entityTitle: {entity}.title      // if using 'title' field
 *    entityTitle: {entity}.displayName   // if using 'displayName' field
 *
 * WHY entityTitle IS A SNAPSHOT:
 * ──────────────────────────────
 * - Preserves the display name as it was at time of action
 * - Audit log remains accurate even if entity is deleted or renamed
 * - Historical record: captured once, never changes
 * - Provides context for "what changed" in audit trail
 *
 * ENTITY TYPE EXAMPLES:
 * ─────────────────────
 * expenses.ts (uses 'title'):
 *   ✓ entityTitle: data.title           (create)
 *   ✓ entityTitle: updates.title || expense.title  (update)
 *   ✓ entityTitle: expense.title        (delete)
 *
 * organizations.ts (uses 'name'):
 *   ✓ entityTitle: data.name            (create)
 *   ✓ entityTitle: updates.name || org.name  (update)
 *   ✓ entityTitle: org.name             (delete)
 *
 * posts.ts (uses 'title'):
 *   ✓ entityTitle: data.title           (create)
 *   ✓ entityTitle: updates.title || post.title  (update)
 *   ✓ entityTitle: post.title           (delete)
 *
 * See: convex/lib/boilerplate/audit_logs/helpers.ts for more details
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Create a new {entity}
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have '[module_name].create' permission
 */
export const create[Entity] = mutation({
  args: {
    data: v.object({
      // REQUIRED: Main display field (name/title/displayName based on entity type)
      name: v.string(),

      description: v.optional(v.string()),

      // Use validators from schema - ensures consistency!
      status: v.optional({module}Validators.status),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional({module}Validators.visibility),

      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      settings: v.optional(
        v.object({
          allowComments: v.optional(v.boolean()),
          emailNotifications: v.optional(v.boolean()),
        })
      ),
      extendedMetadata: v.optional(
        v.object({
          // Add entity-specific extended metadata fields
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      [MODULE]_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validate[Entity]Data(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, '[tableName]');

    // Create {entity}
    const now = Date.now();
    const {entity}Data = {
      publicId,
      name: data.name.trim(),
      description: data.description?.trim(),
      status: [MODULE]_CONSTANTS.STATUS.ACTIVE,
      priority: data.priority || [MODULE]_CONSTANTS.PRIORITY.MEDIUM,
      ownerId: user._id,
      visibility: data.visibility || [MODULE]_CONSTANTS.VISIBILITY.PRIVATE,
      tags: data.tags || [],
      category: data.category,
      startDate: data.startDate,
      dueDate: data.dueDate,
      completedAt: undefined,
      settings: {
        allowComments: true,
        emailNotifications: true,
        ...data.settings,
      },
      extendedMetadata: data.extendedMetadata,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      lastActivityAt: now,
      deletedAt: undefined,
      metadata: {},
    };

    const {entity}Id = await ctx.db.insert('[tableName]', {entity}Data);

    // Automatically add the owner as a member with "owner" role
    await ctx.db.insert('{entity}Members', {
      {entity}Id,
      userId: user._id,
      role: 'owner',
      status: 'active',
      joinedAt: now,
      invitedBy: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // Create audit log
    // REQUIRED: entityTitle uses main display field (data.name/title/displayName)
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{entity}.created',
      entityType: 'system_{entity}',
      entityId: publicId,
      entityTitle: data.name, // REQUIRED: Use data.name, data.title, or data.displayName
      description: `Created {entity} '${data.name}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: {entity}Id, publicId };
  },
});

/**
 * Update an existing {entity}
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner, admin, or have edit permission
 */
export const update[Entity] = mutation({
  args: {
    {entity}Id: v.id('[tableName]'),
    updates: v.object({
      // REQUIRED: Main display field (name/title/displayName based on entity type)
      name: v.optional(v.string()),

      description: v.optional(v.string()),

      // Use validators from schema - ensures consistency!
      status: v.optional({module}Validators.status),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional({module}Validators.visibility),

      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      settings: v.optional(
        v.object({
          allowComments: v.optional(v.boolean()),
          emailNotifications: v.optional(v.boolean()),
        })
      ),
      extendedMetadata: v.optional(
        v.object({
          // Add entity-specific extended metadata fields
        })
      ),
    }),
  },
  handler: async (ctx, { {entity}Id, updates }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const {entity} = await ctx.db.get({entity}Id);
    if (!{entity}) {
      throw new Error('[Entity] not found');
    }

    // 🔒 Check permission
    await requireEditAccess(ctx, {entity}, user);

    // Validate
    const errors = validate[Entity]Data(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Update {entity}
    const now = Date.now();
    const updateData: Partial<typeof {entity}> = {
      ...updates,
      updatedAt: now,
      lastActivityAt: now,
    };

    // Handle status changes
    if (
      updates.status === [MODULE]_CONSTANTS.STATUS.COMPLETED &&
      {entity}.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED
    ) {
      updateData.completedAt = now;
    } else if (updates.status && updates.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED) {
      updateData.completedAt = undefined;
    }

    // Merge settings and metadata
    if (updates.settings) {
      updateData.settings = { ...{entity}.settings, ...updates.settings };
    }
    if (updates.extendedMetadata) {
      updateData.extendedMetadata = {
        ...{entity}.extendedMetadata,
        ...updates.extendedMetadata,
      };
    }

    await ctx.db.patch({entity}Id, updateData);

    // Audit log
    // REQUIRED: entityTitle uses updated value or current value (updates.name/{entity}.name)
    const currentDisplayName = updates.name || {entity}.name;
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{entity}.updated',
      entityType: 'system_{entity}',
      entityId: {entity}.publicId,
      entityTitle: currentDisplayName, // REQUIRED: Use updates.name/{entity}.name, updates.title/{entity}.title, or updates.displayName/{entity}.displayName
      description: `Updated {entity} '${currentDisplayName}'`,
      metadata: {
        source: '{entity}.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: {entity}Id };
  },
});

/**
 * Delete a {entity}
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner, admin, or have delete permission
 */
export const delete[Entity] = mutation({
  args: {
    {entity}Id: v.id('[tableName]'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { {entity}Id, hardDelete = false }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const {entity} = await ctx.db.get({entity}Id);
    if (!{entity}) {
      throw new Error('[Entity] not found');
    }

    // 🔒 Check permission
    requireDeleteAccess({entity}, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      // Hard delete: Remove {entity} and all related data

      // Delete {entity} members
      const members = await ctx.db
        .query('{entity}Members')
        .withIndex('by_{entity}', (q) => q.eq('{entity}Id', {entity}Id))
        .collect();

      for (const member of members) {
        await ctx.db.delete(member._id);
      }

      // Delete the {entity} itself
      await ctx.db.delete({entity}Id);
    } else {
      // Soft delete: Mark as deleted
      await ctx.db.patch({entity}Id, {
        deletedAt: now,
        updatedAt: now,
      });
    }

    // Audit log
    // REQUIRED: entityTitle captures display name at time of deletion ({entity}.name/title/displayName)
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: hardDelete ? '{entity}.hard_deleted' : '{entity}.deleted',
      entityType: 'system_{entity}',
      entityId: {entity}.publicId,
      entityTitle: {entity}.name, // REQUIRED: Use {entity}.name, {entity}.title, or {entity}.displayName
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} {entity} '${{entity}.name}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: {entity}Id };
  },
});

/**
 * Update {entity} progress (optional - for entities with progress tracking)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner, members with edit rights, or admins
 */
export const update[Entity]Progress = mutation({
  args: {
    {entity}Id: v.id('[tableName]'),
    progress: v.object({
      completed: v.number(),
      total: v.number(),
    }),
  },
  handler: async (ctx, { {entity}Id, progress }) => {
    const user = await requireCurrentUser(ctx);

    // ✅ Direct O(1) lookup
    const {entity} = await ctx.db.get({entity}Id);

    if (!{entity}) {
      throw new Error('[Entity] not found');
    }

    // Check permission
    await requireEditAccess(ctx, {entity}, user);

    const { completed, total } = progress;
    const percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const now = Date.now();

    await ctx.db.patch({entity}Id, {
      progress: {
        completed,
        total,
        percentage,
      },
      updatedAt: now,
      lastActivityAt: now,
    });

    return { completed, total, percentage };
  },
});
