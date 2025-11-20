// convex/schema/boilerplate/integrations/integrations/validators.ts
// Grouped validators for integrations module

import { v } from 'convex/values';

/**
 * Integrations Validators
 *
 * Centralized validation schemas for all integrations entities
 */
export const integrationsValidators = {
  // Integration Type
  integrationType: v.union(
    v.literal('automation'), // Zapier, Make, n8n
    v.literal('auth'), // Auth0, WorkOS
    v.literal('api'), // Generic API
    v.literal('webhook') // Webhook receiver
  ),

  // Integration Status
  integrationStatus: v.union(
    v.literal('connected'),
    v.literal('disconnected'),
    v.literal('error'),
    v.literal('pending')
  ),

  // Sync Status
  syncStatus: v.union(
    v.literal('success'),
    v.literal('failed'),
    v.literal('in_progress')
  ),

  // Event Direction
  eventDirection: v.union(
    v.literal('inbound'), // External → Internal
    v.literal('outbound') // Internal → External
  ),

  // Event Status
  eventStatus: v.union(
    v.literal('success'),
    v.literal('failed'),
    v.literal('pending')
  ),

  // Webhook Delivery Status
  webhookDeliveryStatus: v.union(
    v.literal('pending'),
    v.literal('delivered'),
    v.literal('failed'),
    v.literal('retrying')
  ),

  // Webhook Method
  webhookMethod: v.union(
    v.literal('POST'),
    v.literal('PUT')
  ),

  // OAuth Grant Types
  oauthGrantType: v.union(
    v.literal('authorization_code'),
    v.literal('client_credentials'),
    v.literal('refresh_token')
  ),

  // Rate Limit Configuration
  rateLimit: v.object({
    requestsPerMinute: v.number(),
    requestsPerHour: v.number(),
    requestsPerDay: v.number(),
  }),

  // Webhook Retry Configuration
  webhookRetryConfig: v.object({
    enabled: v.boolean(),
    maxAttempts: v.number(),
    backoffMultiplier: v.number(),
    initialDelay: v.number(), // milliseconds
  }),

  // Webhook Filters
  webhookFilters: v.object({
    conditions: v.optional(v.string()), // JSON string for filtering logic
    sampleRate: v.optional(v.number()), // 0-1, for sampling events
  }),

  // API Error Object
  apiError: v.object({
    message: v.string(),
    code: v.optional(v.string()),
    stack: v.optional(v.string()),
  }),

  // Webhook Error Object
  webhookError: v.object({
    message: v.string(),
    code: v.optional(v.string()),
  }),

  // Integration Config
  integrationConfig: v.object({
    apiKey: v.optional(v.string()),
    apiSecret: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
    additionalConfig: v.optional(v.string()), // JSON string for flexible config
  }),
} as const;
