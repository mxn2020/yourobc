// convex/lib/boilerplate/email/templates/utils.ts
// Validation functions and utility helpers for email templates module

import { EMAIL_TEMPLATES_CONSTANTS } from './constants';
import type { CreateEmailTemplateData, UpdateEmailTemplateData } from './types';

/**
 * Validate email template data for creation/update
 */
export function validateEmailTemplateData(
  data: Partial<CreateEmailTemplateData | UpdateEmailTemplateData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Template name is required');
    } else if (trimmed.length < EMAIL_TEMPLATES_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Template name must be at least ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Template name cannot exceed ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!EMAIL_TEMPLATES_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Template name contains invalid characters');
    }
  }

  // Validate slug
  if (data.slug !== undefined) {
    const trimmed = data.slug.trim();

    if (!trimmed) {
      errors.push('Template slug is required');
    } else if (!EMAIL_TEMPLATES_CONSTANTS.VALIDATION.SLUG_PATTERN.test(trimmed)) {
      errors.push('Template slug must contain only lowercase letters, numbers, and hyphens');
    } else if (trimmed.length > EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
      errors.push(`Template slug cannot exceed ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`);
    }
  }

  // Validate subject
  if (data.subject !== undefined) {
    const trimmed = data.subject.trim();

    if (!trimmed) {
      errors.push('Template subject is required');
    } else if (trimmed.length > EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH) {
      errors.push(`Template subject cannot exceed ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_SUBJECT_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate htmlTemplate
  if (data.htmlTemplate !== undefined && !data.htmlTemplate.trim()) {
    errors.push('HTML template is required');
  }

  // Validate variables
  if (data.variables) {
    if (data.variables.length > EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_VARIABLES) {
      errors.push(`Cannot exceed ${EMAIL_TEMPLATES_CONSTANTS.LIMITS.MAX_VARIABLES} variables`);
    }

    const variableNames = new Set<string>();
    data.variables.forEach((variable, index) => {
      if (!variable.name || !variable.name.trim()) {
        errors.push(`Variable at index ${index} must have a name`);
      } else if (variableNames.has(variable.name)) {
        errors.push(`Duplicate variable name: ${variable.name}`);
      } else {
        variableNames.add(variable.name);
      }

      if (!['string', 'number', 'boolean', 'date'].includes(variable.type)) {
        errors.push(`Invalid variable type for ${variable.name}`);
      }
    });
  }

  return errors;
}

/**
 * Extract variables from template string
 * Looks for {{variableName}} patterns
 */
export function extractTemplateVariables(template: string): string[] {
  const variables: string[] = [];
  const regex = EMAIL_TEMPLATES_CONSTANTS.VALIDATION.VARIABLE_PATTERN;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Replace template variables with values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  });

  return result;
}

/**
 * Sanitize HTML content (basic sanitization)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Format email template display name
 */
export function formatEmailTemplateDisplayName(template: { name: string; category?: string }): string {
  if (template.category) {
    return `${template.name} (${template.category})`;
  }
  return template.name;
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if email template is editable
 */
export function isEmailTemplateEditable(template: { status: string; deletedAt?: number }): boolean {
  if (template.deletedAt) return false;
  return template.status !== 'archived';
}
