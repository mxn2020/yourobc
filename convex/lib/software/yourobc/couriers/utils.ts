// convex/lib/software/yourobc/couriers/utils.ts
// Utility functions for couriers module

import { customAlphabet } from 'nanoid';
import type { CreateCourierInput, UpdateCourierInput, CreateCommissionInput, UpdateCommissionInput } from '@/schema/software/yourobc/couriers';
import { COURIERS_CONSTANTS, COMMISSIONS_CONSTANTS } from './constants';

// ============================================================================
// ID Generation
// ============================================================================

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);

/**
 * Generate a unique public ID for couriers
 */
export function generatePublicId(): string {
  return `COU-${nanoid()}`;
}

/**
 * Generate a unique public ID for commissions
 */
export function generateCommissionPublicId(): string {
  return `COM-${nanoid()}`;
}

// ============================================================================
// Courier Validation
// ============================================================================

/**
 * Validate courier creation data
 */
export function validateCourierData(data: CreateCourierInput): void {
  // Company Name
  if (!data.companyName || data.companyName.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_REQUIRED);
  }
  if (data.companyName.trim().length < COURIERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MIN_LENGTH) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_SHORT);
  }
  if (data.companyName.trim().length > COURIERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MAX_LENGTH) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_LONG);
  }

  // Courier Number
  if (!data.courierNumber || data.courierNumber.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.COURIER_NUMBER_REQUIRED);
  }

  // First Name
  if (!data.firstName || data.firstName.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.FIRST_NAME_REQUIRED);
  }

  // Last Name
  if (!data.lastName || data.lastName.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.LAST_NAME_REQUIRED);
  }

  // Phone
  if (!data.phone || data.phone.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.PHONE_REQUIRED);
  }

  // Timezone
  if (!data.timezone || data.timezone.trim().length === 0) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.TIMEZONE_REQUIRED);
  }

  // Skills
  if (!data.skills) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.SKILLS_REQUIRED);
  }

  // Email (if provided)
  if (data.email && !isValidEmail(data.email)) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.INVALID_EMAIL);
  }

  // Ranking (if provided)
  if (data.ranking !== undefined && (data.ranking < COURIERS_CONSTANTS.BUSINESS_RULES.MIN_RANKING || data.ranking > COURIERS_CONSTANTS.BUSINESS_RULES.MAX_RANKING)) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.INVALID_RANKING);
  }
}

/**
 * Validate courier update data
 */
export function validateCourierUpdateData(data: UpdateCourierInput): void {
  // Company Name (if provided)
  if (data.companyName !== undefined) {
    if (data.companyName.trim().length === 0) {
      throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_REQUIRED);
    }
    if (data.companyName.trim().length < COURIERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MIN_LENGTH) {
      throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_SHORT);
    }
    if (data.companyName.trim().length > COURIERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MAX_LENGTH) {
      throw new Error(COURIERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_LONG);
    }
  }

  // Email (if provided)
  if (data.email !== undefined && data.email && !isValidEmail(data.email)) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.INVALID_EMAIL);
  }

  // Ranking (if provided)
  if (data.ranking !== undefined && (data.ranking < COURIERS_CONSTANTS.BUSINESS_RULES.MIN_RANKING || data.ranking > COURIERS_CONSTANTS.BUSINESS_RULES.MAX_RANKING)) {
    throw new Error(COURIERS_CONSTANTS.VALIDATION.INVALID_RANKING);
  }
}

// ============================================================================
// Commission Validation
// ============================================================================

/**
 * Validate commission creation data
 */
export function validateCommissionData(data: CreateCommissionInput): void {
  // Courier ID
  if (!data.courierId) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.COURIER_ID_REQUIRED);
  }

  // Shipment ID
  if (!data.shipmentId) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.SHIPMENT_ID_REQUIRED);
  }

  // Type
  if (!data.type) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.TYPE_REQUIRED);
  }

  // Rate
  if (data.rate === undefined || data.rate === null) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.RATE_REQUIRED);
  }
  if (data.type === 'percentage' && (data.rate < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_RATE || data.rate > COMMISSIONS_CONSTANTS.BUSINESS_RULES.MAX_RATE)) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_RATE);
  }

  // Base Amount
  if (data.baseAmount === undefined || data.baseAmount === null) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.BASE_AMOUNT_REQUIRED);
  }
  if (data.baseAmount < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_AMOUNT) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_AMOUNT);
  }

  // Commission Amount
  if (data.commissionAmount === undefined || data.commissionAmount === null) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.COMMISSION_AMOUNT_REQUIRED);
  }
  if (data.commissionAmount < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_AMOUNT) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_AMOUNT);
  }
}

/**
 * Validate commission update data
 */
export function validateCommissionUpdateData(data: UpdateCommissionInput): void {
  // Rate (if provided)
  if (data.rate !== undefined && data.type === 'percentage' && (data.rate < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_RATE || data.rate > COMMISSIONS_CONSTANTS.BUSINESS_RULES.MAX_RATE)) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_RATE);
  }

  // Base Amount (if provided)
  if (data.baseAmount !== undefined && data.baseAmount < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_AMOUNT) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_AMOUNT);
  }

  // Commission Amount (if provided)
  if (data.commissionAmount !== undefined && data.commissionAmount < COMMISSIONS_CONSTANTS.BUSINESS_RULES.MIN_AMOUNT) {
    throw new Error(COMMISSIONS_CONSTANTS.VALIDATION.INVALID_AMOUNT);
  }
}

// ============================================================================
// Commission Calculations
// ============================================================================

/**
 * Calculate commission amount based on type and rate
 */
export function calculateCommissionAmount(
  type: 'percentage' | 'fixed',
  rate: number,
  baseAmount: number
): number {
  if (type === 'percentage') {
    return (baseAmount * rate) / 100;
  }
  return rate; // Fixed amount
}

/**
 * Validate commission calculation
 */
export function validateCommissionCalculation(
  calculatedAmount: number,
  providedAmount: number,
  tolerance: number = 0.01
): boolean {
  return Math.abs(calculatedAmount - providedAmount) <= tolerance;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format courier display name
 */
export function formatCourierDisplayName(firstName: string, lastName: string, middleName?: string): string {
  if (middleName) {
    return `${firstName} ${middleName} ${lastName}`;
  }
  return `${firstName} ${lastName}`;
}

/**
 * Format commission display date
 */
export function getCommissionDisplayDate(): number {
  return Date.now();
}
