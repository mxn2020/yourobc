// convex/config/app/metadata.config.ts
// ✅ APP CUSTOMIZATION FILE - SAFE TO MODIFY
// This file is where you configure your app's metadata and branding.
// Changes to this file will NOT conflict with system updates.

import type { AppMetadataConfig, FeatureFlagsConfig } from '../types';

/**
 * App metadata configuration
 * Customize your app's name, branding, and general information
 */
export const APP_METADATA: AppMetadataConfig = {
  // Application name (shown in header, page titles, etc.)
  name: 'Geenius',

  // Short description of your app
  description: 'AI-powered application platform',

  // Logo path or URL (relative to public folder or absolute URL)
  logo: '/logo.png',

  // Favicon path or URL
  favicon: '/favicon.ico',

  // Primary brand color (Tailwind color name)
  brandColor: 'indigo',

  // Support email address
  supportEmail: 'support@geenius.app',

  // Company/Organization name
  organizationName: 'Geenius Inc.',
};

/**
 * Feature flags configuration
 * Enable or disable major features in your app
 * Useful for gradual rollout or environment-specific features
 */
export const FEATURE_FLAGS: FeatureFlagsConfig = {
  // Enable payment features (Stripe, subscriptions, etc.)
  enablePayments: true,

  // Enable email features (sending emails, templates, etc.)
  enableEmail: true,

  // Enable projects module
  enableProjects: true,

  // Enable AI features (models, testing, logs)
  enableAI: true,

  // Enable audit logs
  enableAuditLogs: true,

  // Enable notifications system
  enableNotifications: true,

  // Enable comments on entities
  enableComments: true,

  // Enable document attachments on entities
  enableDocuments: true,
};

/**
 * CUSTOMIZATION GUIDE
 *
 * APP_METADATA:
 * - Update 'name' to your app's name
 * - Update 'description' for SEO and meta tags
 * - Update 'logo' path to your app's logo file
 * - Update 'favicon' to your custom favicon
 * - Choose a 'brandColor' that matches your brand (used in UI)
 * - Set 'supportEmail' for contact/support pages
 * - Set 'organizationName' for legal/footer information
 *
 * FEATURE_FLAGS:
 * - Set to false to disable features you don't need
 * - Useful for MVP launches (disable features for later)
 * - Can be environment-specific (dev vs production)
 *
 * BRAND COLORS:
 * Available Tailwind colors:
 * - slate, gray, zinc, neutral, stone
 * - red, orange, amber, yellow, lime
 * - green, emerald, teal, cyan, sky
 * - blue, indigo, violet, purple, fuchsia
 * - pink, rose
 */

/**
 * EXAMPLE CONFIGURATIONS
 */

/*
// Example 1: SaaS Product
export const APP_METADATA: AppMetadataConfig = {
  name: 'TaskMaster Pro',
  description: 'Project management made simple',
  logo: '/images/logo.svg',
  favicon: '/images/favicon.png',
  brandColor: 'blue',
  supportEmail: 'support@taskmaster.io',
  organizationName: 'TaskMaster Inc.',
};

export const FEATURE_FLAGS: FeatureFlagsConfig = {
  enablePayments: true,
  enableEmail: true,
  enableProjects: true,
  enableAI: false,  // Not needed for this app
  enableAuditLogs: true,
  enableNotifications: true,
  enableComments: true,
  enableDocuments: true,
};
*/

/*
// Example 2: MVP Launch (Minimal Features)
export const APP_METADATA: AppMetadataConfig = {
  name: 'MyStartup',
  description: 'Revolutionary new product',
  logo: '/logo.png',
  brandColor: 'emerald',
  supportEmail: 'hello@mystartup.com',
  organizationName: 'MyStartup LLC',
};

export const FEATURE_FLAGS: FeatureFlagsConfig = {
  enablePayments: false,  // Add later
  enableEmail: true,
  enableProjects: false,  // Not in MVP
  enableAI: true,
  enableAuditLogs: false,  // Add later
  enableNotifications: true,
  enableComments: false,  // Not in MVP
  enableDocuments: false,  // Not in MVP
};
*/

/*
// Example 3: Enterprise App
export const APP_METADATA: AppMetadataConfig = {
  name: 'Enterprise Suite',
  description: 'Complete business management platform',
  logo: '/assets/brand/logo.svg',
  favicon: '/assets/brand/favicon.ico',
  brandColor: 'slate',
  supportEmail: 'enterprise@company.com',
  organizationName: 'Enterprise Corp',
};

export const FEATURE_FLAGS: FeatureFlagsConfig = {
  enablePayments: true,
  enableEmail: true,
  enableProjects: true,
  enableAI: true,
  enableAuditLogs: true,  // Important for compliance
  enableNotifications: true,
  enableComments: true,
  enableDocuments: true,
};
*/
