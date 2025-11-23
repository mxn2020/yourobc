// convex/lib/system/audit_logs/helpers.ts

import { MutationCtx } from '@/generated/server';
import { getCurrentUser } from '@/shared/auth.helper';

/**
 * Audit Log Data Interface
 *
 * FIELD NAMING PATTERN FOR entityTitle:
 * ====================================
 * Each entity type can choose its own display field name (title, name, displayName, etc).
 * The `entityTitle` field captures this display value as a snapshot at the time of the action.
 * This allows audit logs to show what the entity was called when the action occurred,
 * even if the entity is later deleted or renamed.
 *
 * USAGE PATTERN:
 * - Pass the entity's CURRENT display field value to entityTitle
 * - Which field you use depends on your entity schema:
 *   ✓ Projects use: entityTitle: data.title
 *   ✓ Websites use: entityTitle: data.name
 *   ✓ Custom entities use: entityTitle: data.displayName (or whatever field you chose)
 * - The key: be CONSISTENT within each entity type
 *
 * EXAMPLES:
 * - logEntityCreation(ctx, 'system_project', projectId, project.title)
 * - logEntityCreation(ctx, 'website', websiteId, website.name)
 * - logEntityUpdate(ctx, 'user_profile', userId, user.displayName, oldData, newData)
 */
export interface CreateAuditLogData {
  action: string;
  entityType: string;
  entityId?: string;
  /**
   * entityTitle: Display name of the entity captured at time of action
   *
   * Should be populated from whichever display field your entity type uses:
   * - data.title (for projects, tasks, blog posts, etc.)
   * - data.name (for websites, integrations, categories, etc.)
   * - data.displayName (for custom entities)
   * - or any other display field your entity schema defines
   *
   * This is a snapshot - stored exactly as it was at the time of the action,
   * so the audit log remains accurate even if the entity is deleted later.
   */
  entityTitle?: string;
  description: string;
  metadata?: {
    source?: string;
    operation?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  };
}

export async function createAuditLog(
  ctx: MutationCtx,
  data: CreateAuditLogData
): Promise<string> {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error('User not authenticated');
  }

  const id = crypto.randomUUID();

  await ctx.db.insert('auditLogs', {
    userId: user._id,
    userName: user.name || user.email || 'Unknown User',
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    entityTitle: data.entityTitle,
    description: data.description,
    metadata: data.metadata,
    createdBy: user._id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return id;
}

export async function batchCreateAuditLogs(
  ctx: MutationCtx,
  dataArray: CreateAuditLogData[]
): Promise<string[]> {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error('User not authenticated');
  }

  const userName = user.name || user.email || 'Unknown User';
  const now = Date.now();

  // Use Promise.all for concurrent inserts instead of sequential
  const insertPromises = dataArray.map(data => 
    ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityTitle: data.entityTitle,
      description: data.description,
      metadata: data.metadata,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    })
  );

  return Promise.all(insertPromises);
}

/**
 * Log entity creation with flexible display field naming
 *
 * @param ctx - Mutation context
 * @param entityType - Type of entity (e.g., 'system_project', 'website', 'user_profile')
 * @param entityId - ID of the created entity
 * @param entityTitle - Display name from whatever field your entity uses (title, name, displayName, etc.)
 *                      This will be stored as a snapshot in the audit log
 * @param metadata - Optional additional metadata about the creation
 *
 * @example
 * // For an entity with a 'title' field:
 * await logEntityCreation(ctx, 'system_project', project.publicId, project.title)
 *
 * @example
 * // For an entity with a 'name' field:
 * await logEntityCreation(ctx, 'website', website.publicId, website.name)
 */
export async function logEntityCreation(
  ctx: MutationCtx,
  entityType: string,
  entityId: string,
  entityTitle?: string,
  metadata?: CreateAuditLogData['metadata']
): Promise<string> {
  return createAuditLog(ctx, {
    action: 'created',
    entityType,
    entityId,
    entityTitle,
    description: `Created ${entityType}${entityTitle ? `: ${entityTitle}` : ''}`,
    metadata,
  });
}

/**
 * Log entity update with flexible display field naming
 *
 * @param ctx - Mutation context
 * @param entityType - Type of entity (e.g., 'system_project', 'website', 'user_profile')
 * @param entityId - ID of the updated entity
 * @param entityTitle - Display name from whatever field your entity uses (title, name, displayName, etc.)
 *                      This will be stored as a snapshot in the audit log
 * @param oldValues - Previous values before the update (optional, for change tracking)
 * @param newValues - New values after the update (optional, for change tracking)
 * @param metadata - Optional additional metadata about the update
 *
 * @example
 * // For an entity with a 'title' field:
 * await logEntityUpdate(ctx, 'system_project', project.publicId, project.title, oldData, newData)
 *
 * @example
 * // For an entity with a 'name' field:
 * await logEntityUpdate(ctx, 'website', website.publicId, website.name, oldData, newData)
 */
export async function logEntityUpdate(
  ctx: MutationCtx,
  entityType: string,
  entityId: string,
  entityTitle?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  metadata?: CreateAuditLogData['metadata']
): Promise<string> {
  return createAuditLog(ctx, {
    action: 'updated',
    entityType,
    entityId,
    entityTitle,
    description: `Updated ${entityType}${entityTitle ? `: ${entityTitle}` : ''}`,
    metadata: {
      ...metadata,
      oldValues,
      newValues,
    },
  });
}

/**
 * Log entity deletion with flexible display field naming
 *
 * @param ctx - Mutation context
 * @param entityType - Type of entity (e.g., 'system_project', 'website', 'user_profile')
 * @param entityId - ID of the deleted entity
 * @param entityTitle - Display name from whatever field your entity uses (title, name, displayName, etc.)
 *                      This will be stored as a snapshot in the audit log
 * @param metadata - Optional additional metadata about the deletion
 *
 * @example
 * // For an entity with a 'title' field:
 * await logEntityDeletion(ctx, 'system_project', project.publicId, project.title)
 *
 * @example
 * // For an entity with a 'name' field:
 * await logEntityDeletion(ctx, 'website', website.publicId, website.name)
 */
export async function logEntityDeletion(
  ctx: MutationCtx,
  entityType: string,
  entityId: string,
  entityTitle?: string,
  metadata?: CreateAuditLogData['metadata']
): Promise<string> {
  return createAuditLog(ctx, {
    action: 'deleted',
    entityType,
    entityId,
    entityTitle,
    description: `Deleted ${entityType}${entityTitle ? `: ${entityTitle}` : ''}`,
    metadata,
  });
}
