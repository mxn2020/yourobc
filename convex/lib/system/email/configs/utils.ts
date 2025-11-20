// convex/lib/boilerplate/email/configs/utils.ts
// Validation functions and utility helpers for email configs module

import { EMAIL_CONFIGS_CONSTANTS, EMAIL_PROVIDER_NAMES } from './constants';
import type { CreateEmailConfigData, UpdateEmailConfigData } from './types';

/**
 * Validate email config data for creation/update
 */
export function validateEmailConfigData(
  data: Partial<CreateEmailConfigData | UpdateEmailConfigData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < EMAIL_CONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${EMAIL_CONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > EMAIL_CONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${EMAIL_CONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!EMAIL_CONFIGS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate config if provided
  if ('config' in data && data.config) {
    // Validate from email
    if (data.config.fromEmail) {
      if (!isValidEmail(data.config.fromEmail)) {
        errors.push('Invalid from email address');
      }
    }

    // Validate from name
    if (data.config.fromName) {
      if (data.config.fromName.length > 100) {
        errors.push('From name must be less than 100 characters');
      }
    }

    // Validate reply-to email
    if (data.config.replyToEmail && !isValidEmail(data.config.replyToEmail)) {
      errors.push('Invalid reply-to email address');
    }

    // Provider-specific validation
    if ('provider' in data) {
      if (data.provider === 'ses' && !data.config.region) {
        errors.push('AWS region is required for SES');
      }

      if (data.provider === 'mailgun' && !data.config.domain) {
        errors.push('Domain is required for Mailgun');
      }

      // Validate API credentials
      if (!data.config.apiKey && !data.config.apiSecret) {
        errors.push('API key or secret is required');
      }
    }
  }

  return errors;
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_CONFIGS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(email);
}

/**
 * Format email config display name
 */
export function formatEmailConfigDisplayName(config: { name: string; provider: string }): string {
  const providerName = EMAIL_PROVIDER_NAMES[config.provider as keyof typeof EMAIL_PROVIDER_NAMES] || config.provider;
  return `${config.name} (${providerName})`;
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: string): string {
  return EMAIL_PROVIDER_NAMES[provider as keyof typeof EMAIL_PROVIDER_NAMES] || provider;
}

/**
 * Check if email config is editable
 */
export function isEmailConfigEditable(config: { status: string; deletedAt?: number }): boolean {
  if (config.deletedAt) return false;
  return config.status !== 'archived';
}

/**
 * Sanitize config before returning (remove sensitive data)
 */
export function sanitizeEmailConfig(config: any) {
  const sanitized = { ...config };
  if (sanitized.config) {
    sanitized.config = {
      ...sanitized.config,
      apiKey: sanitized.config.apiKey ? '***' : undefined,
      apiSecret: sanitized.config.apiSecret ? '***' : undefined,
    };
  }
  return sanitized;
}
