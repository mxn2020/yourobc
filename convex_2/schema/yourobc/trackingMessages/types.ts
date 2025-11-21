// convex/schema/yourobc/trackingMessages/types.ts
// Type extractions from validators for trackingMessages module

import { Infer } from 'convex/values';
import {
  trackingMessagesValidators,
  trackingMessagesFields
} from './validators';

// Extract types from validators
export type TrackingMessagesStatus = Infer<typeof trackingMessagesValidators.status>;
export type TrackingMessagesType = Infer<typeof trackingMessagesValidators.messageType>;
export type TrackingMessagesPriority = Infer<typeof trackingMessagesValidators.priority>;
export type TrackingMessagesDeliveryChannel = Infer<typeof trackingMessagesValidators.deliveryChannel>;

// Extract complex field types
export type TrackingMessagesRecipient = Infer<typeof trackingMessagesFields.recipient>;
export type TrackingMessagesAttachment = Infer<typeof trackingMessagesFields.attachment>;
export type TrackingMessagesTimelineEvent = Infer<typeof trackingMessagesFields.timelineEvent>;
export type TrackingMessagesRoutingInfo = Infer<typeof trackingMessagesFields.routingInfo>;

