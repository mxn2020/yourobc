// convex/config/app/entities.config.ts
// ✅ APP CUSTOMIZATION FILE - SAFE TO MODIFY
// This file is where you define your app-specific and addon entity types.
// Changes to this file will NOT conflict with boilerplate updates.

/**
 * App-specific entity types
 * Add your custom entities here for your app's features
 *
 * Naming convention: Use descriptive names with underscores
 * Examples: 'crm_contact', 'inventory_item', 'blog_post'
 */
export const APP_ENTITY_TYPES = [
  // Blog entities
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'blog_authors',

  // Analytics entities
  'analytics_events',
  'analytics_metrics',
  'analytics_dashboards',
  'analytics_reports',

  // Integrations entities
  'api_keys',
  'webhooks',
  'oauth_apps',
  'external_integrations',
] as const;

/**
 * Addon entity types
 * Add entity types for each addon you're using
 *
 * Naming convention: 'addon_name_entity_type'
 * Examples: 'chatbot_session', 'prompts_template', 'stories_universe'
 */
export const ADDON_ENTITY_TYPES = [
  // Add your addon entity types here
  // Example: 'chatbot_session',
  // Example: 'chatbot_message',
  // Example: 'prompts_template',
  // Example: 'prompts_component',
] as const;

/**
 * App commentable entity types
 * List entities that should support comments
 */
export const APP_COMMENTABLE_ENTITY_TYPES = [
  // Blog posts can have comments
  'blog_posts',
  // Analytics dashboards can have comments
  'analytics_dashboards',
  // Webhooks can have notes/comments
  'webhooks',
] as const;

/**
 * App documentable entity types
 * List entities that should support file attachments/documents
 */
export const APP_DOCUMENTABLE_ENTITY_TYPES = [
  // Add entities that can have documents
  // Example: 'crm_contact',
] as const;

/**
 * App notifiable entity types
 * List entities that can receive notifications
 */
export const APP_NOTIFIABLE_ENTITY_TYPES = [
  // Add entities that can receive notifications
  // Example: 'crm_contact',
] as const;

/**
 * All app and addon entities combined
 */
export const ALL_APP_ENTITY_TYPES = [
  ...APP_ENTITY_TYPES,
  ...ADDON_ENTITY_TYPES,
] as const;

/**
 * App entity type - TypeScript type for all app entities
 */
export type AppEntityType = typeof ALL_APP_ENTITY_TYPES[number] | '';

/**
 * EXAMPLE CONFIGURATIONS
 * Uncomment and modify these examples to get started
 */

/*
// Example 1: CRM App
export const APP_ENTITY_TYPES = [
  'crm_contact',
  'crm_company',
  'crm_deal',
  'crm_note',
] as const;

export const APP_COMMENTABLE_ENTITY_TYPES = [
  'crm_contact',
  'crm_company',
  'crm_deal',
] as const;

export const APP_DOCUMENTABLE_ENTITY_TYPES = [
  'crm_contact',
  'crm_company',
] as const;
*/

/*
// Example 2: E-commerce App
export const APP_ENTITY_TYPES = [
  'ecommerce_product',
  'ecommerce_order',
  'ecommerce_customer',
  'ecommerce_inventory',
] as const;

export const APP_COMMENTABLE_ENTITY_TYPES = [
  'ecommerce_product',
  'ecommerce_order',
] as const;
*/

/*
// Example 3: App with Chatbot Addon
export const ADDON_ENTITY_TYPES = [
  'chatbot_session',
  'chatbot_message',
  'chatbot_template',
] as const;
*/
