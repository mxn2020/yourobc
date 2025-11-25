// convex/lib/{category}/{entity}/{module}/permissions.ts
// Access control for {module} module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { {Module} } from './types';
import { UserProfile } from '@/schema/system';


/**
 * Check if user is a team member
 * Implement module-specific team membership logic
 *
 * @param ctx - Query or mutation context
 * @param resource - Entity to check
 * @param user - User profile
 * @returns True if user is team member
 */
async function isTeamMember(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // TODO: Implement team membership check
  // Example: Query team members table
  return false;
}

/**
 * Check if user can view the resource
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - Entity is public (if visibility field exists)
 * - User is owner (if ownerId field exists)
 * - User is creator
 * - User is team member (if visibility is 'team')
 *
 * @param ctx - Query or mutation context
 * @param resource - Entity to check
 * @param user - User profile
 * @returns True if user can view
 */
export async function canView{Module}(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // Admins can view everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public resources (remove if no visibility field)
  if ('visibility' in resource && resource.visibility === 'public') {
    return true;
  }

  // Owner can view
  if (resource.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (resource.createdBy === user._id) {
    return true;
  }

  // Team members can view team resources (remove if no visibility field)
  if ('visibility' in resource && resource.visibility === 'team') {
    return await isTeamMember(ctx, resource, user);
  }

  return false;
}

/**
 * Require view access (throws if not allowed)
 * 🔒 Throws error if user cannot view resource
 *
 * @param ctx - Query or mutation context
 * @param resource - Entity to check
 * @param user - User profile
 * @throws Error if access denied
 */
export async function requireView{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canView{Module}(ctx, resource, user))) {
    throw new Error('No permission to view this {module}');
  }
}

/**
 * Check if user can edit the resource
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - User is owner
 * - Entity is not completed/archived
 *
 * @param ctx - Query or mutation context
 * @param resource - Entity to check
 * @param user - User profile
 * @returns True if user can edit
 */
export async function canEdit{Module}(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // Admins can edit everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (resource.ownerId === user._id) {
    return true;
  }

  // Cannot edit completed or archived items
  if (resource.status === 'completed' || resource.status === 'archived') {
    return false;
  }

  return false;
}

/**
 * Require edit access (throws if not allowed)
 * 🔒 Throws error if user cannot edit resource
 *
 * @param ctx - Query or mutation context
 * @param resource - Entity to check
 * @param user - User profile
 * @throws Error if access denied
 */
export async function requireEdit{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canEdit{Module}(ctx, resource, user))) {
    throw new Error('No permission to edit this {module}');
  }
}

/**
 * Check if user can delete the resource
 * 🔒 Access granted if:
 * - User is admin/superadmin
 * - User is owner
 *
 * @param resource - Entity to check
 * @param user - User profile
 * @returns True if user can delete
 */
export async function canDelete{Module}(
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 * 🔒 Throws error if user cannot delete resource
 *
 * @param resource - Entity to check
 * @param user - User profile
 * @throws Error if access denied
 */
export async function requireDelete{Module}Access(
  resource: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canDelete{Module}(resource, user))) {
    throw new Error('No permission to delete this {module}');
  }
}

/**
 * Filter array of resources by access permissions
 * 🔒 Returns only resources user can view
 *
 * @param ctx - Query or mutation context
 * @param resources - Array of entities
 * @param user - User profile
 * @returns Filtered array of accessible entities
 */
export async function filter{Module}sByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: {Module}[],
  user: UserProfile
): Promise<{Module}[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return resources;
  }

  // Filter by permission
  const filtered: {Module}[] = [];
  for (const resource of resources) {
    if (await canView{Module}(ctx, resource, user)) {
      filtered.push(resource);
    }
  }

  return filtered;
}

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating permissions.ts:
 * [ ] Import types from ./types, @/generated/server and dataModel
 * [ ] Implement canView{Module}
 * [ ] Implement canEdit{Module}
 * [ ] Implement canDelete{Module}
 * [ ] Add requireView{Module}Access
 * [ ] Add requireEdit{Module}Access
 * [ ] Add requireDelete{Module}Access
 * [ ] Add filter{Module}sByAccess
 * [ ] Implement isTeamMember if needed
 * [ ] Use 'in' operator for optional fields
 *
 * DO:
 * [ ] Check admin first
 * [ ] Use defensive field checking
 * [ ] Separate can* and require* functions
 * [ ] Make canDelete sync if possible
 * [ ] Filter arrays for bulk operations
 *
 * DON'T:
 * [ ] Assume optional fields exist
 * [ ] Skip admin checks
 * [ ] Allow delete without strict controls
 * [ ] Mix authorization with business logic
 * [ ] Expose sensitive data in errors
 */
