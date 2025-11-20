// convex/lib/boilerplate/websites/websites/permissions.ts
// Access control and authorization logic for websites module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Website } from './types';
import type { Doc } from '@/generated/dataModel';
import { WEBSITES_CONSTANTS } from './constants';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canViewWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view their websites
  if (website.ownerId === user._id) return true;

  // Check if user is a collaborator
  const collaboration = await ctx.db
    .query('websiteCollaborators')
    .withIndex('by_website', (q) => q.eq('websiteId', website._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('collaboratorId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (collaboration) {
    return true;
  }

  // Public websites visible to all authenticated users
  if (website.visibility === WEBSITES_CONSTANTS.VISIBILITY.PUBLIC) {
    return true;
  }

  return false;
}

export async function requireViewWebsiteAccess(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canViewWebsite(ctx, website, user))) {
    throw new Error('You do not have permission to view this website');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEditWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (website.ownerId === user._id) return true;

  // Check if collaborator has edit permission
  const collaboration = await ctx.db
    .query('websiteCollaborators')
    .withIndex('by_website', (q) => q.eq('websiteId', website._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('collaboratorId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (collaboration) {
    // Owners and admins can always edit
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true;
    }

    // Editors can edit if they have permission
    if (collaboration.role === 'editor' && collaboration.permissions?.canEditPages) {
      return true;
    }
  }

  // Check explicit edit permission
  if (
    user.permissions.includes(WEBSITES_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireEditWebsiteAccess(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canEditWebsite(ctx, website, user))) {
    throw new Error('You do not have permission to edit this website');
  }
}

// ============================================================================
// Publish Access
// ============================================================================

export async function canPublishWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<boolean> {
  // Admins can publish everything
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can publish
  if (website.ownerId === user._id) return true;

  // Check if collaborator has publish permission
  const collaboration = await ctx.db
    .query('websiteCollaborators')
    .withIndex('by_website', (q) => q.eq('websiteId', website._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('collaboratorId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (collaboration) {
    // Owners and admins can always publish
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true;
    }

    // Editors can publish if they have permission
    if (collaboration.role === 'editor' && collaboration.permissions?.canPublish) {
      return true;
    }
  }

  // Check explicit publish permission
  if (
    user.permissions.includes(WEBSITES_CONSTANTS.PERMISSIONS.PUBLISH) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requirePublishWebsiteAccess(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canPublishWebsite(ctx, website, user))) {
    throw new Error('You do not have permission to publish this website');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDeleteWebsite(
  website: Website,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (website.ownerId === user._id) return true;

  // Explicit delete permission
  if (
    user.permissions.includes(WEBSITES_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireDeleteWebsiteAccess(
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteWebsite(website, user))) {
    throw new Error('Only website owners and administrators can delete websites');
  }
}

// ============================================================================
// Collaborator Management Access
// ============================================================================

export async function canManageCollaborators(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (website.ownerId === user._id) return true;

  // Check if collaborator has management permission
  const collaboration = await ctx.db
    .query('websiteCollaborators')
    .withIndex('by_website', (q) => q.eq('websiteId', website._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('collaboratorId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (collaboration) {
    // Owners and admins can manage collaborators
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true;
    }

    // Check explicit permission
    if (collaboration.permissions?.canManageCollaborators) {
      return true;
    }
  }

  if (
    user.permissions.includes(WEBSITES_CONSTANTS.PERMISSIONS.MANAGE_COLLABORATORS) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireCollaboratorManagementAccess(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canManageCollaborators(ctx, website, user))) {
    throw new Error('You need management permission to modify collaborators');
  }
}

// ============================================================================
// Theme Edit Access
// ============================================================================

export async function canEditTheme(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (website.ownerId === user._id) return true;

  // Check if collaborator has theme edit permission
  const collaboration = await ctx.db
    .query('websiteCollaborators')
    .withIndex('by_website', (q) => q.eq('websiteId', website._id))
    .filter((q) =>
      q.and(
        q.eq(q.field('collaboratorId'), user._id),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .first();

  if (collaboration) {
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true;
    }

    if (collaboration.permissions?.canEditTheme) {
      return true;
    }
  }

  if (
    user.permissions.includes(WEBSITES_CONSTANTS.PERMISSIONS.MANAGE_THEME) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export async function requireThemeEditAccess(
  ctx: QueryCtx | MutationCtx,
  website: Website,
  user: UserProfile
): Promise<void> {
  if (!(await canEditTheme(ctx, website, user))) {
    throw new Error('You need permission to edit website themes');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterWebsitesByAccess(
  ctx: QueryCtx | MutationCtx,
  websites: Website[],
  user: UserProfile
): Promise<Website[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return websites;
  }

  // Filter by access rights
  const accessPromises = websites.map(async (website) => ({
    website,
    hasAccess: await canViewWebsite(ctx, website, user),
  }));

  const accessResults = await Promise.all(accessPromises);
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.website);
}
