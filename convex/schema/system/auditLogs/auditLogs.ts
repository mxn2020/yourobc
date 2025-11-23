// convex/schema/system/auditLogs/auditLogs.ts
// Table definitions for auditLogs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { auditLogsValidators, auditLogsFields } from './validators';
import { entityTypes } from '@/config/entityTypes';

/**
 * Audit Logs Table
 *
 * Records all system actions for accountability and debugging.
 *
 * FIELD NAMING NOTES:
 * - entityTitle: Flexible field that captures the display name of the entity being audited
 *   Each entity type can use its own display field name (title, name, displayName, etc.)
 *   but entityTitle always captures that display value as a snapshot at time of action.
 *   This is intentionally denormalized so the audit log remains accurate even if the
 *   original entity is deleted or renamed later.
 *
 * EXAMPLES:
 * - Auditing a project with title="My Project" → entityTitle: "My Project"
 * - Auditing a website with name="My Site" → entityTitle: "My Site"
 * - Auditing a user with displayName="John Doe" → entityTitle: "John Doe"
 * - The specific field name (title vs name vs displayName) is per-entity-type
 * - What matters: pass the entity's chosen display field to entityTitle
 */
export const auditLogsTable = defineTable({
  // Required: Main display field
  description: v.string(),

  // Required: Core fields
  publicId: v.string(),
  userId: v.id('userProfiles'), // The user who performed the action (actor)

  // User information (denormalized for history)
  userName: v.string(),

  // Action performed
  action: v.string(),

  // Entity being audited
  entityType: entityTypes.all,
  entityId: v.optional(v.string()),

  /**
   * entityTitle: Snapshot of the entity's display name at time of action
   * Captures whatever display field the entity uses (title, name, displayName, etc.)
   * Stored separately to preserve history even if entity is deleted/renamed
   */
  entityTitle: v.optional(v.string()),

  // Metadata (typed audit operation details)
  metadata: v.optional(auditLogsFields.auditMetadata),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_description', ['description'])
  .index('by_user_id', ['userId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_action', ['action'])
  .index('by_created_at', ['createdAt'])
  .index('by_created_by', ['createdBy']); // For filtering by who created the audit log
