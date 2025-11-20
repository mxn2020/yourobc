// src/features/system/integrations/services/IntegrationsService.ts

import { Id } from "@/convex/_generated/dataModel";
import {
  IntegrationProvider,
  IntegrationProviderType,
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
  ApiKey,
  Webhook,
  TestWebhookResult,
  OAuthApp,
  ExternalIntegration,
  ApiRequestLog,
  IntegrationEvent,
  UsageStats,
} from "../types";
import { getIntegrationProvider } from "../config/integrations-config";
import { internalIntegrationProvider } from "../providers/internal/InternalIntegrationProvider";

/**
 * Integrations Service - Facade for all integration operations
 *
 * This service provides a unified interface for:
 * - API key management
 * - Webhook management
 * - OAuth 2.0 management
 * - External integrations (Zapier, Make, n8n)
 * - Request logging and analytics
 */
class IntegrationsService {
  private provider: IntegrationProvider;
  private isInitialized = false;

  constructor() {
    // Initialize with internal provider by default
    this.provider = internalIntegrationProvider;
  }

  /**
   * Initialize the integrations service
   */
  async initialize(
    providerType?: IntegrationProviderType,
    convexClient?: any
  ): Promise<void> {
    if (this.isInitialized) return;

    const provider = providerType || getIntegrationProvider();

    switch (provider) {
      case "internal":
        this.provider = internalIntegrationProvider;
        if (convexClient) {
          await this.provider.initialize(convexClient);
        } else {
          await this.provider.initialize();
        }
        break;

      case "zapier":
        // Lazy load Zapier provider
        const { zapierProvider } = await import(
          "../providers/ZapierProvider"
        );
        this.provider = zapierProvider;
        await this.provider.initialize();
        break;

      case "make":
        // Lazy load Make provider
        const { makeProvider } = await import(
          "../providers/MakeProvider"
        );
        this.provider = makeProvider;
        await this.provider.initialize();
        break;

      case "n8n":
        // Lazy load n8n provider
        const { n8nIntegrationProvider } = await import(
          "../providers/n8nProvider"
        );
        this.provider = n8nIntegrationProvider;
        await this.provider.initialize();
        break;

      default:
        throw new Error(`Unsupported integration provider: ${provider}`);
    }

    this.isInitialized = true;
  }

  /**
   * Get current provider
   */
  getProvider(): IntegrationProvider {
    return this.provider;
  }

  /**
   * Check if service is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // ==========================================================================
  // API Key Management
  // ==========================================================================

  /**
   * Create a new API key
   */
  async createApiKey(params: CreateApiKeyParams): Promise<CreateApiKeyResult> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.createApiKey(params);
  }

  /**
   * Get all API keys for a user
   */
  async getApiKeys(userId: Id<"userProfiles">): Promise<ApiKey[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getApiKeys(userId);
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.revokeApiKey(keyId, revokedBy);
  }

  /**
   * Validate an API key
   */
  async validateApiKey(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.validateApiKey(key);
  }

  // ==========================================================================
  // Webhook Management
  // ==========================================================================

  /**
   * Create a new webhook
   */
  async createWebhook(params: CreateWebhookParams): Promise<Id<"webhooks">> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.createWebhook(params);
  }

  /**
   * Get all webhooks for a user
   */
  async getWebhooks(userId: Id<"userProfiles">): Promise<Webhook[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getWebhooks(userId);
  }

  /**
   * Update a webhook
   */
  async updateWebhook(params: UpdateWebhookParams): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.updateWebhook(params);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: Id<"webhooks">, userId: Id<"userProfiles">): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.deleteWebhook(webhookId, userId);
  }

  /**
   * Test a webhook by sending a test payload
   */
  async testWebhook(webhookId: Id<"webhooks">): Promise<TestWebhookResult> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.testWebhook(webhookId);
  }

  // ==========================================================================
  // OAuth Management
  // ==========================================================================

  /**
   * Create a new OAuth app
   */
  async createOAuthApp(params: CreateOAuthAppParams): Promise<CreateOAuthAppResult> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.createOAuthApp(params);
  }

  /**
   * Get all OAuth apps for a user
   */
  async getOAuthApps(userId: Id<"userProfiles">): Promise<OAuthApp[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getOAuthApps(userId);
  }

  /**
   * Update an OAuth app
   */
  async updateOAuthApp(params: UpdateOAuthAppParams): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.updateOAuthApp(params);
  }

  /**
   * Delete an OAuth app
   */
  async deleteOAuthApp(appId: Id<"oauthApps">, userId: Id<"userProfiles">): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.deleteOAuthApp(appId, userId);
  }

  // ==========================================================================
  // External Integrations
  // ==========================================================================

  /**
   * Connect to an external integration (Zapier, Make, n8n, etc.)
   */
  async connectExternalIntegration(
    params: ConnectExternalIntegrationParams
  ): Promise<Id<"externalIntegrations">> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.createExternalIntegration(params);
  }

  /**
   * Disconnect from an external integration
   */
  async disconnectExternalIntegration(
    integrationId: Id<"externalIntegrations">,
    userId: Id<"userProfiles">
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.disconnectExternalIntegration(integrationId, userId);
  }

  /**
   * Get all external integrations for a user
   */
  async getExternalIntegrations(
    userId: Id<"userProfiles">
  ): Promise<ExternalIntegration[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getExternalIntegrations(userId);
  }

  // ==========================================================================
  // Logs & Analytics
  // ==========================================================================

  /**
   * Get API request logs
   */
  async getRequestLogs(params: GetRequestLogsParams): Promise<ApiRequestLog[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getRequestLogs(params);
  }

  /**
   * Get integration events
   */
  async getIntegrationEvents(
    params: GetIntegrationEventsParams
  ): Promise<IntegrationEvent[]> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getIntegrationEvents(params);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    userId: Id<"userProfiles">,
    startDate: number,
    endDate: number
  ): Promise<UsageStats> {
    if (!this.isInitialized) {
      throw new Error("IntegrationsService not initialized");
    }
    return await this.provider.getUsageStats(userId, startDate, endDate);
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Create a basic read-only API key
   */
  async createReadOnlyApiKey(
    name: string,
    scopes: string[] = ["users:read", "data:read"]
  ): Promise<CreateApiKeyResult> {
    return await this.createApiKey({
      name,
      scopes,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
    });
  }

  /**
   * Create a webhook for specific events
   */
  async createWebhookForEvents(
    url: string,
    events: string[],
    secret?: string
  ): Promise<Id<"webhooks">> {
    return await this.createWebhook({
      name: `Webhook for ${events.join(", ")}`,
      url,
      events,
      secret,
      isActive: true,
    });
  }

  /**
   * Get recent request logs
   */
  async getRecentRequestLogs(limit: number = 100): Promise<ApiRequestLog[]> {
    const endDate = Date.now();
    const startDate = endDate - 24 * 60 * 60 * 1000; // Last 24 hours

    return await this.getRequestLogs({
      startDate,
      endDate,
      limit,
    });
  }

  /**
   * Get failed request logs
   */
  async getFailedRequests(limit: number = 100): Promise<ApiRequestLog[]> {
    const endDate = Date.now();
    const startDate = endDate - 24 * 60 * 60 * 1000; // Last 24 hours

    const logs = await this.getRequestLogs({
      startDate,
      endDate,
      limit: limit * 2, // Get more to filter
    });

    return logs.filter((log) => log.statusCode >= 400).slice(0, limit);
  }
}

// Singleton instance
export const integrationsService = new IntegrationsService();
