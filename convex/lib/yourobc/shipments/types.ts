// convex/lib/yourobc/shipments/types.ts
// convex/yourobc/shipments/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import type { CommunicationChannel as BaseCommunicationChannel, ScheduledTime } from '../../../schema/yourobc/base';
import { CustomerId } from '../customers';
import { PartnerId } from '../partners';
import { Address, CurrencyAmount, Dimensions, FlightDetails } from '../shared';

// Re-export CommunicationChannel for use in other modules
export type { BaseCommunicationChannel as CommunicationChannel };

export type Shipment = Doc<'yourobcShipments'>;
export type ShipmentId = Id<'yourobcShipments'>;
export type ShipmentStatusHistory = Doc<'yourobcShipmentStatusHistory'>;
export type ShipmentStatusHistoryId = Id<'yourobcShipmentStatusHistory'>;

export interface SLA {
  deadline: number;
  status: 'on_time' | 'warning' | 'overdue';
  remainingHours?: number;
}

export interface NextTask {
  description: string;
  assignedTo?: string;
  dueDate?: number;
  priority: 'standard' | 'urgent' | 'critical';
}

export interface Routing {
  outboundFlight?: FlightDetails;
  returnFlight?: FlightDetails;
}

// Enhanced fields for dashboard
export interface AssignedTo {
  name: string;
  type: 'OBC-Kurier' | 'NFO-Partner';
  role?: 'pickup' | 'delivery' | 'customs' | 'general';
}

export interface CustomsInfo {
  hasExport: boolean;
  hasImport: boolean;
  hasTransit: boolean;
  exportDetails?: string;
  importDetails?: string;
  transitDetails?: string;
}

export interface ShipmentDocumentStatus {
  awb: 'missing' | 'pending' | 'complete';
  hawb?: 'missing' | 'pending' | 'complete'; // NFO only
  mawb?: 'missing' | 'pending' | 'complete'; // NFO only
  pod: 'missing' | 'pending' | 'complete';
  lastUpdated?: number;
}



export interface ShipmentCommunication {
  customerChannels: BaseCommunicationChannel[]
  partnerChannels?: BaseCommunicationChannel[]
  courierChannels?: BaseCommunicationChannel[]
  pickupChannels?: BaseCommunicationChannel[]
  deliveryChannels?: BaseCommunicationChannel[]
  customsChannels?: BaseCommunicationChannel[]
}

export interface CreateShipmentData {
  shipmentNumber?: string;
  awbNumber?: string;
  customerReference?: string;
  quoteId?: Id<'yourobcQuotes'>;
  customerId: CustomerId;
  serviceType: 'OBC' | 'NFO';
  priority: 'standard' | 'urgent' | 'critical';
  origin: Address;
  destination: Address;
  dimensions: Dimensions;
  description: string;
  specialInstructions?: string;
  deadline: number;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  partnerId?: PartnerId;
  partnerReference?: string;
  routing?: Routing;
  agreedPrice: CurrencyAmount;
  actualCosts?: CurrencyAmount;
  // Enhanced dashboard fields
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  customsInfo?: CustomsInfo;
  documentStatus?: ShipmentDocumentStatus;
}

export interface UpdateShipmentData {
  shipmentNumber?: string;
  awbNumber?: string;
  customerReference?: string;
  serviceType?: 'OBC' | 'NFO';
  priority?: 'standard' | 'urgent' | 'critical';
  origin?: Address;
  destination?: Address;
  dimensions?: Dimensions;
  description?: string;
  specialInstructions?: string;
  deadline?: number;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  partnerId?: PartnerId;
  partnerReference?: string;
  routing?: Routing;
  agreedPrice?: CurrencyAmount;
  actualCosts?: CurrencyAmount;
  // Enhanced dashboard fields
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  customsInfo?: CustomsInfo;
  documentStatus?: ShipmentDocumentStatus;
}

export interface ShipmentFilters {
  status?: ('quoted' | 'booked' | 'pickup' | 'in_transit' | 'customs' | 'delivered' | 'document' | 'invoiced' | 'cancelled')[];
  serviceType?: ('OBC' | 'NFO')[];
  priority?: ('standard' | 'urgent' | 'critical')[];
  slaStatus?: ('on_time' | 'warning' | 'overdue')[];
  customerId?: CustomerId[];
  assignedCourierId?: Id<'yourobcCouriers'>[];
  partnerId?: PartnerId[];
  originCountry?: string[];
  destinationCountry?: string[];
  dateRange?: {
    start: number;
    end: number;
    field: 'createdAt' | 'deadline' | 'completedAt';
  };
  search?: string;
}

export interface ShipmentListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'shipmentNumber' | 'status' | 'deadline' | 'priority' | 'createdAt' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
  filters?: ShipmentFilters;
}

export interface ShipmentStats {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  shipmentsByStatus: Record<string, number>;
  shipmentsByServiceType: Record<string, number>;
  shipmentsByPriority: Record<string, number>;
  slaPerformance: {
    onTime: number;
    warning: number;
    overdue: number;
  };
  avgDeliveryTime: number;
  totalRevenue: number;
  avgRevenue: number;
}

export interface StatusUpdateData {
  status: 'quoted' | 'booked' | 'pickup' | 'in_transit' | 'customs' | 'delivered' | 'document' | 'invoiced' | 'cancelled';
  location?: string;
  notes?: string;
  metadata?: {
    flightNumber?: string;
    estimatedArrival?: number;
    delayReason?: string;
    podReceived?: boolean;
    customerSignature?: string;
    courierAssigned?: Id<'yourobcCouriers'>;
    courierNumber?: string;
    oldDeadline?: number;
    newDeadline?: number;
    reason?: string;
    actualCosts?: CurrencyAmount;
    costNotes?: string;
    cancellationReason?: string;
  };
}

export interface CreateStatusHistoryData {
  shipmentId: ShipmentId;
  status: 'quoted' | 'booked' | 'pickup' | 'in_transit' | 'customs' | 'delivered' | 'document' | 'invoiced' | 'cancelled';
  timestamp: number;
  location?: string;
  notes?: string;
  metadata?: StatusUpdateData['metadata'];
}