// convex/schema/yourobc/customerMargins/types.ts
// Type extractions from validators for customerMargins module

import { Infer } from 'convex/values';
import {
  customerMarginsValidators,
  customerMarginsFields,
} from './validators';

// Extract types from validators
export type CustomerMarginsStatus = Infer<typeof customerMarginsValidators.status>;
export type CustomerMarginsServiceType = Infer<typeof customerMarginsValidators.serviceType>;
export type CustomerMarginsType = Infer<typeof customerMarginsValidators.marginType>;
export type CustomerMarginsApprovalStatus = Infer<typeof customerMarginsValidators.approvalStatus>;
export type CustomerMarginPricingRule = Infer<typeof customerMarginsFields.pricingRule>;
export type CustomerMarginVolumeTier = Infer<typeof customerMarginsFields.volumeTier>;
export type CustomerMarginChangeHistoryEntry = Infer<typeof customerMarginsFields.changeHistoryEntry>;
export type CustomerMarginByServiceEntry = Infer<typeof customerMarginsFields.marginsByServiceEntry>;
export type CustomerMarginTopRoute = Infer<typeof customerMarginsFields.topRoute>;
