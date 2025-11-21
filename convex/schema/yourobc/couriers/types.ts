// convex/schema/yourobc/couriers/types.ts
// Type extractions from validators for couriers module

import { Infer } from 'convex/values';
import { couriersValidators } from './validators';

// Extract types from validators
export type CourierStatus = Infer<typeof couriersValidators.status>;
export type CourierServiceType = Infer<typeof couriersValidators.serviceType>;
export type CourierDeliverySpeed = Infer<typeof couriersValidators.deliverySpeed>;
export type CourierPricingModel = Infer<typeof couriersValidators.pricingModel>;
export type CourierApiType = Infer<typeof couriersValidators.apiType>;
