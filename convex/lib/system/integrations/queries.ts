// convex/lib/boilerplate/integrations/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { requireCurrentUser } from '@/shared/auth.helper';

/**
 * Get all API keys for a user
 */
export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query('apiKeys')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('revokedAt'), undefined))
      .collect();
  },
});

/**
 * Get a single API key by ID
 */
export const getApiKey = query({
  args: {
    keyId: v.id('apiKeys'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.keyId);
  },
});

/**
 * Get API key by prefix
 */
export const getApiKeyByPrefix = query({
  args: {
    prefix: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('apiKeys')
      .withIndex('by_key_prefix', (q) => q.eq('keyPrefix', args.prefix))
      .first();
  },
});

/**
 * Get all webhooks for a user
 */
export const getWebhooks = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query('webhooks')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});

/**
 * Get a single webhook by ID
 */
export const getWebhook = query({
  args: {
    webhookId: v.id('webhooks'),
  },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.webhookId);
    if (webhook?.deletedAt) return null;
    return webhook;
  },
});

/**
 * Get webhook deliveries for a webhook
 */
export const getWebhookDeliveries = query({
  args: {
    webhookId: v.id('webhooks'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const deliveries = await ctx.db
      .query('webhookDeliveries')
      .withIndex('by_webhook', (q) => q.eq('webhookId', args.webhookId))
      .order('desc')
      .take(args.limit || 50);

    return deliveries;
  },
});

/**
 * Get failed webhook deliveries that need retry
 */
export const getFailedWebhookDeliveries = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    return await ctx.db
      .query('webhookDeliveries')
      .withIndex('by_retry', (q) => q.eq('status', 'retrying'))
      .filter((q) =>
        q.and(
          q.neq(q.field('nextRetryAt'), undefined),
          q.lte(q.field('nextRetryAt'), now)
        )
      )
      .collect();
  },
});

/**
 * Get all OAuth apps for a user
 */
export const getOAuthApps = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    return await ctx.db
      .query('oauthApps')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});

/**
 * Get a single OAuth app by ID
 */
export const getOAuthApp = query({
  args: {
    appId: v.id('oauthApps'),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (app?.deletedAt) return null;
    return app;
  },
});

/**
 * Get OAuth app by client ID
 */
export const getOAuthAppByClientId = query({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('oauthApps')
      .withIndex('by_client_id', (q) => q.eq('clientId', args.clientId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();
  },
});

/**
 * Get OAuth tokens for an app
 */
export const getOAuthTokens = query({
  args: {
    appId: v.id('oauthApps'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('oauthTokens')
      .withIndex('by_app', (q) => q.eq('appId', args.appId))
      .filter((q) => q.eq(q.field('isRevoked'), false))
      .collect();
  },
});

/**
 * Get external integrations for a user
 */
export const getExternalIntegrations = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('automation'),
        v.literal('auth'),
        v.literal('api'),
        v.literal('webhook')
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    // Use type index if available and type is provided, otherwise use user index
    let integrations;

    if (args.type) {
      // Assuming you have a compound index by_user_type: ['userId', 'type']
      // If not, this approach still works but is less efficient
      integrations = await ctx.db
        .query('externalIntegrations')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) =>
          q.and(
            q.eq(q.field('deletedAt'), undefined),
            q.eq(q.field('type'), args.type!)
          )
        )
        .collect();
    } else {
      integrations = await ctx.db
        .query('externalIntegrations')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    return integrations;
  },
});

/**
 * Get a single external integration
 */
export const getExternalIntegration = query({
  args: {
    integrationId: v.id('externalIntegrations'),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (integration?.deletedAt) return null;
    return integration;
  },
});

/**
 * Get integration events
 */
export const getIntegrationEvents = query({
  args: {
    integrationId: v.id('externalIntegrations'),
    eventType: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query('integrationEvents')
      .withIndex('by_integration', (q) =>
        q.eq('integrationId', args.integrationId)
      )
      .order('desc')
      .take(args.limit || 50);

    // Apply filters
    if (args.eventType) {
      events = events.filter((e) => e.eventType === args.eventType);
    }

    if (args.startDate || args.endDate) {
      events = events.filter((e) => {
        if (args.startDate && e.timestamp < args.startDate) return false;
        if (args.endDate && e.timestamp > args.endDate) return false;
        return true;
      });
    }

    return events;
  },
});

/**
 * Get API request logs
 */
export const getApiRequestLogs = query({
  args: {
    apiKeyId: v.optional(v.id('apiKeys')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    let logsQuery;

    // Use most selective index
    if (args.apiKeyId) {
      const apiKeyId = args.apiKeyId;
      logsQuery = ctx.db
        .query('apiRequestLogs')
        .withIndex('by_api_key', (q) => q.eq('apiKeyId', apiKeyId));
    } else {
      // Filter by current user
      logsQuery = ctx.db
        .query('apiRequestLogs')
        .withIndex('by_user', (q) => q.eq('userId', user._id));
    }

    let logs = await logsQuery.order('desc').take(args.limit || 100);

    // Apply date filters
    if (args.startDate || args.endDate) {
      logs = logs.filter((log) => {
        if (args.startDate && log.timestamp < args.startDate) return false;
        if (args.endDate && log.timestamp > args.endDate) return false;
        return true;
      });
    }

    return logs;
  },
});

/**
 * Get API usage statistics
 */
export const getApiUsageStats = query({
  args: {
    apiKeyId: v.optional(v.id('apiKeys')),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    let logsQuery;

    if (args.apiKeyId) {
      const apiKeyId = args.apiKeyId;
      logsQuery = ctx.db
        .query('apiRequestLogs')
        .withIndex('by_api_key', (q) => q.eq('apiKeyId', apiKeyId))
        .collect();
    } else {
      // Filter by current user
      logsQuery = ctx.db
        .query('apiRequestLogs')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .collect();
    }

    const logs = await logsQuery;

    // Filter by date range
    const filtered = logs.filter(
      (log) => log.timestamp >= args.startDate && log.timestamp <= args.endDate
    );

    // Calculate statistics
    const totalRequests = filtered.length;
    const successfulRequests = filtered.filter((log) => log.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime =
      filtered.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests || 0;

    // Group by status code
    const requestsByStatus: Record<number, number> = {};
    filtered.forEach((log) => {
      requestsByStatus[log.statusCode] =
        (requestsByStatus[log.statusCode] || 0) + 1;
    });

    // Group by path
    const requestsByPath: Record<string, number> = {};
    filtered.forEach((log) => {
      requestsByPath[log.path] = (requestsByPath[log.path] || 0) + 1;
    });

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      requestsByStatus,
      requestsByPath,
    };
  },
});

/**
 * Get API key statistics
 */
export const getApiKeyStats = query({
  args: {
    keyId: v.id('apiKeys'),
  },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);
    if (!key) {
      throw new Error('API key not found');
    }

    // Get recent logs for this key
    const logs = await ctx.db
      .query('apiRequestLogs')
      .withIndex('by_api_key', (q) => q.eq('apiKeyId', args.keyId))
      .order('desc')
      .take(100);

    const successfulRequests = logs.filter((log) => log.statusCode < 400).length;
    const failedRequests = logs.length - successfulRequests;
    const averageResponseTime =
      logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length || 0;

    return {
      totalRequests: key.totalRequests,
      successfulRequests,
      failedRequests,
      totalErrors: key.totalErrors,
      averageResponseTime,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
    };
  },
});

/**
 * Validate an API key (without incrementing usage)
 */
export const validateApiKey = query({
  args: {
    keyPrefix: v.string(),
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query('apiKeys')
      .withIndex('by_key_prefix', (q) => q.eq('keyPrefix', args.keyPrefix))
      .first();

    if (!key) {
      return { valid: false, error: 'API key not found' };
    }

    if (key.keyHash !== args.keyHash) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!key.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    if (key.expiresAt && key.expiresAt < Date.now()) {
      return { valid: false, error: 'API key has expired' };
    }

    return {
      valid: true,
      keyId: key._id,
      scopes: key.scopes,
      rateLimit: key.rateLimit,
      allowedIps: key.allowedIps,
    };
  },
});

/**
 * Get webhook statistics
 */
export const getWebhookStats = query({
  args: {
    webhookId: v.id('webhooks'),
  },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // Get recent deliveries
    const deliveries = await ctx.db
      .query('webhookDeliveries')
      .withIndex('by_webhook', (q) => q.eq('webhookId', args.webhookId))
      .order('desc')
      .take(100);

    const pendingDeliveries = deliveries.filter((d) => d.status === 'pending').length;
    const successfulDeliveries = deliveries.filter((d) => d.status === 'delivered').length;
    const failedDeliveries = deliveries.filter((d) => d.status === 'failed').length;
    const retryingDeliveries = deliveries.filter((d) => d.status === 'retrying').length;

    const averageResponseTime =
      deliveries
        .filter((d) => d.responseTime)
        .reduce((sum, d) => sum + (d.responseTime || 0), 0) /
        deliveries.filter((d) => d.responseTime).length || 0;

    return {
      totalDeliveries: webhook.totalDeliveries,
      successfulDeliveries: webhook.successfulDeliveries,
      failedDeliveries: webhook.failedDeliveries,
      pendingDeliveries,
      retryingDeliveries,
      averageResponseTime: webhook.averageResponseTime || averageResponseTime,
      lastTriggeredAt: webhook.lastTriggeredAt,
      lastSuccessAt: webhook.lastSuccessAt,
      lastFailureAt: webhook.lastFailureAt,
      isActive: webhook.isActive,
    };
  },
});

/**
 * Get OAuth app statistics
 */
export const getOAuthAppStats = query({
  args: {
    appId: v.id('oauthApps'),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error('OAuth app not found');
    }

    // Get tokens for this app
    const tokens = await ctx.db
      .query('oauthTokens')
      .withIndex('by_app', (q) => q.eq('appId', args.appId))
      .collect();

    const activeTokens = tokens.filter(
      (t) => !t.isRevoked && t.expiresAt > Date.now()
    ).length;
    const revokedTokens = tokens.filter((t) => t.isRevoked).length;
    const expiredTokens = tokens.filter(
      (t) => !t.isRevoked && t.expiresAt <= Date.now()
    ).length;

    // Count unique users
    const uniqueUsers = new Set(tokens.map((t) => t.userId)).size;

    return {
      totalUsers: app.totalUsers,
      activeUsers: app.activeUsers,
      uniqueUsers,
      totalTokens: app.totalTokens,
      activeTokens,
      revokedTokens,
      expiredTokens,
      isActive: app.isActive,
      isVerified: app.isVerified,
    };
  },
});

/**
 * Get integration health status
 */
export const getIntegrationHealth = query({
  args: {
    integrationId: v.id('externalIntegrations'),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db.get(args.integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Get recent events
    const recentEvents = await ctx.db
      .query('integrationEvents')
      .withIndex('by_integration', (q) => q.eq('integrationId', args.integrationId))
      .order('desc')
      .take(100);

    const successfulEvents = recentEvents.filter((e) => e.status === 'success').length;
    const failedEvents = recentEvents.filter((e) => e.status === 'failed').length;
    const pendingEvents = recentEvents.filter((e) => e.status === 'pending').length;

    const successRate =
      recentEvents.length > 0 ? (successfulEvents / recentEvents.length) * 100 : 0;

    const averageProcessingTime =
      recentEvents
        .filter((e) => e.processingTime)
        .reduce((sum, e) => sum + (e.processingTime || 0), 0) /
        recentEvents.filter((e) => e.processingTime).length || 0;

    // Determine health status
    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    if (recentEvents.length === 0) {
      healthStatus = 'unknown';
    } else if (successRate >= 95) {
      healthStatus = 'healthy';
    } else if (successRate >= 80) {
      healthStatus = 'degraded';
    } else {
      healthStatus = 'unhealthy';
    }

    return {
      status: integration.status,
      healthStatus,
      isConnected: integration.isConnected,
      totalRequests: integration.totalRequests,
      successfulRequests: integration.successfulRequests,
      failedRequests: integration.failedRequests,
      successRate,
      recentSuccessfulEvents: successfulEvents,
      recentFailedEvents: failedEvents,
      recentPendingEvents: pendingEvents,
      averageProcessingTime,
      lastSyncedAt: integration.lastSyncedAt,
      syncStatus: integration.syncStatus,
      connectionError: integration.connectionError,
    };
  },
});

/**
 * Get API key by public ID
 */
export const getApiKeyByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('apiKeys')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first();
  },
});

/**
 * Get webhook by public ID
 */
export const getWebhookByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const webhook = await ctx.db
      .query('webhooks')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first();
    if (webhook?.deletedAt) return null;
    return webhook;
  },
});

/**
 * Get OAuth app by public ID
 */
export const getOAuthAppByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const app = await ctx.db
      .query('oauthApps')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first();
    if (app?.deletedAt) return null;
    return app;
  },
});

/**
 * Get external integration by public ID
 */
export const getExternalIntegrationByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, args) => {
    const integration = await ctx.db
      .query('externalIntegrations')
      .withIndex('by_public_id', (q) => q.eq('publicId', args.publicId))
      .first();
    if (integration?.deletedAt) return null;
    return integration;
  },
});
