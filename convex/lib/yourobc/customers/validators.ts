// convex/lib/yourobc/customers/validators.ts
/**
 * Customer Validators
 *
 * Comprehensive validation schemas and functions for customer data.
 * Uses Convex validators for runtime validation.
 *
 * @module convex/lib/yourobc/customers/validators
 */

import { v } from 'convex/values'
import {
  customerStatusValidator,
  currencyValidator,
  paymentMethodValidator,
  addressSchema,
  contactSchema,
} from '../../../schema/yourobc/base'
import { CUSTOMER_LIMITS } from '../../../config/yourobc'
import { ValidationError } from '../shared'

// ============================================================================
// CORE VALIDATORS - Reusable validation schemas
// ============================================================================

/**
 * Customer statistics validator
 */
export const customerStatsValidator = v.object({
  totalQuotes: v.number(),
  acceptedQuotes: v.number(),
  rejectedQuotes: v.number(),
  totalRevenue: v.number(),
  totalMargin: v.number(),
  averageMargin: v.number(),
  totalShipments: v.number(),
  lastQuoteDate: v.optional(v.number()),
  lastShipmentDate: v.optional(v.number()),
  lastInvoiceDate: v.optional(v.number()),
})

/**
 * Margin configuration validator (for advanced margin rules)
 */
export const marginConfigValidator = v.object({
  type: v.union(v.literal('percentage'), v.literal('fixed'), v.literal('hybrid')),
  percentage: v.optional(v.number()),
  minimumAmount: v.optional(v.number()),
  currency: v.optional(currencyValidator),
})

/**
 * Risk level validator
 */
export const riskLevelValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high')
)

// ============================================================================
// INPUT VALIDATORS - For mutations
// ============================================================================

/**
 * Create customer data validator
 * Used when creating a new customer
 */
export const createCustomerDataValidator = v.object({
  // Core Information (Required)
  companyName: v.string(),
  primaryContact: contactSchema,
  billingAddress: addressSchema,

  // Core Information (Optional)
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Additional Contacts
  additionalContacts: v.optional(v.array(contactSchema)),

  // Addresses
  shippingAddress: v.optional(addressSchema),

  // Financial Settings
  defaultCurrency: v.optional(currencyValidator),
  paymentTerms: v.optional(v.number()),
  paymentMethod: v.optional(paymentMethodValidator),
  margin: v.optional(v.number()),

  // Classification
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),
  tags: v.optional(v.array(v.string())),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),
})

/**
 * Update customer data validator
 * Used when updating an existing customer (all fields optional)
 */
export const updateCustomerDataValidator = v.object({
  // Core Information
  companyName: v.optional(v.string()),
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Status
  status: v.optional(customerStatusValidator),

  // Contacts
  primaryContact: v.optional(contactSchema),
  additionalContacts: v.optional(v.array(contactSchema)),

  // Addresses
  billingAddress: v.optional(addressSchema),
  shippingAddress: v.optional(addressSchema),

  // Financial Settings
  defaultCurrency: v.optional(currencyValidator),
  paymentTerms: v.optional(v.number()),
  paymentMethod: v.optional(paymentMethodValidator),
  margin: v.optional(v.number()),

  // Classification
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),
  tags: v.optional(v.array(v.string())),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),
})

/**
 * Update customer stats validator
 * Used for updating customer statistics
 */
export const updateCustomerStatsValidator = v.object({
  totalQuotes: v.optional(v.number()),
  acceptedQuotes: v.optional(v.number()),
  rejectedQuotes: v.optional(v.number()),
  totalRevenue: v.optional(v.number()),
  totalMargin: v.optional(v.number()),
  averageMargin: v.optional(v.number()),
  totalShipments: v.optional(v.number()),
  lastQuoteDate: v.optional(v.number()),
  lastShipmentDate: v.optional(v.number()),
  lastInvoiceDate: v.optional(v.number()),
})

/**
 * Customer filter validator
 * Used for filtering customer queries
 */
export const customerFilterValidator = v.object({
  status: v.optional(v.array(customerStatusValidator)),
  countries: v.optional(v.array(v.string())),
  currencies: v.optional(v.array(currencyValidator)),
  paymentMethods: v.optional(v.array(paymentMethodValidator)),
  inquirySources: v.optional(v.array(v.id('yourobcInquirySources'))),
  tags: v.optional(v.array(v.string())),
  search: v.optional(v.string()),
  hasRecentActivity: v.optional(v.boolean()),
  minRevenue: v.optional(v.number()),
  maxRevenue: v.optional(v.number()),
  minPaymentTerms: v.optional(v.number()),
  maxPaymentTerms: v.optional(v.number()),
})

/**
 * Customer list options validator
 * Used for pagination and sorting
 */
export const customerListOptionsValidator = v.object({
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
  filters: v.optional(customerFilterValidator),
})

// ============================================================================
// VALIDATION FUNCTIONS - Business logic validation
// ============================================================================

/**
 * Validate customer data against business rules
 * @param data - Customer data to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateCustomerData(
  data: Partial<{
    companyName?: string
    shortName?: string
    website?: string
    notes?: string
    internalNotes?: string
    tags?: string[]
    additionalContacts?: any[]
    paymentTerms?: number
    margin?: number
    primaryContact?: { name?: string; email?: string; phone?: string }
  }>
): ValidationError[] {
  const errors: ValidationError[] = []

  // Company Name validation
  if (data.companyName !== undefined) {
    if (data.companyName.trim().length === 0) {
      errors.push({
        field: 'companyName',
        message: 'Company name cannot be empty',
        code: 'REQUIRED',
      })
    } else if (data.companyName.length > CUSTOMER_LIMITS.maxCompanyNameLength) {
      errors.push({
        field: 'companyName',
        message: `Company name must be less than ${CUSTOMER_LIMITS.maxCompanyNameLength} characters`,
        code: 'MAX_LENGTH',
      })
    }
  }

  // Short Name validation
  if (data.shortName !== undefined && data.shortName.length > CUSTOMER_LIMITS.maxShortNameLength) {
    errors.push({
      field: 'shortName',
      message: `Short name must be less than ${CUSTOMER_LIMITS.maxShortNameLength} characters`,
      code: 'MAX_LENGTH',
    })
  }

  // Website validation
  if (data.website !== undefined && data.website.length > CUSTOMER_LIMITS.maxWebsiteLength) {
    errors.push({
      field: 'website',
      message: `Website URL must be less than ${CUSTOMER_LIMITS.maxWebsiteLength} characters`,
      code: 'MAX_LENGTH',
    })
  }

  // Notes validation
  if (data.notes !== undefined && data.notes.length > CUSTOMER_LIMITS.maxNotesLength) {
    errors.push({
      field: 'notes',
      message: `Notes must be less than ${CUSTOMER_LIMITS.maxNotesLength} characters`,
      code: 'MAX_LENGTH',
    })
  }

  // Internal Notes validation
  if (data.internalNotes !== undefined && data.internalNotes.length > CUSTOMER_LIMITS.maxInternalNotesLength) {
    errors.push({
      field: 'internalNotes',
      message: `Internal notes must be less than ${CUSTOMER_LIMITS.maxInternalNotesLength} characters`,
      code: 'MAX_LENGTH',
    })
  }

  // Tags validation
  if (data.tags !== undefined && data.tags.length > CUSTOMER_LIMITS.maxTags) {
    errors.push({
      field: 'tags',
      message: `Maximum ${CUSTOMER_LIMITS.maxTags} tags allowed`,
      code: 'MAX_COUNT',
    })
  }

  // Additional Contacts validation
  if (data.additionalContacts !== undefined && data.additionalContacts.length > CUSTOMER_LIMITS.maxContacts) {
    errors.push({
      field: 'additionalContacts',
      message: `Maximum ${CUSTOMER_LIMITS.maxContacts} additional contacts allowed`,
      code: 'MAX_COUNT',
    })
  }

  // Primary Contact validation
  if (data.primaryContact) {
    if (data.primaryContact.name !== undefined) {
      if (data.primaryContact.name.trim().length === 0) {
        errors.push({
          field: 'primaryContact.name',
          message: 'Primary contact name cannot be empty',
          code: 'REQUIRED',
        })
      } else if (data.primaryContact.name.length > CUSTOMER_LIMITS.maxContactNameLength) {
        errors.push({
          field: 'primaryContact.name',
          message: `Contact name must be less than ${CUSTOMER_LIMITS.maxContactNameLength} characters`,
          code: 'MAX_LENGTH',
        })
      }
    }

    if (data.primaryContact.email !== undefined && data.primaryContact.email.length > 0) {
      if (data.primaryContact.email.length > CUSTOMER_LIMITS.maxEmailLength) {
        errors.push({
          field: 'primaryContact.email',
          message: `Email must be less than ${CUSTOMER_LIMITS.maxEmailLength} characters`,
          code: 'MAX_LENGTH',
        })
      }
      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.primaryContact.email)) {
        errors.push({
          field: 'primaryContact.email',
          message: 'Invalid email format',
          code: 'INVALID_FORMAT',
        })
      }
    }

    if (data.primaryContact.phone !== undefined && data.primaryContact.phone.length > CUSTOMER_LIMITS.maxPhoneLength) {
      errors.push({
        field: 'primaryContact.phone',
        message: `Phone must be less than ${CUSTOMER_LIMITS.maxPhoneLength} characters`,
        code: 'MAX_LENGTH',
      })
    }
  }

  // Payment Terms validation
  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < CUSTOMER_LIMITS.minPaymentTerms || data.paymentTerms > CUSTOMER_LIMITS.maxPaymentTerms) {
      errors.push({
        field: 'paymentTerms',
        message: `Payment terms must be between ${CUSTOMER_LIMITS.minPaymentTerms} and ${CUSTOMER_LIMITS.maxPaymentTerms} days`,
        code: 'OUT_OF_RANGE',
      })
    }
  }

  // Margin validation
  if (data.margin !== undefined) {
    if (data.margin < CUSTOMER_LIMITS.minMargin || data.margin > CUSTOMER_LIMITS.maxMargin) {
      errors.push({
        field: 'margin',
        message: `Margin must be between ${CUSTOMER_LIMITS.minMargin}% and ${CUSTOMER_LIMITS.maxMargin}%`,
        code: 'OUT_OF_RANGE',
      })
    }
  }

  return errors
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return false
  if (email.length > CUSTOMER_LIMITS.maxEmailLength) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return false
  if (phone.length > CUSTOMER_LIMITS.maxPhoneLength) return false

  // Allow digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/
  return phoneRegex.test(phone)
}

/**
 * Validate website URL format
 * @param url - Website URL to validate
 * @returns true if valid, false otherwise
 */
export function validateWebsite(url: string): boolean {
  if (!url || url.trim().length === 0) return true // Optional field
  if (url.length > CUSTOMER_LIMITS.maxWebsiteLength) return false

  // Basic URL validation
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate tag format
 * @param tag - Tag to validate
 * @returns true if valid, false otherwise
 */
export function validateTag(tag: string): boolean {
  if (!tag || tag.trim().length === 0) return false
  // Tags should be reasonable length (max 50 chars)
  if (tag.length > 50) return false
  // No special characters except hyphen and underscore
  const tagRegex = /^[a-zA-Z0-9\s\-_]+$/
  return tagRegex.test(tag)
}

/**
 * Sanitize and normalize tag
 * @param tag - Tag to sanitize
 * @returns Normalized tag (lowercase, trimmed)
 */
export function sanitizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

/**
 * Validate margin configuration
 * @param config - Margin configuration to validate
 * @returns Array of validation errors
 */
export function validateMarginConfig(config: {
  type: 'percentage' | 'fixed' | 'hybrid'
  percentage?: number
  minimumAmount?: number
  currency?: 'EUR' | 'USD'
}): ValidationError[] {
  const errors: ValidationError[] = []

  if (config.type === 'percentage' || config.type === 'hybrid') {
    if (config.percentage === undefined) {
      errors.push({
        field: 'percentage',
        message: 'Percentage is required for percentage or hybrid margin type',
        code: 'REQUIRED',
      })
    } else if (config.percentage < CUSTOMER_LIMITS.minMargin || config.percentage > CUSTOMER_LIMITS.maxMargin) {
      errors.push({
        field: 'percentage',
        message: `Percentage must be between ${CUSTOMER_LIMITS.minMargin}% and ${CUSTOMER_LIMITS.maxMargin}%`,
        code: 'OUT_OF_RANGE',
      })
    }
  }

  if (config.type === 'fixed' || config.type === 'hybrid') {
    if (config.minimumAmount === undefined) {
      errors.push({
        field: 'minimumAmount',
        message: 'Minimum amount is required for fixed or hybrid margin type',
        code: 'REQUIRED',
      })
    } else if (config.minimumAmount < 0) {
      errors.push({
        field: 'minimumAmount',
        message: 'Minimum amount cannot be negative',
        code: 'OUT_OF_RANGE',
      })
    }

    if (!config.currency) {
      errors.push({
        field: 'currency',
        message: 'Currency is required for fixed or hybrid margin type',
        code: 'REQUIRED',
      })
    }
  }

  return errors
}
