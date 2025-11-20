// convex/lib/boilerplate/integrations/integrations/permissions.ts
// Permission and access control functions for integrations module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';
import { INTEGRATIONS_CONSTANTS } from './constants';

/**
 * Check if user can view API keys
 */
export async function canViewApiKeys(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // Users can always view their own API keys
  return true;
}

/**
 * Check if user can create API keys
 */
export async function canCreateApiKey(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create API keys
  return true;
}

/**
 * Check if user can update/revoke API key
 */
export async function canManageApiKey(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>,
  apiKey: Doc<'apiKeys'>
): Promise<boolean> {
  // User must be the owner
  return apiKey.userId === userId;
}

/**
 * Check if user can view webhooks
 */
export async function canViewWebhooks(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // Users can always view their own webhooks
  return true;
}

/**
 * Check if user can create webhooks
 */
export async function canCreateWebhook(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create webhooks
  return true;
}

/**
 * Check if user can manage webhook
 */
export async function canManageWebhook(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>,
  webhook: Doc<'webhooks'>
): Promise<boolean> {
  // User must be the owner
  return webhook.userId === userId;
}

/**
 * Check if user can view OAuth apps
 */
export async function canViewOAuthApps(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // Users can always view their own OAuth apps
  return true;
}

/**
 * Check if user can create OAuth apps
 */
export async function canCreateOAuthApp(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create OAuth apps
  return true;
}

/**
 * Check if user can manage OAuth app
 */
export async function canManageOAuthApp(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>,
  oauthApp: Doc<'oauthApps'>
): Promise<boolean> {
  // User must be the owner
  return oauthApp.userId === userId;
}

/**
 * Check if user can view external integrations
 */
export async function canViewIntegrations(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // Users can always view their own integrations
  return true;
}

/**
 * Check if user can create external integrations
 */
export async function canCreateIntegration(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create integrations
  return true;
}

/**
 * Check if user can manage external integration
 */
export async function canManageIntegration(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'userProfiles'>,
  integration: Doc<'externalIntegrations'>
): Promise<boolean> {
  // User must be the owner
  return integration.userId === userId;
}

/**
 * Filter API keys by access control
 */
export function filterApiKeysByAccess(
  apiKeys: Doc<'apiKeys'>[],
  userId: Id<'userProfiles'>
): Doc<'apiKeys'>[] {
  return apiKeys.filter((key) => key.userId === userId);
}

/**
 * Filter webhooks by access control
 */
export function filterWebhooksByAccess(
  webhooks: Doc<'webhooks'>[],
  userId: Id<'userProfiles'>
): Doc<'webhooks'>[] {
  return webhooks.filter((webhook) => webhook.userId === userId);
}

/**
 * Filter OAuth apps by access control
 */
export function filterOAuthAppsByAccess(
  oauthApps: Doc<'oauthApps'>[],
  userId: Id<'userProfiles'>
): Doc<'oauthApps'>[] {
  return oauthApps.filter((app) => app.userId === userId);
}

/**
 * Filter integrations by access control
 */
export function filterIntegrationsByAccess(
  integrations: Doc<'externalIntegrations'>[],
  userId: Id<'userProfiles'>
): Doc<'externalIntegrations'>[] {
  return integrations.filter((integration) => integration.userId === userId);
}
