// convex/lib/{category}/{entity}/{module}/mutations.ts
// Write operations for {module} module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { chunkIds } from '@/shared/bulk.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { {MODULE}_CONSTANTS } from './constants';
import { trim{Module}Data, validate{Module}Data, buildSearchableText } from './utils';
import {
  requireEdit{Module}Access,
  requireDelete{Module}Access,
  canEdit{Module},
  canDelete{Module}
} from './permissions';

/**
 * Create a new {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have CREATE permission
 *
 * @param data - Entity creation data
 * @returns Created entity ID and publicId
 */
export const create{Module} = mutation({
  args: {
    data: v.object({
      {displayField}: v.string(),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
      // Add more fields as needed...
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Trim and validate
    const trimmed = trim{Module}Data(data);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, '{tableName}');

    // Build searchableText if using search indexes
    // Remove this line if no search indexes in schema
    const searchableText = buildSearchableText(trimmed);

    // Insert record
    const id = await ctx.db.insert('{tableName}', {
      ...trimmed,
      publicId,
      searchableText,  // Remove if not using search
      ownerId: user._id,
      status: trimmed.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: '{module}.created',
      entityType: '{tableName}',
      entityId: publicId,
      entityTitle: trimmed.{displayField},  // Use name/title/displayName
      description: `Created {module}: ${trimmed.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 *
 * @param id - Entity ID
 * @param updates - Fields to update
 * @returns Updated entity ID
 */
export const update{Module} = mutation({
  args: {
    id: v.id('{tableName}'),
    updates: v.object({
      {displayField}: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
      // Add more fields as needed...
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('{Module} not found');
    }

    // Check permissions
    await requireEdit{Module}Access(ctx, existing, user);

    // Trim and validate
    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Rebuild searchableText with merged data
    const searchableText = buildSearchableText({
      {displayField}: trimmed.{displayField} ?? existing.{displayField},
      description: trimmed.description ?? existing.description,
      tags: trimmed.tags ?? existing.tags,
    });

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      searchableText,  // Remove if not using search
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: '{module}.updated',
      entityType: '{tableName}',
      entityId: existing.publicId,
      entityTitle: trimmed.{displayField} ?? existing.{displayField},  // Use name/title/displayName
      description: `Updated {module}: ${trimmed.{displayField} ?? existing.{displayField}}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete a {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 *
 * @param id - Entity ID
 * @returns Deleted entity ID
 */
export const delete{Module} = mutation({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('{Module} not found');
    }

    // Check permissions
    await requireDelete{Module}Access(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: '{module}.deleted',
      entityType: '{tableName}',
      entityId: existing.publicId,
      entityTitle: existing.{displayField},  // Use name/title/displayName
      description: `Deleted {module}: ${existing.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Bulk update multiple {module}s
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have BULK_EDIT permission
 *
 * @param ids - Array of entity IDs
 * @param updates - Fields to update
 * @param chunkSize - Items per batch (default: 50)
 * @returns Update summary
 */
export const bulkUpdate{Module}s = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    updates: v.object({
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
      // Add more fields as needed...
    }),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, updates, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // Validate updates
    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(", "));
    }

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    // Process in chunks
    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        // Check permission per entity
        const canEdit = await canEdit{Module}(ctx, doc, user);
        if (!canEdit) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          ...trimmed,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    // Single audit log for bulk operation
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.{displayField} || user.email || "Unknown",
      action: "{module}.bulk_updated",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk update",
      description: `Bulk updated ${updatedCount} {module} items`,
      metadata: {
        updates: trimmed,
        denied,
        requestedCount: ids.length,
        updatedCount,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      updatedCount,
      denied,
    };
  },
});

/**
 * Bulk delete multiple {module}s
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have DELETE permission
 *
 * @param ids - Array of entity IDs
 * @param chunkSize - Items per batch (default: 50)
 * @returns Delete summary
 */
export const bulkDelete{Module}s = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let deletedCount = 0;
    const denied: string[] = [];

    // Process in chunks
    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        // Check permission per entity
        const canDel = await canDelete{Module}(doc, user);
        if (!canDel) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        deletedCount++;
      }
    }

    // Single audit log for bulk operation
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.{displayField} || user.email || "Unknown",
      action: "{module}.bulk_deleted",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk delete",
      description: `Bulk deleted ${deletedCount} {module} items`,
      metadata: { denied, requestedCount: ids.length, deletedCount },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      deletedCount,
      denied,
    };
  },
});

// Add more mutations as needed...

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating mutations.ts:
 * [ ] Implement create{Module}
 * [ ] Implement update{Module}
 * [ ] Implement delete{Module}
 * [ ] Implement bulkUpdate{Module}s (optional)
 * [ ] Implement bulkDelete{Module}s (optional)
 * [ ] Import validators from schema
 * [ ] Use trim before validate
 * [ ] Use soft delete (never hard delete)
 * [ ] Create audit logs for all mutations
 * [ ] Check permissions
 * [ ] Generate publicId for creates
 * [ ] Rebuild searchableText for updates
 * [ ] Chunk bulk operations
 * [ ] Check access per entity in bulk ops
 *
 * DO:
 * [ ] Trim data before validation
 * [ ] Return error arrays from validation
 * [ ] Use soft delete pattern
 * [ ] Log all mutations to auditLogs
 * [ ] Use entityTitle with display field
 * [ ] Check permissions before operations
 * [ ] Chunk large bulk operations
 *
 * DON'T:
 * [ ] Use ctx.db.delete() (use soft delete)
 * [ ] Skip validation
 * [ ] Skip audit logging
 * [ ] Skip permission checks
 * [ ] Process all bulk items at once
 * [ ] Forget to update searchableText
 */
