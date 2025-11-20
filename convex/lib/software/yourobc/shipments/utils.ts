// convex/lib/software/yourobc/shipments/utils.ts
// Utility functions for shipments module

import type {
  CreateShipmentInput,
  UpdateShipmentInput,
  CreateShipmentStatusHistoryInput,
  UpdateShipmentStatusHistoryInput,
  ShipmentStatus,
  Sla,
  SlaStatus,
} from '@/schema/software/yourobc/shipments';
import { SHIPMENTS_CONSTANTS } from './constants';

// ============================================================================
// Public ID Generation
// ============================================================================

/**
 * Generate a unique public ID for shipments
 */
export function generatePublicId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `shp_${timestamp}${randomStr}`;
}

/**
 * Generate a unique public ID for shipment status history
 */
export function generateStatusHistoryPublicId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `shp_hist_${timestamp}${randomStr}`;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate shipment data
 */
export function validateShipmentData(data: CreateShipmentInput): void {
  // Validate shipment number
  if (!data.shipmentNumber || data.shipmentNumber.trim().length === 0) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_SHIPMENT_NUMBER);
  }

  const trimmedNumber = data.shipmentNumber.trim();
  if (
    trimmedNumber.length < SHIPMENTS_CONSTANTS.MIN_SHIPMENT_NUMBER_LENGTH ||
    trimmedNumber.length > SHIPMENTS_CONSTANTS.MAX_SHIPMENT_NUMBER_LENGTH
  ) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_SHIPMENT_NUMBER);
  }

  // Validate dimensions
  if (
    data.dimensions.length <= 0 ||
    data.dimensions.width <= 0 ||
    data.dimensions.height <= 0 ||
    data.dimensions.weight <= 0
  ) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_DIMENSIONS);
  }

  // Validate pricing
  if (data.agreedPrice.amount < 0) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_PRICE);
  }

  if (data.actualCosts && data.actualCosts.amount < 0) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_PRICE);
  }

  // Validate SLA
  if (data.sla.deadline <= Date.now()) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_SLA);
  }
}

/**
 * Validate shipment update data
 */
export function validateShipmentUpdateData(data: UpdateShipmentInput): void {
  // Validate shipment number if provided
  if (data.shipmentNumber !== undefined) {
    if (!data.shipmentNumber || data.shipmentNumber.trim().length === 0) {
      throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_SHIPMENT_NUMBER);
    }

    const trimmedNumber = data.shipmentNumber.trim();
    if (
      trimmedNumber.length < SHIPMENTS_CONSTANTS.MIN_SHIPMENT_NUMBER_LENGTH ||
      trimmedNumber.length > SHIPMENTS_CONSTANTS.MAX_SHIPMENT_NUMBER_LENGTH
    ) {
      throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_SHIPMENT_NUMBER);
    }
  }

  // Validate dimensions if provided
  if (data.dimensions) {
    if (
      data.dimensions.length <= 0 ||
      data.dimensions.width <= 0 ||
      data.dimensions.height <= 0 ||
      data.dimensions.weight <= 0
    ) {
      throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_DIMENSIONS);
    }
  }

  // Validate pricing if provided
  if (data.agreedPrice && data.agreedPrice.amount < 0) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_PRICE);
  }

  if (data.actualCosts && data.actualCosts.amount < 0) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.INVALID_PRICE);
  }
}

/**
 * Validate status history data
 */
export function validateStatusHistoryData(
  data: CreateShipmentStatusHistoryInput
): void {
  if (data.timestamp > Date.now()) {
    throw new Error('Status history timestamp cannot be in the future');
  }
}

/**
 * Validate status history update data
 */
export function validateStatusHistoryUpdateData(
  data: UpdateShipmentStatusHistoryInput
): void {
  if (data.timestamp !== undefined && data.timestamp > Date.now()) {
    throw new Error('Status history timestamp cannot be in the future');
  }
}

// ============================================================================
// Status Transition Validation
// ============================================================================

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): boolean {
  const allowedTransitions =
    SHIPMENTS_CONSTANTS.ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus as any);
}

/**
 * Validate status transition
 */
export function validateStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): void {
  if (!isValidStatusTransition(currentStatus, newStatus)) {
    throw new Error(
      `${SHIPMENTS_CONSTANTS.ERRORS.INVALID_STATUS_TRANSITION}: Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
}

// ============================================================================
// SLA Calculation Functions
// ============================================================================

/**
 * Calculate SLA status based on deadline and current time
 */
export function calculateSlaStatus(deadline: number): SlaStatus {
  const now = Date.now();
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);

  if (hoursRemaining < SHIPMENTS_CONSTANTS.SLA_OVERDUE_THRESHOLD) {
    return 'overdue';
  } else if (hoursRemaining < SHIPMENTS_CONSTANTS.SLA_WARNING_THRESHOLD) {
    return 'warning';
  } else {
    return 'on_time';
  }
}

/**
 * Calculate remaining hours for SLA
 */
export function calculateRemainingHours(deadline: number): number {
  const now = Date.now();
  const hoursRemaining = (deadline - now) / (1000 * 60 * 60);
  return Math.max(0, hoursRemaining);
}

/**
 * Update SLA with current status
 */
export function updateSla(sla: Sla): Sla {
  return {
    ...sla,
    status: calculateSlaStatus(sla.deadline),
    remainingHours: calculateRemainingHours(sla.deadline),
  };
}

// ============================================================================
// Search and Filter Functions
// ============================================================================

/**
 * Check if shipment matches search term
 */
export function matchesSearchTerm(
  shipment: any,
  searchTerm: string
): boolean {
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase();
  return (
    shipment.shipmentNumber?.toLowerCase().includes(term) ||
    shipment.awbNumber?.toLowerCase().includes(term) ||
    shipment.customerReference?.toLowerCase().includes(term) ||
    shipment.description?.toLowerCase().includes(term)
  );
}

// ============================================================================
// Data Formatting Functions
// ============================================================================

/**
 * Format shipment number for display
 */
export function formatShipmentNumber(shipmentNumber: string): string {
  return shipmentNumber.toUpperCase();
}

/**
 * Get status label
 */
export function getStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    quoted: 'Quoted',
    booked: 'Booked',
    pickup: 'Pickup',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    customs: 'Customs',
    document: 'Documentation',
    invoiced: 'Invoiced',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}
