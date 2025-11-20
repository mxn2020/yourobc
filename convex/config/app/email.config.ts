// convex/config/app/email.config.ts
// ✅ APP CUSTOMIZATION FILE - SAFE TO MODIFY
// This file is where you configure your app's email settings.
// Changes to this file will NOT conflict with boilerplate updates.

import type { EmailConfig } from '../types';

/**
 * Email configuration
 * Configure your email provider and default settings here
 *
 * Supported providers:
 * - 'sendgrid': SendGrid (requires SENDGRID_API_KEY in .env.local)
 * - 'resend': Resend (requires RESEND_API_KEY in .env.local)
 * - 'nodemailer': Nodemailer (requires SMTP settings)
 * - 'ses': Amazon SES (requires AWS credentials)
 * - 'postmark': Postmark (requires POSTMARK_API_KEY)
 * - 'mailgun': Mailgun (requires MAILGUN_API_KEY)
 */
export const EMAIL_CONFIG: EmailConfig = {
  // Email provider to use
  provider: 'resend',

  // Default 'from' email address
  // IMPORTANT: Must be verified with your email provider
  defaultFrom: 'noreply@yourdomain.com',

  // Default 'from' name (appears as 'Name <email@domain.com>')
  defaultFromName: 'Your App Name',

  // Reply-to address (optional)
  replyTo: 'support@yourdomain.com',

  // Enable email logging for debugging
  enableLogging: true,

  // Retry failed email sends
  enableRetry: true,

  // Maximum number of retry attempts
  maxRetries: 3,
};

/**
 * CONFIGURATION INSTRUCTIONS
 *
 * 1. Choose your email provider (see supported providers above)
 * 2. Add the required API key to .env.local:
 *    - SendGrid: SENDGRID_API_KEY=your_key
 *    - Resend: RESEND_API_KEY=your_key
 *    - etc.
 * 3. Update defaultFrom with a verified email address
 * 4. Update defaultFromName with your app/company name
 * 5. Set replyTo if you want replies to go to a different address
 *
 * DOMAIN VERIFICATION
 * Most email providers require you to verify your sending domain:
 * - Add DNS records (SPF, DKIM, DMARC) as instructed by your provider
 * - Verify your domain in the provider's dashboard
 * - Wait for DNS propagation (can take up to 48 hours)
 *
 * TESTING
 * Test your email configuration using the admin panel:
 * /admin/email-test (if available in your boilerplate)
 */

/**
 * EXAMPLE CONFIGURATIONS
 */

/*
// Example 1: SendGrid Configuration
export const EMAIL_CONFIG: EmailConfig = {
  provider: 'sendgrid',
  defaultFrom: 'notifications@myapp.com',
  defaultFromName: 'MyApp Notifications',
  replyTo: 'support@myapp.com',
  enableLogging: true,
  enableRetry: true,
  maxRetries: 3,
};
*/

/*
// Example 2: Resend Configuration (Recommended)
export const EMAIL_CONFIG: EmailConfig = {
  provider: 'resend',
  defaultFrom: 'hello@myapp.com',
  defaultFromName: 'MyApp',
  replyTo: 'support@myapp.com',
  enableLogging: false,  // Disable in production
  enableRetry: true,
  maxRetries: 2,
};
*/

/*
// Example 3: Amazon SES Configuration
export const EMAIL_CONFIG: EmailConfig = {
  provider: 'ses',
  defaultFrom: 'noreply@myapp.com',
  defaultFromName: 'MyApp System',
  enableLogging: true,
  enableRetry: true,
  maxRetries: 3,
};
*/
