// convex/lib/yourobc/employees/utils.ts
// Validation functions and utility helpers for employees module

import { EMPLOYEES_CONSTANTS } from './constants';
import type { CreateEmployeeData, UpdateEmployeeData, VacationRequest } from './types';

/**
 * Validate employee data for creation/update
 */
export function validateEmployeeData(
  data: Partial<CreateEmployeeData | UpdateEmployeeData>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < EMPLOYEES_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${EMPLOYEES_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters. Only letters, spaces, hyphens, apostrophes, and periods are allowed');
    }
  }

  // Validate employee number
  if ('employeeNumber' in data && data.employeeNumber !== undefined) {
    const trimmed = data.employeeNumber.trim();
    if (!trimmed) {
      errors.push('Employee number is required');
    } else if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_EMPLOYEE_NUMBER_LENGTH) {
      errors.push(`Employee number cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_EMPLOYEE_NUMBER_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.EMPLOYEE_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Employee number must contain only uppercase letters, numbers, and hyphens');
    }
  }

  // Validate email
  if (data.email !== undefined && data.email.trim()) {
    const trimmed = data.email.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH) {
      errors.push(`Email cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(trimmed)) {
      errors.push('Invalid email format');
    }
  }

  // Validate work email
  if (data.workEmail !== undefined && data.workEmail.trim()) {
    const trimmed = data.workEmail.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH) {
      errors.push(`Work email cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(trimmed)) {
      errors.push('Invalid work email format');
    }
  }

  // Validate phone
  if (data.phone !== undefined && data.phone.trim()) {
    const trimmed = data.phone.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
      errors.push(`Phone cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.PHONE_PATTERN.test(trimmed)) {
      errors.push('Invalid phone format');
    }
  }

  // Validate work phone
  if (data.workPhone !== undefined && data.workPhone.trim()) {
    const trimmed = data.workPhone.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
      errors.push(`Work phone cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`);
    } else if (!EMPLOYEES_CONSTANTS.VALIDATION.PHONE_PATTERN.test(trimmed)) {
      errors.push('Invalid work phone format');
    }
  }

  // Validate department
  if (data.department !== undefined && data.department.trim()) {
    const trimmed = data.department.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_DEPARTMENT_LENGTH) {
      errors.push(`Department cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_DEPARTMENT_LENGTH} characters`);
    }
  }

  // Validate position
  if (data.position !== undefined && data.position.trim()) {
    const trimmed = data.position.trim();
    if (trimmed.length > EMPLOYEES_CONSTANTS.LIMITS.MAX_POSITION_LENGTH) {
      errors.push(`Position cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_POSITION_LENGTH} characters`);
    }
  }

  // Validate salary
  if (data.salary !== undefined) {
    if (data.salary < EMPLOYEES_CONSTANTS.LIMITS.MIN_SALARY) {
      errors.push(`Salary cannot be negative`);
    } else if (data.salary > EMPLOYEES_CONSTANTS.LIMITS.MAX_SALARY) {
      errors.push(`Salary cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_SALARY}`);
    }
  }

  // Validate dates
  if (data.startDate !== undefined && data.endDate !== undefined) {
    if (data.endDate < data.startDate) {
      errors.push('End date cannot be before start date');
    }
  }

  // Validate office (required for creation)
  if ('office' in data && data.office) {
    if (!data.office.location || !data.office.location.trim()) {
      errors.push('Office location is required');
    }
    if (!data.office.country || !data.office.country.trim()) {
      errors.push('Office country is required');
    }
    if (!data.office.countryCode || !data.office.countryCode.trim()) {
      errors.push('Office country code is required');
    }
  }

  return errors;
}

/**
 * Validate vacation request data
 */
export function validateVacationRequest(data: VacationRequest): string[] {
  const errors: string[] = [];

  // Validate dates
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  if (!data.endDate) {
    errors.push('End date is required');
  }
  if (data.endDate < data.startDate) {
    errors.push('End date cannot be before start date');
  }

  // Validate days
  if (!data.days || data.days < EMPLOYEES_CONSTANTS.LIMITS.MIN_VACATION_DAYS) {
    errors.push('Days must be greater than 0');
  } else if (data.days > EMPLOYEES_CONSTANTS.LIMITS.MAX_VACATION_DAYS) {
    errors.push(`Vacation days cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_VACATION_DAYS}`);
  }

  // Validate type
  if (!data.type) {
    errors.push('Vacation type is required');
  }

  // Validate reason length
  if (data.reason && data.reason.trim().length > EMPLOYEES_CONSTANTS.LIMITS.MAX_REASON_LENGTH) {
    errors.push(`Reason cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_REASON_LENGTH} characters`);
  }

  // Validate notes length
  if (data.notes && data.notes.trim().length > EMPLOYEES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Notes cannot exceed ${EMPLOYEES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  return errors;
}

/**
 * Format employee display name
 */
export function formatEmployeeDisplayName(employee: { name: string; status?: string; position?: string }): string {
  const parts = [employee.name];

  if (employee.position) {
    parts.push(`(${employee.position})`);
  }

  if (employee.status && employee.status !== 'active') {
    parts.push(`[${employee.status}]`);
  }

  return parts.join(' ');
}

/**
 * Generate employee number
 */
export function generateEmployeeNumber(prefix: string = 'EMP', sequence: number): string {
  const paddedSequence = sequence.toString().padStart(6, '0');
  return `${prefix}-${paddedSequence}`;
}

/**
 * Check if employee is editable
 */
export function isEmployeeEditable(employee: { status: string; deletedAt?: number }): boolean {
  if (employee.deletedAt) return false;
  return employee.status !== 'terminated';
}

/**
 * Check if employee can request vacation
 */
export function canRequestVacation(employee: { status: string; isActive: boolean }): boolean {
  return employee.isActive && (employee.status === 'active' || employee.status === 'probation');
}

/**
 * Calculate vacation days between two dates
 */
export function calculateVacationDays(startDate: number, endDate: number, isHalfDay?: boolean): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.ceil((endDate - startDate) / millisecondsPerDay) + 1; // +1 to include both start and end dates

  if (isHalfDay) {
    return 0.5;
  }

  return daysDiff;
}

/**
 * Calculate days remaining until date
 */
export function calculateDaysRemaining(endDate: number): number {
  const now = Date.now();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((endDate - now) / millisecondsPerDay);
  return Math.max(0, daysRemaining);
}

/**
 * Check if employee is currently on vacation
 */
export function isOnVacation(employee: { currentVacationStatus?: { isOnVacation: boolean; endDate: number } }): boolean {
  if (!employee.currentVacationStatus) return false;
  if (!employee.currentVacationStatus.isOnVacation) return false;

  const now = Date.now();
  return employee.currentVacationStatus.endDate > now;
}

/**
 * Format salary display
 */
export function formatSalary(amount: number, currency: string = 'USD', frequency?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (frequency) {
    const frequencyDisplay = {
      hourly: '/hr',
      weekly: '/week',
      bi_weekly: '/2 weeks',
      monthly: '/month',
      annually: '/year',
    }[frequency] || '';

    return `${formatted}${frequencyDisplay}`;
  }

  return formatted;
}

/**
 * Sanitize and trim string fields
 */
export function sanitizeEmployeeData<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = { ...data };

  // Trim string fields
  if ('name' in sanitized && typeof sanitized.name === 'string') {
    sanitized.name = sanitized.name.trim();
  }
  if ('employeeNumber' in sanitized && typeof sanitized.employeeNumber === 'string') {
    sanitized.employeeNumber = sanitized.employeeNumber.trim();
  }
  if ('email' in sanitized && typeof sanitized.email === 'string') {
    sanitized.email = sanitized.email.trim().toLowerCase();
  }
  if ('workEmail' in sanitized && typeof sanitized.workEmail === 'string') {
    sanitized.workEmail = sanitized.workEmail.trim().toLowerCase();
  }
  if ('phone' in sanitized && typeof sanitized.phone === 'string') {
    sanitized.phone = sanitized.phone.trim();
  }
  if ('workPhone' in sanitized && typeof sanitized.workPhone === 'string') {
    sanitized.workPhone = sanitized.workPhone.trim();
  }
  if ('department' in sanitized && typeof sanitized.department === 'string') {
    sanitized.department = sanitized.department.trim();
  }
  if ('position' in sanitized && typeof sanitized.position === 'string') {
    sanitized.position = sanitized.position.trim();
  }

  return sanitized as T;
}
