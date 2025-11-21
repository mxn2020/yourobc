// convex/lib/system/system/permissionRequests/types.ts
// TypeScript type definitions for permissionRequests module

import type { Doc, Id } from '@/generated/dataModel';

export type PermissionRequest = Doc<'permissionRequests'>;
export type PermissionRequestId = Id<'permissionRequests'>;

export interface CreatePermissionRequestData {
  permission: string;
  [key: string]: any;
}

export interface UpdatePermissionRequestData {
  permission?: string;
  [key: string]: any;
}

export interface PermissionRequestListResponse {
  items: PermissionRequest[];
  total: number;
  hasMore: boolean;
}
