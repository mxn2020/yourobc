// convex/lib/yourobc/shipments/types.ts
// TypeScript type definitions for shipments module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ShipmentStatus,
  ShipmentServiceType,
  ShipmentPriority,
  ShipmentCommunicationChannel,
} from '@/schema/yourobc/shipments/types';

// Entity types
export type Shipment = Doc<'yourobcShipments'>;
export type ShipmentId = Id<'yourobcShipments'>;
export type ShipmentStatusHistory = Doc<'yourobcShipmentStatusHistory'>;
export type ShipmentStatusHistoryId = Id<'yourobcShipmentStatusHistory'>;

// Address interface (matching addressSchema)
export interface ShipmentAddress {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  countryCode: string;
}

// Dimensions interface (matching dimensionsSchema)
export interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
  chargeableWeight?: number;
}

// Currency amount interface (matching currencyAmountSchema)
export interface CurrencyAmount {
  amount: number;
  currency: 'EUR' | 'USD';
  exchangeRate?: number;
  exchangeRateDate?: number;
}

// SLA interface (matching slaSchema)
export interface ShipmentSla {
  deadline: number;
  status: 'on_time' | 'warning' | 'overdue';
  remainingHours?: number;
}

// Scheduled time interface (matching scheduledTimeSchema)
export interface ScheduledTime {
  utcTimestamp: number;
  timezone: string;
}

// Data interfaces for creation
export interface CreateShipmentData {
  shipmentNumber: string;
  awbNumber?: string;
  customerReference?: string;
  serviceType: ShipmentServiceType;
  priority: ShipmentPriority;
  customerId: Id<'yourobcCustomers'>;
  quoteId?: Id<'yourobcQuotes'>;
  origin: ShipmentAddress;
  destination: ShipmentAddress;
  dimensions: ShipmentDimensions;
  description: string;
  specialInstructions?: string;
  currentStatus?: ShipmentStatus;
  sla: ShipmentSla;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  partnerReference?: string;
  agreedPrice: CurrencyAmount;
  actualCosts?: CurrencyAmount;
  totalPrice?: CurrencyAmount;
  purchasePrice?: CurrencyAmount;
  commission?: CurrencyAmount;
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  communicationChannel?: {
    type: ShipmentCommunicationChannel;
    identifier?: string;
  };
  tags?: string[];
  category?: string;
  customFields?: Record<string, any>;
}

export interface UpdateShipmentData {
  shipmentNumber?: string;
  awbNumber?: string;
  customerReference?: string;
  serviceType?: ShipmentServiceType;
  priority?: ShipmentPriority;
  description?: string;
  specialInstructions?: string;
  currentStatus?: ShipmentStatus;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  partnerReference?: string;
  actualCosts?: CurrencyAmount;
  totalPrice?: CurrencyAmount;
  purchasePrice?: CurrencyAmount;
  commission?: CurrencyAmount;
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  tags?: string[];
  category?: string;
}

// Response types
export interface ShipmentWithRelations extends Shipment {
  customer?: Doc<'yourobcCustomers'> | null;
  quote?: Doc<'yourobcQuotes'> | null;
  courier?: Doc<'yourobcCouriers'> | null;
  employee?: Doc<'yourobcEmployees'> | null;
  partner?: Doc<'yourobcPartners'> | null;
  statusHistory?: ShipmentStatusHistory[];
}

export interface ShipmentListResponse {
  items: Shipment[];
  returnedCount: number; // count of items returned in this page
  hasMore: boolean;
  cursor?: string; // cursor for pagination (only present in paginated queries)
}

// Filter types
export interface ShipmentFilters {
  status?: ShipmentStatus[];
  serviceType?: ShipmentServiceType[];
  priority?: ShipmentPriority[];
  customerId?: Id<'yourobcCustomers'>;
  assignedCourierId?: Id<'yourobcCouriers'>;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  search?: string;
  dateFrom?: number;
  dateTo?: number;
}

// Status history data interface
export interface CreateStatusHistoryData {
  shipmentId: ShipmentId;
  status: ShipmentStatus;
  timestamp: number;
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
