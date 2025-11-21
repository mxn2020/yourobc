// convex/schema/yourobc/shipments/types.ts
// Type extractions from validators for shipments module

import { Infer } from 'convex/values';
import { shipmentsValidators } from './validators';

// Extract types from validators
export type ShipmentStatus = Infer<typeof shipmentsValidators.status>;
export type ShipmentServiceType = Infer<typeof shipmentsValidators.serviceType>;
export type ShipmentPriority = Infer<typeof shipmentsValidators.priority>;
export type ShipmentCommunicationChannel = Infer<typeof shipmentsValidators.communicationChannel>;
export type ShipmentSlaStatus = Infer<typeof shipmentsValidators.slaStatus>;
export type ShipmentDocumentStatus = Infer<typeof shipmentsValidators.documentStatus>;
