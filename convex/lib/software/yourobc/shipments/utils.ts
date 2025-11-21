// convex/lib/software/yourobc/shipments/utils.ts
// Validation functions and utility helpers for shipments module

import { SHIPMENTS_CONSTANTS } from './constants';
import type {
  CreateShipmentData,
  UpdateShipmentData,
  ShipmentDimensions,
  ShipmentAddress,
  CurrencyAmount,
} from './types';

/**
 * Validate shipment data for creation/update
 */
export function validateShipmentData(
  data: Partial<CreateShipmentData | UpdateShipmentData>
): string[] {
  const errors: string[] = [];

  // Validate shipment number
  if (data.shipmentNumber !== undefined) {
    const trimmed = data.shipmentNumber.trim();

    if (!trimmed) {
      errors.push('Shipment number is required');
    } else if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_SHIPMENT_NUMBER_LENGTH) {
      errors.push(`Shipment number cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_SHIPMENT_NUMBER_LENGTH} characters`);
    } else if (!SHIPMENTS_CONSTANTS.VALIDATION.SHIPMENT_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Shipment number must contain only letters, numbers, and hyphens');
    }
  }

  // Validate AWB number
  if (data.awbNumber !== undefined && data.awbNumber.trim()) {
    const trimmed = data.awbNumber.trim();
    if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_AWB_NUMBER_LENGTH) {
      errors.push(`AWB number cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_AWB_NUMBER_LENGTH} characters`);
    } else if (!SHIPMENTS_CONSTANTS.VALIDATION.AWB_NUMBER_PATTERN.test(trimmed)) {
      errors.push('AWB number must contain only letters, numbers, and hyphens');
    }
  }

  // Validate customer reference
  if (data.customerReference !== undefined && data.customerReference.trim()) {
    const trimmed = data.customerReference.trim();
    if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH) {
      errors.push(`Customer reference cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined) {
    const trimmed = data.description.trim();
    if (!trimmed) {
      errors.push('Description is required');
    } else if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate special instructions
  if (data.specialInstructions !== undefined && data.specialInstructions.trim()) {
    const trimmed = data.specialInstructions.trim();
    if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH) {
      errors.push(`Special instructions cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH} characters`);
    }
  }

  // Validate courier instructions
  if (data.courierInstructions !== undefined && data.courierInstructions.trim()) {
    const trimmed = data.courierInstructions.trim();
    if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_COURIER_INSTRUCTIONS_LENGTH) {
      errors.push(`Courier instructions cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_COURIER_INSTRUCTIONS_LENGTH} characters`);
    }
  }

  // Validate partner reference
  if (data.partnerReference !== undefined && data.partnerReference.trim()) {
    const trimmed = data.partnerReference.trim();
    if (trimmed.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_PARTNER_REFERENCE_LENGTH) {
      errors.push(`Partner reference cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_PARTNER_REFERENCE_LENGTH} characters`);
    }
  }

  // Validate dimensions
  if ('dimensions' in data && data.dimensions) {
    const dimErrors = validateDimensions(data.dimensions);
    errors.push(...dimErrors);
  }

  // Validate origin address
  if ('origin' in data && data.origin) {
    const addressErrors = validateAddress(data.origin, 'Origin');
    errors.push(...addressErrors);
  }

  // Validate destination address
  if ('destination' in data && data.destination) {
    const addressErrors = validateAddress(data.destination, 'Destination');
    errors.push(...addressErrors);
  }

  // Validate agreed price
  if ('agreedPrice' in data && data.agreedPrice) {
    const priceErrors = validateCurrencyAmount(data.agreedPrice, 'Agreed price');
    errors.push(...priceErrors);
  }

  // Validate actual costs
  if ('actualCosts' in data && data.actualCosts) {
    const costErrors = validateCurrencyAmount(data.actualCosts, 'Actual costs');
    errors.push(...costErrors);
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.some(tag => !tag.trim())) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Validate dimensions
 */
export function validateDimensions(dimensions: ShipmentDimensions): string[] {
  const errors: string[] = [];

  if (dimensions.length < SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS) {
    errors.push(`Length must be at least ${SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS} ${dimensions.unit}`);
  } else if (dimensions.length > SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS) {
    errors.push(`Length cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS} ${dimensions.unit}`);
  }

  if (dimensions.width < SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS) {
    errors.push(`Width must be at least ${SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS} ${dimensions.unit}`);
  } else if (dimensions.width > SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS) {
    errors.push(`Width cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS} ${dimensions.unit}`);
  }

  if (dimensions.height < SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS) {
    errors.push(`Height must be at least ${SHIPMENTS_CONSTANTS.LIMITS.MIN_DIMENSIONS} ${dimensions.unit}`);
  } else if (dimensions.height > SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS) {
    errors.push(`Height cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_DIMENSIONS} ${dimensions.unit}`);
  }

  if (dimensions.weight < SHIPMENTS_CONSTANTS.LIMITS.MIN_WEIGHT) {
    errors.push(`Weight must be at least ${SHIPMENTS_CONSTANTS.LIMITS.MIN_WEIGHT} ${dimensions.weightUnit}`);
  } else if (dimensions.weight > SHIPMENTS_CONSTANTS.LIMITS.MAX_WEIGHT) {
    errors.push(`Weight cannot exceed ${SHIPMENTS_CONSTANTS.LIMITS.MAX_WEIGHT} ${dimensions.weightUnit}`);
  }

  return errors;
}

/**
 * Validate address
 */
export function validateAddress(address: ShipmentAddress, label: string = 'Address'): string[] {
  const errors: string[] = [];

  if (!address.city || !address.city.trim()) {
    errors.push(`${label} city is required`);
  }

  if (!address.country || !address.country.trim()) {
    errors.push(`${label} country is required`);
  }

  if (!address.countryCode || !address.countryCode.trim()) {
    errors.push(`${label} country code is required`);
  } else if (address.countryCode.trim().length !== 2) {
    errors.push(`${label} country code must be 2 characters`);
  }

  return errors;
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: CurrencyAmount, label: string = 'Amount'): string[] {
  const errors: string[] = [];

  if (amount.amount < 0) {
    errors.push(`${label} cannot be negative`);
  }

  if (!amount.currency) {
    errors.push(`${label} currency is required`);
  }

  if (amount.exchangeRate !== undefined && amount.exchangeRate <= 0) {
    errors.push(`${label} exchange rate must be positive`);
  }

  return errors;
}

/**
 * Format shipment display name
 */
export function formatShipmentDisplayName(shipment: { shipmentNumber: string; currentStatus?: string }): string {
  const statusBadge = shipment.currentStatus ? ` [${shipment.currentStatus}]` : '';
  return `${shipment.shipmentNumber}${statusBadge}`;
}

/**
 * Check if shipment is editable
 */
export function isShipmentEditable(shipment: { currentStatus: string; deletedAt?: number }): boolean {
  if (shipment.deletedAt) return false;
  return shipment.currentStatus !== 'invoiced' && shipment.currentStatus !== 'cancelled';
}

/**
 * Check if shipment can be cancelled
 */
export function canCancelShipment(shipment: { currentStatus: string; deletedAt?: number }): boolean {
  if (shipment.deletedAt) return false;
  return shipment.currentStatus !== 'delivered'
    && shipment.currentStatus !== 'invoiced'
    && shipment.currentStatus !== 'cancelled';
}

/**
 * Calculate chargeable weight (volumetric weight)
 */
export function calculateChargeableWeight(dimensions: ShipmentDimensions): number {
  // Convert to cm if needed
  let length = dimensions.length;
  let width = dimensions.width;
  let height = dimensions.height;

  if (dimensions.unit === 'inch') {
    length *= 2.54;
    width *= 2.54;
    height *= 2.54;
  }

  // Calculate volumetric weight (using standard air freight divisor 6000)
  const volumetricWeight = (length * width * height) / 6000;

  // Convert actual weight to kg if needed
  let actualWeight = dimensions.weight;
  if (dimensions.weightUnit === 'lb') {
    actualWeight *= 0.453592;
  }

  // Return the greater of actual weight or volumetric weight
  return Math.max(actualWeight, volumetricWeight);
}

/**
 * Format tracking status for display
 */
export function formatTrackingStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Trim string fields in shipment data
 */
export function trimShipmentData<T extends Partial<CreateShipmentData | UpdateShipmentData>>(data: T): T {
  const trimmed = { ...data };

  if (trimmed.shipmentNumber) trimmed.shipmentNumber = trimmed.shipmentNumber.trim();
  if (trimmed.awbNumber) trimmed.awbNumber = trimmed.awbNumber.trim();
  if (trimmed.customerReference) trimmed.customerReference = trimmed.customerReference.trim();
  if (trimmed.description) trimmed.description = trimmed.description.trim();
  if (trimmed.specialInstructions) trimmed.specialInstructions = trimmed.specialInstructions.trim();
  if (trimmed.courierInstructions) trimmed.courierInstructions = trimmed.courierInstructions.trim();
  if (trimmed.partnerReference) trimmed.partnerReference = trimmed.partnerReference.trim();
  if (trimmed.tags) trimmed.tags = trimmed.tags.map(tag => tag.trim()).filter(tag => tag);
  if (trimmed.category) trimmed.category = trimmed.category.trim();

  return trimmed;
}
