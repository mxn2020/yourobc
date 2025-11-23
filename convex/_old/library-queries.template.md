// convex/lib/boilerplate/[module_name]/queries.ts
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { [MODULE]_CONSTANTS } from './constants';
import { requireViewAccess, filter[Entity]sByAccess } from './permissions';
import { is[Entity]Overdue } from './utils';
import { {module}Validators } from '@/schema/[addon]/{category}/validators';
import { statusTypes, sortOrderValidator } from '@/schema/base';
import type { [Entity] } from './types';
import type { [Entity]Status } from '../../../types';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * VALIDATORS IN QUERIES - TYPE-SAFE FILTERS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Use validators in query filter args for type safety:
 *
 * BENEFITS:
 * ✓ Type-safe filter values
 * ✓ Same validators as schema and mutations
 * ✓ IDE autocomplete for allowed filter values
 * ✓ Prevents invalid filter values at compile time
 *
 * PATTERN:
 * filters: v.optional(v.object({
 *   status: v.optional(v.array({module}Validators.status)),
 *   priority: v.optional(v.array(statusTypes.priority)),
 *   visibility: v.optional(v.array({module}Validators.visibility)),
 * }))
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════
 * REQUIRED TABLE FIELDS - MAIN DISPLAY FIELD
 * ═══════════════════════════════════════════════════════════════════════
 *
 * EVERY table MUST include a main display field for identification:
 * - Use 'name' for: users, products, categories, organizations, teams
 * - Use 'title' for: projects, tasks, invoices, proposals, documents
 * - Use 'displayName' for: entities where name/title would be ambiguous
 *
 * REQUIRED INDEX: Add the appropriate index in your schema:
 * - .index('by_name', ['name']) for entities using 'name'
 * - .index('by_title', ['title']) for entities using 'title'
 * - .index('by_displayName', ['displayName']) for entities using 'displayName'
 *
 * ⚠️  IMPORTANT: Update the search filter (line 176) and sortBy logic (line 94)
 *     to use the correct field name for your entity type. See examples below.
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Get paginated list of {entity}s with filtering
 * 🔒 Authentication: Required
 * 🔒 Authorization: Returns only {entity}s user can access
 */
export const get[Entity]s = query({
  args: {
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        sortBy: v.optional(v.string()), // 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'dueDate' | 'priority' | 'name' (or 'title' or 'displayName')
        sortOrder: v.optional(sortOrderValidator),  // Use validator

        filters: v.optional(
          v.object({
            // Use validators for type-safe filters
            status: v.optional(v.array({module}Validators.status)),
            priority: v.optional(v.array(statusTypes.priority)),
            visibility: v.optional(v.array({module}Validators.visibility)),

            category: v.optional(v.string()),
            ownerId: v.optional(v.id('userProfiles')),
            search: v.optional(v.string()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, { options = {} }) => {
    // 🔒 Authenticate user
    const user = await requireCurrentUser(ctx);

    const {
      limit = 50,
      offset = 0,
      sortBy = 'lastActivityAt',
      sortOrder = 'desc',
      filters = {},
    } = options;

    let {entity}s: [Entity][] = [];

    // Strategy: Use indexes when possible, fall back to full scan
    if (filters.ownerId) {
      // Use owner index for efficient querying
      {entity}s = await ctx.db
        .query('[tableName]')
        .withIndex('by_owner', (q) => q.eq('ownerId', filters.ownerId!))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else if (filters.status?.length === 1) {
      // Use status index if filtering by single status
      {entity}s = await ctx.db
        .query('[tableName]')
        .withIndex('by_status', (q) => q.eq('status', filters.status![0] as [Entity]Status))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else if (filters.category) {
      // Use category index
      {entity}s = await ctx.db
        .query('[tableName]')
        .withIndex('by_category', (q) => q.eq('category', filters.category!))
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
    } else {
      // Fall back to collecting all {entity}s
      const all[Entity]s = await ctx.db
        .query('[tableName]')
        .order(sortOrder === 'desc' ? 'desc' : 'asc')
        .collect();
      {entity}s = all[Entity]s;
    }

    // Apply in-memory filters
    if (filters.status && filters.status.length > 1) {
      {entity}s = {entity}s.filter((p) => filters.status!.includes(p.status));
    }

    if (filters.priority?.length) {
      {entity}s = {entity}s.filter((p) => filters.priority!.includes(p.priority));
    }

    if (filters.visibility?.length) {
      {entity}s = {entity}s.filter((p) => filters.visibility!.includes(p.visibility));
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      {entity}s = {entity}s.filter(
        ({entity}) =>
          // Search across main display field (name/title/displayName)
          // ⚠️  Use 'name' for users/products/categories, 'title' for projects/tasks/invoices, 'displayName' for ambiguous entities
          {entity}.name.toLowerCase().includes(searchTerm) ||  // REQUIRED: Update field name based on entity type
          {entity}.description?.toLowerCase().includes(searchTerm) ||
          {entity}.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 🔒 Filter by access permissions
    const accessible[Entity]s = await filter[Entity]sByAccess(ctx, {entity}s, user);

    // Pagination
    const total = accessible[Entity]s.length;
    const paginated[Entity]s = accessible[Entity]s.slice(offset, offset + limit);

    return {
      {entity}s: paginated[Entity]s,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single {entity} by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view {entity}
 */
export const get[Entity] = query({
  args: {
    {entity}Id: v.id('[tableName]'),
  },
  handler: async (ctx, { {entity}Id }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // Fetch {entity}
    const {entity} = await ctx.db.get({entity}Id);
    if (!{entity}) {
      throw new Error('[Entity] not found');
    }

    // 🔒 Check access permissions
    await requireViewAccess(ctx, {entity}, user);

    // Fetch members with their details (if applicable)
    const members = await ctx.db
      .query('{entity}Members')
      .withIndex('by_{entity}', (q) => q.eq('{entity}Id', {entity}Id))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const userProfile = await ctx.db.get(member.userId);
        return {
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          name: userProfile?.name,
          email: userProfile?.email,
        };
      })
    );

    // Add computed fields
    // Note: {entity} includes main display field (name/title/displayName)
    return {
      ...{entity},  // Includes: name (or title/displayName), description, status, etc.
      isOverdue: is[Entity]Overdue({entity}),
      memberDetails,
    };
  },
});

/**
 * Get {entity} by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have access to view {entity}
 */
export const get[Entity]ByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    // 🔒 Authenticate
    const user = await requireCurrentUser(ctx);

    // Fetch {entity} by public ID
    const {entity} = await ctx.db
      .query('[tableName]')
      .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
      .first();

    if (!{entity}) {
      throw new Error('[Entity] not found');
    }

    // 🔒 Check access permissions
    await requireViewAccess(ctx, {entity}, user);

    // Add computed fields
    // Note: {entity} includes main display field (name/title/displayName)
    return {
      ...{entity},  // Includes: name (or title/displayName), description, status, etc.
      isOverdue: is[Entity]Overdue({entity}),
    };
  },
});

/**
 * Get user's own {entity}s (owned + collaborated)
 * 🔒 Authentication: Required
 * ✅ Scalable: Uses indexed queries, no full table scans
 */
export const getUser[Entity]s = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { targetUserId, includeArchived = false, limit = 100 }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own {entity}s unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own {entity}s');
    }

    // 1. Owned {entity}s - using index (FAST)
    let ownedQuery = ctx.db
      .query('[tableName]')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .order('desc');

    if (!includeArchived) {
      ownedQuery = ownedQuery.filter((q) =>
        q.and(
          q.neq(q.field('status'), [MODULE]_CONSTANTS.STATUS.CANCELLED),
          q.neq(q.field('status'), [MODULE]_CONSTANTS.STATUS.COMPLETED)
        )
      );
    }

    const owned[Entity]s = await ownedQuery.take(limit);

    // 2. Member {entity}s - using {entity}Members table index (FAST)
    const memberships = await ctx.db
      .query('{entity}Members')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'active')
        )
      )
      .order('desc')
      .take(limit);

    // 3. Fetch the actual {entity}s (batched, efficient)
    const member[Entity]sWithNull = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.{entity}Id))
    );

    // 4. Filter out nulls and apply archive filter
    let collaborated[Entity]s = member[Entity]sWithNull.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.ownerId !== userId
    );

    if (!includeArchived) {
      collaborated[Entity]s = collaborated[Entity]s.filter(
        (p) =>
          p.status !== [MODULE]_CONSTANTS.STATUS.CANCELLED &&
          p.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED
      );
    }

    // 5. Calculate stats
    const stats = {
      totalOwned: owned[Entity]s.length,
      totalCollaborated: collaborated[Entity]s.length,
      activeOwned: owned[Entity]s.filter(
        (p) => p.status === [MODULE]_CONSTANTS.STATUS.ACTIVE
      ).length,
      activeCollaborated: collaborated[Entity]s.filter(
        (p) => p.status === [MODULE]_CONSTANTS.STATUS.ACTIVE
      ).length,
    };

    // All returned {entity}s include main display field (name/title/displayName)
    return {
      owned: owned[Entity]s,  // Each {entity} has: name (or title/displayName), description, status, etc.
      collaborated: collaborated[Entity]s,  // Each {entity} has: name (or title/displayName), description, status, etc.
      stats,
    };
  },
});

/**
 * Get {entity} statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: Stats filtered by user access
 */
export const get[Entity]Stats = query({
  args: {
    targetUserId: v.optional(v.id('userProfiles')),
  },
  handler: async (ctx, { targetUserId }) => {
    const user = await requireCurrentUser(ctx);
    const userId = targetUserId || user._id;

    // Only allow viewing own stats unless admin
    if (
      userId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('Permission denied: You can only view your own stats');
    }

    // Fetch user's {entity}s efficiently using indexes
    const owned[Entity]s = await ctx.db
      .query('[tableName]')
      .withIndex('by_owner', (q) => q.eq('ownerId', userId))
      .collect();

    const memberships = await ctx.db
      .query('{entity}Members')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('deletedAt'), undefined),
          q.eq(q.field('status'), 'active')
        )
      )
      .collect();

    const member[Entity]sWithNull = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.{entity}Id))
    );

    const collaborated[Entity]s = member[Entity]sWithNull.filter(
      (p): p is NonNullable<typeof p> => p !== null && p.ownerId !== userId
    );

    const allAccessible[Entity]s = [...owned[Entity]s, ...collaborated[Entity]s];

    // Calculate statistics
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    const atRisk[Entity]s = allAccessible[Entity]s.filter(
      (p) =>
        p.dueDate &&
        p.dueDate > now &&
        p.dueDate <= sevenDaysFromNow &&
        p.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED
    ).length;

    const {entity}sByStatus = {
      active: allAccessible[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.ACTIVE).length,
      completed: allAccessible[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.COMPLETED).length,
      archived: allAccessible[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.ARCHIVED).length,
      on_hold: allAccessible[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.ON_HOLD).length,
    };

    const {entity}sByPriority = {
      low: allAccessible[Entity]s.filter((p) => p.priority === [MODULE]_CONSTANTS.PRIORITY.LOW).length,
      medium: allAccessible[Entity]s.filter((p) => p.priority === [MODULE]_CONSTANTS.PRIORITY.MEDIUM).length,
      high: allAccessible[Entity]s.filter((p) => p.priority === [MODULE]_CONSTANTS.PRIORITY.HIGH).length,
      urgent: allAccessible[Entity]s.filter((p) => p.priority === [MODULE]_CONSTANTS.PRIORITY.URGENT).length,
    };

    const {entity}sByCategory: Record<string, number> = {};
    allAccessible[Entity]s.forEach((p) => {
      if (p.category) {
        {entity}sByCategory[p.category] = ({entity}sByCategory[p.category] || 0) + 1;
      }
    });

    return {
      total[Entity]s: allAccessible[Entity]s.length,
      active[Entity]s: {entity}sByStatus.active,
      completed[Entity]s: {entity}sByStatus.completed,
      archived[Entity]s: {entity}sByStatus.archived,
      onHold[Entity]s: {entity}sByStatus.on_hold,
      overdue[Entity]s: allAccessible[Entity]s.filter((p) => is[Entity]Overdue(p)).length,
      atRisk[Entity]s,
      {entity}sByStatus,
      {entity}sByPriority,
      {entity}sByCategory,
    };
  },
});

/**
 * Get dashboard stats
 * 🔒 Authentication: Optional (returns null if not authenticated)
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Use getCurrentUser (not requireCurrentUser) for optional auth
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Fetch user's {entity}s
    const owned[Entity]s = await ctx.db
      .query('[tableName]')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();

    // Calculate basic stats
    const now = Date.now();

    return {
      total[Entity]s: owned[Entity]s.length,
      active[Entity]s: owned[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.ACTIVE).length,
      completed[Entity]s: owned[Entity]s.filter((p) => p.status === [MODULE]_CONSTANTS.STATUS.COMPLETED).length,
      overdue[Entity]s: owned[Entity]s.filter((p) => p.dueDate && p.dueDate < now && p.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED).length,
    };
  },
});

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MAIN DISPLAY FIELD - QUERY EXAMPLES BY ENTITY TYPE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Example 1: User entity (uses 'name')
 * ─────────────────────────────────────
 * Schema:
 *   name: v.string(),  // Main display field
 *   .index('by_name', ['name'])
 *
 * Query by name:
 *   const user = await ctx.db
 *     .query('userProfiles')
 *     .withIndex('by_name', q => q.eq('name', userName))
 *     .first();
 *
 * Search filter:
 *   users.filter(user => user.name.toLowerCase().includes(searchTerm))
 *
 * Return value:
 *   { _id, name, email, ... }
 *
 * ─────────────────────────────────────
 * Example 2: Project entity (uses 'title')
 * ─────────────────────────────────────
 * Schema:
 *   title: v.string(),  // Main display field
 *   .index('by_title', ['title'])
 *
 * Query by title:
 *   const project = await ctx.db
 *     .query('projects')
 *     .withIndex('by_title', q => q.eq('title', projectTitle))
 *     .first();
 *
 * Search filter:
 *   projects.filter(project => project.title.toLowerCase().includes(searchTerm))
 *
 * Return value:
 *   { _id, title, description, status, ... }
 *
 * ─────────────────────────────────────
 * Example 3: Invoice entity (uses 'title')
 * ─────────────────────────────────────
 * Schema:
 *   title: v.string(),  // Main display field
 *   .index('by_title', ['title'])
 *
 * Query by title:
 *   const invoice = await ctx.db
 *     .query('invoices')
 *     .withIndex('by_title', q => q.eq('title', invoiceTitle))
 *     .first();
 *
 * Search filter:
 *   invoices.filter(invoice => invoice.title.toLowerCase().includes(searchTerm))
 *
 * Return value:
 *   { _id, title, invoiceNumber, amount, ... }
 *
 * ─────────────────────────────────────
 * Example 4: Custom entity (uses 'displayName')
 * ─────────────────────────────────────
 * Schema:
 *   displayName: v.string(),  // Main display field
 *   .index('by_displayName', ['displayName'])
 *
 * Query by displayName:
 *   const entity = await ctx.db
 *     .query('customEntities')
 *     .withIndex('by_displayName', q => q.eq('displayName', name))
 *     .first();
 *
 * Search filter:
 *   entities.filter(entity => entity.displayName.toLowerCase().includes(searchTerm))
 *
 * Return value:
 *   { _id, displayName, description, ... }
 *
 * ═══════════════════════════════════════════════════════════════════════
 * CHOOSING THE RIGHT FIELD NAME
 * ═══════════════════════════════════════════════════════════════════════
 *
 * RULE OF THUMB:
 * - Use 'name' for entities representing people, products, or objects
 * - Use 'title' for entities representing documents, tasks, or work items
 * - Use 'displayName' when 'name' or 'title' would be ambiguous
 *
 * ENTITY TYPE GUIDE:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 'name' entities:                                                    │
 * │   • userProfiles, organizations, teams                              │
 * │   • products, categories, tags                                      │
 * │   • settings, configurations                                        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ 'title' entities:                                                   │
 * │   • projects, tasks, milestones                                     │
 * │   • posts, articles, documents                                      │
 * │   • invoices, proposals, contracts                                  │
 * │   • events, notifications                                           │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ 'displayName' entities:                                             │
 * │   • entities where 'name' might conflict with other properties      │
 * │   • entities that need a different field for technical names        │
 * │   • hybrid entities that don't fit 'name' or 'title' clearly       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ⚠️  REMEMBER: Always update query examples, search filters, and sortBy
 *     logic to use the correct field name for your entity type!
 *
 * ═══════════════════════════════════════════════════════════════════════
 */
