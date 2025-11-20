// convex/config/types.ts
// TypeScript type definitions for app configuration

import { LucideIcon } from 'lucide-react';

/**
 * Navigation item configuration
 */
export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

/**
 * Addon configuration
 */
export interface AddonConfig {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  color: AddonColor;
  description?: string;
}

/**
 * Available colors for addons
 */
export type AddonColor =
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose';

/**
 * Entity type category
 */
export interface EntityTypeCategory {
  /** Array of entity type strings */
  types: string[];
  /** Category description */
  description?: string;
}

/**
 * Entity types configuration
 */
export interface EntityTypesConfig {
  /** Core system entities (don't modify in apps) */
  system: string[];
  /** System entities (don't modify in apps) */
  system: string[];
  /** App/addon specific entities (customize per app) */
  app: string[];
  /** Entities that can have comments */
  commentable: string[];
  /** Entities that can have documents */
  documentable: string[];
  /** Entities that can receive notifications */
  notifiable: string[];
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  /** Core dashboard navigation */
  dashboard: NavigationItem[];
  /** Admin panel navigation */
  admin: NavigationItem[];
  /** Projects system navigation */
  projects: NavigationItem[];
  /** App-specific addon configurations */
  addons: AddonConfig[];
  /** Navigation items per addon */
  addonNavigation: Record<string, NavigationItem[]>;
}

/**
 * Email provider type
 */
export type EmailProvider = 'sendgrid' | 'resend' | 'nodemailer' | 'ses' | 'postmark' | 'mailgun';

/**
 * Email configuration
 */
export interface EmailConfig {
  /** Selected email provider */
  provider: EmailProvider;
  /** Default 'from' email address */
  defaultFrom: string;
  /** Default 'from' name */
  defaultFromName?: string;
  /** Default reply-to address */
  replyTo?: string;
  /** Enable email logging */
  enableLogging?: boolean;
  /** Retry failed sends */
  enableRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
}

/**
 * App metadata configuration
 */
export interface AppMetadataConfig {
  /** Application name */
  name: string;
  /** Short app description */
  description?: string;
  /** Logo path or URL */
  logo?: string;
  /** Favicon path or URL */
  favicon?: string;
  /** Primary brand color */
  brandColor?: AddonColor;
  /** Support email */
  supportEmail?: string;
  /** Company/Organization name */
  organizationName?: string;
}

/**
 * Feature flags configuration
 */
export interface FeatureFlagsConfig {
  /** Enable payment features */
  enablePayments?: boolean;
  /** Enable email features */
  enableEmail?: boolean;
  /** Enable projects module */
  enableProjects?: boolean;
  /** Enable AI features */
  enableAI?: boolean;
  /** Enable audit logs */
  enableAuditLogs?: boolean;
  /** Enable notifications */
  enableNotifications?: boolean;
  /** Enable comments */
  enableComments?: boolean;
  /** Enable documents */
  enableDocuments?: boolean;
}

/**
 * Complete app configuration
 */
export interface AppConfig {
  metadata: AppMetadataConfig;
  navigation: NavigationConfig;
  entities: EntityTypesConfig;
  email: EmailConfig;
  features: FeatureFlagsConfig;
}
