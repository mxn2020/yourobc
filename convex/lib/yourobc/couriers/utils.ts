// convex/lib/yourobc/couriers/utils.ts
// convex/yourobc/couriers/utils.ts

import { COURIER_CONSTANTS, COURIER_STATUS_COLORS } from './constants';
import type { Courier, CreateCourierData, UpdateCourierData, Skills } from './types';

import {
  isValidEmail,
  isValidPhone,
  isValidTimezone,
  calculateWorkingHours,
  generateSequentialNumber,
} from '../shared';

export function validateCourierData(data: Partial<CreateCourierData | UpdateCourierData>): string[] {
  const errors: string[] = [];

  if (data.courierNumber && data.courierNumber.length > COURIER_CONSTANTS.LIMITS.MAX_COURIER_NUMBER_LENGTH) {
    errors.push(`Courier number must be less than ${COURIER_CONSTANTS.LIMITS.MAX_COURIER_NUMBER_LENGTH} characters`);
  }

  if (data.firstName !== undefined && !data.firstName.trim()) {
    errors.push('First name is required');
  }

  if (data.firstName && data.firstName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(`First name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
  }

  if (data.lastName !== undefined && !data.lastName.trim()) {
    errors.push('Last name is required');
  }

  if (data.lastName && data.lastName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(`Last name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
  }

  if (data.middleName && data.middleName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(`Middle name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
  }


  if (data.phone && data.phone.length > COURIER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
    errors.push(`Phone must be less than ${COURIER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`);
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Phone format is invalid');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  if (data.timezone && !isValidTimezone(data.timezone)) {
    errors.push('Invalid timezone');
  }

  if (data.skills) {
    const skillErrors = validateCourierSkills(data.skills);
    errors.push(...skillErrors);
  }

  return errors;
}

export function validateCourierSkills(skills: Partial<Skills>): string[] {
  const errors: string[] = [];

  if (skills.languages && skills.languages.length > COURIER_CONSTANTS.LIMITS.MAX_LANGUAGES) {
    errors.push(`Maximum ${COURIER_CONSTANTS.LIMITS.MAX_LANGUAGES} languages allowed`);
  }

  if (skills.certifications && skills.certifications.length > COURIER_CONSTANTS.LIMITS.MAX_CERTIFICATIONS) {
    errors.push(`Maximum ${COURIER_CONSTANTS.LIMITS.MAX_CERTIFICATIONS} certifications allowed`);
  }

  if (skills.maxCarryWeight && skills.maxCarryWeight > COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT) {
    errors.push(`Maximum carry weight cannot exceed ${COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT}kg`);
  }

  return errors;
}

export function generateCourierNumber(type: 'courier', sequence: number): string {
  return generateSequentialNumber('COU', sequence);
}

export function getCourierStatusColor(status: Courier['status']): string {
  return COURIER_STATUS_COLORS[status] || '#6b7280';
}

export function isCourierAvailableForShipment(
  courier: Courier,
  serviceType: 'OBC' | 'NFO',
  requiredLanguages?: string[]
): boolean {
  if (!courier.isActive || courier.status !== COURIER_CONSTANTS.STATUS.AVAILABLE) {
    return false;
  }

  if (!courier.skills.availableServices.includes(serviceType)) {
    return false;
  }

  if (requiredLanguages && requiredLanguages.length > 0) {
    const hasRequiredLanguages = requiredLanguages.every(lang =>
      courier.skills.languages.includes(lang)
    );
    if (!hasRequiredLanguages) return false;
  }

  return true;
}


export function getCourierWorkStatus(courier: Courier): {
  isWorking: boolean;
  lastLogin?: number;
  lastLogout?: number;
  todayHours: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todayEntries = courier.timeEntries.filter(
    entry => entry.timestamp >= todayStart && entry.timestamp < todayEnd
  );

  const lastLogin = todayEntries
    .filter(entry => entry.type === COURIER_CONSTANTS.TIME_ENTRY_TYPE.LOGIN)
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp;

  const lastLogout = todayEntries
    .filter(entry => entry.type === COURIER_CONSTANTS.TIME_ENTRY_TYPE.LOGOUT)
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp;

  const isWorking = lastLogin && (!lastLogout || lastLogin > lastLogout);
  const todayHours = calculateWorkingHours(todayEntries);

  return {
    isWorking: !!isWorking,
    lastLogin,
    lastLogout,
    todayHours,
  };
}

export function formatCourierDisplayName(courier: Courier): string {
  const nameParts = [courier.firstName, courier.middleName, courier.lastName].filter(Boolean);
  return nameParts.length > 0 ? nameParts.join(' ') : `Courier ${courier.courierNumber || courier._id}`;
}

export function sanitizeCourierForExport(courier: Courier, includePrivateData = false): Partial<Courier> {
  const publicData = {
    courierNumber: courier.courierNumber,
    firstName: courier.firstName,
    middleName: courier.middleName,
    lastName: courier.lastName,
    status: courier.status,
    isActive: courier.isActive,
    isOnline: courier.isOnline,
    skills: courier.skills,
    currentLocation: courier.currentLocation,
    timezone: courier.timezone,
    createdAt: courier.createdAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      userProfileId: courier.userProfileId,
      authUserId: courier.authUserId,
      phone: courier.phone,
      email: courier.email,
      timeEntries: courier.timeEntries,
    };
  }

  return publicData;
}

export function validateCommissionData(data: {
  type: string;
  rate: number;
  baseAmount: number;
  commissionAmount: number;
}): string[] {
  const errors: string[] = [];

  if (data.rate < COURIER_CONSTANTS.LIMITS.MIN_COMMISSION_RATE || data.rate > COURIER_CONSTANTS.LIMITS.MAX_COMMISSION_RATE) {
    errors.push(`Commission rate must be between ${COURIER_CONSTANTS.LIMITS.MIN_COMMISSION_RATE} and ${COURIER_CONSTANTS.LIMITS.MAX_COMMISSION_RATE} percent`);
  }

  if (data.baseAmount <= 0) {
    errors.push('Base amount must be greater than 0');
  }

  if (data.commissionAmount < 0) {
    errors.push('Commission amount cannot be negative');
  }

  if (data.type === COURIER_CONSTANTS.COMMISSION_TYPE.PERCENTAGE) {
    const expectedCommission = Math.round((data.baseAmount * data.rate / 100) * 100) / 100;
    if (Math.abs(data.commissionAmount - expectedCommission) > 0.01) {
      errors.push('Commission amount does not match calculated percentage');
    }
  }

  return errors;
}

export function calculateCommission(baseAmount: number, rate: number, type: 'percentage' | 'fixed'): number {
  if (type === COURIER_CONSTANTS.COMMISSION_TYPE.PERCENTAGE) {
    return Math.round((baseAmount * rate / 100) * 100) / 100;
  } else {
    return rate;
  }
}