/**
 * Courier Module Validation Utilities
 *
 * Validation functions for courier data as specified in YOUROBC.md
 */

import { ValidationError } from '../shared'
import { COURIER_CONSTANTS } from './constants'
import type { CreateCourierData, UpdateCourierData } from './types'

/**
 * Validate courier personal information
 */
export function validateCourierPersonalInfo(
  data: Partial<CreateCourierData | UpdateCourierData>
): ValidationError[] {
  const errors: ValidationError[] = []

  // First name validation
  if (data.firstName !== undefined) {
    if (!data.firstName?.trim()) {
      errors.push({ 
        field: 'firstName', 
        message: 'First name is required',
        code: 'FIRST_NAME_REQUIRED'
      })
    } else if (data.firstName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push({
        field: 'firstName',
        message: `First name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`,
        code: 'FIRST_NAME_TOO_LONG'
      })
    }
  }

  // Last name validation
  if (data.lastName !== undefined) {
    if (!data.lastName?.trim()) {
      errors.push({ 
        field: 'lastName', 
        message: 'Last name is required',
        code: 'LAST_NAME_REQUIRED'
      })
    } else if (data.lastName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push({
        field: 'lastName',
        message: `Last name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`,
        code: 'LAST_NAME_TOO_LONG'
      })
    }
  }

  // Middle name validation
  if (data.middleName && data.middleName.length > COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push({
      field: 'middleName',
      message: `Middle name must be less than ${COURIER_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`,
      code: 'MIDDLE_NAME_TOO_LONG'
    })
  }

  return errors
}

/**
 * Validate courier contact information
 */
export function validateCourierContactInfo(
  data: Partial<CreateCourierData | UpdateCourierData>
): ValidationError[] {
  const errors: ValidationError[] = []

  // Phone validation (required)
  if (data.phone !== undefined) {
    if (!data.phone?.trim()) {
      errors.push({
        field: 'phone',
        message: 'Phone number is required',
        code: 'PHONE_REQUIRED'
      })
    } else if (data.phone.length > COURIER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
      errors.push({
        field: 'phone',
        message: `Phone must be less than ${COURIER_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`,
        code: 'PHONE_TOO_LONG'
      })
    } else if (!isValidPhone(data.phone)) {
      errors.push({
        field: 'phone',
        message: 'Invalid phone number format',
        code: 'PHONE_INVALID_FORMAT'
      })
    }
  }

  // Email validation (optional)
  if (data.email) {
    if (data.email.length > COURIER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH) {
      errors.push({
        field: 'email',
        message: `Email must be less than ${COURIER_CONSTANTS.LIMITS.MAX_EMAIL_LENGTH} characters`,
        code: 'EMAIL_TOO_LONG'
      })
    } else if (!isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Invalid email format',
        code: 'EMAIL_INVALID_FORMAT'
      })
    }
  }

  return errors
}

/**
 * Validate courier skills as per YOUROBC.md requirements
 */
export function validateCourierSkills(
  skills: Partial<CreateCourierData['skills']>
): ValidationError[] {
  const errors: ValidationError[] = []

  // Languages validation (required)
  if (skills.languages !== undefined) {
    if (!skills.languages || skills.languages.length === 0) {
      errors.push({
        field: 'skills.languages',
        message: 'At least one language must be selected',
        code: 'LANGUAGES_REQUIRED'
      })
    } else if (skills.languages.length > COURIER_CONSTANTS.LIMITS.MAX_LANGUAGES) {
      errors.push({
        field: 'skills.languages',
        message: `Maximum ${COURIER_CONSTANTS.LIMITS.MAX_LANGUAGES} languages allowed`,
        code: 'LANGUAGES_TOO_MANY'
      })
    }
  }

  // Service types validation (required)
  if (skills.availableServices !== undefined) {
    if (!skills.availableServices || skills.availableServices.length === 0) {
      errors.push({
        field: 'skills.availableServices',
        message: 'At least one service type must be selected (OBC or NFO)',
        code: 'SERVICES_REQUIRED'
      })
    }
  }

  // Max carry weight validation
  if (skills.maxCarryWeight !== undefined && skills.maxCarryWeight !== null) {
    if (skills.maxCarryWeight < 0) {
      errors.push({
        field: 'skills.maxCarryWeight',
        message: 'Maximum carry weight cannot be negative',
        code: 'MAX_CARRY_WEIGHT_NEGATIVE'
      })
    } else if (skills.maxCarryWeight > COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT) {
      errors.push({
        field: 'skills.maxCarryWeight',
        message: `Maximum carry weight cannot exceed ${COURIER_CONSTANTS.LIMITS.MAX_CARRY_WEIGHT}kg`,
        code: 'MAX_CARRY_WEIGHT_EXCEEDED'
      })
    }
  }

  // Certifications validation
  if (skills.certifications && skills.certifications.length > COURIER_CONSTANTS.LIMITS.MAX_CERTIFICATIONS) {
    errors.push({
      field: 'skills.certifications',
      message: `Maximum ${COURIER_CONSTANTS.LIMITS.MAX_CERTIFICATIONS} certifications allowed`,
      code: 'CERTIFICATIONS_TOO_MANY'
    })
  }

  return errors
}

/**
 * Validate complete courier data
 */
export function validateCourierData(
  data: Partial<CreateCourierData | UpdateCourierData>
): ValidationError[] {
  const errors: ValidationError[] = []

  // Validate personal info
  errors.push(...validateCourierPersonalInfo(data))

  // Validate contact info
  errors.push(...validateCourierContactInfo(data))

  // Validate skills
  if (data.skills) {
    errors.push(...validateCourierSkills(data.skills))
  }

  // Validate location if provided
  if (data.currentLocation) {
    if (!data.currentLocation.country?.trim()) {
      errors.push({
        field: 'currentLocation.country',
        message: 'Country is required',
        code: 'COUNTRY_REQUIRED'
      })
    }
    if (!data.currentLocation.countryCode?.trim()) {
      errors.push({
        field: 'currentLocation.countryCode',
        message: 'Country code is required',
        code: 'COUNTRY_CODE_REQUIRED'
      })
    }
  }

  // Validate timezone
  if (data.timezone && !isValidTimezone(data.timezone)) {
    errors.push({
      field: 'timezone',
      message: 'Invalid timezone',
      code: 'TIMEZONE_INVALID'
    })
  }

  return errors
}

/**
 * Validate commission data
 */
export function validateCommissionData(data: {
  rate: number
  baseAmount: number
  type: 'percentage' | 'fixed'
  commissionAmount?: number
}): ValidationError[] {
  const errors: ValidationError[] = []

  // Rate validation
  if (data.rate < COURIER_CONSTANTS.LIMITS.MIN_COMMISSION_RATE ||
      data.rate > COURIER_CONSTANTS.LIMITS.MAX_COMMISSION_RATE) {
    errors.push({
      field: 'rate',
      message: `Commission rate must be between ${COURIER_CONSTANTS.LIMITS.MIN_COMMISSION_RATE} and ${COURIER_CONSTANTS.LIMITS.MAX_COMMISSION_RATE}%`,
      code: 'COMMISSION_RATE_OUT_OF_RANGE'
    })
  }

  // Base amount validation
  if (data.baseAmount <= 0) {
    errors.push({
      field: 'baseAmount',
      message: 'Base amount must be greater than 0',
      code: 'BASE_AMOUNT_INVALID'
    })
  }

  // Commission amount validation for percentage type
  if (data.type === 'percentage' && data.commissionAmount !== undefined) {
    const expectedCommission = Math.round((data.baseAmount * data.rate / 100) * 100) / 100
    if (Math.abs(data.commissionAmount - expectedCommission) > 0.01) {
      errors.push({
        field: 'commissionAmount',
        message: 'Commission amount does not match calculated percentage',
        code: 'COMMISSION_AMOUNT_MISMATCH'
      })
    }
  }

  // Commission amount validation for fixed type
  if (data.type === 'fixed' && data.commissionAmount !== undefined) {
    if (data.commissionAmount < 0) {
      errors.push({
        field: 'commissionAmount',
        message: 'Commission amount cannot be negative',
        code: 'COMMISSION_AMOUNT_NEGATIVE'
      })
    }
  }

  return errors
}

// Helper validation functions

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  // Remove spaces and common separators
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
  // Must start with optional + and contain 7-15 digits
  const phoneRegex = /^[\+]?[0-9]{7,15}$/
  return phoneRegex.test(cleaned)
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(err => err.message).join(', ')
}

/**
 * Group validation errors by field
 */
export function groupValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  return errors.reduce((acc, err) => {
    if (!acc[err.field]) {
      acc[err.field] = []
    }
    acc[err.field].push(err.message)
    return acc
  }, {} as Record<string, string[]>)
}
