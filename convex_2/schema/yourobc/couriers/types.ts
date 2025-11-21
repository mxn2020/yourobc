// convex/schema/yourobc/couriers/types.ts
// Type extractions from validators for couriers module

import { Infer } from 'convex/values';
import { couriersValidators, couriersFields } from './validators';

// Extract types from validators
export type CourierStatus = Infer<typeof couriersValidators.status>;
export type CourierServiceType = Infer<typeof couriersValidators.serviceType>;
export type CourierDeliverySpeed = Infer<typeof couriersValidators.deliverySpeed>;
export type CourierPricingModel = Infer<typeof couriersValidators.pricingModel>;
export type CourierApiType = Infer<typeof couriersValidators.apiType>;
export type CourierCommissionType = Infer<typeof couriersValidators.commissionType>;
export type CourierCommissionSimpleStatus = Infer<typeof couriersValidators.commissionSimpleStatus>;
export type CourierServiceCoverage = Infer<typeof couriersFields.serviceCoverage>;
export type CourierMaxDimensions = Infer<typeof couriersFields.maxDimensions>;
export type CourierCostStructure = Infer<typeof couriersFields.costStructure>;
export type CourierDeliveryTimes = Infer<typeof couriersFields.deliveryTimes>;
export type CourierApiIntegration = Infer<typeof couriersFields.apiIntegration>;
export type CourierApiCredentials = Infer<typeof couriersFields.apiCredentials>;
export type CourierMetrics = Infer<typeof couriersFields.metrics>;
