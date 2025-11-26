// convex/lib/marketing/email_signatures/utils.ts

import { EMAIL_SIGNATURE_CONSTANTS } from './constants';
import type { MarketingEmailSignature } from './types';

export function validateEmailSignatureData(data: Partial<MarketingEmailSignature>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title.trim()) {
    errors.push('Name is required');
  }

  if (data.fullName !== undefined && !data.fullName.trim()) {
    errors.push('Full name is required');
  }

  if (data.title && data.title.length > EMAIL_SIGNATURE_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(`Name must be less than ${EMAIL_SIGNATURE_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
  }

  if (data.tags && data.tags.length > EMAIL_SIGNATURE_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${EMAIL_SIGNATURE_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  return errors;
}

export function generateSignatureHTML(signature: MarketingEmailSignature): string {
  const parts = [
    `<div style="font-family: Arial, sans-serif;">`,
    `<p><strong>${signature.fullName}</strong></p>`,
  ];

  if (signature.jobTitle) parts.push(`<p>${signature.jobTitle}</p>`);
  if (signature.company) parts.push(`<p>${signature.company}</p>`);
  if (signature.email) parts.push(`<p>Email: <a href="mailto:${signature.email}">${signature.email}</a></p>`);
  if (signature.phone) parts.push(`<p>Phone: ${signature.phone}</p>`);
  parts.push(`</div>`);

  return parts.join('\n');
}
