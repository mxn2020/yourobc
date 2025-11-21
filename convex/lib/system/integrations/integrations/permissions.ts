// convex/lib/system/integrations/integrations/permissions.ts
// Access control and authorization logic for integrations module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { ApiKey, Webhook, OAuthApp, ExternalIntegration } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// API Keys - View Access
// ============================================================================

export async function canViewApiKey(
  ctx: QueryCtx | MutationCtx,
  apiKey: ApiKey,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (apiKey.ownerId === user._id) return true;

  // Creator can view
  if (apiKey.createdBy === user._id) return true;

  // User who owns the API key can view
  if (apiKey.userId === user._id) return true;

  return false;
}

export async function requireViewApiKeyAccess(
  ctx: QueryCtx | MutationCtx,
  apiKey: ApiKey,
  user: UserProfile
): Promise<void> {
  if (!(await canViewApiKey(ctx, apiKey, user))) {
    throw new Error('You do not have permission to view this API key');
  }
}

// ============================================================================
// API Keys - Edit Access
// ============================================================================

export async function canEditApiKey(
  ctx: QueryCtx | MutationCtx,
  apiKey: ApiKey,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (apiKey.ownerId === user._id) return true;

  // User who owns the API key can edit
  if (apiKey.userId === user._id) return true;

  return false;
}

export async function requireEditApiKeyAccess(
  ctx: QueryCtx | MutationCtx,
  apiKey: ApiKey,
  user: UserProfile
): Promise<void> {
  if (!(await canEditApiKey(ctx, apiKey, user))) {
    throw new Error('You do not have permission to edit this API key');
  }
}

// ============================================================================
// API Keys - Delete Access
// ============================================================================

export async function canDeleteApiKey(
  apiKey: ApiKey,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (apiKey.ownerId === user._id) return true;
  if (apiKey.userId === user._id) return true;
  return false;
}

export async function requireDeleteApiKeyAccess(
  apiKey: ApiKey,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteApiKey(apiKey, user))) {
    throw new Error('You do not have permission to delete this API key');
  }
}

// ============================================================================
// Webhooks - View Access
// ============================================================================

export async function canViewWebhook(
  ctx: QueryCtx | MutationCtx,
  webhook: Webhook,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (webhook.ownerId === user._id) return true;

  // Creator can view
  if (webhook.createdBy === user._id) return true;

  // User who owns the webhook can view
  if (webhook.userId === user._id) return true;

  return false;
}

export async function requireViewWebhookAccess(
  ctx: QueryCtx | MutationCtx,
  webhook: Webhook,
  user: UserProfile
): Promise<void> {
  if (!(await canViewWebhook(ctx, webhook, user))) {
    throw new Error('You do not have permission to view this webhook');
  }
}

// ============================================================================
// Webhooks - Edit Access
// ============================================================================

export async function canEditWebhook(
  ctx: QueryCtx | MutationCtx,
  webhook: Webhook,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (webhook.ownerId === user._id) return true;

  // User who owns the webhook can edit
  if (webhook.userId === user._id) return true;

  return false;
}

export async function requireEditWebhookAccess(
  ctx: QueryCtx | MutationCtx,
  webhook: Webhook,
  user: UserProfile
): Promise<void> {
  if (!(await canEditWebhook(ctx, webhook, user))) {
    throw new Error('You do not have permission to edit this webhook');
  }
}

// ============================================================================
// Webhooks - Delete Access
// ============================================================================

export async function canDeleteWebhook(
  webhook: Webhook,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (webhook.ownerId === user._id) return true;
  if (webhook.userId === user._id) return true;
  return false;
}

export async function requireDeleteWebhookAccess(
  webhook: Webhook,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteWebhook(webhook, user))) {
    throw new Error('You do not have permission to delete this webhook');
  }
}

// ============================================================================
// OAuth Apps - View Access
// ============================================================================

export async function canViewOAuthApp(
  ctx: QueryCtx | MutationCtx,
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (oauthApp.ownerId === user._id) return true;

  // Creator can view
  if (oauthApp.createdBy === user._id) return true;

  // User who owns the OAuth app can view
  if (oauthApp.userId === user._id) return true;

  return false;
}

export async function requireViewOAuthAppAccess(
  ctx: QueryCtx | MutationCtx,
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<void> {
  if (!(await canViewOAuthApp(ctx, oauthApp, user))) {
    throw new Error('You do not have permission to view this OAuth app');
  }
}

// ============================================================================
// OAuth Apps - Edit Access
// ============================================================================

export async function canEditOAuthApp(
  ctx: QueryCtx | MutationCtx,
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (oauthApp.ownerId === user._id) return true;

  // User who owns the OAuth app can edit
  if (oauthApp.userId === user._id) return true;

  return false;
}

export async function requireEditOAuthAppAccess(
  ctx: QueryCtx | MutationCtx,
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<void> {
  if (!(await canEditOAuthApp(ctx, oauthApp, user))) {
    throw new Error('You do not have permission to edit this OAuth app');
  }
}

// ============================================================================
// OAuth Apps - Delete Access
// ============================================================================

export async function canDeleteOAuthApp(
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (oauthApp.ownerId === user._id) return true;
  if (oauthApp.userId === user._id) return true;
  return false;
}

export async function requireDeleteOAuthAppAccess(
  oauthApp: OAuthApp,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteOAuthApp(oauthApp, user))) {
    throw new Error('You do not have permission to delete this OAuth app');
  }
}

// ============================================================================
// External Integrations - View Access
// ============================================================================

export async function canViewExternalIntegration(
  ctx: QueryCtx | MutationCtx,
  integration: ExternalIntegration,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (integration.ownerId === user._id) return true;

  // Creator can view
  if (integration.createdBy === user._id) return true;

  // User who owns the integration can view
  if (integration.userId === user._id) return true;

  return false;
}

export async function requireViewExternalIntegrationAccess(
  ctx: QueryCtx | MutationCtx,
  integration: ExternalIntegration,
  user: UserProfile
): Promise<void> {
  if (!(await canViewExternalIntegration(ctx, integration, user))) {
    throw new Error('You do not have permission to view this integration');
  }
}

// ============================================================================
// External Integrations - Edit Access
// ============================================================================

export async function canEditExternalIntegration(
  ctx: QueryCtx | MutationCtx,
  integration: ExternalIntegration,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (integration.ownerId === user._id) return true;

  // User who owns the integration can edit
  if (integration.userId === user._id) return true;

  return false;
}

export async function requireEditExternalIntegrationAccess(
  ctx: QueryCtx | MutationCtx,
  integration: ExternalIntegration,
  user: UserProfile
): Promise<void> {
  if (!(await canEditExternalIntegration(ctx, integration, user))) {
    throw new Error('You do not have permission to edit this integration');
  }
}

// ============================================================================
// External Integrations - Delete Access
// ============================================================================

export async function canDeleteExternalIntegration(
  integration: ExternalIntegration,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (integration.ownerId === user._id) return true;
  if (integration.userId === user._id) return true;
  return false;
}

export async function requireDeleteExternalIntegrationAccess(
  integration: ExternalIntegration,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteExternalIntegration(integration, user))) {
    throw new Error('You do not have permission to delete this integration');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterApiKeysByAccess(
  ctx: QueryCtx | MutationCtx,
  apiKeys: ApiKey[],
  user: UserProfile
): Promise<ApiKey[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return apiKeys;
  }

  const accessible: ApiKey[] = [];

  for (const apiKey of apiKeys) {
    if (await canViewApiKey(ctx, apiKey, user)) {
      accessible.push(apiKey);
    }
  }

  return accessible;
}

export async function filterWebhooksByAccess(
  ctx: QueryCtx | MutationCtx,
  webhooks: Webhook[],
  user: UserProfile
): Promise<Webhook[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return webhooks;
  }

  const accessible: Webhook[] = [];

  for (const webhook of webhooks) {
    if (await canViewWebhook(ctx, webhook, user)) {
      accessible.push(webhook);
    }
  }

  return accessible;
}

export async function filterOAuthAppsByAccess(
  ctx: QueryCtx | MutationCtx,
  oauthApps: OAuthApp[],
  user: UserProfile
): Promise<OAuthApp[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return oauthApps;
  }

  const accessible: OAuthApp[] = [];

  for (const app of oauthApps) {
    if (await canViewOAuthApp(ctx, app, user)) {
      accessible.push(app);
    }
  }

  return accessible;
}

export async function filterExternalIntegrationsByAccess(
  ctx: QueryCtx | MutationCtx,
  integrations: ExternalIntegration[],
  user: UserProfile
): Promise<ExternalIntegration[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return integrations;
  }

  const accessible: ExternalIntegration[] = [];

  for (const integration of integrations) {
    if (await canViewExternalIntegration(ctx, integration, user)) {
      accessible.push(integration);
    }
  }

  return accessible;
}
