// convex/lib/yourobc/shipments/utils.ts
// convex/yourobc/shipments/utils.ts

import { SHIPMENT_CONSTANTS, SHIPMENT_STATUS_COLORS, PRIORITY_COLORS, SLA_STATUS_COLORS } from './constants';
import type { 
  Shipment, 
  CreateShipmentData, 
  UpdateShipmentData, 
  SLA,
  StatusUpdateData,
  NextTask
} from './types';

import {
  isValidEmail,
  isValidPhone,
  generateSequentialNumber,
  validateAddress,
  validateCurrencyAmount,
  validateDimensions,
} from '../shared';
import type {
  Address,
  CurrencyAmount,
  Dimensions,
} from '../shared';

export function validateShipmentData(data: Partial<CreateShipmentData | UpdateShipmentData>): string[] {
  const errors: string[] = [];

  if (data.shipmentNumber && data.shipmentNumber.length > SHIPMENT_CONSTANTS.LIMITS.MAX_SHIPMENT_NUMBER_LENGTH) {
    errors.push(`Shipment number must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_SHIPMENT_NUMBER_LENGTH} characters`);
  }

  if (data.awbNumber && data.awbNumber.length > SHIPMENT_CONSTANTS.LIMITS.MAX_AWB_NUMBER_LENGTH) {
    errors.push(`AWB number must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_AWB_NUMBER_LENGTH} characters`);
  }

  if (data.customerReference && data.customerReference.length > SHIPMENT_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH) {
    errors.push(`Customer reference must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH} characters`);
  }

  if (data.description !== undefined && !data.description.trim()) {
    errors.push('Description is required');
  }

  if (data.description && data.description.length > SHIPMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.specialInstructions && data.specialInstructions.length > SHIPMENT_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH) {
    errors.push(`Special instructions must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH} characters`);
  }

  if (data.courierInstructions && data.courierInstructions.length > SHIPMENT_CONSTANTS.LIMITS.MAX_COURIER_INSTRUCTIONS_LENGTH) {
    errors.push(`Courier instructions must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_COURIER_INSTRUCTIONS_LENGTH} characters`);
  }

  if (data.partnerReference && data.partnerReference.length > SHIPMENT_CONSTANTS.LIMITS.MAX_PARTNER_REFERENCE_LENGTH) {
    errors.push(`Partner reference must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_PARTNER_REFERENCE_LENGTH} characters`);
  }

  if (data.deadline && data.deadline <= Date.now()) {
    errors.push('Deadline must be in the future');
  }

  if (data.origin) {
    const originErrors = validateAddress(data.origin, 'origin');
    errors.push(...originErrors);
  }

  if (data.destination) {
    const destinationErrors = validateAddress(data.destination, 'destination');
    errors.push(...destinationErrors);
  }

  if (data.dimensions) {
    const dimensionsErrors = validateDimensions(data.dimensions);
    errors.push(...dimensionsErrors);
  }

  if (data.agreedPrice) {
    const priceErrors = validateCurrencyAmount(data.agreedPrice, 'agreed price');
    errors.push(...priceErrors);
  }

  if (data.actualCosts) {
    const costsErrors = validateCurrencyAmount(data.actualCosts, 'actual costs');
    errors.push(...costsErrors);
  }

  return errors;
}

export function validateStatusUpdate(data: StatusUpdateData): string[] {
  const errors: string[] = [];

  if (data.metadata?.flightNumber && data.metadata.flightNumber.length > SHIPMENT_CONSTANTS.LIMITS.MAX_FLIGHT_NUMBER_LENGTH) {
    errors.push(`Flight number must be less than ${SHIPMENT_CONSTANTS.LIMITS.MAX_FLIGHT_NUMBER_LENGTH} characters`);
  }

  if (data.metadata?.estimatedArrival && data.metadata.estimatedArrival <= Date.now()) {
    errors.push('Estimated arrival must be in the future');
  }

  if (data.metadata?.newDeadline && data.metadata.oldDeadline && data.metadata.newDeadline <= data.metadata.oldDeadline) {
    errors.push('New deadline must be later than the old deadline');
  }

  if (data.metadata?.actualCosts) {
    const costsErrors = validateCurrencyAmount(data.metadata.actualCosts, 'actual costs');
    errors.push(...costsErrors);
  }

  return errors;
}

export function generateShipmentNumber(serviceType: 'OBC' | 'NFO', sequence: number): string {
  const prefix = serviceType === 'OBC' ? 'OBC' : 'NFO';
  return generateSequentialNumber(prefix, sequence);
}

export function generateAWBNumber(): string {
  // Generate a simple AWB number with timestamp and random digits
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AWB${timestamp}${random}`;
}

export function getShipmentStatusColor(status: Shipment['currentStatus']): string {
  return SHIPMENT_STATUS_COLORS[status] || '#6b7280';
}

export function getPriorityColor(priority: Shipment['priority']): string {
  return PRIORITY_COLORS[priority] || '#6b7280';
}

export function getSLAStatusColor(slaStatus: SLA['status']): string {
  return SLA_STATUS_COLORS[slaStatus] || '#6b7280';
}

export function calculateSLA(deadline: number, currentStatus: Shipment['currentStatus']): SLA {
  const now = Date.now();
  const remainingHours = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60)));
  const warningThreshold = SHIPMENT_CONSTANTS.DEFAULT_VALUES.SLA_WARNING_HOURS;

  let status: SLA['status'] = 'on_time';
  
  if (currentStatus === SHIPMENT_CONSTANTS.STATUS.DELIVERED || 
      currentStatus === SHIPMENT_CONSTANTS.STATUS.INVOICED ||
      currentStatus === SHIPMENT_CONSTANTS.STATUS.CANCELLED) {
    status = now <= deadline ? 'on_time' : 'overdue';
  } else if (now > deadline) {
    status = 'overdue';
  } else if (remainingHours <= warningThreshold) {
    status = 'warning';
  }

  return {
    deadline,
    status,
    remainingHours: remainingHours > 0 ? remainingHours : undefined,
  };
}

export function getNextTask(shipment: Shipment | { currentStatus: Shipment['currentStatus']; priority: Shipment['priority']; sla: Shipment['sla'] }): NextTask | undefined {
  const { currentStatus } = shipment;
  const now = Date.now();

  switch (currentStatus) {
    case SHIPMENT_CONSTANTS.STATUS.QUOTED:
      return {
        description: 'Follow up on quote with customer',
        dueDate: now + (24 * 60 * 60 * 1000), // 1 day
        priority: 'standard' as const,
      };

    case SHIPMENT_CONSTANTS.STATUS.BOOKED:
      return {
        description: 'Arrange pickup with courier',
        dueDate: now + (2 * 60 * 60 * 1000), // 2 hours
        priority: 'urgent' as const,
      };

    case SHIPMENT_CONSTANTS.STATUS.PICKUP:
      return {
        description: 'Confirm pickup completion',
        dueDate: now + (4 * 60 * 60 * 1000), // 4 hours
        priority: 'urgent' as const,
      };

    case SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT:
      return {
        description: 'Monitor shipment progress',
        dueDate: shipment.sla.deadline,
        priority: shipment.priority,
      };

    case SHIPMENT_CONSTANTS.STATUS.DELIVERED:
      return {
        description: 'Obtain proof of delivery',
        dueDate: now + (24 * 60 * 60 * 1000), // 1 day
        priority: 'standard' as const,
      };

    case SHIPMENT_CONSTANTS.STATUS.DOCUMENT:
      return {
        description: 'Prepare and send invoice',
        dueDate: now + (48 * 60 * 60 * 1000), // 2 days
        priority: 'standard' as const,
      };

    default:
      return undefined;
  }
}

export function formatShipmentDisplayName(shipment: Shipment): string {
  return `${shipment.shipmentNumber} - ${shipment.description.substring(0, 50)}${shipment.description.length > 50 ? '...' : ''}`;
}

export function formatAddressDisplay(address: Address): string {
  const parts = [address.street, address.city, address.country].filter(Boolean);
  return parts.join(', ');
}

export function formatDimensionsDisplay(dimensions: Dimensions): string {
  const { length, width, height, weight, unit, weightUnit } = dimensions;
  return `${length}×${width}×${height} ${unit}, ${weight} ${weightUnit}`;
}

export function formatCurrencyDisplay(amount: CurrencyAmount): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
  });
  return formatter.format(amount.amount);
}

export function sanitizeShipmentForExport(shipment: Shipment, includePrivateData = false): Partial<Shipment> {
  const publicData = {
    shipmentNumber: shipment.shipmentNumber,
    awbNumber: shipment.awbNumber,
    customerReference: shipment.customerReference,
    serviceType: shipment.serviceType,
    priority: shipment.priority,
    currentStatus: shipment.currentStatus,
    origin: shipment.origin,
    destination: shipment.destination,
    dimensions: shipment.dimensions,
    description: shipment.description,
    sla: shipment.sla,
    routing: shipment.routing,
    createdAt: shipment.createdAt,
    completedAt: shipment.completedAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      customerId: shipment.customerId,
      quoteId: shipment.quoteId,
      assignedCourierId: shipment.assignedCourierId,
      partnerId: shipment.partnerId,
      partnerReference: shipment.partnerReference,
      specialInstructions: shipment.specialInstructions,
      courierInstructions: shipment.courierInstructions,
      agreedPrice: shipment.agreedPrice,
      actualCosts: shipment.actualCosts,
      nextTask: shipment.nextTask,
      createdBy: shipment.createdBy,
    };
  }

  return publicData;
}

export function canUpdateShipmentStatus(currentStatus: Shipment['currentStatus'], newStatus: Shipment['currentStatus']): boolean {
  const statusFlow: Record<Shipment['currentStatus'], Shipment['currentStatus'][]> = {
    [SHIPMENT_CONSTANTS.STATUS.QUOTED]: [SHIPMENT_CONSTANTS.STATUS.BOOKED, SHIPMENT_CONSTANTS.STATUS.CANCELLED],
    [SHIPMENT_CONSTANTS.STATUS.BOOKED]: [SHIPMENT_CONSTANTS.STATUS.PICKUP, SHIPMENT_CONSTANTS.STATUS.CANCELLED],
    [SHIPMENT_CONSTANTS.STATUS.PICKUP]: [SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT, SHIPMENT_CONSTANTS.STATUS.CANCELLED],
    [SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT]: [SHIPMENT_CONSTANTS.STATUS.CUSTOMS, SHIPMENT_CONSTANTS.STATUS.DELIVERED, SHIPMENT_CONSTANTS.STATUS.CANCELLED],
    [SHIPMENT_CONSTANTS.STATUS.CUSTOMS]: [SHIPMENT_CONSTANTS.STATUS.DELIVERED, SHIPMENT_CONSTANTS.STATUS.CANCELLED],
    [SHIPMENT_CONSTANTS.STATUS.DELIVERED]: [SHIPMENT_CONSTANTS.STATUS.DOCUMENT],
    [SHIPMENT_CONSTANTS.STATUS.DOCUMENT]: [SHIPMENT_CONSTANTS.STATUS.INVOICED],
    [SHIPMENT_CONSTANTS.STATUS.INVOICED]: [],
    [SHIPMENT_CONSTANTS.STATUS.CANCELLED]: [],
  };

  return statusFlow[currentStatus]?.includes(newStatus) || false;
}

export function calculateDeliveryTime(shipment: Shipment): number | null {
  if (!shipment.completedAt || shipment.currentStatus !== SHIPMENT_CONSTANTS.STATUS.DELIVERED) {
    return null;
  }

  return Math.ceil((shipment.completedAt - shipment.createdAt) / (1000 * 60 * 60)); // Hours
}

export function isShipmentOverdue(shipment: Shipment): boolean {
  return shipment.sla.status === SHIPMENT_CONSTANTS.SLA_STATUS.OVERDUE;
}

export function isShipmentActive(shipment: Shipment): boolean {
  const inactiveStatuses: Shipment['currentStatus'][] = [
    SHIPMENT_CONSTANTS.STATUS.DELIVERED,
    SHIPMENT_CONSTANTS.STATUS.INVOICED,
    SHIPMENT_CONSTANTS.STATUS.CANCELLED
  ];
  return !inactiveStatuses.includes(shipment.currentStatus);
}

export function convertDimensions(dimensions: Dimensions, targetUnit: 'cm' | 'inch', targetWeightUnit: 'kg' | 'lb'): Dimensions {
  let { length, width, height, weight, unit, weightUnit } = dimensions;

  // Convert dimensions
  if (unit !== targetUnit) {
    const factor = unit === 'cm' ? 0.393701 : 2.54; // cm to inch or inch to cm
    length = parseFloat((length * factor).toFixed(2));
    width = parseFloat((width * factor).toFixed(2));
    height = parseFloat((height * factor).toFixed(2));
  }

  // Convert weight
  if (weightUnit !== targetWeightUnit) {
    const factor = weightUnit === 'kg' ? 2.20462 : 0.453592; // kg to lb or lb to kg
    weight = parseFloat((weight * factor).toFixed(2));
  }

  return {
    length,
    width,
    height,
    weight,
    unit: targetUnit,
    weightUnit: targetWeightUnit,
  };
}