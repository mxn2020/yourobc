// convex/schema/boilerplate/system/permissionRequests/permissionRequests.ts
// Table definitions for permissionRequests module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { permissionRequestsValidators } from './validators';

/**
 * Permission Requests Table
 *
 * Tracks requests from users to gain specific permissions.
 * Admins can approve or deny these requests through the admin panel.
 */
export const permissionRequestsTable = defineTable({
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
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_user', ['userId'])
  .index('by_status', ['status'])
  .index('by_permission', ['permission'])
  .index('by_user_status', ['userId', 'status'])
  .index('by_reviewed_by', ['reviewedBy'])
  .index('by_created_at', ['createdAt']);
