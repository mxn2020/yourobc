# Schema Permissions Template

```markdown
// convex/lib/[category]/[entity]/[module]/permissions.ts

/**
 * ============================================================================
 * PERMISSIONS TEMPLATE
 * ============================================================================
 *
 * This file defines access control logic for your module's entities.
 * Permissions ensure users can only view/edit/delete data they have access to.
 *
 * LOCATION: convex/lib/[category]/[entity]/[module]/permissions.ts
 * OPTIONAL: Only needed for modules with access control requirements
 *
 * ============================================================================
 * WHY PERMISSIONS MATTER
 * ============================================================================
 *
 * WITHOUT permissions (❌ Bad):
 * - Any user can access any data
 * - No privacy or data segregation
 * - Security vulnerabilities
 * - Cannot support multi-tenant scenarios
 *
 * WITH permissions (✅ Good):
 * - Controlled access to sensitive data
 * - Role-based access control (RBAC)
 * - Owner-based access control
 * - Visibility-based access control
 * - Secure multi-tenant architecture
 *
 * ============================================================================
 * PERMISSION PATTERNS
 * ============================================================================
 *
 * This template supports multiple access control patterns:
 *
 * 1. ROLE-BASED ACCESS
 *    - Admins/superadmins can access everything
 *    - Regular users have limited access
 *
 * 2. OWNERSHIP-BASED ACCESS
 *    - Owners can view/edit their own data
 *    - Checked via ownerId field (if exists)
 *
 * 3. CREATOR-BASED ACCESS
 *    - Creators can view/edit what they created
 *    - Checked via createdBy field
 *
 * 4. VISIBILITY-BASED ACCESS
 *    - Public: Anyone can view
 *    - Team: Team members can view
 *    - Private: Only owner/creator can view
 *    - Checked via visibility field (if exists)
 *
 * 5. RELATIONSHIP-BASED ACCESS
 *    - Access inherited from related entities
 *    - Example: Invoice access via project access
 *
 * ============================================================================
 * CRITICAL RULES
 * ============================================================================
 *
 * 1. DEFENSIVE FIELD CHECKING
 *    ✅ Always check if fields exist before using them
 *    ✅ Use 'field' in entity pattern
 *    ❌ Never assume optional fields exist
 *
 *    Example:
 *    if ('ownerId' in entity && entity.ownerId === user._id) return true;
 *
 * 2. CONSISTENT PERMISSION HIERARCHY
 *    ✅ Admins/superadmins always first
 *    ✅ Then visibility checks
 *    ✅ Then ownership checks
 *    ✅ Then creator checks
 *    ✅ Finally relationship checks
 *
 * 3. SEPARATION OF CONCERNS
 *    ✅ canView*: Read permissions
 *    ✅ canEdit*: Write permissions
 *    ✅ canDelete*: Delete permissions
 *    ✅ require*Access: Throws errors if no access
 *    ✅ filter*ByAccess: Filters arrays by access
 *
 * 4. ASYNC CONSISTENCY
 *    ✅ Use async/await for database lookups
 *    ✅ Mark functions as async when needed
 *    ✅ canDelete can be sync if no DB lookups needed
 *
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 * 1. IN QUERIES (Check Access):
 *
 * export const getEntity = query({
 *   args: { id: v.id('tableName') },
 *   handler: async (ctx, { id }) => {
 *     const user = await requireAuth(ctx);
 *     const entity = await ctx.db.get(id);
 *     if (!entity) throw new Error('Not found');
 *     
 *     await requireEntityViewAccess(ctx, entity, user);
 *     return entity;
 *   },
 * });
 *
 * 2. IN MUTATIONS (Require Access):
 *
 * export const updateEntity = mutation({
 *   args: { id: v.id('tableName'), data: v.object({...}) },
 *   handler: async (ctx, { id, data }) => {
 *     const user = await requireAuth(ctx);
 *     const entity = await ctx.db.get(id);
 *     if (!entity) throw new Error('Not found');
 *     
 *     await requireEntityEditAccess(ctx, entity, user);
 *     await ctx.db.patch(id, data);
 *   },
 * });
 *
 * 3. IN LIST QUERIES (Filter Arrays):
 *
 * export const listEntities = query({
 *   handler: async (ctx) => {
 *     const user = await requireAuth(ctx);
 *     const allEntities = await ctx.db.query('tableName').collect();
 *     
 *     return await filterEntitiesByAccess(ctx, allEntities, user);
 *   },
 * });
 *
 * ============================================================================
 * FIELD EXISTENCE PATTERNS
 * ============================================================================
 *
 * Always use defensive checking for optional fields:
 *
 * // Check ownerId (optional field)
 * if ('ownerId' in entity && entity.ownerId === user._id) return true;
 *
 * // Check visibility (optional field)
 * if ('visibility' in entity && entity.visibility === 'public') return true;
 *
 * // Check createdBy (usually required, but be safe)
 * if ('createdBy' in entity && entity.createdBy === user._id) return true;
 *
 * // Check related entities
 * if ('projectId' in entity && entity.projectId) {
 *   const project = await ctx.db.get(entity.projectId);
 *   if (project) {
 *     return await canViewProject(ctx, project, user);
 *   }
 * }
 *
 * ============================================================================
 */

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { [Entity] } from './types';
import type { Doc } from '@/generated/dataModel';


// ============================================================================
// [Entity] Access Control
// ============================================================================

/**
 * Check if user can view an entity
 * 
 * Access granted if:
 * - User is admin/superadmin
 * - Entity has public visibility (if visibility field exists)
 * - User is the owner (if ownerId field exists)
 * - User is the creator
 * - User has access via related entities (customize as needed)
 */
export async function canView[Entity](
  ctx: QueryCtx | MutationCtx,
  entity: [Entity],
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all entities
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public visibility (if field exists)
  if ('visibility' in entity && entity.visibility === 'public') return true;

  // Owner can view (if field exists)
  if ('ownerId' in entity && entity.ownerId === user._id) return true;

  // Creator can view (if field exists)
  if ('createdBy' in entity && entity.createdBy === user._id) return true;

  // Add relationship-based access checks here
  // Example: Check access via parent entity
  // if ('parentId' in entity && entity.parentId) {
  //   const parent = await ctx.db.get(entity.parentId);
  //   if (parent) {
  //     return await canViewParent(ctx, parent, user);
  //   }
  // }

  return false;
}

/**
 * Check if user can edit an entity
 * 
 * Access granted if:
 * - User is admin/superadmin
 * - User is the owner (if ownerId field exists)
 * - User is the creator (customize based on your needs)
 */
export async function canEdit[Entity](
  ctx: QueryCtx | MutationCtx,
  entity: [Entity],
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all entities
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit (if field exists)
  if ('ownerId' in entity && entity.ownerId === user._id) return true;

  // Optionally allow creator to edit
  // if ('createdBy' in entity && entity.createdBy === user._id) return true;

  return false;
}

/**
 * Check if user can delete an entity
 * 
 * Access granted if:
 * - User is admin/superadmin
 * - User is the owner (if ownerId field exists)
 * 
 * Note: This is sync because it doesn't need database lookups
 * Make it async if you need to check related entities
 */
export function canDelete[Entity](
  entity: [Entity],
  user: UserProfile
): boolean {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  
  // Owner can delete (if field exists)
  if ('ownerId' in entity && entity.ownerId === user._id) return true;
  
  return false;
}

// ============================================================================
// Require Access (Throw Errors)
// ============================================================================

/**
 * Require view access or throw error
 * Use in queries and mutations that need to verify access
 */
export async function require[Entity]ViewAccess(
  ctx: QueryCtx | MutationCtx,
  entity: [Entity],
  user: UserProfile
): Promise<void> {
  if (!(await canView[Entity](ctx, entity, user))) {
    throw new Error('You do not have permission to view this [entity]');
  }
}

/**
 * Require edit access or throw error
 * Use in mutations that modify entities
 */
export async function require[Entity]EditAccess(
  ctx: QueryCtx | MutationCtx,
  entity: [Entity],
  user: UserProfile
): Promise<void> {
  if (!(await canEdit[Entity](ctx, entity, user))) {
    throw new Error('You do not have permission to edit this [entity]');
  }
}

/**
 * Require delete access or throw error
 * Use in delete mutations
 */
export function require[Entity]DeleteAccess(
  entity: [Entity],
  user: UserProfile
): void {
  if (!canDelete[Entity](entity, user)) {
    throw new Error('You do not have permission to delete this [entity]');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

/**
 * Filter an array of entities to only those the user can view
 * Use in list queries to return only accessible entities
 * 
 * @param ctx - Query or mutation context
 * @param entities - Array of entities to filter
 * @param user - User profile
 * @returns Filtered array containing only accessible entities
 */
export async function filter[Entity]ByAccess(
  ctx: QueryCtx | MutationCtx,
  entities: [Entity][],
  user: UserProfile
): Promise<[Entity][]> {
  const accessible: [Entity][] = [];

  for (const entity of entities) {
    if (await canView[Entity](ctx, entity, user)) {
      accessible.push(entity);
    }
  }

  return accessible;
}

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

/**
 * When implementing permissions for a module:
 * 
 * [ ] 1. Create permissions.ts file
 * [ ] 2. Import entity types from types.ts
 * [ ] 3. Implement canView[Entity] with all access patterns
 * [ ] 4. Implement canEdit[Entity] with appropriate restrictions
 * [ ] 5. Implement canDelete[Entity] with strict controls
 * [ ] 6. Add require*Access functions for error throwing
 * [ ] 7. Add filter*ByAccess for bulk filtering
 * [ ] 8. Use 'in' operator for all optional fields
 * [ ] 9. Import permissions in queries.ts
 * [ ] 10. Import permissions in mutations.ts
 * [ ] 11. Test with different user roles
 * [ ] 12. Test with users without access
 * [ ] 13. Test bulk filtering
 * [ ] 14. Document any custom access patterns
 * 
 * Common mistakes to avoid:
 * [ ] DON'T assume optional fields exist
 * [ ] DON'T skip admin/superadmin checks
 * [ ] DON'T allow delete without strict controls
 * [ ] DON'T forget to use require*Access in mutations
 * [ ] DON'T expose sensitive data in error messages
 * [ ] DON'T make canDelete async unless necessary
 * 
 * Optional enhancements:
 * [ ] Add team-based access control
 * [ ] Add organization-based access control
 * [ ] Add sharing/collaboration features
 * [ ] Add time-based access (e.g., expires after date)
 * [ ] Add audit logging for access checks
 */

// ============================================================================
// CUSTOMIZATION EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Team-based access
 * 
 * if ('teamId' in entity && entity.teamId) {
 *   const teamMember = await ctx.db
 *     .query('teamMembers')
 *     .withIndex('by_team_and_user', (q) => 
 *       q.eq('teamId', entity.teamId).eq('userId', user._id)
 *     )
 *     .first();
 *   if (teamMember) return true;
 * }
 */

/**
 * EXAMPLE 2: Hierarchical access (via parent)
 * 
 * if ('parentId' in entity && entity.parentId) {
 *   const parent = await ctx.db.get(entity.parentId);
 *   if (parent && await canViewParent(ctx, parent, user)) {
 *     return true;
 *   }
 * }
 */

/**
 * EXAMPLE 3: Shared access
 * 
 * if ('sharedWith' in entity && Array.isArray(entity.sharedWith)) {
 *   if (entity.sharedWith.includes(user._id)) return true;
 * }
 */

/**
 * EXAMPLE 4: Organization-based access
 * 
 * if ('organizationId' in entity && entity.organizationId === user.organizationId) {
 *   return true;
 * }
 */

/**
 * EXAMPLE 5: Time-based access
 * 
 * if ('expiresAt' in entity && entity.expiresAt) {
 *   if (Date.now() > entity.expiresAt) return false;
 * }
 */
```

This template provides:

1. **Defensive field checking** - Always uses `'field' in entity` pattern
2. **Flexible access patterns** - Role, ownership, visibility, creator, relationships
3. **Complete permission set** - View, edit, delete, require, and filter functions
4. **Clear documentation** - Explains when and how to use each pattern
5. **Customization examples** - Shows how to add team, hierarchy, sharing, etc.
6. **Implementation checklist** - Step-by-step guide for new modules
7. **Common pitfalls** - Warns about mistakes to avoid
8. **Optional enhancements** - Ideas for advanced features

The key innovation is the consistent use of `'field' in entity` checks, making it safe to use with any schema regardless of which optional fields exist.
