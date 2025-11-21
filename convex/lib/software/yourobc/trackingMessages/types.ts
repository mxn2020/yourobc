// convex/lib/software/yourobc/trackingMessages/types.ts
// TypeScript type definitions for trackingMessages module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  TrackingMessagesStatus,
  TrackingMessagesType,
  TrackingMessagesPriority,
  TrackingMessagesDeliveryChannel,
} from '@/schema/software/yourobc/trackingMessages/types';

// Entity types
export type TrackingMessage = Doc<'softwareYourObcTrackingMessages'>;
export type TrackingMessageId = Id<'softwareYourObcTrackingMessages'>;

// Sub-types
export interface MessageRecipient {
  email?: string;
  phone?: string;
  name?: string;
  userId?: Id<'userProfiles'>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  event: string;
  description?: string;
  userId?: Id<'userProfiles'>;
}

export interface RoutingInfo {
  origin?: string;
  destination?: string;
  currentLocation?: string;
  estimatedDelivery?: number;
}

// Data interfaces
export interface CreateTrackingMessageData {
  messageId?: string; // Auto-generated if not provided
  subject?: string;
  content: string;
  status?: TrackingMessagesStatus;
  messageType: TrackingMessagesType;
  priority?: TrackingMessagesPriority;
  templateId?: string;
  shipmentId?: Id<'yourobcShipments'>;
  shipmentNumber?: string;
  recipients: MessageRecipient[];
  deliveryChannel?: TrackingMessagesDeliveryChannel;
  attachments?: MessageAttachment[];
  routingInfo?: RoutingInfo;
  tags?: string[];
  category?: string;
}

export interface UpdateTrackingMessageData {
  subject?: string;
  content?: string;
  status?: TrackingMessagesStatus;
  messageType?: TrackingMessagesType;
  priority?: TrackingMessagesPriority;
  recipients?: MessageRecipient[];
  deliveryChannel?: TrackingMessagesDeliveryChannel;
  attachments?: MessageAttachment[];
  routingInfo?: RoutingInfo;
  tags?: string[];
  category?: string;
}

// Response types
export interface TrackingMessageWithRelations extends TrackingMessage {
  shipment?: Doc<'yourobcShipments'> | null;
}

export interface TrackingMessageListResponse {
  items: TrackingMessage[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface TrackingMessageFilters {
  status?: TrackingMessagesStatus[];
  messageType?: TrackingMessagesType[];
  priority?: TrackingMessagesPriority[];
  shipmentId?: Id<'yourobcShipments'>;
  search?: string;
  unreadOnly?: boolean;
}
