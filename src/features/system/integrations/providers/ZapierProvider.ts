// src/features/system/integrations/providers/ZapierProvider.ts

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
 * Zapier integration provider (stub implementation)
 */
class ZapierProvider implements IntegrationProvider {
  name = "Zapier";
  type = "zapier" as const;
  isInitialized = false;

  async initialize(): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getApiKeys(userId: Id<"userProfiles">): Promise<ApiKey[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async revokeApiKey(keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async validateApiKey(key: string): Promise<boolean> {
    throw new Error("Zapier provider not implemented yet");
  }

  async createWebhook(params: CreateWebhookParams): Promise<Id<"webhooks">> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getWebhooks(userId: Id<"userProfiles">): Promise<Webhook[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async updateWebhook(params: UpdateWebhookParams): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async deleteWebhook(webhookId: Id<"webhooks">, userId: Id<"userProfiles">): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async testWebhook(webhookId: Id<"webhooks">): Promise<TestWebhookResult> {
    throw new Error("Zapier provider not implemented yet");
  }

  async createOAuthApp(params: CreateOAuthAppParams): Promise<CreateOAuthAppResult> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getOAuthApps(userId: Id<"userProfiles">): Promise<OAuthApp[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async updateOAuthApp(params: UpdateOAuthAppParams): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async deleteOAuthApp(appId: Id<"oauthApps">, userId: Id<"userProfiles">): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async createExternalIntegration(
    params: ConnectExternalIntegrationParams
  ): Promise<Id<"externalIntegrations">> {
    throw new Error("Zapier provider not implemented yet");
  }

  async disconnectExternalIntegration(
    integrationId: Id<"externalIntegrations">,
    userId: Id<"userProfiles">
  ): Promise<void> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getExternalIntegrations(userId: Id<"userProfiles">): Promise<ExternalIntegration[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getRequestLogs(params: GetRequestLogsParams): Promise<ApiRequestLog[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getIntegrationEvents(params: GetIntegrationEventsParams): Promise<IntegrationEvent[]> {
    throw new Error("Zapier provider not implemented yet");
  }

  async getUsageStats(
    userId: Id<"userProfiles">,
    startDate: number,
    endDate: number
  ): Promise<UsageStats> {
    throw new Error("Zapier provider not implemented yet");
  }
}

export default new ZapierProvider();
export const zapierProvider = new ZapierProvider();
