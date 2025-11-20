// convex/schema/software/yourobc/shipments/types.ts
// Type exports for shipments module

import type { Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import {
  shipmentStatusValidator,
  slaStatusValidator,
  documentCompletionStatusValidator,
  serviceTypeValidator,
  servicePriorityValidator,
  communicationChannelValidator,
  dimensionUnitValidator,
  weightUnitValidator,
  currencyValidator,
  addressSchema,
  dimensionsSchema,
  currencyAmountSchema,
  slaSchema,
  nextTaskSchema,
  flightDetailsSchema,
  routingSchema,
  documentStatusSchema,
  customsInfoSchema,
  scheduledTimeSchema,
} from './validators';

// ============================================================================
// Validator-derived Types
// ============================================================================

export type ShipmentStatus = Infer<typeof shipmentStatusValidator>;
export type SlaStatus = Infer<typeof slaStatusValidator>;
export type DocumentCompletionStatus = Infer<typeof documentCompletionStatusValidator>;
export type ServiceType = Infer<typeof serviceTypeValidator>;
export type ServicePriority = Infer<typeof servicePriorityValidator>;
export type CommunicationChannel = Infer<typeof communicationChannelValidator>;
export type DimensionUnit = Infer<typeof dimensionUnitValidator>;
export type WeightUnit = Infer<typeof weightUnitValidator>;
export type Currency = Infer<typeof currencyValidator>;

// ============================================================================
// Schema-derived Types
// ============================================================================

export type Address = Infer<typeof addressSchema>;
export type Dimensions = Infer<typeof dimensionsSchema>;
export type CurrencyAmount = Infer<typeof currencyAmountSchema>;
export type Sla = Infer<typeof slaSchema>;
export type NextTask = Infer<typeof nextTaskSchema>;
export type FlightDetails = Infer<typeof flightDetailsSchema>;
export type Routing = Infer<typeof routingSchema>;
export type DocumentStatus = Infer<typeof documentStatusSchema>;
export type CustomsInfo = Infer<typeof customsInfoSchema>;
export type ScheduledTime = Infer<typeof scheduledTimeSchema>;

// ============================================================================
// Document Types - Shipments
// ============================================================================

export type Shipment = Doc<'yourobcShipments'>;
export type ShipmentId = Id<'yourobcShipments'>;

// ============================================================================
// Document Types - Shipment Status History
// ============================================================================

export type ShipmentStatusHistory = Doc<'yourobcShipmentStatusHistory'>;
export type ShipmentStatusHistoryId = Id<'yourobcShipmentStatusHistory'>;

// ============================================================================
// Data Transfer Types - Shipments
// ============================================================================

/**
 * Create shipment input data
 */
export interface CreateShipmentInput {
  shipmentNumber: string;
  awbNumber?: string;
  customerReference?: string;
  serviceType: ServiceType;
  priority: ServicePriority;
  customerId: Id<'yourobcCustomers'>;
  quoteId?: Id<'yourobcQuotes'>;
  origin: Address;
  destination: Address;
  dimensions: Dimensions;
  description: string;
  specialInstructions?: string;
  currentStatus: ShipmentStatus;
  sla: Sla;
  nextTask?: NextTask;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  partnerReference?: string;
  routing?: Routing;
  agreedPrice: CurrencyAmount;
  actualCosts?: CurrencyAmount;
  totalPrice?: CurrencyAmount;
  purchasePrice?: CurrencyAmount;
  commission?: CurrencyAmount;
  documentStatus?: DocumentStatus;
  customsInfo?: CustomsInfo;
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  communicationChannel?: {
    type: CommunicationChannel;
    identifier?: string;
  };
  tags?: string[];
  category?: string;
}

/**
 * Update shipment input data
 */
export interface UpdateShipmentInput {
  shipmentNumber?: string;
  awbNumber?: string;
  customerReference?: string;
  serviceType?: ServiceType;
  priority?: ServicePriority;
  customerId?: Id<'yourobcCustomers'>;
  quoteId?: Id<'yourobcQuotes'>;
  origin?: Address;
  destination?: Address;
  dimensions?: Dimensions;
  description?: string;
  specialInstructions?: string;
  currentStatus?: ShipmentStatus;
  sla?: Sla;
  nextTask?: NextTask;
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  partnerReference?: string;
  routing?: Routing;
  agreedPrice?: CurrencyAmount;
  actualCosts?: CurrencyAmount;
  totalPrice?: CurrencyAmount;
  purchasePrice?: CurrencyAmount;
  commission?: CurrencyAmount;
  documentStatus?: DocumentStatus;
  customsInfo?: CustomsInfo;
  pickupTime?: ScheduledTime;
  deliveryTime?: ScheduledTime;
  communicationChannel?: {
    type: CommunicationChannel;
    identifier?: string;
  };
  completedAt?: number;
  tags?: string[];
  category?: string;
}

// ============================================================================
// Data Transfer Types - Shipment Status History
// ============================================================================

/**
 * Shipment status history metadata
 */
export interface StatusHistoryMetadata {
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
}

/**
 * Create shipment status history input data
 */
export interface CreateShipmentStatusHistoryInput {
  shipmentId: ShipmentId;
  status: ShipmentStatus;
  timestamp: number;
  location?: string;
  notes?: string;
  metadata?: StatusHistoryMetadata;
}

/**
 * Update shipment status history input data
 */
export interface UpdateShipmentStatusHistoryInput {
  status?: ShipmentStatus;
  timestamp?: number;
  location?: string;
  notes?: string;
  metadata?: StatusHistoryMetadata;
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

/**
 * Shipment with populated relations
 */
export interface ShipmentWithRelations extends Shipment {
  customer?: Doc<'yourobcCustomers'>;
  quote?: Doc<'yourobcQuotes'>;
  courier?: Doc<'yourobcCouriers'>;
  employee?: Doc<'yourobcEmployees'>;
  partner?: Doc<'yourobcPartners'>;
  owner?: Doc<'userProfiles'>;
  statusHistory?: ShipmentStatusHistory[];
}

/**
 * Shipment status history with populated relations
 */
export interface ShipmentStatusHistoryWithRelations extends ShipmentStatusHistory {
  shipment?: Shipment;
  owner?: Doc<'userProfiles'>;
}
