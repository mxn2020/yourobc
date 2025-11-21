// convex/schema/system/system/auditLogs/auditLogs.ts
// Table definitions for auditLogs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { auditLogsValidators } from './validators';

/**
 * Audit Logs Table
 *
 * Records all system actions for accountability and debugging.
 *
 * FIELD NAMING NOTES:
 * - entityTitle: Flexible field that captures the display name of the entity being audited
 *   Each entity type can use its own display field name (title, name, displayName, etc.)
 *   but entityTitle always captures that display value as a snapshot at time of action.
 */
export const auditLogsTable = defineTable({
  // Required: Main display field (action as display name)
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User who performed the action
  userId: auditLogsValidators.userId,
  userName: auditLogsValidators.userName,

  // Action performed
  action: auditLogsValidators.action,

  // Entity being audited
  entityType: auditLogsValidators.entityType,
  entityId: auditLogsValidators.entityId,
  entityTitle: auditLogsValidators.entityTitle,

  // Action description
  description: auditLogsValidators.description,

  // Standard metadata and audit fields
  metadata: auditLogsValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_user', ['userId'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_action', ['action'])
  .index('by_created_at', ['createdAt']);
