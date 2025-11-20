// src/features/email/utils/email-validator.ts

import type { EmailRequest, ProviderConfig } from '../types';

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate multiple email addresses
 */
export function areValidEmails(emails: string[]): boolean {
  return emails.every(email => isValidEmail(email));
}

/**
 * Validate email request
 */
export function validateEmailRequest(request: EmailRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate recipients
  if (!request.to || (Array.isArray(request.to) && request.to.length === 0)) {
    errors.push('At least one recipient is required');
  } else {
    const recipients = Array.isArray(request.to) ? request.to : [request.to];
    const recipientEmails = recipients.map(r => (typeof r === 'string' ? r : r.email));

    recipientEmails.forEach(email => {
      if (!isValidEmail(email)) {
        errors.push(`Invalid recipient email: ${email}`);
      }
    });
  }

  // Validate subject
  if (!request.subject || request.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  // Validate content
  if (!request.html && !request.text && !request.templateId) {
    errors.push('Email must have HTML content, text content, or a template');
  }

  // Validate from address if provided
  if (request.from) {
    const fromEmail = typeof request.from === 'string' ? request.from : request.from.email;
    if (!isValidEmail(fromEmail)) {
      errors.push(`Invalid sender email: ${fromEmail}`);
    }
  }

  // Validate reply-to if provided
  if (request.replyTo) {
    const replyToEmail =
      typeof request.replyTo === 'string' ? request.replyTo : request.replyTo.email;
    if (!isValidEmail(replyToEmail)) {
      errors.push(`Invalid reply-to email: ${replyToEmail}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(config: ProviderConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate fromEmail
  if (!config.fromEmail || !isValidEmail(config.fromEmail)) {
    errors.push('Valid sender email is required');
  }

  // Validate fromName
  if (!config.fromName || config.fromName.trim().length === 0) {
    errors.push('Sender name is required');
  }

  // Validate reply-to if provided
  if (config.replyToEmail && !isValidEmail(config.replyToEmail)) {
    errors.push('Invalid reply-to email');
  }

  // Provider-specific validation
  switch (config.provider) {
    case 'resend':
      if (!config.apiKey) {
        errors.push('Resend API key is required');
      } else if (!config.apiKey.startsWith('re_')) {
        errors.push('Invalid Resend API key format (should start with "re_")');
      }
      break;

    case 'sendgrid':
      if (!config.apiKey) {
        errors.push('SendGrid API key is required');
      } else if (!config.apiKey.startsWith('SG.')) {
        errors.push('Invalid SendGrid API key format (should start with "SG.")');
      }
      break;

    case 'ses':
      if (!config.apiKey) {
        errors.push('AWS Access Key ID is required');
      }
      if (!config.apiSecret) {
        errors.push('AWS Secret Access Key is required');
      }
      if (!config.region) {
        errors.push('AWS region is required');
      }
      break;

    case 'postmark':
      if (!config.apiKey) {
        errors.push('Postmark server API token is required');
      }
      break;

    case 'mailgun':
      if (!config.apiKey) {
        errors.push('Mailgun API key is required');
      }
      if (!config.domain) {
        errors.push('Mailgun domain is required');
      }
      break;

    default:
      errors.push('Unknown email provider');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize email content (remove potentially dangerous HTML)
 */
export function sanitizeEmailHtml(html: string): string {
  // Basic sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * Extract plain text from HTML
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gim, '')
    .replace(/<script[^>]*>.*<\/script>/gim, '')
    .replace(/<[^>]+>/gim, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
