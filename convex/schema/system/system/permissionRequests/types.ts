// convex/schema/boilerplate/system/permissionRequests/types.ts
// Type extractions from validators for permissionRequests module

import { Infer } from 'convex/values';
import { permissionRequestsValidators } from './validators';

// Extract types from validators
export type PermissionRequestStatus = Infer<typeof permissionRequestsValidators.status>;
