// convex/lib/boilerplate/email/utils.ts
// convex/lib/email/utils.ts

import { EMAIL_CONSTANTS } from './constants'
import type { EmailConfig, EmailTemplate, CreateEmailConfigData, CreateEmailTemplateData } from './types'
import { UserRole } from '../../../types'
import { Id } from '@/generated/dataModel'

/**
 * Validate email configuration data
 */
export function validateEmailConfigData(data: CreateEmailConfigData): string[] {
  const errors: string[] = []

  // Validate provider
  const validProviders = ['resend', 'sendgrid', 'ses', 'postmark', 'mailgun']
  if (!validProviders.includes(data.provider)) {
    errors.push('Invalid email provider')
  }

  // Validate required config fields
  if (!data.config.fromEmail) {
    errors.push('From email is required')
  } else if (!isValidEmail(data.config.fromEmail)) {
    errors.push('Invalid from email address')
  }

  if (!data.config.fromName) {
    errors.push('From name is required')
  } else if (data.config.fromName.length > 100) {
    errors.push('From name must be less than 100 characters')
  }

  // Validate optional fields
  if (data.config.replyToEmail && !isValidEmail(data.config.replyToEmail)) {
    errors.push('Invalid reply-to email address')
  }

  // Provider-specific validation
  if (data.provider === 'ses' && !data.config.region) {
    errors.push('AWS region is required for SES')
  }

  if (data.provider === 'mailgun' && !data.config.domain) {
    errors.push('Domain is required for Mailgun')
  }

  // Validate API credentials
  if (!data.config.apiKey && !data.config.apiSecret) {
    errors.push('API key or secret is required')
  }

  return errors
}

/**
 * Validate email template data
 */
export function validateEmailTemplateData(data: CreateEmailTemplateData): string[] {
  const errors: string[] = []

  // Validate name
  if (!data.name || !data.name.trim()) {
    errors.push('Template name is required')
  } else if (data.name.length > 100) {
    errors.push('Template name must be less than 100 characters')
  }

  // Validate slug
  if (!data.slug || !data.slug.trim()) {
    errors.push('Template slug is required')
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Template slug must contain only lowercase letters, numbers, and hyphens')
  } else if (data.slug.length > 50) {
    errors.push('Template slug must be less than 50 characters')
  }

  // Validate subject
  if (!data.subject || !data.subject.trim()) {
    errors.push('Template subject is required')
  } else if (data.subject.length > 200) {
    errors.push('Template subject must be less than 200 characters')
  }

  // Validate templates
  if (!data.htmlTemplate || !data.htmlTemplate.trim()) {
    errors.push('HTML template is required')
  }

  // Validate variables
  if (data.variables) {
    const variableNames = new Set<string>()
    data.variables.forEach((variable, index) => {
      if (!variable.name || !variable.name.trim()) {
        errors.push(`Variable at index ${index} must have a name`)
      } else if (variableNames.has(variable.name)) {
        errors.push(`Duplicate variable name: ${variable.name}`)
      } else {
        variableNames.add(variable.name)
      }

      if (!['string', 'number', 'boolean', 'date'].includes(variable.type)) {
        errors.push(`Invalid variable type for ${variable.name}`)
      }
    })
  }

  return errors
}

/**
 * Check if user can manage email configurations
 * Email management is admin-only
 */
export function canManageEmailConfig(userId: Id<'userProfiles'>, userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'superadmin'
}

/**
 * Check if user can view email logs
 * Email logs are admin-only
 */
export function canViewEmailLogs(userId: Id<'userProfiles'>, userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'superadmin'
}

/**
 * Check if user can manage email templates
 * Template management is admin-only
 */
export function canManageEmailTemplates(userId: Id<'userProfiles'>, userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'superadmin'
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize HTML content (basic sanitization)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*[''][^'']*['']/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Extract variables from template string
 * Looks for {{variableName}} patterns
 */
export function extractTemplateVariables(template: string): string[] {
  const variableRegex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = variableRegex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

/**
 * Replace template variables with values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, String(value ?? ''))
  })

  return result
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    resend: 'Resend',
    sendgrid: 'SendGrid',
    ses: 'AWS SES',
    postmark: 'Postmark',
    mailgun: 'Mailgun',
  }
  return names[provider] || provider
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    sent: '#3b82f6',
    delivered: '#10b981',
    failed: '#ef4444',
    bounced: '#6b7280',
  }
  return colors[status] || '#6b7280'
}

/**
 * Format email log for display
 */
export function formatEmailLogSummary(log: any): string {
  const recipients = log.to.join(', ')
  return `${log.subject} to ${recipients}`
}

/**
 * Calculate email statistics
 */
export function calculateEmailStats(logs: any[]): {
  total: number
  sent: number
  delivered: number
  failed: number
  bounced: number
  pending: number
  successRate: number
} {
  const total = logs.length
  const sent = logs.filter(l => l.status === 'sent').length
  const delivered = logs.filter(l => l.status === 'delivered').length
  const failed = logs.filter(l => l.status === 'failed').length
  const bounced = logs.filter(l => l.status === 'bounced').length
  const pending = logs.filter(l => l.status === 'pending').length

  const successRate = total > 0 ? ((sent + delivered) / total) * 100 : 0

  return {
    total,
    sent,
    delivered,
    failed,
    bounced,
    pending,
    successRate,
  }
}
