# Library Implementation (Phase 2)

> Implement business logic, queries, mutations, and permissions after schema is complete.

## Table of Contents

- [Overview](#overview)
- [Implementation Steps](#implementation-steps)
- [File 1: constants.ts](#file-1-constantsts)
- [File 2: types.ts](#file-2-typests)
- [File 3: utils.ts](#file-3-utilsts)
- [File 4: permissions.ts](#file-4-permissionsts)
- [File 5: queries.ts](#file-5-queriest)
- [File 6: mutations.ts](#file-6-mutationsts)
- [File 7: index.ts](#file-7-indexts)
- [Shared Resources](#shared-resources)
- [Query Patterns](#query-patterns)
- [Mutation Patterns](#mutation-patterns)
- [Quick Reference](#quick-reference)
- [Troubleshooting](#troubleshooting)
- [Appendix](#appendix)

---

## Overview

Library implementation is **Phase 2** of module creation. This phase implements:

- Business logic and operations
- Access control and permissions
- Query endpoints (reads)
- Mutation endpoints (writes)
- Validation and utilities

### Why Library After Schema?

1. **Dependencies**: Library code depends on schema types
2. **Type Safety**: Schema provides TypeScript types
3. **Validation**: Schema validators are reused in library
4. **Clear Separation**: Data structure vs business logic

### File Creation Order

```
1. constants.ts   → Business constants and permissions
2. types.ts       → Operation interfaces
3. utils.ts       → Validation and helpers
4. permissions.ts → Access control logic
5. queries.ts     → Read operations
6. mutations.ts   → Write operations
7. index.ts       → Barrel exports
```

---

## Implementation Steps

### Step 1: Create Directory Structure

```bash
# Replace with your values
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

mkdir -p convex/lib/$CATEGORY/$ENTITY/$MODULE
cd convex/lib/$CATEGORY/$ENTITY/$MODULE
touch constants.ts types.ts utils.ts permissions.ts queries.ts mutations.ts index.ts
```

### Step 2: Implement Files in Order

Follow the sections below in sequence:

1. [constants.ts](#file-1-constantsts)
2. [types.ts](#file-2-typests)
3. [utils.ts](#file-3-utilsts)
4. [permissions.ts](#file-4-permissionsts)
5. [queries.ts](#file-5-queriest)
6. [mutations.ts](#file-6-mutationsts)
7. [index.ts](#file-7-indexts)

---

## File 1: constants.ts

### Purpose

Define canonical business constants, permissions, and limits. Constants are the source of truth - validators should mirror them.

### Rules

- ✅ Constants are canonical (validators reference these)
- ✅ Use `as const` for type inference
- ✅ Export `{MODULE}_CONSTANTS` and `{MODULE}_VALUES`
- ❌ Don't duplicate values from schema validators

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/constants.ts
// Business constants for {module} module

export const {MODULE}_CONSTANTS = {
  PERMISSIONS: {
    VIEW: '{module}:view',
    CREATE: '{module}:create',
    EDIT: '{module}:edit',
    DELETE: '{module}:delete',
    PUBLISH: '{module}:publish',
    BULK_EDIT: '{module}:bulk_edit',
  },

  STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    COMPLETED: 'completed',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },

  LIMITS: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAGS: 10,
    MAX_ATTACHMENTS: 20,
  },
} as const;

export const {MODULE}_VALUES = {
  status: Object.values({MODULE}_CONSTANTS.STATUS),
  priority: Object.values({MODULE}_CONSTANTS.PRIORITY),
  visibility: Object.values({MODULE}_CONSTANTS.VISIBILITY),
} as const;
```

### Real Example: Projects Module

```typescript
// convex/lib/software/freelancer_dashboard/projects/constants.ts

export const PROJECTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'projects:view',
    CREATE: 'projects:create',
    EDIT: 'projects:edit',
    DELETE: 'projects:delete',
    ARCHIVE: 'projects:archive',
    BULK_EDIT: 'projects:bulk_edit',
  },

  STATUS: {
    PLANNING: 'planning',
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  BILLING_TYPE: {
    HOURLY: 'hourly',
    FIXED: 'fixed',
    RETAINER: 'retainer',
  },

  LIMITS: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 10000,
    MAX_TAGS: 15,
    MIN_BUDGET: 0,
    MAX_BUDGET: 10000000,
  },
} as const;

export const PROJECTS_VALUES = {
  status: Object.values(PROJECTS_CONSTANTS.STATUS),
  priority: Object.values(PROJECTS_CONSTANTS.PRIORITY),
  billingType: Object.values(PROJECTS_CONSTANTS.BILLING_TYPE),
} as const;
```

### Common Patterns

**Permission Naming**:
```typescript
PERMISSIONS: {
  VIEW: '{module}:view',
  CREATE: '{module}:create',
  EDIT: '{module}:edit',
  DELETE: '{module}:delete',
  MANAGE: '{module}:manage',
  BULK_EDIT: '{module}:bulk_edit',
}
```

**Status States**:
```typescript
STATUS: {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled',
}
```

**Field Limits**:
```typescript
LIMITS: {
  MIN_{FIELD}_LENGTH: number,
  MAX_{FIELD}_LENGTH: number,
  MAX_ITEMS: number,
  MIN_VALUE: number,
  MAX_VALUE: number,
}
```

---

## File 2: types.ts

### Purpose

Define TypeScript interfaces for operations (create, update, list responses).

### Rules

- ✅ Import schema types from `@/schema/{category}/{entity}/{module}/types`
- ✅ Import `Doc`, `Id` from `@/generated/dataModel`
- ✅ Define operation interfaces (Create, Update, List)
- ❌ No duplication of schema types

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/types.ts
// TypeScript type definitions for {module} module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  {Module}Status,
  {Module}Priority,
  {Module}Visibility
} from '@/schema/{category}/{entity}/{module}/types';

// Base entity types
export type {Module} = Doc<'{tableName}'>;
export type {Module}Id = Id<'{tableName}'>;

// Create operation
export interface Create{Module}Data {
  name: string;
  description?: string;
  status?: {Module}Status;
  priority?: {Module}Priority;
  visibility?: {Module}Visibility;
  parentId?: {Module}Id;
  categoryId?: Id<'categories'>;
  tags?: string[];
}

// Update operation
export interface Update{Module}Data {
  name?: string;
  description?: string;
  status?: {Module}Status;
  priority?: {Module}Priority;
  visibility?: {Module}Visibility;
  tags?: string[];
}

// List response
export interface {Module}ListResponse {
  items: {Module}[];
  returnedCount: number; // count of items returned in this page
  // If you need a global total, add a separate `count{Module}s` query.
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface {Module}Filters {
  status?: {Module}Status[];
  priority?: {Module}Priority[];
  categoryId?: Id<'categories'>;
  search?: string;
}
```

### Real Example: Projects Module

```typescript
// convex/lib/software/freelancer_dashboard/projects/types.ts
import type { Doc, Id } from '@/generated/dataModel';
import type {
  ProjectStatus,
  ProjectPriority,
  ProjectBillingType,
  ProjectBudget
} from '@/schema/software/freelancer_dashboard/projects/types';

export type Project = Doc<'freelancerProjects'>;
export type ProjectId = Id<'freelancerProjects'>;

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  billingType?: ProjectBillingType;
  clientId?: Id<'freelancerClients'>;
  budget?: ProjectBudget;
  startDate?: number;
  deadline?: number;
  tags?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  billingType?: ProjectBillingType;
  budget?: ProjectBudget;
  startDate?: number;
  deadline?: number;
  tags?: string[];
}

export interface ProjectListResponse {
  items: Project[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  clientId?: Id<'freelancerClients'>;
  billingType?: ProjectBillingType[];
  search?: string;
}
```

---

## File 3: utils.ts

### Purpose

Implement validation and helper functions. Always trim before validation.

### Rules

- ✅ Trim functions have generic typing (no `any`)
- ✅ Validation returns `string[]` of errors
- ✅ Trim before validate in all operations
- ✅ Use constants for validation limits
- ❌ No `any` types in trim helpers

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/utils.ts
// Validation + helpers for {module} module

import { {MODULE}_CONSTANTS } from './constants';
import type { Create{Module}Data, Update{Module}Data } from './types';

/**
 * Trim all string fields in module data
 * Generic typing ensures type safety without `any`
 */
export function trim{Module}Data<
  T extends Partial<Create{Module}Data | Update{Module}Data>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  // Trim string fields
  if (typeof trimmed.name === "string") {
    trimmed.name = trimmed.name.trim() as T["name"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  // Trim array of strings
  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);

    trimmed.tags = nextTags as T["tags"];
  }

  return trimmed;
}

/**
 * Validate module data
 * Returns array of error messages
 */
export function validate{Module}Data(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else {
      const name = data.name.trim();

      if (!name) {
        errors.push("Name is required");
      }

      if (name.length < {MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(
          `Name must be at least ${{MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`
        );
      }

      if (name.length > {MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(
          `Name cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > {MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else {
      if (data.tags.length > {MODULE}_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push(
          `Cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_TAGS} tags`
        );
      }

      if (data.tags.some(t => typeof t !== "string" || !t.trim())) {
        errors.push("Tags cannot be empty");
      }
    }
  }

  return errors;
}

/**
 * Build searchable text for full-text search
 * Only include if using search indexes
 */
export function buildSearchableText(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string {
  const parts: string[] = [];

  if (data.name) parts.push(data.name);
  if (data.description) parts.push(data.description);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags);

  return parts.join(' ').toLowerCase().trim();
}
```

### Validation Patterns

**String validation**:
```typescript
if (typeof data.field !== "string") {
  errors.push("Field must be a string");
} else {
  const value = data.field.trim();
  
  if (!value) errors.push("Field is required");
  if (value.length < MIN) errors.push("Too short");
  if (value.length > MAX) errors.push("Too long");
}
```

**Number validation**:
```typescript
if (typeof data.field !== "number") {
  errors.push("Field must be a number");
} else {
  if (data.field < MIN) errors.push("Too small");
  if (data.field > MAX) errors.push("Too large");
  if (!Number.isFinite(data.field)) errors.push("Invalid number");
}
```

**Array validation**:
```typescript
if (!Array.isArray(data.field)) {
  errors.push("Field must be an array");
} else {
  if (data.field.length > MAX) errors.push("Too many items");
  if (data.field.some(item => !isValid(item))) {
    errors.push("Invalid items");
  }
}
```

---

## File 4: permissions.ts

### Purpose

Implement access control logic. Separate boolean checks (`can*`) from throwing checks (`require*`).

### Rules

- ✅ Separate `can*` (returns boolean) and `require*` (throws error)
- ✅ Admin checks first
- ✅ Owner checks before other rules
- ✅ Implement team membership only if the schema defines `visibility: 'team'`; otherwise remove visibility branches
- ❌ Don't mix authorization logic with business logic

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/permissions.ts
// Access control for {module}

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { {Module} } from './types';


/**
 * Check if user is a team member
 * Implement module-specific team membership rules
 */
async function isTeamMember(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // TODO: Implement module-specific team membership logic
  // Examples:
  // - Check if user is in same organization
  // - Check if user is assigned to the resource
  // - Check if user has a specific role
  return false;
}

/**
 * Check if user can view the resource
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

  // Public resources are viewable by all (remove if no visibility field)
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
 */
export async function requireView{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
) {
  if (!(await canView{Module}(ctx, resource, user))) {
    throw new Error('No permission to view this {module}');
  }
}

/**
 * Check if user can edit the resource
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
 */
export async function requireEdit{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
) {
  if (!(await canEdit{Module}(ctx, resource, user))) {
    throw new Error('No permission to edit this {module}');
  }
}

/**
 * Check if user can delete the resource
 */
export async function canDelete{Module}(
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // Admins can delete everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can delete
  if (resource.ownerId === user._id) {
    return true;
  }

  return false;
}

/**
 * Require delete access (throws if not allowed)
 */
export async function requireDelete{Module}Access(
  resource: {Module},
  user: UserProfile
) {
  if (!(await canDelete{Module}(resource, user))) {
    throw new Error('No permission to delete this {module}');
  }
}

/**
 * Filter list of resources by access permissions
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
```

### Permission Patterns

**Check Order**:
1. Admin check (superadmin, admin)
2. Owner check (ownerId, createdBy)
3. Status checks (completed, archived)
4. Team membership checks
5. Default deny

**Common Patterns**:

```typescript
// Admin bypass
if (user.role === 'admin' || user.role === 'superadmin') {
  return true;
}

// Owner check
if (resource.ownerId === user._id) {
  return true;
}

// Status restriction
if (resource.status === 'locked') {
  return false;
}

// Visibility check
if (resource.visibility === 'public') {
  return true;
}
```

---

## File 5: queries.ts

### Purpose

Implement read operations (queries). Use cursor pagination, indexed queries, and permission filtering.

### Rules

- ✅ Call `requireCurrentUser(ctx)` unless explicitly public/internal
- ✅ Use `.withIndex()` for indexed queries
- ✅ Use `.filter(notDeleted)` for regular indexes
- ✅ Use `.eq('deletedAt', undefined)` in search builders
- ✅ Apply `cursor ?? null` for pagination
- ✅ Filter by permissions AFTER pagination
- ❌ No builder type reassignment (`let q = ...; q = q.withIndex(...)`)

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/queries.ts
// Read operations for {module} module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filter{Module}sByAccess, requireView{Module}Access } from './permissions';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import type { {Module}ListResponse, {Module}Filters } from './types';

/**
 * Get paginated list with filtering (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Default behavior is user sees own items. **If the module supports admin global listing, branch the indexed query on `isAdmin` so admins fetch all items before permission filtering.** (Permission filters can’t “add back” docs that were never queried.)
 */
export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array({module}Validators.status)),
      priority: v.optional(v.array({module}Validators.priority)),
      categoryId: v.optional(v.id('categories')),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const isAdmin = user.role === "admin" || user.role === "superadmin";

    // Build indexed query - most selective filter first
    const q = (() => {
      // Admin global listing (module opt-in)
      if (isAdmin) {
        return ctx.db
          .query("{tableName}")
          .withIndex("by_created_at", iq => iq.gte("createdAt", 0))
          .filter(notDeleted);
      }

      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query("{tableName}")
          .withIndex("by_owner_and_status", iq =>
            iq.eq("ownerId", user._id).eq("status", filters.status![0])
          )
          .filter(notDeleted);
      }

      // Category filter with owner
      if (filters.categoryId) {
        return ctx.db
          .query("{tableName}")
          .withIndex("by_owner_and_category", iq =>
            iq.eq("ownerId", user._id).eq("categoryId", filters.categoryId!)
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query("{tableName}")
        .withIndex("by_owner_id", iq => iq.eq("ownerId", user._id))
        .filter(notDeleted);
    })();

    // Paginate
    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    // Apply permission filtering
    let items = await filter{Module}sByAccess(ctx, page.page, user);

    // Apply additional filters in-memory (for multiple values)
    if (filters.status && filters.status.length > 1) {
      items = items.filter(i => filters.status!.includes(i.status));
    }

    if (filters.priority?.length) {
      items = items.filter(i => i.priority && filters.priority!.includes(i.priority));
    }

    // Simple text search (fallback for non-search-index tables)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(term) ||
        (i.description && i.description.toLowerCase().includes(term))
      );
    }

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Search with full-text search index
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
 * 
 * Note: Only include this if table has searchIndex defined in schema
 */
export const search{Module}s = query({
  args: {
    searchQuery: v.optional(v.string()),
    status: v.optional({module}Validators.status),
    priority: v.optional({module}Validators.priority),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const { searchQuery, status, priority, limit = 50, cursor } = args;

    // If no search query, fall back to regular indexed query
    if (!searchQuery?.trim()) {
      const q = status
        ? ctx.db
            .query('{tableName}')
            .withIndex('by_owner_and_status', iq =>
              iq.eq('ownerId', user._id).eq('status', status)
            )
        : ctx.db
            .query('{tableName}')
            .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id));

      const page = await q
        .filter(notDeleted)  // ✅ Regular index - use .filter(notDeleted)
        .order('desc')
        .paginate({ numItems: limit, cursor: cursor ?? null });

      return {
        items: await filter{Module}sByAccess(ctx, page.page, user),
        returnedCount: page.page.length,
        hasMore: !page.isDone,
        cursor: page.continueCursor,
      };
    }

    // Search with filters applied BEFORE pagination
    const searchBuilder = ctx.db
      .query('{tableName}')
      .withSearchIndex('search_all', sq => {
        let q = sq
          .search('searchableText', searchQuery)
          .eq('ownerId', user._id)
          .eq('deletedAt', undefined);  // ✅ Search index - use .eq() in builder

        if (status) {
          q = q.eq('status', status);
        }

        if (priority) {
          q = q.eq('priority', priority);
        }

        return q;
      });
      // ❌ DON'T add .filter(notDeleted) here

    const page = await searchBuilder.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filter{Module}sByAccess(ctx, page.page, user),
      returnedCount: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get single item by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const get{Module} = query({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, doc, user);
    return doc;
  },
});

/**
 * Get item by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const get{Module}ByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const doc = await ctx.db
      .query('{tableName}')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)  // ✅ Regular index
      .first();

    if (!doc) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, doc, user);
    return doc;
  },
});

/**
 * Get statistics
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own stats, admins see all
 */
export const get{Module}Stats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const days = args.days || 30;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get items for the time period
    const itemsQuery = isAdmin
      ? ctx.db
          .query('{tableName}')
          .withIndex('by_created_at', q => q.gte('createdAt', since))
      : ctx.db
          .query('{tableName}')
          .withIndex('by_owner_id', q => q.eq('ownerId', user._id));

    const allItems = await itemsQuery
      .filter(notDeleted)  // ✅ Regular index
      .collect();

    // Filter by date if not using index
    const items = isAdmin
      ? allItems
      : allItems.filter(i => i.createdAt >= since);

    // Calculate statistics
    const stats = {
      total: items.length,
      
      // By status
      byStatus: {
        active: items.filter(i => i.status === 'active').length,
        archived: items.filter(i => i.status === 'archived').length,
        completed: items.filter(i => i.status === 'completed').length,
      },

      // By priority (if applicable)
      byPriority: {
        low: items.filter(i => i.priority === 'low').length,
        medium: items.filter(i => i.priority === 'medium').length,
        high: items.filter(i => i.priority === 'high').length,
        urgent: items.filter(i => i.priority === 'urgent').length,
      },

      // Time-based stats
      createdThisWeek: items.filter(
        i => i.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      
      updatedThisWeek: items.filter(
        i => i.updatedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    };

    return stats;
  },
});

/**
 * Get items by status (Optional - add as needed)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items
 */
export const get{Module}sByStatus = query({
  args: {
    status: {module}Validators.status,
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { status, limit = 50, cursor } = args;

    const page = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner_and_status', q =>
        q.eq('ownerId', user._id).eq('status', status)
      )
      .filter(notDeleted)  // ✅ Regular index
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

    const items = await filter{Module}sByAccess(ctx, page.page, user);

    return {
      items,
      returnedCount: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Count items by status (Optional - add as needed)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own counts
 */
export const count{Module}sByStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const items = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)  // ✅ Regular index
      .collect();

    return {
      active: items.filter(i => i.status === 'active').length,
      archived: items.filter(i => i.status === 'archived').length,
      completed: items.filter(i => i.status === 'completed').length,
      total: items.length,
    };
  },
});
```

---

## File 6: mutations.ts

### Purpose

Implement write operations (mutations). Always trim, validate, soft delete, and audit log.

### Rules

- ✅ Trim then validate in all operations
- ✅ Soft delete only (never hard delete)
- ✅ Audit log every mutation
- ✅ Use `entityType: '{tableName}'` in audit logs
- ✅ Chunk bulk operations (default 50)
- ✅ Check access per entity in bulk operations
- ❌ Never use `ctx.db.delete()`

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/mutations.ts
// Write operations for {module} module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { chunkIds } from '@/shared/bulk.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { {MODULE}_CONSTANTS } from './constants';
import { trim{Module}Data, validate{Module}Data, buildSearchableText } from './utils';
import { 
  requireEdit{Module}Access, 
  requireDelete{Module}Access,
  canEdit{Module},
  canDelete{Module}
} from './permissions';

/**
 * Create a new {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have CREATE permission
 */
export const create{Module} = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Trim and validate
    const trimmed = trim{Module}Data(data);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, '{tableName}');

    // Build searchableText if using search indexes
    // Remove this line if no search indexes in schema
    const searchableText = buildSearchableText(trimmed);

    // Insert record
    const id = await ctx.db.insert('{tableName}', {
      ...trimmed,
      publicId,
      searchableText,  // ← Remove if not using search
      ownerId: user._id,
      status: trimmed.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: '{module}.created',
      entityType: '{tableName}',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: `Created {module}: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const update{Module} = mutation({
  args: {
    id: v.id('{tableName}'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    
    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('{Module} not found');
    }

    // Check permissions
    await requireEdit{Module}Access(ctx, existing, user);

    // Trim and validate
    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Rebuild searchableText with merged data
    const searchableText = buildSearchableText({
      name: trimmed.name ?? existing.name,
      description: trimmed.description ?? existing.description,
      tags: trimmed.tags ?? existing.tags,
    });

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      searchableText,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: '{module}.updated',
      entityType: '{tableName}',
      entityId: existing.publicId,
      entityTitle: trimmed.name ?? existing.name,
      description: `Updated {module}: ${trimmed.name ?? existing.name}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete a {module}
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin
 */
export const delete{Module} = mutation({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    
    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('{Module} not found');
    }

    // Check permissions
    await requireDelete{Module}Access(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: '{module}.deleted',
      entityType: '{tableName}',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted {module}: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Bulk update multiple {module}s
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have BULK_EDIT permission
 */
export const bulkUpdate{Module}s = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    updates: v.object({
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      tags: v.optional(v.array(v.string())),
    }),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, updates, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // Validate updates
    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) {
      throw new Error(errors.join(", "));
    }

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    // Process in chunks
    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        // Check permission per entity
        const canEdit = await canEdit{Module}(ctx, doc, user);
        if (!canEdit) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          ...trimmed,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    // Single audit log for bulk operation
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.name || user.email || "Unknown",
      action: "{module}.bulk_updated",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk update",
      description: `Bulk updated ${updatedCount} {module} items`,
      metadata: {
        updates: trimmed,
        denied,
        requestedCount: ids.length,
        updatedCount,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      updatedCount,
      denied,
    };
  },
});

/**
 * Bulk delete multiple {module}s
 * 🔒 Authentication: Required
 * 🔒 Authorization: Must have DELETE permission
 */
export const bulkDelete{Module}s = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let deletedCount = 0;
    const denied: string[] = [];

    // Process in chunks
    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

        // Check permission per entity
        const canDel = await canDelete{Module}(doc, user);
        if (!canDel) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        deletedCount++;
      }
    }

    // Single audit log for bulk operation
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.name || user.email || "Unknown",
      action: "{module}.bulk_deleted",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk delete",
      description: `Bulk deleted ${deletedCount} {module} items`,
      metadata: { denied, requestedCount: ids.length, deletedCount },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return {
      requestedCount: ids.length,
      deletedCount,
      denied,
    };
  },
});
```

---

## File 7: index.ts

### Purpose

Barrel exports for public library API.

### Template

```typescript
// convex/lib/{category}/{entity}/{module}/index.ts
// Public exports for {module} module

export { {MODULE}_CONSTANTS, {MODULE}_VALUES } from './constants';
export type * from './types';
export * from './utils';
export * from './permissions';
export * from './queries';
export * from './mutations';
```

---

## Shared Resources

### Auth Helpers (`@/shared/auth.helper`)

```typescript
// Get current user (returns null if not logged in)
const user = await getCurrentUser(ctx);

// Require current user (throws if not logged in)
const user = await requireCurrentUser(ctx);

// Require specific permission
await requirePermission(ctx, 'projects:create', { allowAdmin: true });

// Require admin role
await requireAdmin(ctx);

// Require ownership or admin
await requireOwnershipOrAdmin(ctx, resource.ownerId);
```

### Soft Delete Helper (`@/shared/db.helper`)

```typescript
import { notDeleted } from '@/shared/db.helper';

// Canonical soft-delete rules:
// - Regular indexes: use .filter(notDeleted) after withIndex
// - Search indexes: use .eq('deletedAt', undefined) inside the search builder
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅ Filter after index
  .collect();

// DON'T use with search indexes
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq =>
    sq.search('searchableText', query)
      .eq('deletedAt', undefined)  // ✅ Use .eq() in builder
  );
  // ❌ DON'T add .filter(notDeleted) here
```

### Bulk Helper (`@/shared/bulk.helper`)

```typescript
import { chunkIds } from '@/shared/bulk.helper';

// Split IDs into chunks of 50
const chunks = chunkIds(ids, 50);

for (const chunk of chunks) {
  // Process chunk
  const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));
  // ... handle docs
}
```

### PublicId Helper (`@/shared/utils/publicId`)

```typescript
import { generateUniquePublicId } from '@/shared/utils/publicId';

// Generate unique publicId for table
const publicId = await generateUniquePublicId(ctx, 'freelancerProjects');
```

---

## Query Patterns

### Pattern Decision Guide

| Query Type | Use When | Example |
|------------|----------|---------|
| `get{Module}s` | Main list with filters | Dashboard, list views |
| `search{Module}s` | Full-text search needed | Search bar, advanced search |
| `get{Module}` | Single item by ID | Detail view, edit form |
| `get{Module}ByPublicId` | External references | API, public URLs |
| `get{Module}sByStatus` | Status-specific views | Status tabs, kanban |
| `get{Module}Stats` | Dashboard metrics | Analytics, reports |
| `count{Module}sByStatus` | Badge counters | Tab counts, sidebar |

### Soft Delete Pattern

**✅ Regular indexes** - Use `.filter(notDeleted)` after query:
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅ After index
  .collect();
```

**✅ Search indexes** - Use `.eq('deletedAt', undefined)` in builder:
```typescript
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq =>
    sq.search('searchableText', query)
      .eq('deletedAt', undefined)  // ✅ In builder
  );
  // ❌ DON'T use .filter(notDeleted) here
```

### Index Usage Strategy

**Use compound indexes for common combinations**:
```typescript
// Good - frequent filter combination
.withIndex('by_owner_and_status', q =>
  q.eq('ownerId', user._id).eq('status', 'active')
)

// Good - most selective first
.withIndex('by_user_and_date', q =>
  q.eq('userId', user._id).gte('createdAt', since)
)
```

**Apply filters strategically**:
- Single-value filters → Use index
- Multi-value filters → In-memory after pagination
- Text search → Use search index or in-memory

---

## Mutation Patterns

### Standard CRUD Pattern

**CREATE**:
```
1. Auth (requireCurrentUser)
2. Permission (requirePermission)
3. Trim (trim{Module}Data)
4. Validate (validate{Module}Data)
5. Generate publicId
6. Insert
7. Audit log
8. Return ID
```

**UPDATE**:
```
1. Auth (requireCurrentUser)
2. Fetch existing
3. Check existence and not deleted
4. Permission (requireEdit{Module}Access)
5. Trim (trim{Module}Data)
6. Validate (validate{Module}Data)
7. Patch
8. Audit log
9. Return ID
```

**DELETE**:
```
1. Auth (requireCurrentUser)
2. Fetch existing
3. Check existence and not deleted
4. Permission (requireDelete{Module}Access)
5. Soft delete (patch deletedAt, deletedBy)
6. Audit log
7. Return ID
```

### Bulk Operations Pattern

**Structure**:
```typescript
1. Auth (requireCurrentUser)
2. Permission (requirePermission BULK_*)
3. Trim and validate updates
4. Chunk IDs (default 50)
5. For each chunk:
   - Fetch docs
   - For each doc:
     - Check not deleted
     - Check permission
     - Apply operation
     - Track success/denied
6. Single audit log with summary
7. Return summary
```

**Audit Log for Bulk**:
```typescript
await ctx.db.insert("auditLogs", {
  userId: user._id,
  userName: user.name || user.email || "Unknown",
  action: "{module}.bulk_updated",  // or bulk_deleted
  entityType: "{tableName}",
  entityId: "bulk",  // Special ID for bulk operations
  entityTitle: "{module} bulk operation",
  description: `Bulk updated ${updatedCount} items`,
  metadata: {
    updates: trimmed,  // What changed
    denied,  // IDs that were denied
    requestedCount: ids.length,
    updatedCount,
  },
  createdAt: now,
  createdBy: user._id,
  updatedAt: now,
});
```

---

## Quick Reference

### Implementation Checklist

**constants.ts**:
- [ ] Define PERMISSIONS object
- [ ] Define status/priority/visibility enums
- [ ] Define LIMITS object
- [ ] Export {MODULE}_CONSTANTS and {MODULE}_VALUES
- [ ] Use `as const`

**types.ts**:
- [ ] Import schema types
- [ ] Define {Module}, {Module}Id base types
- [ ] Define Create{Module}Data interface
- [ ] Define Update{Module}Data interface
- [ ] Define {Module}ListResponse interface
- [ ] Define {Module}Filters interface (optional)

**utils.ts**:
- [ ] Implement trim{Module}Data with generic typing
- [ ] Implement validate{Module}Data returning string[]
- [ ] Implement buildSearchableText (if using search)
- [ ] Use constants for validation limits
- [ ] No `any` types

**permissions.ts**:
- [ ] Implement canView{Module}
- [ ] Implement requireView{Module}Access
- [ ] Implement canEdit{Module}
- [ ] Implement requireEdit{Module}Access
- [ ] Implement canDelete{Module}
- [ ] Implement requireDelete{Module}Access
- [ ] Implement filter{Module}sByAccess
- [ ] Implement isTeamMember if using visibility:team

**queries.ts**:
- [ ] Implement get{Module}s with pagination
- [ ] Implement search{Module}s (if using search)
- [ ] Implement get{Module} by ID
- [ ] Implement get{Module}ByPublicId
- [ ] Implement get{Module}Stats (optional)
- [ ] All queries use requireCurrentUser (unless public)
- [ ] Use .withIndex() for indexed queries
- [ ] Use cursor ?? null for pagination
- [ ] Filter by permissions after pagination

**mutations.ts**:
- [ ] Implement create{Module}
- [ ] Implement update{Module}
- [ ] Implement delete{Module}
- [ ] Implement bulkUpdate{Module}s (optional)
- [ ] Implement bulkDelete{Module}s (optional)
- [ ] All mutations trim before validate
- [ ] All mutations use soft delete
- [ ] All mutations create audit logs
- [ ] Bulk operations are chunked
- [ ] Bulk operations check access per entity

**index.ts**:
- [ ] Export constants
- [ ] Export types
- [ ] Export utils
- [ ] Export permissions
- [ ] Export queries
- [ ] Export mutations

### Common Imports

```typescript
// Queries
import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filter{Module}sByAccess, requireView{Module}Access } from './permissions';

// Mutations
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { chunkIds } from '@/shared/bulk.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { requireEdit{Module}Access, canEdit{Module} } from './permissions';
```

---

## Troubleshooting

### Error: Builder Type Reassignment

**Problem**: TypeScript error when reassigning query builder

```typescript
// ❌ Wrong
let q = ctx.db.query('tableName');
q = q.withIndex('by_owner_id', iq => iq.eq('ownerId', user._id));
```

**Solution**: Use IIFE or build in one expression

```typescript
// ✅ Correct
const q = (() => {
  if (filters.status) {
    return ctx.db
      .query('tableName')
      .withIndex('by_owner_and_status', iq =>
        iq.eq('ownerId', user._id).eq('status', filters.status)
      );
  }
  
  return ctx.db
    .query('tableName')
    .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id));
})();
```

### Error: Cursor Type Mismatch

**Problem**: Type error with pagination cursor

```typescript
// ❌ Wrong
cursor: cursor
```

**Solution**: Use `?? null`

```typescript
// ✅ Correct
cursor: cursor ?? null
```

### Error: searchableText Not Updating

**Problem**: Search returns old content after update

**Solution**: Rebuild searchableText in update mutation

```typescript
// ✅ Must rebuild with current values
const searchableText = buildSearchableText({
  name: trimmed.name ?? existing.name,
  description: trimmed.description ?? existing.description,
  tags: trimmed.tags ?? existing.tags,
});

await ctx.db.patch(id, {
  ...trimmed,
  searchableText,  // ← Don't forget this!
  updatedAt: now,
});
```

### Error: Permission Bypass in Lists

**Problem**: Deleted items or unauthorized items appear in lists

**Solution**: Apply filters in correct order

```typescript
// ✅ Correct order
1. Build indexed query
2. Apply .filter(notDeleted)
3. Paginate
4. Filter by permissions (filter{Module}sByAccess)
5. Apply in-memory filters
```

### Error: Validation Not Running

**Problem**: Invalid data gets inserted

**Solution**: Check trim → validate order

```typescript
// ✅ Always trim first, then validate
const trimmed = trim{Module}Data(data);
const errors = validate{Module}Data(trimmed);
if (errors.length) {
  throw new Error(errors.join(', '));
}
```

### Error: Hard Delete Used

**Problem**: Used `ctx.db.delete()` instead of soft delete

**Solution**: Always patch deletedAt fields

```typescript
// ❌ Wrong - hard delete
await ctx.db.delete(id);

// ✅ Correct - soft delete
await ctx.db.patch(id, {
  deletedAt: now,
  deletedBy: user._id,
  updatedAt: now,
  updatedBy: user._id,
});
```

---

## Appendix

### A. Query Performance Tips

1. **Use indexes strategically**
   - Most selective field first
   - Compound indexes for common combinations
   
2. **Paginate early**
   - Don't collect() large datasets
   - Use cursor pagination
   
3. **Filter in correct order**
   - Index filters first
   - Single-value filters via index
   - Multi-value filters in-memory
   
4. **Avoid N+1 queries**
   ```typescript
   // ❌ Bad - N+1 queries
   for (const project of projects) {
     const client = await ctx.db.get(project.clientId);
   }
   
   // ✅ Good - batch fetch
   const clientIds = [...new Set(projects.map(p => p.clientId))];
   const clients = await Promise.all(
     clientIds.map(id => ctx.db.get(id))
   );
   ```

### B. Real Module Examples

**Location**: `convex/lib/software/freelancer_dashboard/`

**Recommended to study**:
- `projects/` - Complex module with relationships
- `clients/` - Simple module pattern
- `invoices/` - Financial data handling

### C. Permission Patterns

**Public resources**:
```typescript
if (resource.visibility === 'public') return true;
```

**Owner/creator**:
```typescript
if (resource.ownerId === user._id) return true;
if (resource.createdBy === user._id) return true;
```

**Admin bypass**:
```typescript
if (user.role === 'admin' || user.role === 'superadmin') return true;
```

**Status restrictions**:
```typescript
if (resource.status === 'locked') return false;
```

**Team membership**:
```typescript
if (resource.visibility === 'team') {
  return await isTeamMember(ctx, resource, user);
}
```

### D. Audit Log Best Practices

**Action naming**:
```
{module}.created
{module}.updated
{module}.deleted
{module}.bulk_updated
{module}.bulk_deleted
{module}.archived
{module}.published
```

**EntityType**:
- Always use table name: `entityType: '{tableName}'`
- For bulk: `entityId: 'bulk'`
- For single: `entityId: publicId`

**Metadata usage**:
```typescript
metadata: {
  changes: trimmed,  // What changed
  oldValues: { ... },  // Before
  newValues: { ... },  // After
  denied: [...],  // Failed items in bulk
  requestedCount: number,
  successCount: number,
}
```

### E. Common Validation Patterns

**Required field**:
```typescript
if (!data.field) {
  errors.push("Field is required");
}
```

**String length**:
```typescript
if (data.field.length < MIN || data.field.length > MAX) {
  errors.push("Field length invalid");
}
```

**Number range**:
```typescript
if (data.field < MIN || data.field > MAX) {
  errors.push("Field value out of range");
}
```

**Array limits**:
```typescript
if (data.field.length > MAX_ITEMS) {
  errors.push("Too many items");
}
```

**Date validation**:
```typescript
if (data.deadline && data.deadline < Date.now()) {
  errors.push("Deadline must be in the future");
}
```

---

**Next Document**: [04 - Consistency Review →](./04-consistency-review.md)
