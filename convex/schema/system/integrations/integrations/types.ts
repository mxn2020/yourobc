// convex/schema/system/integrations/integrations/types.ts
// Type extractions from validators for integrations module

import { Infer } from 'convex/values';
import { integrationsValidators } from './validators';

// Extract types from validators
export type IntegrationType = Infer<typeof integrationsValidators.integrationType>;
export type IntegrationStatus = Infer<typeof integrationsValidators.integrationStatus>;
export type SyncStatus = Infer<typeof integrationsValidators.syncStatus>;
export type EventDirection = Infer<typeof integrationsValidators.eventDirection>;
export type EventStatus = Infer<typeof integrationsValidators.eventStatus>;
export type WebhookDeliveryStatus = Infer<typeof integrationsValidators.webhookDeliveryStatus>;
export type WebhookMethod = Infer<typeof integrationsValidators.webhookMethod>;
export type OAuthGrantType = Infer<typeof integrationsValidators.oauthGrantType>;
export type RateLimit = Infer<typeof integrationsValidators.rateLimit>;
export type WebhookRetryConfig = Infer<typeof integrationsValidators.webhookRetryConfig>;
export type WebhookFilters = Infer<typeof integrationsValidators.webhookFilters>;
export type ApiError = Infer<typeof integrationsValidators.apiError>;
export type WebhookError = Infer<typeof integrationsValidators.webhookError>;
export type IntegrationConfig = Infer<typeof integrationsValidators.integrationConfig>;
