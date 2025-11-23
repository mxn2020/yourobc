// convex/schema/yourobc/customers/types.ts
// Type extractions from validators for customers module

import { Infer } from 'convex/values';
import { customerMarginsFields, customerMarginsValidators, customersValidators } from './validators';

// Extract types from validators
export type CustomerStatus = Infer<typeof customersValidators.status>;
export type CustomerMarginsStatus = Infer<typeof customerMarginsValidators.status>;
export type CustomerMarginsServiceType = Infer<typeof customerMarginsValidators.serviceType>;
export type CustomerMarginsType = Infer<typeof customerMarginsValidators.marginType>;
export type CustomerMarginsApprovalStatus = Infer<
  typeof customerMarginsValidators.approvalStatus
>;
export type CustomerMarginPricingRule = Infer<typeof customerMarginsFields.pricingRule>;
export type CustomerMarginVolumeTier = Infer<typeof customerMarginsFields.volumeTier>;
export type CustomerMarginChangeHistoryEntry = Infer<
  typeof customerMarginsFields.changeHistoryEntry
>;
export type CustomerMarginByServiceEntry = Infer<typeof customerMarginsFields.marginsByServiceEntry>;
export type CustomerMarginTopRoute = Infer<typeof customerMarginsFields.topRoute>;

