// convex/lib/yourobc/tracking_messages/utils.ts
// convex/lib/yourobc/trackingMessages/utils.ts

import { TRACKING_MESSAGE_CONSTANTS } from './constants';
import type { TrackingMessageVariables } from './types'

/**
 * Parse template and replace variables with actual values
 */
export function parseTemplate(template: string, variables: TrackingMessageVariables): string {
  let result = template

  // Replace all {variable} placeholders with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(placeholder, value || '-')
  })

  return result
}

/**
 * Extract variable names from a template
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g)
  if (!matches) return []

  return matches.map((match) => match.replace(/[{}]/g, ''))
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  requiredVariables: string[],
  providedVariables: TrackingMessageVariables
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  requiredVariables.forEach((varName) => {
    if (!(varName in providedVariables) || !providedVariables[varName as keyof TrackingMessageVariables]) {
      missing.push(varName)
    }
  })

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Format date/time for templates
 */
export function formatDateTime(timestamp: number, language: 'en' | 'de' = 'en'): string {
  const date = new Date(timestamp)
  const locale = language === 'de' ? 'de-DE' : 'en-US'

  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date only
 */
export function formatDate(timestamp: number, language: 'en' | 'de' = 'en'): string {
  const date = new Date(timestamp)
  const locale = language === 'de' ? 'de-DE' : 'en-US'

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format time only
 */
export function formatTime(timestamp: number, language: 'en' | 'de' = 'en'): string {
  const date = new Date(timestamp)
  const locale = language === 'de' ? 'de-DE' : 'en-US'

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate a preview of the message with sample data
 */
export function generatePreview(template: string, variables: string[]): string {
  const sampleData: Record<string, string> = {
    shipmentNumber: 'ABC-12345',
    customerName: 'John Smith',
    customerCompany: 'Acme Corp',
    origin: 'Frankfurt',
    destination: 'New York',
    awbNumber: '125-12345678',
    hawbNumber: 'HA-123456',
    mawbNumber: 'MA-789012',
    courierName: 'Max Mustermann',
    courierPhone: '+49 123 456789',
    partnerName: 'Global Logistics Partner',
    partnerContact: 'partner@example.com',
    pickupTime: '14.03.2025 10:00',
    deliveryTime: '15.03.2025 14:30',
    estimatedArrival: '15.03.2025 12:00',
    flightNumber: 'LH400',
    status: 'In Transit',
    notes: 'Customs clearance in progress',
    trackingUrl: 'https://track.example.com/ABC-12345',
    currentDate: formatDate(Date.now(), 'en'),
    currentTime: formatTime(Date.now(), 'en'),
  }

  let result = template
  variables.forEach((varName) => {
    const placeholder = new RegExp(`\\{${varName}\\}`, 'g')
    result = result.replace(placeholder, sampleData[varName] || `{${varName}}`)
  })

  return result
}

/**
 * Sanitize template to prevent injection
 */
export function sanitizeTemplate(template: string): string {
  // Remove any script tags or dangerous content
  return template
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*[''][^'']*['']/gi, '')
}

/**
 * Count words in template
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).length
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = countWords(text)
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Validate tracking message data
 */
export function validateTrackingMessageData(data: {
  template?: string;
  subject?: string;
  variables?: string[];
}): string[] {
  const errors: string[] = [];

  if (data.template !== undefined && !data.template.trim()) {
    errors.push('Template is required');
  }

  if (data.template && data.template.length > TRACKING_MESSAGE_CONSTANTS.LIMITS.MAX_TEMPLATE_LENGTH) {
    errors.push(`Template must be less than ${TRACKING_MESSAGE_CONSTANTS.LIMITS.MAX_TEMPLATE_LENGTH} characters`);
  }

  if (data.subject && data.subject.length > TRACKING_MESSAGE_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
    errors.push(`Subject must be less than ${TRACKING_MESSAGE_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
  }

  return errors;
}
