// convex/schema/system/core/permission_requests/permissionRequests.ts
// Table definitions for permission requests module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { permissionRequestsFields, permissionRequestsValidators } from './validators';

export const permissionRequestsTable = defineTable({
  displayName: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  requester: permissionRequestsFields.requester,
  request: permissionRequestsFields.request,
  status: permissionRequestsValidators.status,
  review: permissionRequestsFields.review,

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_status', ['status'])
  .index('by_permission', ['request.permission'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_reviewed_by', ['review.reviewedBy'])
  .index('by_created_at', ['createdAt']);
