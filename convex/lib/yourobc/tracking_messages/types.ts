// convex/lib/yourobc/tracking_messages/types.ts
// convex/lib/yourobc/trackingMessages/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import type { ShipmentStatus, Language as LangType } from '../../../schema/yourobc/base';

export type TrackingMessage = Doc<'yourobcTrackingMessages'>;
export type TrackingMessageId = Id<'yourobcTrackingMessages'>;

export type ServiceType = 'OBC' | 'NFO';
export type Language = LangType;

export interface CreateTrackingMessageData {
  name: string;
  serviceType: ServiceType;
  status: ShipmentStatus;
  language: Language;
  subject?: string;
  template: string;
  variables: string[];
  isActive: boolean;
  category?: 'booking' | 'pickup' | 'in_transit' | 'delivery' | 'customs' | 'general';
}

export interface UpdateTrackingMessageData {
  serviceType?: ServiceType;
  status?: ShipmentStatus;
  language?: Language;
  subject?: string;
  template?: string;
  variables?: string[];
  isActive?: boolean;
  category?: 'booking' | 'pickup' | 'in_transit' | 'delivery' | 'customs' | 'general';
}

export interface TrackingMessageVariables {
  shipmentNumber: string;
  customerName: string;
  customerCompany: string;
  origin: string;
  destination: string;
  awbNumber?: string;
  hawbNumber?: string;
  mawbNumber?: string;
  courierName?: string;
  courierPhone?: string;
  partnerName?: string;
  partnerContact?: string;
  pickupTime?: string;
  deliveryTime?: string;
  estimatedArrival?: string;
  flightNumber?: string;
  status: ShipmentStatus;
  notes?: string;
  trackingUrl?: string;
  currentDate: string;
  currentTime: string;
}

export interface GenerateMessageParams {
  templateId: TrackingMessageId;
  variables: TrackingMessageVariables;
}

export interface TrackingMessageFilters {
  serviceType?: ServiceType[];
  status?: ShipmentStatus[];
  language?: Language[];
  category?: string[];
  isActive?: boolean;
}
