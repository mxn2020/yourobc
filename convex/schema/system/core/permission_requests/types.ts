// convex/schema/system/core/permission_requests/types.ts
// Type extractions from validators for permission requests module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { permissionRequestsFields, permissionRequestsValidators } from './validators';
import { permissionRequestsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type PermissionRequest = Doc<'permissionRequests'>;
export type PermissionRequestId = Id<'permissionRequests'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type PermissionRequestSchema = Infer<typeof permissionRequestsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type PermissionRequestStatus = Infer<typeof permissionRequestsValidators.status>;

// ============================================
// Field Types
// ============================================

export type PermissionRequestRequester = Infer<typeof permissionRequestsFields.requester>;
export type PermissionRequestRequest = Infer<typeof permissionRequestsFields.request>;
export type PermissionRequestReview = Infer<typeof permissionRequestsFields.review>;
