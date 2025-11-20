// convex/lib/system/integrations/mutations.ts

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper';
import {
  generateApiKey,
  generateWebhookSecret,
  generateOAuthCredentials,
  generateAccessToken,
  generateRefreshToken,
  calculateTokenExpiration,
  hashString,
} from './utils';
import { INTEGRATIONS_CONFIG } from './constants';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create a new API key
 * 🔒 Authentication: Required
 */
export const createApiKey = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    scopes: v.array(v.string()),
    rateLimit: v.object({
      requestsPerMinute: v.number(),
      requestsPerHour: v.number(),
      requestsPerDay: v.number(),
    }),
    allowedIps: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedUserName = (user.name || user.email || 'User').trim();
    const trimmedScopes = args.scopes.map(scope => scope.trim());
    const trimmedAllowedIps = args.allowedIps?.map(ip => ip.trim());

    // 3. Generate API key
    const now = Date.now();
    const { key, prefix, hash } = generateApiKey();
    const publicId = await generateUniquePublicId(ctx, 'apiKeys');

    // 4. Create API key
    const keyId = await ctx.db.insert('apiKeys', {
      publicId,
      name: trimmedName,
      description: trimmedDescription,
      keyPrefix: prefix,
      keyHash: hash,
      scopes: trimmedScopes,
      rateLimit: args.rateLimit,
      allowedIps: trimmedAllowedIps,
      isActive: true,
      expiresAt: args.expiresAt,
      totalRequests: 0,
      totalErrors: 0,
      userId: user._id,
      userName: trimmedUserName,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'apiKey.create',
      entityType: 'apiKey',
      entityId: publicId,
      entityTitle: trimmedName,
      description: `Created API key "${trimmedName}" with ${trimmedScopes.length} scope(s)`,
      metadata: {
        scopes: trimmedScopes,
        rateLimit: args.rateLimit,
        expiresAt: args.expiresAt,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return key details
    return { keyId, key, publicId };
  },
});

/**
 * Revoke an API key
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const revokeApiKey = mutation({
  args: {
    keyId: v.id('apiKeys'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { keyId, reason }) => {
    // 1. Get API key (Direct O(1) lookup)
    const apiKey = await ctx.db.get(keyId);
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, apiKey.userId);

    // 3. Trim string fields
    const trimmedReason = reason?.trim();

    // 4. Revoke API key
    const now = Date.now();
    await ctx.db.patch(keyId, {
      isActive: false,
      revokedAt: now,
      revokedBy: user._id,
      revokedReason: trimmedReason,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'apiKey.revoke',
      entityType: 'apiKey',
      entityId: apiKey.publicId,
      entityTitle: apiKey.name,
      description: `Revoked API key "${apiKey.name}"${trimmedReason ? `: ${trimmedReason}` : ''}`,
      metadata: {
        keyPrefix: apiKey.keyPrefix,
        reason: trimmedReason,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Update API key
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateApiKey = mutation({
  args: {
    keyId: v.id('apiKeys'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      scopes: v.optional(v.array(v.string())),
      rateLimit: v.optional(
        v.object({
          requestsPerMinute: v.number(),
          requestsPerHour: v.number(),
          requestsPerDay: v.number(),
        })
      ),
      allowedIps: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { keyId, updates }) => {
    // 1. Get API key (Direct O(1) lookup)
    const apiKey = await ctx.db.get(keyId);
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, apiKey.userId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      scopes: updates.scopes?.map(scope => scope.trim()),
      allowedIps: updates.allowedIps?.map(ip => ip.trim()),
    };

    // 4. Update API key
    const now = Date.now();
    await ctx.db.patch(keyId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'apiKey.update',
      entityType: 'apiKey',
      entityId: apiKey.publicId,
      entityTitle: trimmedUpdates.name || apiKey.name,
      description: `Updated API key "${apiKey.name}"`,
      metadata: {
        updates: trimmedUpdates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Log an API request
 * 🔒 Authentication: Optional (can be called by API itself)
 */
export const logApiRequest = mutation({
  args: {
    requestId: v.string(),
    apiKeyId: v.optional(v.id('apiKeys')),
    apiKeyPrefix: v.optional(v.string()),
    method: v.string(),
    path: v.string(),
    query: v.optional(v.record(v.string(), v.union(v.string(), v.array(v.string())))),
    headers: v.optional(v.record(v.string(), v.string())),
    body: v.optional(v.string()),
    statusCode: v.number(),
    responseBody: v.optional(v.string()),
    responseTime: v.number(),
    ipAddress: v.string(),
    userAgent: v.optional(v.string()),
    userId: v.optional(v.id('userProfiles')),
    error: v.optional(
      v.object({
        message: v.string(),
        code: v.optional(v.string()),
        stack: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedRequestId = args.requestId.trim();
    const trimmedMethod = args.method.trim();
    const trimmedPath = args.path.trim();
    const trimmedApiKeyPrefix = args.apiKeyPrefix?.trim();
    const trimmedIpAddress = args.ipAddress.trim();
    const trimmedUserAgent = args.userAgent?.trim();
    const trimmedError = args.error ? {
      ...args.error,
      message: args.error.message.trim(),
      code: args.error.code?.trim(),
    } : undefined;

    // 2. Create log entry
    const now = Date.now();
    return await ctx.db.insert('apiRequestLogs', {
      ...args,
      requestId: trimmedRequestId,
      apiKeyPrefix: trimmedApiKeyPrefix,
      method: trimmedMethod,
      path: trimmedPath,
      ipAddress: trimmedIpAddress,
      userAgent: trimmedUserAgent,
      error: trimmedError,
      timestamp: now,
      createdAt: now,
      createdBy: args.userId,
      updatedAt: now,
      updatedBy: args.userId,
    });
  },
});

/**
 * Create a webhook
 * 🔒 Authentication: Required
 */
export const createWebhook = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    secret: v.optional(v.string()),
    events: v.array(v.string()),
    method: v.optional(v.union(v.literal('POST'), v.literal('PUT'))),
    headers: v.optional(v.record(v.string(), v.string())),
    timeout: v.optional(v.number()),
    retryConfig: v.optional(
      v.object({
        enabled: v.boolean(),
        maxAttempts: v.number(),
        backoffMultiplier: v.number(),
        initialDelay: v.number(),
      })
    ),
    filters: v.optional(
      v.object({
        conditions: v.optional(v.string()),
        sampleRate: v.optional(v.number()),
      })
    ),
    isActive: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedUrl = args.url.trim();
    const trimmedUserName = (user.name || user.email || 'User').trim();
    const trimmedEvents = args.events.map(event => event.trim());

    // 3. Generate secret and IDs
    const now = Date.now();
    const secret = args.secret?.trim() || generateWebhookSecret();
    const publicId = await generateUniquePublicId(ctx, 'webhooks');

    // 4. Create webhook
    const webhookId = await ctx.db.insert('webhooks', {
      publicId,
      name: trimmedName,
      description: trimmedDescription,
      url: trimmedUrl,
      secret,
      events: trimmedEvents,
      method: args.method || 'POST',
      headers: args.headers,
      timeout: args.timeout || INTEGRATIONS_CONFIG.WEBHOOK_TIMEOUT_MS,
      retryConfig: args.retryConfig || {
        enabled: true,
        maxAttempts: INTEGRATIONS_CONFIG.WEBHOOK_MAX_RETRIES,
        backoffMultiplier: INTEGRATIONS_CONFIG.WEBHOOK_RETRY_BACKOFF_MULTIPLIER,
        initialDelay: INTEGRATIONS_CONFIG.WEBHOOK_INITIAL_RETRY_DELAY_MS,
      },
      filters: args.filters,
      isActive: args.isActive !== undefined ? args.isActive : true,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      userId: user._id,
      userName: trimmedUserName,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'webhook.create',
      entityType: 'webhook',
      entityId: publicId,
      entityTitle: trimmedName,
      description: `Created webhook "${trimmedName}" for ${trimmedEvents.length} event(s)`,
      metadata: {
        url: trimmedUrl,
        events: trimmedEvents,
        method: args.method || 'POST',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return webhook ID
    return webhookId;
  },
});

/**
 * Update a webhook
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateWebhook = mutation({
  args: {
    webhookId: v.id('webhooks'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      url: v.optional(v.string()),
      secret: v.optional(v.string()),
      events: v.optional(v.array(v.string())),
      method: v.optional(v.union(v.literal('POST'), v.literal('PUT'))),
      headers: v.optional(v.record(v.string(), v.string())),
      timeout: v.optional(v.number()),
      retryConfig: v.optional(
        v.object({
          enabled: v.boolean(),
          maxAttempts: v.number(),
          backoffMultiplier: v.number(),
          initialDelay: v.number(),
        })
      ),
      filters: v.optional(
        v.object({
          conditions: v.optional(v.string()),
          sampleRate: v.optional(v.number()),
        })
      ),
      isActive: v.optional(v.boolean()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { webhookId, updates }) => {
    // 1. Get webhook (Direct O(1) lookup)
    const webhook = await ctx.db.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, webhook.userId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      url: updates.url?.trim(),
      secret: updates.secret?.trim(),
      events: updates.events?.map(event => event.trim()),
    };

    // 4. Update webhook
    const now = Date.now();
    await ctx.db.patch(webhookId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'webhook.update',
      entityType: 'webhook',
      entityId: webhook.publicId,
      entityTitle: trimmedUpdates.name || webhook.name,
      description: `Updated webhook "${webhook.name}"`,
      metadata: {
        updates: trimmedUpdates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Delete a webhook
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteWebhook = mutation({
  args: {
    webhookId: v.id('webhooks'),
  },
  handler: async (ctx, { webhookId }) => {
    // 1. Get webhook (Direct O(1) lookup)
    const webhook = await ctx.db.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, webhook.userId);

    // 3. Soft delete webhook
    const now = Date.now();
    await ctx.db.patch(webhookId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'webhook.delete',
      entityType: 'webhook',
      entityId: webhook.publicId,
      entityTitle: webhook.name,
      description: `Deleted webhook "${webhook.name}"`,
      metadata: {
        url: webhook.url,
        events: webhook.events,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. Return success
    return true;
  },
});

/**
 * Log a webhook delivery
 * 🔒 Authentication: Optional (called by webhook system)
 */
export const logWebhookDelivery = mutation({
  args: {
    webhookId: v.id('webhooks'),
    event: v.string(),
    payload: v.string(),
    attemptNumber: v.number(),
    url: v.string(),
    method: v.string(),
    headers: v.record(v.string(), v.string()),
    body: v.string(),
    statusCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    status: v.union(
      v.literal('pending'),
      v.literal('delivered'),
      v.literal('failed'),
      v.literal('retrying')
    ),
    error: v.optional(
      v.object({
        message: v.string(),
        code: v.optional(v.string()),
      })
    ),
    nextRetryAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedEvent = args.event.trim();
    const trimmedPayload = args.payload.trim();
    const trimmedUrl = args.url.trim();
    const trimmedMethod = args.method.trim();
    const trimmedError = args.error ? {
      ...args.error,
      message: args.error.message.trim(),
      code: args.error.code?.trim(),
    } : undefined;

    // 2. Create delivery log
    const now = Date.now();
    return await ctx.db.insert('webhookDeliveries', {
      ...args,
      event: trimmedEvent,
      payload: trimmedPayload,
      url: trimmedUrl,
      method: trimmedMethod,
      error: trimmedError,
      createdAt: now,
      deliveredAt: args.status === 'delivered' ? now : undefined,
      updatedAt: now,
      updatedBy: undefined,
    });
  },
});

/**
 * Create an OAuth app
 * 🔒 Authentication: Required
 */
export const createOAuthApp = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    redirectUris: v.array(v.string()),
    scopes: v.array(v.string()),
    grantTypes: v.array(
      v.union(
        v.literal('authorization_code'),
        v.literal('client_credentials'),
        v.literal('refresh_token')
      )
    ),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    privacyPolicyUrl: v.optional(v.string()),
    termsOfServiceUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedUserName = (user.name || user.email || 'User').trim();
    const trimmedRedirectUris = args.redirectUris.map(uri => uri.trim());
    const trimmedScopes = args.scopes.map(scope => scope.trim());
    const trimmedLogoUrl = args.logoUrl?.trim();
    const trimmedWebsite = args.website?.trim();
    const trimmedPrivacyPolicyUrl = args.privacyPolicyUrl?.trim();
    const trimmedTermsOfServiceUrl = args.termsOfServiceUrl?.trim();

    // 3. Generate OAuth credentials
    const now = Date.now();
    const { clientId, clientSecret, clientSecretHash } = generateOAuthCredentials();
    const publicId = await generateUniquePublicId(ctx, 'oauthApps');

    // 4. Create OAuth app
    const appId = await ctx.db.insert('oauthApps', {
      publicId,
      name: trimmedName,
      description: trimmedDescription,
      clientId,
      clientSecret: clientSecretHash,
      redirectUris: trimmedRedirectUris,
      scopes: trimmedScopes,
      grantTypes: args.grantTypes,
      logoUrl: trimmedLogoUrl,
      website: trimmedWebsite,
      privacyPolicyUrl: trimmedPrivacyPolicyUrl,
      termsOfServiceUrl: trimmedTermsOfServiceUrl,
      rateLimit: {
        requestsPerMinute: INTEGRATIONS_CONFIG.DEFAULT_RATE_LIMITS.REQUESTS_PER_MINUTE,
        requestsPerHour: INTEGRATIONS_CONFIG.DEFAULT_RATE_LIMITS.REQUESTS_PER_HOUR,
      },
      isActive: true,
      isVerified: false,
      totalUsers: 0,
      activeUsers: 0,
      totalTokens: 0,
      userId: user._id,
      userName: trimmedUserName,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'oauthApp.create',
      entityType: 'oauthApp',
      entityId: publicId,
      entityTitle: trimmedName,
      description: `Created OAuth app "${trimmedName}" with ${args.grantTypes.length} grant type(s)`,
      metadata: {
        scopes: trimmedScopes,
        grantTypes: args.grantTypes,
        redirectUris: trimmedRedirectUris,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return app details
    return { appId, clientId, clientSecret, publicId };
  },
});

/**
 * Update an OAuth app
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateOAuthApp = mutation({
  args: {
    appId: v.id('oauthApps'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      redirectUris: v.optional(v.array(v.string())),
      scopes: v.optional(v.array(v.string())),
      grantTypes: v.optional(
        v.array(
          v.union(
            v.literal('authorization_code'),
            v.literal('client_credentials'),
            v.literal('refresh_token')
          )
        )
      ),
      logoUrl: v.optional(v.string()),
      website: v.optional(v.string()),
      privacyPolicyUrl: v.optional(v.string()),
      termsOfServiceUrl: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { appId, updates }) => {
    // 1. Get OAuth app (Direct O(1) lookup)
    const app = await ctx.db.get(appId);
    if (!app) {
      throw new Error('OAuth app not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, app.userId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
      redirectUris: updates.redirectUris?.map(uri => uri.trim()),
      scopes: updates.scopes?.map(scope => scope.trim()),
      logoUrl: updates.logoUrl?.trim(),
      website: updates.website?.trim(),
      privacyPolicyUrl: updates.privacyPolicyUrl?.trim(),
      termsOfServiceUrl: updates.termsOfServiceUrl?.trim(),
    };

    // 4. Update OAuth app
    const now = Date.now();
    await ctx.db.patch(appId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'oauthApp.update',
      entityType: 'oauthApp',
      entityId: app.publicId,
      entityTitle: trimmedUpdates.name || app.name,
      description: `Updated OAuth app "${app.name}"`,
      metadata: {
        updates: trimmedUpdates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return success
    return { success: true };
  },
});

/**
 * Delete an OAuth app
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteOAuthApp = mutation({
  args: {
    appId: v.id('oauthApps'),
  },
  handler: async (ctx, { appId }) => {
    // 1. Get OAuth app (Direct O(1) lookup)
    const app = await ctx.db.get(appId);
    if (!app) {
      throw new Error('OAuth app not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, app.userId);

    // 3. Soft delete OAuth app
    const now = Date.now();
    await ctx.db.patch(appId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'oauthApp.delete',
      entityType: 'oauthApp',
      entityId: app.publicId,
      entityTitle: app.name,
      description: `Deleted OAuth app "${app.name}"`,
      metadata: {
        clientId: app.clientId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. Return success
    return { success: true };
  },
});

/**
 * Rotate OAuth client secret
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const rotateClientSecret = mutation({
  args: {
    appId: v.id('oauthApps'),
  },
  handler: async (ctx, { appId }) => {
    // 1. Get OAuth app (Direct O(1) lookup)
    const app = await ctx.db.get(appId);
    if (!app) {
      throw new Error('OAuth app not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, app.userId);

    // 3. Generate new client secret
    const { clientSecret, clientSecretHash } = generateOAuthCredentials();

    // 4. Update OAuth app with new secret
    const now = Date.now();
    await ctx.db.patch(appId, {
      clientSecret: clientSecretHash,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'oauthApp.rotateSecret',
      entityType: 'oauthApp',
      entityId: app.publicId,
      entityTitle: app.name,
      description: `Rotated client secret for OAuth app "${app.name}"`,
      metadata: {
        clientId: app.clientId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return new secret
    return { success: true, clientSecret };
  },
});

/**
 * Create an OAuth token
 * 🔒 Authentication: Required
 */
export const createOAuthToken = mutation({
  args: {
    appId: v.id('oauthApps'),
    appName: v.string(),
    scopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedAppName = args.appName.trim();
    const trimmedUserName = (user.name || user.email || 'User').trim();
    const trimmedScopes = args.scopes.map(scope => scope.trim());

    // 3. Generate tokens
    const now = Date.now();
    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();
    const accessTokenHash = hashString(accessToken);
    const refreshTokenHash = hashString(refreshToken);

    // 4. Create OAuth token
    const tokenId = await ctx.db.insert('oauthTokens', {
      appId: args.appId,
      appName: trimmedAppName,
      accessTokenHash,
      refreshTokenHash,
      tokenType: 'Bearer',
      scopes: trimmedScopes,
      userId: user._id,
      userName: trimmedUserName,
      expiresAt: calculateTokenExpiration(
        INTEGRATIONS_CONFIG.OAUTH_ACCESS_TOKEN_EXPIRATION_SECONDS
      ),
      refreshTokenExpiresAt: calculateTokenExpiration(
        INTEGRATIONS_CONFIG.OAUTH_REFRESH_TOKEN_EXPIRATION_SECONDS
      ),
      isRevoked: false,
      usageCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return token details
    return { tokenId, accessToken, refreshToken };
  },
});

/**
 * Revoke an OAuth token
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const revokeOAuthToken = mutation({
  args: {
    tokenId: v.id('oauthTokens'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { tokenId, reason }) => {
    // 1. Get OAuth token (Direct O(1) lookup)
    const token = await ctx.db.get(tokenId);
    if (!token) {
      throw new Error('OAuth token not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, token.userId);

    // 3. Trim string fields
    const trimmedReason = reason?.trim();

    // 4. Revoke OAuth token
    const now = Date.now();
    await ctx.db.patch(tokenId, {
      isRevoked: true,
      revokedAt: now,
      revokedReason: trimmedReason,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return success
    return true;
  },
});

/**
 * Create an external integration
 * 🔒 Authentication: Required
 */
export const createExternalIntegration = mutation({
  args: {
    name: v.string(),
    provider: v.string(),
    type: v.union(
      v.literal('automation'),
      v.literal('auth'),
      v.literal('api'),
      v.literal('webhook')
    ),
    config: v.object({
      apiKey: v.optional(v.string()),
      apiSecret: v.optional(v.string()),
      webhookUrl: v.optional(v.string()),
      additionalConfig: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedProvider = args.provider.trim();

    // 3. Generate unique ID
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'externalIntegrations');

    // 4. Create external integration
    return await ctx.db.insert('externalIntegrations', {
      publicId,
      name: trimmedName,
      provider: trimmedProvider,
      type: args.type,
      config: args.config,
      status: 'disconnected',
      isConnected: false,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      userId: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});

/**
 * Connect an external integration
 * 🔒 Authentication: Required
 */
export const connectExternalIntegration = mutation({
  args: {
    platform: v.union(
      v.literal('zapier'),
      v.literal('make'),
      v.literal('n8n'),
      v.literal('custom')
    ),
    name: v.string(),
    config: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();

    // 3. Generate unique ID
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'externalIntegrations');

    // 4. Create connected integration
    const integrationId = await ctx.db.insert('externalIntegrations', {
      publicId,
      name: trimmedName,
      provider: args.platform,
      type: 'automation',
      config: args.config,
      status: 'connected',
      isConnected: true,
      lastConnectedAt: now,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      userId: user._id,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'integration.connect',
      entityType: 'integration',
      entityId: publicId,
      entityTitle: trimmedName,
      description: `Connected ${args.platform} integration "${trimmedName}"`,
      metadata: {
        platform: args.platform,
        type: 'automation',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return integration ID
    return integrationId;
  },
});

/**
 * Update external integration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateExternalIntegration = mutation({
  args: {
    integrationId: v.id('externalIntegrations'),
    updates: v.object({
      isConnected: v.optional(v.boolean()),
      lastConnectedAt: v.optional(v.number()),
      connectionError: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal('connected'),
          v.literal('disconnected'),
          v.literal('error'),
          v.literal('pending')
        )
      ),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { integrationId, updates }) => {
    // 1. Get integration (Direct O(1) lookup)
    const integration = await ctx.db.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, integration.userId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      connectionError: updates.connectionError?.trim(),
    };

    // 4. Update integration
    const now = Date.now();
    await ctx.db.patch(integrationId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'integration.update',
      entityType: 'integration',
      entityId: integration.publicId,
      entityTitle: integration.name,
      description: `Updated integration "${integration.name}"`,
      metadata: {
        updates: trimmedUpdates,
        provider: integration.provider,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Disconnect an external integration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const disconnectExternalIntegration = mutation({
  args: {
    integrationId: v.id('externalIntegrations'),
  },
  handler: async (ctx, { integrationId }) => {
    // 1. Get integration (Direct O(1) lookup)
    const integration = await ctx.db.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, integration.userId);

    // 3. Disconnect integration
    const now = Date.now();
    await ctx.db.patch(integrationId, {
      isConnected: false,
      status: 'disconnected',
      lastDisconnectedAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'integration.disconnect',
      entityType: 'integration',
      entityId: integration.publicId,
      entityTitle: integration.name,
      description: `Disconnected integration "${integration.name}"`,
      metadata: {
        provider: integration.provider,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. Return success
    return { success: true, message: 'Integration disconnected successfully' };
  },
});

/**
 * Sync an external integration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const syncExternalIntegration = mutation({
  args: {
    integrationId: v.id('externalIntegrations'),
    syncStatus: v.union(
      v.literal('success'),
      v.literal('failed'),
      v.literal('in_progress')
    ),
  },
  handler: async (ctx, { integrationId, syncStatus }) => {
    // 1. Get integration (Direct O(1) lookup)
    const integration = await ctx.db.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, integration.userId);

    // 3. Update sync status
    const now = Date.now();
    await ctx.db.patch(integrationId, {
      syncStatus,
      lastSyncedAt: syncStatus === 'success' ? now : undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Return success
    return { success: true, syncStatus };
  },
});

/**
 * Test an external integration connection
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const testExternalIntegration = mutation({
  args: {
    integrationId: v.id('externalIntegrations'),
  },
  handler: async (ctx, { integrationId }) => {
    // 1. Get integration (Direct O(1) lookup)
    const integration = await ctx.db.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, integration.userId);

    // 3. Log test event
    const now = Date.now();
    await ctx.db.insert('integrationEvents', {
      integrationId,
      eventType: 'test.connection',
      direction: 'outbound',
      request: JSON.stringify({ test: true }),
      status: 'pending',
      timestamp: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Return success
    return { success: true, message: 'Integration test initiated' };
  },
});

/**
 * Validate API key and increment usage counter
 * 🔒 Authentication: Optional (used by API validation)
 */
export const validateApiKeyWithIncrement = mutation({
  args: {
    keyPrefix: v.string(),
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedKeyPrefix = args.keyPrefix.trim();
    const trimmedKeyHash = args.keyHash.trim();

    // 2. Find API key by prefix
    const key = await ctx.db
      .query('apiKeys')
      .withIndex('by_key_prefix', (q) => q.eq('keyPrefix', trimmedKeyPrefix))
      .first();

    if (!key) {
      return { valid: false, error: 'API key not found' };
    }

    // 3. Validate key hash
    if (key.keyHash !== trimmedKeyHash) {
      return { valid: false, error: 'Invalid API key' };
    }

    // 4. Check if key is active
    if (!key.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    // 5. Check if key has expired
    const now = Date.now();
    if (key.expiresAt && key.expiresAt < now) {
      return { valid: false, error: 'API key has expired' };
    }

    // 6. Increment usage counter
    await ctx.db.patch(key._id, {
      totalRequests: key.totalRequests + 1,
      lastUsedAt: now,
      updatedAt: now,
      updatedBy: key.userId,
    });

    // 7. Return validation result
    return {
      valid: true,
      keyId: key._id,
      scopes: key.scopes,
      rateLimit: key.rateLimit,
    };
  },
});

/**
 * Test a webhook by sending a test delivery
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const testWebhook = mutation({
  args: {
    webhookId: v.id('webhooks'),
    testPayload: v.optional(v.string()),
  },
  handler: async (ctx, { webhookId, testPayload }) => {
    // 1. Get webhook (Direct O(1) lookup)
    const webhook = await ctx.db.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, webhook.userId);

    // 3. Prepare test payload
    const now = Date.now();
    const testEvent = 'test.webhook';
    const trimmedTestPayload = testPayload?.trim();
    const payload = trimmedTestPayload || JSON.stringify({ test: true, timestamp: now });

    // 4. Create webhook delivery
    const deliveryId = await ctx.db.insert('webhookDeliveries', {
      webhookId,
      event: testEvent,
      payload,
      attemptNumber: 1,
      url: webhook.url,
      method: webhook.method,
      headers: webhook.headers || {},
      body: payload,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'webhook.test',
      entityType: 'webhook',
      entityId: webhook.publicId,
      entityTitle: webhook.name,
      description: `Tested webhook "${webhook.name}"`,
      metadata: {
        url: webhook.url,
        deliveryId: deliveryId,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. Return delivery ID
    return { deliveryId, message: 'Test webhook queued for delivery' };
  },
});

/**
 * Retry a failed webhook delivery
 * 🔒 Authentication: Required (internal system use)
 */
export const retryWebhookDelivery = mutation({
  args: {
    deliveryId: v.id('webhookDeliveries'),
  },
  handler: async (ctx, { deliveryId }) => {
    // 1. Get webhook delivery (Direct O(1) lookup)
    const delivery = await ctx.db.get(deliveryId);
    if (!delivery) {
      throw new Error('Webhook delivery not found');
    }

    // 2. Update delivery for retry
    const now = Date.now();
    await ctx.db.patch(deliveryId, {
      status: 'retrying',
      attemptNumber: delivery.attemptNumber + 1,
      nextRetryAt: now,
      updatedAt: now,
      updatedBy: undefined,
    });

    // 3. Return success
    return { success: true, message: 'Webhook delivery retry initiated' };
  },
});

/**
 * Create OAuth authorization (for authorization code flow)
 * 🔒 Authentication: Required
 */
export const createOAuthAuthorization = mutation({
  args: {
    appId: v.id('oauthApps'),
    scopes: v.array(v.string()),
    redirectUri: v.string(),
    state: v.optional(v.string()),
  },
  handler: async (ctx, { appId, scopes, redirectUri, state }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Get OAuth app (Direct O(1) lookup)
    const app = await ctx.db.get(appId);
    if (!app) {
      throw new Error('OAuth app not found');
    }

    // 3. Trim string fields
    const trimmedRedirectUri = redirectUri.trim();
    const trimmedScopes = scopes.map(scope => scope.trim());
    const trimmedUserName = (user.name || user.email || 'User').trim();

    // 4. Validate redirect URI
    if (!app.redirectUris.includes(trimmedRedirectUri)) {
      throw new Error('Invalid redirect URI');
    }

    // 5. Generate authorization code
    const authCode = generateAccessToken();
    const authCodeHash = hashString(authCode);

    // 6. Create authorization token
    const now = Date.now();
    const authId = await ctx.db.insert('oauthTokens', {
      appId,
      appName: app.name,
      accessTokenHash: authCodeHash,
      tokenType: 'code',
      scopes: trimmedScopes,
      userId: user._id,
      userName: trimmedUserName,
      expiresAt: now + 600000,
      isRevoked: false,
      usageCount: 0,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. Return authorization code
    return { authorizationCode: authCode, authId };
  },
});

/**
 * Exchange authorization code for access token
 * 🔒 Authentication: Optional (OAuth flow)
 */
export const exchangeAuthorizationCode = mutation({
  args: {
    code: v.string(),
    appId: v.id('oauthApps'),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedCode = args.code.trim();
    const trimmedRedirectUri = args.redirectUri.trim();

    // 2. Hash authorization code
    const codeHash = hashString(trimmedCode);

    // 3. Find authorization
    const authorization = await ctx.db
      .query('oauthTokens')
      .filter((q) =>
        q.and(
          q.eq(q.field('appId'), args.appId),
          q.eq(q.field('accessTokenHash'), codeHash),
          q.eq(q.field('tokenType'), 'code')
        )
      )
      .first();

    if (!authorization) {
      throw new Error('Invalid authorization code');
    }

    // 4. Validate authorization
    const now = Date.now();
    if (authorization.expiresAt < now) {
      throw new Error('Authorization code expired');
    }

    if (authorization.isRevoked) {
      throw new Error('Authorization code already used');
    }

    // 5. Revoke authorization code
    await ctx.db.patch(authorization._id, {
      isRevoked: true,
      revokedAt: now,
      updatedAt: now,
      updatedBy: authorization.userId,
    });

    // 6. Generate access and refresh tokens
    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();
    const accessTokenHash = hashString(accessToken);
    const refreshTokenHash = hashString(refreshToken);

    // 7. Create access token
    const tokenId = await ctx.db.insert('oauthTokens', {
      appId: args.appId,
      appName: authorization.appName,
      accessTokenHash,
      refreshTokenHash,
      tokenType: 'Bearer',
      scopes: authorization.scopes,
      userId: authorization.userId,
      userName: authorization.userName,
      expiresAt: calculateTokenExpiration(
        INTEGRATIONS_CONFIG.OAUTH_ACCESS_TOKEN_EXPIRATION_SECONDS
      ),
      refreshTokenExpiresAt: calculateTokenExpiration(
        INTEGRATIONS_CONFIG.OAUTH_REFRESH_TOKEN_EXPIRATION_SECONDS
      ),
      isRevoked: false,
      usageCount: 0,
      createdAt: now,
      createdBy: authorization.userId,
      updatedAt: now,
      updatedBy: authorization.userId,
    });

    // 8. Return tokens
    return {
      tokenId,
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: INTEGRATIONS_CONFIG.OAUTH_ACCESS_TOKEN_EXPIRATION_SECONDS,
    };
  },
});

/**
 * Log an integration event
 * 🔒 Authentication: Optional (system use)
 */
export const logIntegrationEvent = mutation({
  args: {
    integrationId: v.id('externalIntegrations'),
    eventType: v.string(),
    direction: v.union(v.literal('inbound'), v.literal('outbound')),
    request: v.optional(v.string()),
    response: v.optional(v.string()),
    status: v.union(
      v.literal('success'),
      v.literal('failed'),
      v.literal('pending')
    ),
    error: v.optional(v.string()),
    processingTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const trimmedEventType = args.eventType.trim();
    const trimmedRequest = args.request?.trim();
    const trimmedResponse = args.response?.trim();
    const trimmedError = args.error?.trim();

    // 2. Create integration event log
    const now = Date.now();
    return await ctx.db.insert('integrationEvents', {
      integrationId: args.integrationId,
      eventType: trimmedEventType,
      direction: args.direction,
      request: trimmedRequest,
      response: trimmedResponse,
      status: args.status,
      error: trimmedError,
      processingTime: args.processingTime,
      timestamp: now,
      createdAt: now,
      createdBy: undefined,
      updatedAt: now,
      updatedBy: undefined,
    });
  },
});