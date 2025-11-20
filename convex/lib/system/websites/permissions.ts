// convex/lib/boilerplate/websites/permissions.ts

import { QueryCtx, MutationCtx } from '@/generated/server'
import { Doc, Id } from '@/generated/dataModel'
import { WEBSITE_CONSTANTS } from './constants'
import { UserProfile } from '../user_profiles'
import { throwPermissionError, throwAccessError } from '@/shared/errors'

/**
 * Check if user can view a website
 */
export async function canViewWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  // Owner can view their websites
  if (website.ownerId === user._id) {
    return true
  }

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
    .first()

  if (collaboration) {
    return true
  }

  // Public websites visible to all authenticated users
  if (website.visibility === WEBSITE_CONSTANTS.VISIBILITY.PUBLIC) {
    return true
  }

  return false
}

/**
 * Check if user can edit a website
 */
export async function canEditWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  // Owner can edit
  if (website.ownerId === user._id) {
    return true
  }

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
    .first()

  if (collaboration) {
    // Owners and admins can always edit
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true
    }

    // Editors can edit pages but not website settings
    if (collaboration.role === 'editor' && collaboration.permissions?.canEditPages) {
      return true
    }
  }

  // Check explicit edit permission
  if (
    user.permissions.includes(WEBSITE_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true
  }

  return false
}

/**
 * Check if user can publish a website or page
 */
export async function canPublishWebsite(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<boolean> {
  // Admins can publish everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  // Owner can publish
  if (website.ownerId === user._id) {
    return true
  }

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
    .first()

  if (collaboration) {
    // Owners and admins can always publish
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true
    }

    // Editors can publish if they have permission
    if (collaboration.role === 'editor' && collaboration.permissions?.canPublish) {
      return true
    }
  }

  // Check explicit publish permission
  if (
    user.permissions.includes(WEBSITE_CONSTANTS.PERMISSIONS.PUBLISH) ||
    user.permissions.includes('*')
  ) {
    return true
  }

  return false
}

/**
 * Check if user can delete a website
 */
export function canDeleteWebsite(
  website: Doc<'websites'>,
  user: UserProfile
): boolean {
  // Only admins and owners
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  if (website.ownerId === user._id) {
    return true
  }

  // Explicit delete permission
  if (
    user.permissions.includes(WEBSITE_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true
  }

  return false
}

/**
 * Check if user can manage collaborators
 */
export async function canManageCollaborators(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  if (website.ownerId === user._id) {
    return true
  }

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
    .first()

  if (collaboration) {
    // Owners and admins can manage collaborators
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true
    }

    // Check explicit permission
    if (collaboration.permissions?.canManageCollaborators) {
      return true
    }
  }

  if (
    user.permissions.includes(WEBSITE_CONSTANTS.PERMISSIONS.MANAGE_COLLABORATORS) ||
    user.permissions.includes('*')
  ) {
    return true
  }

  return false
}

/**
 * Check if user can edit theme
 */
export async function canEditTheme(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true
  }

  if (website.ownerId === user._id) {
    return true
  }

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
    .first()

  if (collaboration) {
    if (collaboration.role === 'owner' || collaboration.role === 'admin') {
      return true
    }

    if (collaboration.permissions?.canEditTheme) {
      return true
    }
  }

  if (
    user.permissions.includes(WEBSITE_CONSTANTS.PERMISSIONS.MANAGE_THEME) ||
    user.permissions.includes('*')
  ) {
    return true
  }

  return false
}

/**
 * Require view access or throw error
 */
export async function requireViewAccess(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canViewWebsite(ctx, website, user)
  if (!hasAccess) {
    throwAccessError(`You don't have permission to view this website`, {
      permission: WEBSITE_CONSTANTS.PERMISSIONS.VIEW,
      module: 'Websites',
    })
  }
}

/**
 * Require edit access or throw error
 */
export async function requireEditAccess(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canEditWebsite(ctx, website, user)
  if (!hasAccess) {
    throwPermissionError(WEBSITE_CONSTANTS.PERMISSIONS.EDIT, {
      module: 'Websites',
      action: 'You need edit permission to modify this website',
    })
  }
}

/**
 * Require publish access or throw error
 */
export async function requirePublishAccess(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canPublishWebsite(ctx, website, user)
  if (!hasAccess) {
    throwPermissionError(WEBSITE_CONSTANTS.PERMISSIONS.PUBLISH, {
      module: 'Websites',
      action: 'You need publish permission to publish this website',
    })
  }
}

/**
 * Require delete access or throw error
 */
export function requireDeleteAccess(
  website: Doc<'websites'>,
  user: UserProfile
): void {
  if (!canDeleteWebsite(website, user)) {
    throwPermissionError(WEBSITE_CONSTANTS.PERMISSIONS.DELETE, {
      module: 'Websites',
      action: 'Only website owners and administrators can delete websites',
    })
  }
}

/**
 * Require collaborator management access or throw error
 */
export async function requireCollaboratorManagementAccess(
  ctx: QueryCtx | MutationCtx,
  website: Doc<'websites'>,
  user: UserProfile
): Promise<void> {
  const hasAccess = await canManageCollaborators(ctx, website, user)
  if (!hasAccess) {
    throwPermissionError(WEBSITE_CONSTANTS.PERMISSIONS.MANAGE_COLLABORATORS, {
      module: 'Websites',
      action: 'You need management permission to modify collaborators',
    })
  }
}

/**
 * Filter websites based on user access
 */
export async function filterWebsitesByAccess(
  ctx: QueryCtx | MutationCtx,
  websites: Doc<'websites'>[],
  user: UserProfile
): Promise<Doc<'websites'>[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return websites
  }

  // Filter by access rights
  const accessPromises = websites.map(async (website) => ({
    website,
    hasAccess: await canViewWebsite(ctx, website, user),
  }))

  const accessResults = await Promise.all(accessPromises)
  return accessResults
    .filter((result) => result.hasAccess)
    .map((result) => result.website)
}
