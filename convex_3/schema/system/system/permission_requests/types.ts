// convex/schema/system/core/permission_requests/types.ts
// Type extractions from validators for permission requests module

import { Infer } from 'convex/values';
import { permissionRequestsFields, permissionRequestsValidators } from './validators';

export type PermissionRequestStatus = Infer<typeof permissionRequestsValidators.status>;
export type PermissionRequestRequester = Infer<typeof permissionRequestsFields.requester>;
export type PermissionRequestRequest = Infer<typeof permissionRequestsFields.request>;
export type PermissionRequestReview = Infer<typeof permissionRequestsFields.review>;
