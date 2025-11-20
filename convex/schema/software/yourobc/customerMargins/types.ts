// convex/schema/software/yourobc/customerMargins/types.ts
// Type extractions from validators for customerMargins module

import { Infer } from 'convex/values';
import { customerMarginsValidators } from './validators';

// Extract types from validators
export type CustomerMarginsStatus = Infer<typeof customerMarginsValidators.status>;
export type CustomerMarginsServiceType = Infer<typeof customerMarginsValidators.serviceType>;
export type CustomerMarginsType = Infer<typeof customerMarginsValidators.marginType>;
export type CustomerMarginsApprovalStatus = Infer<typeof customerMarginsValidators.approvalStatus>;
