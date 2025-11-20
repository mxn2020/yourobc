// src/features/boilerplate/integrations/index.ts
// Main export file for the Integrations feature

// Types (export types explicitly to avoid conflicts)
export type {
  IntegrationProvider as IIntegrationProvider,
  IntegrationProviderType,
  ApiKey,
  Webhook,
  WebhookDelivery,
  OAuthApp,
  OAuthToken,
  ExternalIntegration,
  ApiRequestLog,
  IntegrationEvent,
  CreateApiKeyParams,
  CreateApiKeyResult,
  CreateWebhookParams,
  UpdateWebhookParams,
  CreateOAuthAppParams,
  CreateOAuthAppResult,
  UpdateOAuthAppParams,
  ConnectExternalIntegrationParams,
  GetRequestLogsParams,
  GetIntegrationEventsParams,
  UsageStats,
  IntegrationStatus,
  WebhookDeliveryStatus,
  OAuthGrantType,
  RateLimitStatus,
} from "./types";

// Configuration
export * from "./config/integrations-config";

// Services
export { integrationsService } from "./services/IntegrationsService";

// Hooks (IntegrationsProvider component is exported here)
export * from "./hooks";

// Components
export * from "./components";

// Utilities
export * from "./utils";

// Constants
export { WEBHOOK_EVENTS, API_SCOPES, OAUTH_SCOPES } from "./types";
