// src/features/boilerplate/integrations/providers/n8nProvider.ts

import { Id } from "@/convex/_generated/dataModel";
import {
  IntegrationProvider,
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
  ApiKey,
  Webhook,
  TestWebhookResult,
  OAuthApp,
  ExternalIntegration,
  ApiRequestLog,
  IntegrationEvent,
} from "../types";

/**
 * n8n integration provider (stub implementation)
 */
class n8nProvider implements IntegrationProvider {
  name = "n8n";
  type = "n8n" as const;
  isInitialized = false;

  async initialize(): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
    throw new Error("n8n provider not implemented yet");
  }

  async getApiKeys(userId: Id<"userProfiles">): Promise<ApiKey[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async revokeApiKey(keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async validateApiKey(key: string): Promise<boolean> {
    throw new Error("n8n provider not implemented yet");
  }

  async createWebhook(params: CreateWebhookParams): Promise<Id<"webhooks">> {
    throw new Error("n8n provider not implemented yet");
  }

  async getWebhooks(userId: Id<"userProfiles">): Promise<Webhook[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async updateWebhook(params: UpdateWebhookParams): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async deleteWebhook(webhookId: Id<"webhooks">, userId: Id<"userProfiles">): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async testWebhook(webhookId: Id<"webhooks">): Promise<TestWebhookResult> {
    throw new Error("n8n provider not implemented yet");
  }

  async createOAuthApp(params: CreateOAuthAppParams): Promise<CreateOAuthAppResult> {
    throw new Error("n8n provider not implemented yet");
  }

  async getOAuthApps(userId: Id<"userProfiles">): Promise<OAuthApp[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async updateOAuthApp(params: UpdateOAuthAppParams): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async deleteOAuthApp(appId: Id<"oauthApps">, userId: Id<"userProfiles">): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async createExternalIntegration(
    params: ConnectExternalIntegrationParams
  ): Promise<Id<"externalIntegrations">> {
    throw new Error("n8n provider not implemented yet");
  }

  async disconnectExternalIntegration(
    integrationId: Id<"externalIntegrations">,
    userId: Id<"userProfiles">
  ): Promise<void> {
    throw new Error("n8n provider not implemented yet");
  }

  async getExternalIntegrations(userId: Id<"userProfiles">): Promise<ExternalIntegration[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async getRequestLogs(params: GetRequestLogsParams): Promise<ApiRequestLog[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async getIntegrationEvents(params: GetIntegrationEventsParams): Promise<IntegrationEvent[]> {
    throw new Error("n8n provider not implemented yet");
  }

  async getUsageStats(
    userId: Id<"userProfiles">,
    startDate: number,
    endDate: number
  ): Promise<UsageStats> {
    throw new Error("n8n provider not implemented yet");
  }
}

export default new n8nProvider();
export const n8nIntegrationProvider = new n8nProvider();
