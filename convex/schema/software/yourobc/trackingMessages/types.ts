// convex/schema/software/yourobc/trackingMessages/types.ts
// Type extractions from validators for trackingMessages module

import { Infer } from 'convex/values';
import { trackingMessagesValidators } from './validators';

// Extract types from validators
export type TrackingMessagesStatus = Infer<typeof trackingMessagesValidators.status>;
export type TrackingMessagesType = Infer<typeof trackingMessagesValidators.messageType>;
export type TrackingMessagesPriority = Infer<typeof trackingMessagesValidators.priority>;
export type TrackingMessagesDeliveryChannel = Infer<typeof trackingMessagesValidators.deliveryChannel>;
