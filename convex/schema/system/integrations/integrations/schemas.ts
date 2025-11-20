// convex/schema/system/integrations/integrations/schemas.ts
// Schema exports for integrations module

import {
  apiKeysTable,
  apiRequestLogsTable,
  webhooksTable,
  webhookDeliveriesTable,
  oauthAppsTable,
  oauthTokensTable,
  externalIntegrationsTable,
  integrationEventsTable,
} from './integrations';

export const integrationsSchemas = {
  apiKeys: apiKeysTable,
  apiRequestLogs: apiRequestLogsTable,
  webhooks: webhooksTable,
  webhookDeliveries: webhookDeliveriesTable,
  oauthApps: oauthAppsTable,
  oauthTokens: oauthTokensTable,
  externalIntegrations: externalIntegrationsTable,
  integrationEvents: integrationEventsTable,
};
