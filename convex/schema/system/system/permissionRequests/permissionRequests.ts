// convex/schema/system/system/permissionRequests/permissionRequests.ts
// Table definitions for permissionRequests module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { permissionRequestsValidators } from './validators';

export const permissionRequestsTable = defineTable({
  // Required: Main display field (permission is the key identifier)
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User information
  userId: permissionRequestsValidators.userId,
  userName: permissionRequestsValidators.userName,
  userEmail: permissionRequestsValidators.userEmail,

  // Permission details
  permission: permissionRequestsValidators.permission,
  module: permissionRequestsValidators.module,

  // Request details
  message: permissionRequestsValidators.message,
  status: permissionRequestsValidators.status,

  // Review details
  reviewedBy: permissionRequestsValidators.reviewedBy,
  reviewedByName: permissionRequestsValidators.reviewedByName,
  reviewedAt: permissionRequestsValidators.reviewedAt,
  reviewNotes: permissionRequestsValidators.reviewNotes,

  // Standard metadata and audit fields
  metadata: permissionRequestsValidators.metadata,
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
  .index('by_status', ['status'])
  .index('by_permission', ['permission'])
  .index('by_user_status', ['userId', 'status'])
  .index('by_reviewed_by', ['reviewedBy'])
  .index('by_created_at', ['createdAt']);
