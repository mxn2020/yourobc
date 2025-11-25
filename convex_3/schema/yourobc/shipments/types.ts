// convex/schema/yourobc/shipments/types.ts
// Type extractions from validators for shipments module

import { Infer } from 'convex/values';
import { shipmentsValidators } from './validators';
import { baseValidators } from '@/schema/base.validators';

// Extract types from validators
export type ShipmentStatus = Infer<typeof shipmentsValidators.status>;
export type ShipmentServiceType = Infer<typeof baseValidators.serviceType>;
export type ShipmentPriority = Infer<typeof shipmentsValidators.priority>;
export type ShipmentCommunicationChannel = Infer<typeof shipmentsValidators.communicationChannel>;
export type ShipmentSlaStatus = Infer<typeof shipmentsValidators.slaStatus>;
export type ShipmentDocumentStatus = Infer<typeof shipmentsValidators.documentStatus>;
