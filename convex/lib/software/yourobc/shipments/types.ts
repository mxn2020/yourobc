// convex/lib/software/yourobc/shipments/types.ts
// Library types for shipments module

import type { Id } from '@/generated/dataModel';
import type {
  ShipmentStatus,
  ServiceType,
  ServicePriority,
  SlaStatus,
} from '@/schema/software/yourobc/shipments';

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Shipment filters for list queries
 */
export interface ShipmentFilters {
  status?: ShipmentStatus;
  serviceType?: ServiceType;
  priority?: ServicePriority;
  customerId?: Id<'yourobcCustomers'>;
  employeeId?: Id<'yourobcEmployees'>;
  partnerId?: Id<'yourobcPartners'>;
  assignedCourierId?: Id<'yourobcCouriers'>;
  slaStatus?: SlaStatus;
  searchTerm?: string;
  includeDeleted?: boolean;
}

/**
 * Shipment list options
 */
export interface ShipmentListOptions {
  filters?: ShipmentFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'shipmentNumber' | 'createdAt' | 'sla.deadline' | 'currentStatus';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Shipment status history filters
 */
export interface ShipmentStatusHistoryFilters {
  shipmentId?: Id<'yourobcShipments'>;
  status?: ShipmentStatus;
  startDate?: number;
  endDate?: number;
  includeDeleted?: boolean;
}

/**
 * Shipment status history list options
 */
export interface ShipmentStatusHistoryListOptions {
  filters?: ShipmentStatusHistoryFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Shipment statistics summary
 */
export interface ShipmentStatsSummary {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  cancelledShipments: number;
  onTimeShipments: number;
  overdueShipments: number;
  totalRevenue: number;
  averageDeliveryTime: number;
}

/**
 * Shipment status breakdown
 */
export interface ShipmentStatusBreakdown {
  status: ShipmentStatus;
  count: number;
  percentage: number;
}

// ============================================================================
// Business Logic Types
// ============================================================================

/**
 * Status change data
 */
export interface StatusChangeData {
  shipmentId: Id<'yourobcShipments'>;
  newStatus: ShipmentStatus;
  location?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * SLA update data
 */
export interface SlaUpdateData {
  deadline: number;
  reason?: string;
}

/**
 * Assignment data
 */
export interface AssignmentData {
  assignedCourierId?: Id<'yourobcCouriers'>;
  courierInstructions?: string;
  employeeId?: Id<'yourobcEmployees'>;
}
