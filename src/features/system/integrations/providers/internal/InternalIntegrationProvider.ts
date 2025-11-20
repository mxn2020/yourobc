// src/features/boilerplate/integrations/providers/internal/InternalIntegrationProvider.ts

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
} from "../../types";

/**
 * Internal integration provider using Convex backend
 */
class InternalIntegrationProvider implements IntegrationProvider {
  name = "Internal";
  type = "internal" as const;
  isInitialized = false;

  // Store convex client reference
  private convexClient: {
    mutation: (mutation: unknown, args: Record<string, unknown>) => Promise<unknown>;
    query: (query: unknown, args: Record<string, unknown>) => Promise<unknown>;
  } | null = null;

  async initialize(convexClient?: {
    mutation: (mutation: unknown, args: Record<string, unknown>) => Promise<unknown>;
    query: (query: unknown, args: Record<string, unknown>) => Promise<unknown>;
  }): Promise<void> {
    this.convexClient = convexClient || null;
    this.isInitialized = true;
  }

  // API Key Management

  async createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    const result = await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.createApiKey, {
      name: params.name,
      description: params.description,
      scopes: params.scopes,
      rateLimit: params.rateLimit,
      expiresAt: params.expiresAt,
      allowedIps: params.allowedIps,
      metadata: params.metadata,
    });

    return result as CreateApiKeyResult;
  }

  async getApiKeys(userId: Id<"userProfiles">): Promise<ApiKey[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(api.lib.boilerplate.integrations.queries.getApiKeys, {
      userId,
    })) as ApiKey[];
  }

  async revokeApiKey(keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.revokeApiKey, {
      keyId,
      revokedBy,
    });
  }

  async validateApiKey(key: string): Promise<boolean> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    const result = await this.convexClient.query(api.lib.boilerplate.integrations.queries.validateApiKey, {
      key,
    });

    return result !== null;
  }

  // Webhook Management

  async createWebhook(params: CreateWebhookParams): Promise<Id<"webhooks">> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.createWebhook, {
      name: params.name,
      description: params.description,
      url: params.url,
      secret: params.secret,
      events: params.events,
      method: params.method,
      headers: params.headers,
      timeout: params.timeout,
      retryConfig: params.retryConfig,
      filters: params.filters,
      isActive: params.isActive,
      metadata: params.metadata,
    })) as Id<"webhooks">;
  }

  async getWebhooks(userId: Id<"userProfiles">): Promise<Webhook[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(api.lib.boilerplate.integrations.queries.getWebhooks, {
      userId,
    })) as Webhook[];
  }

  async updateWebhook(params: UpdateWebhookParams): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.updateWebhook, {
      webhookId: params.webhookId,
      name: params.name,
      description: params.description,
      url: params.url,
      secret: params.secret,
      events: params.events,
      method: params.method,
      headers: params.headers,
      timeout: params.timeout,
      retryConfig: params.retryConfig,
      filters: params.filters,
      isActive: params.isActive,
      metadata: params.metadata,
      updatedBy: params.updatedBy,
    });
  }

  async deleteWebhook(webhookId: Id<"webhooks">, userId: Id<"userProfiles">): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.deleteWebhook, {
      webhookId,
      userId,
    });
  }

  async testWebhook(webhookId: Id<"webhooks">): Promise<TestWebhookResult> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.testWebhook, {
      webhookId,
    })) as TestWebhookResult;
  }

  // OAuth Management

  async createOAuthApp(params: CreateOAuthAppParams): Promise<CreateOAuthAppResult> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.createOAuthApp, {
      name: params.name,
      description: params.description,
      redirectUris: params.redirectUris,
      scopes: params.scopes,
      grantTypes: params.grantTypes || ["authorization_code"],
      logoUrl: params.logoUrl,
      website: params.website,
      privacyPolicyUrl: params.privacyPolicyUrl,
      termsOfServiceUrl: params.termsOfServiceUrl,
    })) as CreateOAuthAppResult;
  }

  async getOAuthApps(userId: Id<"userProfiles">): Promise<OAuthApp[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(api.lib.boilerplate.integrations.queries.getOAuthApps, {
      userId,
    })) as OAuthApp[];
  }

  async updateOAuthApp(params: UpdateOAuthAppParams): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.updateOAuthApp, {
      appId: params.appId,
      name: params.name,
      description: params.description,
      redirectUris: params.redirectUris,
      scopes: params.scopes,
      grantTypes: params.grantTypes,
      logoUrl: params.logoUrl,
      website: params.website,
      privacyPolicyUrl: params.privacyPolicyUrl,
      termsOfServiceUrl: params.termsOfServiceUrl,
      isActive: params.isActive,
      updatedBy: params.updatedBy,
    });
  }

  async deleteOAuthApp(appId: Id<"oauthApps">, userId: Id<"userProfiles">): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(api.lib.boilerplate.integrations.mutations.deleteOAuthApp, {
      appId,
      userId,
    });
  }

  // External Integrations

  async createExternalIntegration(
    params: ConnectExternalIntegrationParams
  ): Promise<Id<"externalIntegrations">> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.mutation(
      api.lib.boilerplate.integrations.mutations.createExternalIntegration,
      {
        provider: params.provider,
        type: params.type,
        name: params.name,
        config: params.config,
        metadata: params.metadata,
      }
    )) as Id<"externalIntegrations">;
  }

  async disconnectExternalIntegration(integrationId: Id<"externalIntegrations">, userId: Id<"userProfiles">): Promise<void> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    await this.convexClient.mutation(
      api.lib.boilerplate.integrations.mutations.disconnectExternalIntegration,
      {
        integrationId,
        userId,
      }
    );
  }

  async getExternalIntegrations(userId: Id<"userProfiles">): Promise<ExternalIntegration[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(
      api.lib.boilerplate.integrations.queries.getExternalIntegrations,
      {
        userId,
      }
    )) as ExternalIntegration[];
  }

  // Logs & Analytics

  async getRequestLogs(params: GetRequestLogsParams): Promise<ApiRequestLog[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(api.lib.boilerplate.integrations.queries.getRequestLogs, {
      apiKeyId: params.apiKeyId,
      userId: params.userId,
      method: params.method,
      path: params.path,
      startDate: params.startDate,
      endDate: params.endDate,
      statusCode: params.statusCode,
      limit: params.limit,
    })) as ApiRequestLog[];
  }

  async getIntegrationEvents(params: GetIntegrationEventsParams): Promise<IntegrationEvent[]> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(
      api.lib.boilerplate.integrations.queries.getIntegrationEvents,
      {
        integrationId: params.integrationId,
        eventType: params.eventType,
        status: params.status,
        direction: params.direction,
        startDate: params.startDate,
        endDate: params.endDate,
        limit: params.limit,
      }
    )) as IntegrationEvent[];
  }

  async getUsageStats(
    userId: Id<"userProfiles">,
    startDate: number,
    endDate: number
  ): Promise<UsageStats> {
    if (!this.convexClient) {
      throw new Error("InternalIntegrationProvider not initialized");
    }

    return (await this.convexClient.query(api.lib.boilerplate.integrations.queries.getUsageStats, {
      userId,
      startDate,
      endDate,
    })) as UsageStats;
  }
}

export default new InternalIntegrationProvider();

// Singleton instance
export const internalIntegrationProvider = new InternalIntegrationProvider();
