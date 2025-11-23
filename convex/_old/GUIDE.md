Absolutely — here’s a single merged **Updated Convex Backend Implementation Guide*- that:

- Integrates your new patterns + my review + the other reviewer’s “bring back the operational bulk”
- Restores the missing “reference” material (best practices, tips, full consistency review, troubleshooting, perf examples, quick reference tables, real examples pointers)
- Fixes inconsistencies (index naming, trim typing, audit entityType, pagination, builder reassignment)
- Uses **“-” dash bullets everywhere**, including nested bullets

---

# Convex Backend Implementation Guide (Merged + Updated)

> Complete reference for implementing Convex modules with the standardized template system.
> Assumes:
>
> - TanStack Start backend template
> - ConvexDB storage + `userProfiles`
> - Better Auth + Neon for auth
> - BetterAuth user → Convex `userProfiles` sync on login
> - `ctx.auth` contains BetterAuth JWT

---

## 📚 Table of Contents

1. Quick Start
2. Module Structure
3. Implementation Steps
4. Schema Files
5. Library Files
6. Shared Resources
7. Consistency Review
8. Security & Permissions
9. Common Operations
10. Troubleshooting
11. Performance Optimization
12. Quick Reference Tables
13. Tips & Tricks / Workflow
14. Reference Examples

---

## 🚀 Quick Start

### Module File Structure

Every module follows this standard structure (one module can contain multiple tables, but sometimes it’s good to have a main module with submodules or multiple sibling modules):

```
convex/
├── schema/
│   └── {category}/
│       └── {entity}/
│           └── {module}/
│               ├── {module}.ts       # Table definitions
│               ├── {sub_module/sibling_module}.ts   # Additional tables (if needed)
│               ├── validators.ts     # Grouped validators
│               ├── types.ts          # Type extractions
│               ├── schemas.ts        # Schema exports
│               ├── index.ts          # Public schema exports (barrel)
│
└── lib/
    └── {category}/
        └── {entity}/
            └── {module}/
                ├── constants.ts
                ├── types.ts
                ├── utils.ts
                ├── permissions.ts
                ├── queries.ts
                ├── mutations.ts
                ├── index.ts
                │
                ├── {sub_module}/        # Optional: Sub-modules
                │   ├── constants.ts
                │   ├── types.ts
                │   ├── utils.ts
                │   ├── permissions.ts
                │   ├── queries.ts
                │   ├── mutations.ts
                │   └── index.ts
                │
                └── {sibling_module}/    # Optional: Sibling-modules
                    ├── constants.ts
                    ├── types.ts
                    ├── utils.ts
                    ├── permissions.ts
                    ├── queries.ts
                    ├── mutations.ts
                    └── index.ts
```

### Categories

- `addons` - Reusable tools/features
- `apps` - Full applications
- `external` - Client projects
- `games` - Game projects
- `software` - Business software

### Search & Replace Placeholders

All placeholders must be replaced **including the `{}` brackets**.

| Placeholder    | Replace With      | Example                            |
| -------------- | ----------------- | ---------------------------------- |
| `{category}`   | Category name     | `software`, `addons`, `games`      |
| `{entity}`     | Entity name       | `freelancer_dashboard`, `chess`    |
| `{module}`     | Module name       | `projects`, `clients`, `invoices`  |
| `{Module}`     | PascalCase module | `Projects`, `Clients`, `Invoices`  |
| `{MODULE}`     | SCREAMING_SNAKE   | `PROJECTS`, `CLIENTS`, `INVOICES`  |
| `{tableName}`  | Full table name   | `freelancerProjects`, `chessGames` |
| `{TableName}`  | PascalCase table  | `FreelancerProjects`               |
| `{table_name}` | snake_case table  | `freelancer_projects`              |

---

## 📁 Module Structure

### Schema Directory (`convex/schema/{category}/{entity}/{module}/`)

```
{module}/
- {module}.ts          # Table definitions
- {sub_module}.ts      # Additional tables (if needed)
- validators.ts        # Grouped validators
- types.ts             # Type extractions from validators
- schemas.ts           # Schema export objects
- index.ts             # Public barrel exports
```

### Library Directory (`convex/lib/{category}/{entity}/{module}/`)

**Flat Structure (Simple Modules)**

```
{module}/
- constants.ts
- types.ts
- utils.ts
- permissions.ts
- queries.ts
- mutations.ts
- index.ts
```

**Nested Structure (Sub-modules)**

```
{module}/
- constants.ts
- types.ts
- utils.ts
- permissions.ts
- queries.ts
- mutations.ts
- index.ts
- {sub_module_1}/
- {sub_module_2}/
```

**Nested Structure (Sibling-modules)**

```
{module}/
- index.ts
- {sibling_module_1}/
- {sibling_module_2}/
```

---

## 📛 Folder Naming Conventions

### Reserved/Problematic Names

**Certain folder names are reserved or problematic and MUST NOT be used:**

❌ **Avoid these folder names:**
- `logs` - Reserved/problematic
- `templates` - Reserved/problematic

✅ **Instead, use snake_case with descriptive prefixes:**
- `email_logs` (not `logs`)
- `email_templates` (not `templates`)
- `audit_logs` (not `logs`)
- `system_metrics` (not `metrics`)

### Pattern: `{prefix}_{descriptive_name}`

Use **snake_case** with descriptive module-specific prefixes.

### Examples

```bash
# ❌ BAD - Reserved names
convex/lib/system/email/logs/
convex/lib/system/email/templates/

# ✅ GOOD - Descriptive snake_case with prefixes
convex/lib/system/email/email_logs/
convex/lib/system/email/email_templates/
convex/lib/system/audit_logs/
convex/lib/data/forms/forms_fields/
convex/lib/data/surveys/surveys_questions/
```

### Why This Matters

1. **Avoid Conflicts:** `logs` and `templates` may conflict with system directories or build tools
2. **Prevent Collisions:** Snake_case with prefixes prevents naming collisions
3. **Improve Clarity:** `email_logs` is clearer than just `logs`
4. **Consistency:** All module folders follow the same pattern

### Verification

**Check for problematic folder names:**

```bash
# Should return NO matches in lib/ directories
find convex/lib -type d -name "logs" -o -name "templates"

# Should return NO matches in schema/ directories
find convex/schema -type d -name "logs" -o -name "templates"
```

---

## 🔄 Implementation Steps

### Phase 1: Schema Files (Define Data Structure)

1. Create schema directory structure
2. Define validators in `validators.ts`
3. Create table definitions in `{module}.ts`
4. Extract types in `types.ts`
5. Export schemas in `schemas.ts`
6. Register schemas in main `schema.ts`

### Phase 2: Library Files (Implement Business Logic)

7. Define constants in `constants.ts`
8. Create type interfaces in `types.ts`
9. Implement validation in `utils.ts`
10. Create permission logic in `permissions.ts`
11. Implement queries in `queries.ts`
12. Implement mutations in `mutations.ts`
13. Configure exports in `index.ts`

### Phase 3: Consistency Review

14. Verify all required fields are present
15. Check validator consistency between schema and library
16. Ensure permission checks are comprehensive
17. Validate audit logging in all mutations
18. Review trimming on all text inputs
19. Confirm soft delete implementation
20. Test all CRUD operations

---

## 📋 Schema Files

### Required Fields for All Tables

Every table **must*- include these unless explicitly exempt.
If exempt, document it at the top of the table file.

1. Main display field (choose one)

   - `name: v.string()`
   - `title: v.string()`
   - `displayName: v.string()`

2. Core fields

   - `publicId: v.string()`
   - `ownerId: v.id('userProfiles')` - User who owns this resource (for domain tables with ownership)

3. Audit fields

   - `...auditFields`
   - `...softDeleteFields`

4. Required indexes (names are strict)

   - `by_public_id` - `['publicId']`
   - `by_name` (or `by_title` / `by_displayName`) - `['name']`
   - `by_owner_id` - `['ownerId']`
   - `by_deleted_at` - `['deletedAt']`

> Legacy modules may still use `by_owner` or `by_created`. Rename existing indexes, and for new modules use `by_owner_id` or `by_created_at`.

### File Conventions

All schema files start with:

```ts
// convex/schema/{category}/{entity}/{module}/{filename}.ts
// {Brief description of file purpose}
```

---

### 1. validators.ts

**Purpose**

- Define grouped validators using `v.union()`, `v.object()`, etc.

**Rules**

- NO schema imports (prevents circular dependencies)
- Only import `v` from `'convex/values'`
- Can import from `@/schema/base.validators`
- Export `{module}Validators` for unions
- Export `{module}Fields` for complex objects
- Optionality is NOT decided here

```ts
// convex/schema/{category}/{entity}/{module}/validators.ts
// Grouped validators and complex fields for {module} module

import { v } from 'convex/values';
import { baseValidators, baseFields } from '@/schema/base.validators';

export const {module}Validators = {
  status: v.union(
    v.literal('active'),
    v.literal('archived'),
    v.literal('completed')
  ),
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),
  serviceType: baseValidators.serviceType,
  currency: baseValidators.currency,
} as const;

export const {module}Fields = {
  dimensions: v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
    unit: v.union(v.literal('cm'), v.literal('in')),
  }),
  address: baseFields.address,
  contact: baseFields.contact,
  currencyAmount: baseFields.currencyAmount,
} as const;
```

---

### 2. {module}.ts

**Purpose**

- Define database tables with `defineTable()`

**Rules**

- Optionality is set here
- Use validators from `./validators`
- Spread base audit fields
- Define required indexes
- Export `{module}Table`

```ts
// convex/schema/{category}/{entity}/{module}/{module}.ts
// Table definitions for {module} module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { {module}Validators, {module}Fields } from './validators';

export const {module}Table = defineTable({
  name: v.string(),

  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who owns/manages this resource

  // Optional: Denormalized search field (only if using search indexes)
  // Maintained in create/update mutations via buildSearchableText()
  searchableText: v.string(),  // ← Remove this line if not using search

  description: v.optional(v.string()),
  status: {module}Validators.status,
  priority: v.optional({module}Validators.priority),
  visibility: v.optional({module}Validators.visibility),

  dimensions: v.optional({module}Fields.dimensions),

  parentId: v.optional(v.id('{tableName}')),
  categoryId: v.optional(v.id('categories')),

  ...auditFields,
  ...softDeleteFields,
})
// Full-text search indexes

// Single combined search (Recommended for most cases)
// Include this if you need full-text search across multiple fields
.searchIndex('search_all', {
  searchField: 'searchableText',
  filterFields: ['ownerId', 'status', 'deletedAt'],
})

// Field-specific search (Advanced)
// Requires additional searchableText field and maintenance overhead
/*
.searchIndex('search_by_name', {
  searchField: 'name',
  filterFields: ['ownerId', 'status', 'deletedAt'],
})
.searchIndex('search_by_description', {
  searchField: 'description',
  filterFields: ['ownerId', 'status', 'deletedAt'],
})
.searchIndex('search_by_tags', {
  searchField: 'tags',
  filterFields: ['ownerId', 'status', 'deletedAt'],
})
*/


  // Standard indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])

  // Optional indexes (add based on your queries)
  .index('by_owner_and_category', ['ownerId', 'categoryId'])  // ← Only if using categories
  .index('by_parent', ['parentId'])  // ← Only if hierarchical
  .index('by_category', ['categoryId'])  // ← Only if filtering by category alone
  .index('by_created_at', ['createdAt']);  // ← Only if sorting by creation time

```

---

### 3. types.ts

```ts
// convex/schema/{category}/{entity}/{module}/types.ts
// Type extractions from validators for {module} module

import { Infer } from 'convex/values';
import { {module}Validators, {module}Fields } from './validators';

export type {Module}Status = Infer<typeof {module}Validators.status>;
export type {Module}Priority = Infer<typeof {module}Validators.priority>;
export type {Module}Visibility = Infer<typeof {module}Validators.visibility>;
export type {Module}Dimensions = Infer<typeof {module}Fields.dimensions>;
```

---

### 4. schemas.ts

```ts
// convex/schema/{category}/{entity}/{module}/schemas.ts
// Schema exports for {module} module

import { {module}Table } from './{module}';

export const {category}{Entity}{Module}Schemas = {
  {tableName}: {module}Table,
};
```

---

### Schema Registration

```ts
// convex/schema.ts
import { defineSchema } from 'convex/server';
import { {category}{Entity}{Module}Schemas } from './schema/{category}/{entity}/{module}/schemas';

export default defineSchema({
  ...{category}{Entity}{Module}Schemas,
});
```

### SearchIndex Decision Guide

**Should you add search indexes?**

```
Do users need to search text content?
├─ NO → Skip search indexes entirely
│   - Remove searchableText field
│   - Remove all .searchIndex() definitions
│   - Remove buildSearchableText helper
│   - Use simple in-memory filtering instead
│
└─ YES → Choose search approach:
    │
    ├─ Simple text search (1-3 fields)
    │   - Add searchableText field
    │   - Add single search_all index
    │   - Maintain in create/update mutations
    │   - Use search{Module}s query
    │
    ├─ Field-specific search (power users)
    │   - Add field-specific indexes
    │   - More maintenance overhead
    │   - Use search{Module}ByField query
    │
    └─ No search (use filtering instead)
        - Keep simple string filtering in get{Module}s
        - Good for small datasets (<1000 items)
        - Lower overhead, simpler code
```

**Storage & Performance Impact:**

| Approach | Schema Overhead | Mutation Overhead | Query Performance | Best For |
|----------|----------------|-------------------|-------------------|----------|
| No search | 0 bytes | None | Slow (in-memory) | <1K items, prototyping |
| Single search index | ~500 bytes/doc | Low (maintain 1 field) | Fast | Most production use cases |
| Field-specific indexes | ~100 bytes/field | Medium (maintain N fields) | Very fast | Power users, admins |

**Recommendation:** Start without search indexes. Add them only when:
- Dataset grows beyond 1,000 items
- Users report slow search performance
- You need to search across long text fields (descriptions, notes)

---

## 📚 Library Files

### File Conventions

All library files start with:

```ts
// convex/lib/{category}/{entity}/{module}/{filename}.ts
// {Brief description of file purpose}
```

---

### 1. constants.ts

**Purpose**

- Canonical business constants, permissions, limits

**Rule**

- Constants are canonical, validators should mirror them, not duplicate them.

```ts
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
  },
} as const;

export const {MODULE}_VALUES = {
  status: Object.values({MODULE}_CONSTANTS.STATUS),
  priority: Object.values({MODULE}_CONSTANTS.PRIORITY),
  visibility: Object.values({MODULE}_CONSTANTS.VISIBILITY),
} as const;
```

---

### 2. types.ts

```ts
// convex/lib/{category}/{entity}/{module}/types.ts
// TypeScript type definitions for {module} module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  {Module}Status,
  {Module}Priority,
  {Module}Visibility
} from '@/schema/{category}/{entity}/{module}/types';

export type {Module} = Doc<'{tableName}'>;
export type {Module}Id = Id<'{tableName}'>;

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

export interface Update{Module}Data {
  name?: string;
  description?: string;
  status?: {Module}Status;
  priority?: {Module}Priority;
  visibility?: {Module}Visibility;
  tags?: string[];
}

export interface {Module}ListResponse {
  items: {Module}[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}
```

---

### 3. utils.ts

**Rules**

- Trim first, validate trimmed
- No `any` in trim helpers
- Validation returns `string[]`

```ts
// convex/lib/{category}/{entity}/{module}/utils.ts
// Validation + helpers for {module} module

import { {MODULE}_CONSTANTS } from './constants';
import type { Create{Module}Data, Update{Module}Data } from './types';

export function trim{Module}Data<
  T extends Partial<Create{Module}Data | Update{Module}Data>
>(data: T): T {
  // clone so we don't mutate caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.name === "string") {
    trimmed.name = trimmed.name.trim() as T["name"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  if (Array.isArray(trimmed.tags)) {
    // trim each tag, drop empty ones
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);

    trimmed.tags = nextTags as T["tags"];
  }

  return trimmed;
}

export function validate{Module}Data(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string[] {
  const errors: string[] = [];

  // --- name ---
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else {
      // assume trim{Module}Data ran, but be defensive
      const name = data.name.trim();

      if (!name) errors.push("Name is required");
      if (name.length < {MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(
          `Name must be at least ${"{MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH"} chars`
        );
      }
      if (name.length > {MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(
          `Name cannot exceed ${"{MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH"} chars`
        );
      }
    }
  }

  // --- description ---
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > {MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push("Description too long");
      }
    }
  }

  // --- tags ---
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else {
      const tags = data.tags;

      if (tags.length > {MODULE}_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push("Too many tags");
      }

      if (tags.some(t => typeof t !== "string" || !t.trim())) {
        errors.push("Tags cannot be empty");
      }
    }
  }

  return errors;
}

```

---

### 4. permissions.ts

**Rules**

- Separate `can*` and `require*`
- Formal team membership hook if `visibility: 'team'`

```ts
// convex/lib/{category}/{entity}/{module}/permissions.ts
// Access control for {module}

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { {Module} } from './types';

type UserProfile = Doc<'userProfiles'>;

async function isTeamMember(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  // implement module-specific rules here
  return false;
}

export async function canView{Module}(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.visibility === 'public') return true;
  if (resource.ownerId === user._id) return true;
  if (resource.createdBy === user._id) return true;

  if (resource.visibility === 'team') {
    return await isTeamMember(ctx, resource, user);
  }

  return false;
}

export async function requireView{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
) {
  if (!(await canView{Module}(ctx, resource, user))) {
    throw new Error('No view permission');
  }
}

export async function canEdit{Module}(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.ownerId === user._id) return true;
  if (resource.status === 'completed' || resource.status === 'archived') return false;
  return false;
}

export async function requireEdit{Module}Access(
  ctx: QueryCtx | MutationCtx,
  resource: {Module},
  user: UserProfile
) {
  if (!(await canEdit{Module}(ctx, resource, user))) {
    throw new Error('No edit permission');
  }
}

export async function canDelete{Module}(resource: {Module}, user: UserProfile) {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (resource.ownerId === user._id) return true;
  return false;
}

export async function requireDelete{Module}Access(resource: {Module}, user: UserProfile) {
  if (!(await canDelete{Module}(resource, user))) {
    throw new Error('No delete permission');
  }
}

export async function filter{Module}sByAccess(
  ctx: QueryCtx | MutationCtx,
  resources: {Module}[],
  user: UserProfile
) {
  if (user.role === 'admin' || user.role === 'superadmin') return resources;
  const out: {Module}[] = [];
  for (const r of resources) {
    if (await canView{Module}(ctx, r, user)) out.push(r);
  }
  return out;
}
```

---

### 5. queries.ts

**Required rules**

- `requireCurrentUser(ctx)` unless explicitly public/internal
- Cursor pagination default with `cursor ?? null`
- No builder-type reassignment
- Indexed filters before pagination
- Permission filtering on the page only
- **Search indexes**: Use `.eq('deletedAt', undefined)` in search builder (NOT `.filter(notDeleted)`)
- **Regular indexes**: Use `.filter(notDeleted)` after index query

```ts
// convex/lib/{category}/{entity}/{module}/queries.ts
// Read operations for {module} module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filter{Module}sByAccess, requireView{Module}Access } from './permissions';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import type { {Module}ListResponse } from './types';

/**
 * Get paginated list with filtering (cursor-based)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items, admins see all
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

    // Build indexed query - most selective filter first
    const q = (() => {
      // Single status filter with owner
      if (filters.status?.length === 1) {
        return ctx.db
          .query('{tableName}')
          .withIndex('by_owner_and_status', iq =>
            iq.eq('ownerId', user._id).eq('status', filters.status![0])
          )
          .filter(notDeleted);  // ✅ Regular index - use .filter(notDeleted)
      }

      // Category filter with owner
      if (filters.categoryId) {
        return ctx.db
          .query('{tableName}')
          .withIndex('by_owner_and_category', iq =>
            iq.eq('ownerId', user._id).eq('categoryId', filters.categoryId!)
          )
          .filter(notDeleted);
      }

      // Default: owner only
      return ctx.db
        .query('{tableName}')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
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
      total: items.length,
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
        total: page.page.length,
        hasMore: !page.isDone,
        cursor: page.continueCursor,
      };
    }

    // Search with filters applied BEFORE pagination
    const searchQuery = ctx.db
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

    const page = await searchQuery.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filter{Module}sByAccess(ctx, page.page, user),
      total: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Advanced: Search specific fields
 * 🔒 Authentication: Required
 * 
 * Note: Only include this if table has field-specific search indexes
 */
export const search{Module}ByField = query({
  args: {
    searchQuery: v.string(),
    searchField: v.union(
      v.literal('name'),
      v.literal('description'),
      v.literal('tags'),
      v.literal('all')
    ),
    status: v.optional({module}Validators.status),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse & { cursor?: string }> => {
    const user = await requireCurrentUser(ctx);
    const query = args.searchQuery.trim();

    if (!query) {
      throw new Error('Search query is required');
    }

    const { limit = 50, cursor, status } = args;

    // Helper: Build search query with common filters
    const buildSearchQuery = (indexName: string, searchField: string) => {
      return ctx.db
        .query('{tableName}')
        .withSearchIndex(indexName, sq => {
          let search = sq
            .search(searchField, query)
            .eq('ownerId', user._id)
            .eq('deletedAt', undefined);  // ✅ Search index filter

          if (status) {
            search = search.eq('status', status);
          }

          return search;
        });
        // ❌ DON'T add .filter(notDeleted) here
    };

    // Route to appropriate search index
    const searchQuery = (() => {
      switch (args.searchField) {
        case 'name':
          return buildSearchQuery('search_by_name', 'name');
        case 'description':
          return buildSearchQuery('search_by_description', 'description');
        case 'tags':
          return buildSearchQuery('search_by_tags', 'tags');
        case 'all':
        default:
          return buildSearchQuery('search_all', 'searchableText');
      }
    })();

    const page = await searchQuery.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filter{Module}sByAccess(ctx, page.page, user),
      total: page.page.length,
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

      // By category (if applicable)
      byCategory: {} as Record<string, number>,

      // Time-based stats
      createdThisWeek: items.filter(
        i => i.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
      
      updatedThisWeek: items.filter(
        i => i.updatedAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    };

    // Count by category
    items.forEach(item => {
      if (item.categoryId) {
        const key = item.categoryId;
        stats.byCategory[key] = (stats.byCategory[key] || 0) + 1;
      }
    });

    return stats;
  },
});

/**
 * Get items by category (Optional - add as needed)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items
 */
export const get{Module}sByCategory = query({
  args: {
    categoryId: v.id('categories'),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { categoryId, limit = 50, cursor } = args;

    const page = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner_and_category', q =>
        q.eq('ownerId', user._id).eq('categoryId', categoryId)
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
      total: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
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
      total: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});

/**
 * Get recently updated items (Optional - add as needed)
 * 🔒 Authentication: Required
 * 🔒 Authorization: User sees own items
 */
export const getRecent{Module}s = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 10 } = args;

    const items = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)  // ✅ Regular index
      .order('desc')
      .take(limit);

    return await filter{Module}sByAccess(ctx, items, user);
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

**Query Pattern Guidelines:**

**When to use each pattern:**

1. **`get{Module}s`** - Main list query with filtering
   - Use for general browsing with filters
   - Supports multiple filter combinations
   - Falls back to in-memory search if no search index

2. **`search{Module}s`** - Full-text search
   - Use when table has `searchableText` field and search index
   - Much faster than in-memory search for large datasets
   - Automatically falls back to indexed query when no search term

3. **`search{Module}ByField`** - Field-specific search (optional)
   - Use when users need to search specific fields
   - Requires multiple search indexes in schema
   - Good for admin interfaces and power users

4. **`get{Module}`** - Single item by ID
   - Standard fetch by internal ID
   - Always check permissions

5. **`get{Module}ByPublicId`** - Single item by public ID
   - For external references and APIs
   - More user-friendly than internal IDs

6. **`get{Module}sByCategory/Status`** - Filtered lists
   - Pre-filtered views for common cases
   - More efficient than filtering in `get{Module}s`
   - Use compound indexes (by_owner_and_category)

7. **`getRecent{Module}s`** - Recent items
   - Dashboard widgets, activity feeds
   - Small limit (10-20 items)
   - No pagination needed

8. **`get{Module}Stats`** - Aggregated statistics
   - Dashboard metrics, reports
   - Calculates counts and distributions
   - Optionally time-bounded

9. **`count{Module}sByStatus`** - Quick counts
   - Badge counters, status tabs
   - Lighter than full stats query
   - Good for UI state

**Soft Delete Pattern:**

- ✅ **Search indexes**: Use `.eq('deletedAt', undefined)` **inside** search builder
- ✅ **Regular indexes**: Use `.filter(notDeleted)` **after** index query
- ❌ **Never** use both together
- ❌ **Never** add `.filter(notDeleted)` after `.withSearchIndex()`

**Performance Tips:**

- Use most selective index first (usually `by_owner_id` or `by_owner_and_status`)
- Apply single-value filters via index, multi-value filters in-memory
- Paginate early, filter late
- Keep stats queries time-bounded (default 30 days)
- Consider denormalizing frequently-accessed counts

---

### 6. mutations.ts

**Rules**

- Trim then validate trimmed
- Soft delete only
- Audit logs always
- `auditLogs.entityType === '{tableName}'`

```ts
// convex/lib/{category}/{entity}/{module}/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { chunkIds } from '@/shared/bulk.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { {MODULE}_CONSTANTS } from './constants';
import { trim{Module}Data, validate{Module}Data } from './utils';
import { 
  requireEdit{Module}Access, 
  requireDelete{Module}Access,
  canEdit{Module},
  canDelete{Module}
} from './permissions';

// Helper: Build searchableText from multiple fields for full-text search indexing
// ⚠️ Only include this helper and searchableText updates if your schema has search indexes
// If your module doesn't need search, remove:
// - This helper function
// - searchableText field from insert/patch operations
// - All searchIndex definitions from schema
function buildSearchableText(data: Partial<Create{Module}Data | Update{Module}Data>): string {
  const parts: string[] = [];

  if (data.name) parts.push(data.name);
  if (data.description) parts.push(data.description);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags);

  return parts.join(' ').toLowerCase().trim();
}

export const create{Module} = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    const trimmed = trim{Module}Data(data);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, '{tableName}');

    // Build searchableText if using search indexes
    // Remove this line if no search indexes in schema
    const searchableText = buildSearchableText(trimmed);

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

    await ctx.db.insert('auditLogs', {
      userId: user._id, // Who performed the action (actor)
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

export const update{Module} = mutation({
  args: {
    id: v.id('{tableName}'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) throw new Error('Not found');

    await requireEdit{Module}Access(ctx, existing, user);

    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    const now = Date.now();
    const searchableText = buildSearchableText({
      name: trimmed.name ?? existing.name,
      description: trimmed.description ?? existing.description,
      tags: trimmed.tags ?? existing.tags,
    });

    await ctx.db.patch(id, {
      ...trimmed,
      searchableText,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id, // Who performed the action (actor)
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

export const delete{Module} = mutation({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) throw new Error('Not found');

    await requireDelete{Module}Access(existing, user);

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id, // Who performed the action (actor)
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

export const bulkUpdate{Module}s = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      visibility: v.optional({module}Validators.visibility),
      tags: v.optional(v.array(v.string())),
    }),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, updates, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const trimmed = trim{Module}Data(updates);
    const errors = validate{Module}Data(trimmed);
    if (errors.length) throw new Error(errors.join(", "));

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

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

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;

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

// optional: bulk status mutations, useful for “archive many”, “complete many”, etc.
export const bulkSet{Module}Status = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    status: {module}Validators.status,
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, status, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;
        if (!(await canEdit{Module}(ctx, doc, user))) {
          denied.push(doc.publicId);
          continue;
        }

        await ctx.db.patch(doc._id, {
          status,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.name || user.email || "Unknown",
      action: "{module}.bulk_status_set",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk status set",
      description: `Set status=${status} on ${updatedCount} items`,
      metadata: { status, denied, requestedCount: ids.length, updatedCount },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { requestedCount: ids.length, updatedCount, denied };
  },
});

// optional: bulk add/remove tags
export const bulkAdd{Module}Tags = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    tagsToAdd: v.array(v.string()),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, tagsToAdd, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const trimmedTags = tagsToAdd.map(t => t.trim()).filter(Boolean);
    if (!trimmedTags.length) throw new Error("No tags to add");

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;
        if (!(await canEdit{Module}(ctx, doc, user))) {
          denied.push(doc.publicId);
          continue;
        }

        const oldTags = doc.tags ?? [];
        const newTags = Array.from(new Set([...oldTags, ...trimmedTags]))
          .slice(0, {MODULE}_CONSTANTS.LIMITS.MAX_TAGS);

        await ctx.db.patch(doc._id, {
          tags: newTags,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.name || user.email || "Unknown",
      action: "{module}.bulk_tags_added",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk add tags",
      description: `Added tags to ${updatedCount} items`,
      metadata: { tagsToAdd: trimmedTags, denied, requestedCount: ids.length, updatedCount },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { requestedCount: ids.length, updatedCount, denied };
  },
});

export const remove{Module}Tags = mutation({
  args: {
    ids: v.array(v.id("{tableName}")),
    tagsToRemove: v.array(v.string()),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, tagsToRemove, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    const trimmedTags = tagsToRemove.map(t => t.trim()).filter(Boolean);
    if (!trimmedTags.length) throw new Error("No tags to remove");

    const now = Date.now();
    const chunks = chunkIds(ids, chunkSize ?? 50);

    let updatedCount = 0;
    const denied: string[] = [];

    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map(id => ctx.db.get(id)));

      for (const doc of docs) {
        if (!doc || doc.deletedAt) continue;
        if (!(await canEdit{Module}(ctx, doc, user))) {
          denied.push(doc.publicId);
          continue;
        }

        const oldTags = doc.tags ?? [];
        const newTags = oldTags.filter(t => !trimmedTags.includes(t));

        await ctx.db.patch(doc._id, {
          tags: newTags,
          updatedAt: now,
          updatedBy: user._id,
        });

        updatedCount++;
      }
    }

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      userName: user.name || user.email || "Unknown",
      action: "{module}.bulk_tags_removed",
      entityType: "{tableName}",
      entityId: "bulk",
      entityTitle: "{module} bulk remove tags",
      description: `Removed tags from ${updatedCount} items`,
      metadata: { tagsToRemove: trimmedTags, denied, requestedCount: ids.length, updatedCount },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { requestedCount: ids.length, updatedCount, denied };
  },
});


```

**Bulk operations (required)**

- Must be chunked (default 50)
- Must check access per entity
- One audit log per bulk action

---

### 7. index.ts

```ts
// convex/lib/{category}/{entity}/{module}/index.ts

export { {MODULE}_CONSTANTS } from './constants';
export type - from './types';
export - from './utils';
export - from './permissions';
export - from './queries';
export - from './mutations';
```

---

## 🔧 Shared Resources

### Auth Helpers (`@/shared/auth.helper`)

- `getCurrentUser(ctx)`
- `requireCurrentUser(ctx)`
- `requirePermission(ctx, permission, { allowAdmin })`
- `requireAdmin(ctx)`
- `requireOwnershipOrAdmin(ctx, ownerId)`

### Soft Delete Helper (Required)

```ts
// convex/shared/db.helper.ts
export const notDeleted = (q: any) => q.eq(q.field('deletedAt'), undefined);
```

### Base Validators (`@/schema/base.validators`)

- `baseValidators`

  - currency
  - serviceType
  - contactRole
  - documentType
  - etc.
- `baseFields`

  - address
  - contact
  - currencyAmount
  - metadata
  - etc.

---

## ✅ Consistency Review (Full)

Run these after every module implementation.

### 1. Field Consistency

- Schema has main display field
- Schema indexes main display field
- Audit logs reflect main display field
- Search filters use main display field

Commands:

```bash
grep -r "name:" convex/schema/{category}/{entity}/{module}/
grep -r "entityTitle:" convex/lib/{category}/{entity}/{module}/
```

### 2. Validator vs Constants Consistency

- Validators match constant values
- Prefer constants as canonical source

```bash
diff convex/schema/{category}/{entity}/{module}/validators.ts \
     convex/lib/{category}/{entity}/{module}/constants.ts
```

### 3. Permission Consistency

- All mutations call `requireCurrentUser`
- All mutations call permission or requireAccess
- All queries call `requireCurrentUser` unless explicitly public/internal
- All list queries filter by access

```bash
grep -r "mutation({" convex/lib/{category}/{entity}/{module}/mutations.ts
grep -r "requireCurrentUser" convex/lib/{category}/{entity}/{module}/
```

### 4. Validation + Trimming Consistency

- Trim before validation in create/update/bulk
- All string inputs trimmed

```bash
grep -r "trim{Module}Data" convex/lib/{category}/{entity}/{module}/mutations.ts
grep -r "\.trim()" convex/lib/{category}/{entity}/{module}/
```

### 5. Audit Log Consistency

- Every mutation inserts auditLogs
- `entityType === '{tableName}'`

```bash
grep -c "export const" convex/lib/{category}/{entity}/{module}/mutations.ts
grep -c "auditLogs" convex/lib/{category}/{entity}/{module}/mutations.ts
```

### 6. Soft Delete Consistency

- No `ctx.db.delete()` in standard modules
- All queries use `notDeleted`

```bash
grep -r "ctx.db.delete" convex/lib/{category}/{entity}/{module}/
grep -r "filter(notDeleted)" convex/lib/{category}/{entity}/{module}/
```

### 6.5. SearchIndex Consistency

**Basic SearchIndex (required for searchable modules):**
- Schema defines `.searchIndex('search_all', ...)` with searchableText field
- `searchableText` field is denormalized and maintained in mutations
- Create mutation builds and includes `searchableText`
- Update mutation rebuilds and includes `searchableText`
- Queries use `.withSearchIndex()` for search operations
- Search queries use `.eq('deletedAt', undefined)` in search builder (not `.filter(notDeleted)`)
- Search queries have fallback to regular indexed queries when no search term

**Field-specific SearchIndex (optional - for advanced use cases):**
- Additional searchIndex entries for specific fields (name, description, tags, etc.)
- Each index has same filterFields for consistent results
- Query uses buildSearchQuery helper to avoid duplication
- Switch statement routes to correct index based on searchField parameter

```bash
# Check for searchIndex definitions
grep -r "\.searchIndex" convex/schema/{category}/{entity}/{module}/

# Check for searchableText field in schema
grep -r "searchableText:" convex/schema/{category}/{entity}/{module}/

# Check searchableText is built in mutations
grep -r "buildSearchableText" convex/lib/{category}/{entity}/{module}/mutations.ts

# Check search queries use withSearchIndex (not .filter(notDeleted))
grep -r "withSearchIndex" convex/lib/{category}/{entity}/{module}/queries.ts
grep -r "\.eq('deletedAt', undefined)" convex/lib/{category}/{entity}/{module}/queries.ts

# For field-specific searches
grep -r "buildSearchQuery" convex/lib/{category}/{entity}/{module}/queries.ts
grep -r "switch.*searchField" convex/lib/{category}/{entity}/{module}/queries.ts
```

### 7. Type Safety Consistency

- Minimal `any`
- `Doc<>` and `Id<>` used
- Schema unions extracted via `Infer`
- All metadata fields use typed validators (no `v.any()`)
- Metadata is optional (never required)
- All tables with `publicId` are registered in `PUBLIC_ID_PREFIXES`

```bash
# Check for generic any types (should be minimal)
grep -r ": any" convex/lib/{category}/{entity}/{module}/

# Check for untyped metadata (should return no results)
grep -r "metadata.*v\.any()" convex/schema/

# Check all tables with publicId are registered
grep -r "publicId: v.string()" convex/schema/
# Compare with:
cat convex/shared/config/publicId.ts | grep -A 100 "PUBLIC_ID_PREFIXES"
```

### 8. Index Usage Consistency

- `.withIndex()` when possible
- No full scans for large tables

```bash
grep -A 5 "ctx.db.query" convex/lib/{category}/{entity}/{module}/queries.ts | grep -v "withIndex"
```

### 9. Return Value Consistency

- Mutations return ID
- Bulk returns summary
- Queries return stable response shapes

### 10. Import Path Consistency

- No circular deps
- Correct aliasing

```bash
grep -r "import.*@/" convex/lib/{category}/{entity}/{module}/
```

### 11. Folder Naming Consistency

- No folders named `logs` or `templates` (use snake_case with prefixes)
- All folder names use descriptive prefixes

```bash
# Should return NO matches
find convex/lib -type d -name "logs" -o -name "templates"
find convex/schema -type d -name "logs" -o -name "templates"

# Expected: email_logs, email_templates, audit_logs (not logs, templates)
```

---

## 🔒 Security & Permissions

- `requireCurrentUser(ctx)` is default guard
- Explicitly document if a function is:

  - public
  - internal-only
  - webhook-only
- Ownership checks should happen before fallback rules
- Related entities must cascade access checks

---

## ⚡ Common Operations

### CREATE

- Auth → Permission → Trim → Validate → Insert → Audit → Return

### LIST (Cursor Pagination)

- Indexed query → `.filter(notDeleted)` → paginate → access filter page → post-filter page

### UPDATE

- Auth → Fetch → Access → Trim → Validate → Patch → Audit → Return

### SOFT DELETE

- Auth → Fetch → Access → Patch deleted fields → Audit → Return

### BULK

- Chunk size 50
- Validate trimmed updates
- Check access per item
- One audit log per bulk action

---

## 🆔 Public ID Configuration

### Required Step: Register Table with PublicId

**When creating a table with `publicId` field, you MUST register it in the config for type safety.**

### Pattern

1. Add table to schema with `publicId: v.string()`
2. Register table name and prefix in `/convex/shared/config/publicId.ts`
3. Use `generateUniquePublicId(ctx, 'tableName')` in mutations

### Configuration File

**Path:** `convex/shared/config/publicId.ts`

**Add your table to `PUBLIC_ID_PREFIXES`:**

```ts
export const PUBLIC_ID_PREFIXES = {
  // Your new table
  myTable: 'mytbl',  // table name: prefix (3-5 chars, lowercase)

  // Existing tables
  emailLogs: 'emlog',
  emailTemplates: 'emtpl',
  emailConfigs: 'emcfg',
  auditLogs: 'aulog',
  userProfiles: 'user',
  // ...
} as const;
```

### Type Safety

**TypeScript automatically validates table names:**

```ts
// ✅ Type-safe - 'emailLogs' is in PUBLIC_ID_PREFIXES
const publicId = await generateUniquePublicId(ctx, 'emailLogs');

// ❌ Type error - 'myNewTable' not in PUBLIC_ID_PREFIXES
const publicId = await generateUniquePublicId(ctx, 'myNewTable');
//                                                   ^^^^^^^^^^^^
// Error: Argument of type '"myNewTable"' is not assignable to parameter of type 'PublicIdTable'
```

### Prefix Guidelines

**DO:**
- Use 3-5 lowercase characters
- Make it memorable and recognizable
- Use abbreviations: `emlog` (email log), `user` (user profile)
- Group related tables: `emlog`, `emtpl`, `emcfg` (all email-related)

**DON'T:**
- Use more than 5 characters (IDs get too long)
- Use special characters or numbers
- Duplicate existing prefixes
- Use generic prefixes like `tbl`, `rec`, `item`

### Example: Adding a New Table

**Step 1: Define schema with publicId**

```ts
// convex/schema/myModule/myTable.ts
export const myTableTable = defineTable({
  publicId: v.string(),  // ← Step 1: Add publicId field
  name: v.string(),
  // ... other fields
})
  .index('by_public_id', ['publicId'])  // ← Required index
```

**Step 2: Register in config**

```ts
// convex/shared/config/publicId.ts
export const PUBLIC_ID_PREFIXES = {
  myTable: 'mytbl',  // ← Step 2: Add table mapping
  // ... existing tables
} as const;
```

**Step 3: Use in mutation**

```ts
// convex/lib/myModule/mutations.ts
import { generateUniquePublicId } from '@/shared/utils/publicId';

export const createMyThing = mutation({
  handler: async (ctx, args) => {
    // ← Step 3: Generate publicId (type-safe!)
    const publicId = await generateUniquePublicId(ctx, 'myTable');

    const id = await ctx.db.insert('myTable', {
      publicId,
      name: args.name,
      // ... other fields
    });

    return id;
  },
});
```

### Verification

**Check type safety is working:**

```bash
grep "generateUniquePublicId" convex/lib/{module}/mutations.ts
# All calls should use table names from PUBLIC_ID_PREFIXES
```

**Check all tables with publicId are registered:**

```bash
# Find all tables with publicId field
grep -r "publicId: v.string()" convex/schema/

# Verify each is in PUBLIC_ID_PREFIXES
cat convex/shared/config/publicId.ts | grep -A 100 "PUBLIC_ID_PREFIXES"
```

---

## 📦 Metadata Pattern

### Default: Typed Metadata Per Table

**Rule:** Every table defines strongly-typed metadata in its validators.ts

**Never use `v.any()` or `v.optional(v.any())` for metadata**

### Pattern

1. Define `{module}Fields.{specificMetadata}` in validators.ts
2. Use that field in table definition
3. Types flow automatically through `Infer`

### Example

```ts
// validators.ts
export const projectFields = {
  projectMetadata: v.object({
    budget: v.optional(v.number()),
    deadline: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high')
    )),
    tags: v.optional(v.array(v.string())),
  }),
} as const;

// project.ts
metadata: v.optional(projectFields.projectMetadata),
```

### Benefits

✅ **Full type safety** - no more `any`
✅ **Self-documenting** - metadata schema is visible
✅ **Validation** - Convex validates structure
✅ **Discoverability** - IDE autocomplete works
✅ **Refactoring** - find all metadata usage easily

### Guidelines

**DO:**
- Define typed metadata for every table
- Keep metadata focused on operational/contextual data
- Use optional fields for flexibility
- Document what each metadata field is for
- Make metadata itself optional: `v.optional(fields.metadata)`

**DON'T:**
- Use `v.any()` or `v.optional(v.any())` for metadata
- Put core domain data in metadata (use proper fields instead)
- Make metadata required (always optional)
- Nest metadata too deeply (1-2 levels max)

### Special Cases

**Flexible key-value pairs:**

For change tracking or flexible data that needs type safety without `any`, use `metadataValue`:

```ts
// Better than v.any() - provides type safety while remaining flexible
const metadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({}) // For nested objects
);

// Use in record for key-value pairs
oldValues: v.optional(v.record(v.string(), metadataValue)),
newValues: v.optional(v.record(v.string(), metadataValue)),
```

**Truly unknown shapes (rare):**

If you genuinely cannot predict metadata structure (external webhooks, provider responses), use `v.any()` but document why:

```ts
// Only when shape is truly unbounded
providerResponse: v.optional(v.any()), // Provider-specific - shape varies by provider
```

But consider if you can at least type the common cases:

```ts
providerResponse: v.optional(v.union(
  v.object({ provider: v.literal('stripe'), ... }),
  v.object({ provider: v.literal('paypal'), ... }),
  v.any(), // fallback for unknown providers
)),
```

### Real Examples

**Email Logs:**
```ts
// validators.ts
logMetadata: v.object({
  source: v.optional(v.union(
    v.literal('system'),
    v.literal('user'),
    v.literal('webhook')
  )),
  operation: v.optional(v.string()),
  providerLatencyMs: v.optional(v.number()),
  retryCount: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
}),
```

**Audit Logs:**
```ts
// validators.ts

// Define metadataValue type for flexible but typed values
const metadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({}) // For nested objects
);

auditMetadata: v.object({
  operation: v.optional(v.string()),

  // Change tracking - better than using `any`
  oldValues: v.optional(v.record(v.string(), metadataValue)),
  newValues: v.optional(v.record(v.string(), metadataValue)),

  ipAddress: v.optional(v.string()),
  source: v.optional(v.union(
    v.literal('web'),
    v.literal('api'),
    v.literal('system')
  )),
}),
```

### Audit Log Metadata Patterns

The audit log metadata type supports **flexible operation-specific fields** through an index signature while maintaining type safety for predefined fields.

**Type Definition:**
```ts
// In auditLogs/helpers.ts
metadata?: {
  source?: string;
  operation?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;  // ← Allows operation-specific fields
};
```

**Standard Predefined Fields:**
- `operation`: 'create' | 'update' | 'delete' | 'reset' | 'soft_delete'
- `oldValues`: Previous state before update (Record<string, any>)
- `newValues`: New state after update (Record<string, any>)
- `source`: Where the action originated ('web', 'api', 'system')
- `ipAddress`: IP address of requester
- `userAgent`: Browser user agent

**Operation-Specific Fields:**
You can add any additional fields relevant to the operation. Common patterns:

```ts
// Update operations
metadata: {
  operation: 'update',
  oldValues: { theme: 'dark', language: 'en' },
  newValues: { theme: 'light', language: 'en' },
  changedFields: ['theme'],  // ← Operation-specific
}

// Reset operations
metadata: {
  operation: 'reset',
  oldValues: { ... },
  newValues: { ... },
}

// Delete operations
metadata: {
  operation: 'soft_delete',
  deletedSettings: { theme: 'dark', language: 'en' },  // ← Operation-specific
}

// Single field updates
metadata: {
  operation: 'update',
  settingKey: 'theme',  // ← Operation-specific
  oldValue: 'dark',
  newValue: 'light',
}

// Test operations
metadata: {
  operation: 'test_email_config',
  oldValues: { isVerified: false, lastTestStatus: 'pending' },
  newValues: { isVerified: true, lastTestStatus: 'success' },
  testDetails: {  // ← Operation-specific
    provider: 'sendgrid',
    success: true,
    error: null,
  },
}

// Toggle operations
metadata: {
  operation: 'update',
  modelId: 'model-xyz',  // ← Operation-specific
  action: 'add',  // ← Operation-specific
  oldValues: { favoriteModels: ['a', 'b'] },
  newValues: { favoriteModels: ['a', 'b', 'model-xyz'] },
}
```

**Best Practices:**
- Always include `operation` to identify the type of change
- Include `oldValues`/`newValues` for all updates (enables change tracking)
- Add operation-specific fields for additional context
- Keep field names descriptive and consistent within entity type
- Document what each operation-specific field represents

---

## 🐛 Troubleshooting (Full)

### 1. Builder type reassignment error

- Cause: `let q` then `q = q.withIndex(...)`
- Fix: build query in one expression (IIFE)

### 2. paginate cursor type error

- Fix: `cursor: cursor ?? null`

### 3. Entity not found after creation

- Cause: missing `await` on insert
- Fix: `const id = await ctx.db.insert(...)`

### 4. Owner can’t edit

- Cause: ownership check missing or after status checks
- Fix: check owner first in `canEdit`

### 5. `entityTitle` undefined in auditLogs

- Cause: using wrong field
- Fix: always use main display field

### 6. Circular dependency

- Cause: schema imports inside validators
- Fix: validators must never import schemas

### 7. Index not used / slow query

- Cause: using `.filter()` instead of `.withIndex()`
- Fix: use indexes first

### 8. Deleted items showing up

- Cause: missing `notDeleted` filter
- Fix: ensure all queries `.filter(notDeleted)`

### 9. Permission bypass in lists

- Cause: returning raw `.collect()` without filtering access
- Fix: apply `filter{Module}sByAccess` after pagination

### 10. SearchableText not updating in search results

- **Cause:** Forgot to rebuild searchableText in update mutation
- **Symptoms:** 
  - Search returns old content
  - Recently updated items don't appear in search
  - Search results seem stale
- **Fix:** Ensure update mutation calls `buildSearchableText()` and patches the field

```typescript
// ❌ BAD - forgot to update searchableText
await ctx.db.patch(id, {
  ...trimmed,
  updatedAt: now,
  updatedBy: user._id,
});

// ✅ GOOD - rebuild searchableText with current values
const searchableText = buildSearchableText({
  name: trimmed.name ?? existing.name,
  description: trimmed.description ?? existing.description,
  tags: trimmed.tags ?? existing.tags,
});

await ctx.db.patch(id, {
  ...trimmed,
  searchableText,  // ← Must include this!
  updatedAt: now,
  updatedBy: user._id,
});
```

- **Prevention:** Add to consistency checklist - grep for `buildSearchableText` in mutations

---

## ⚙️ Performance Optimization (Full)

### Index Strategy

- Use compound indexes for common combos
- Avoid redundant indexes

Example:

```ts
.index('by_owner_and_status', ['ownerId', 'status'])
```

### Query Optimization

- Avoid unbounded `.collect()` on large tables
- Paginate first, filter later
- Batch related lookups to avoid N+1

Example batch lookup:

```ts
const docs = await ctx.db.query('{tableName}').collect();
const ownerIds = [...new Set(docs.map(d => d.ownerId))];
const owners = await Promise.all(ownerIds.map(id => ctx.db.get(id)));
```

### Denormalize counts for hot paths

- Store cached counts on parent docs
- Update counts during mutations

### Performance Checklist

- No unbounded `.collect()`
- All frequent queries use indexes
- Lists paginate with cursors
- Avoid N+1 query loops
- Denormalize if counts are hot

---

## 📊 Quick Reference Tables

### Standard Indexes

- `by_public_id` - lookup public IDs
- `by_name` / `by_title` / `by_displayName` - lookup/search display field
- `by_owner_id` - ownership lists
- `by_deleted_at` - soft delete filtering
- `by_status` - status filters
- `by_owner_and_status` - ownership + status combined
- `by_created_at` - sort + paginate by time

### Standard Fields

- `publicId` - external identifier
- display field (`name` / `title` / `displayName`)
- `ownerId` - user who owns/manages the resource (domain tables only)
- `userId` - user who acted/performed action (log/event tables only)
- `status`
- audit fields

  - `createdAt`
  - `createdBy`
  - `updatedAt`
  - `updatedBy`
  - `deletedAt`
  - `deletedBy`

### Permission Patterns

- global permission gate: `requirePermission`
- entity access:

  - `canView{Module}`
  - `canEdit{Module}`
  - `canDelete{Module}`
  - `requireView{Module}Access`
  - `requireEdit{Module}Access`
  - `requireDelete{Module}Access`
- bulk access filter:

  - `filter{Module}sByAccess`

### Mutation Patterns

- CREATE: Auth → AuthZ → Trim → Validate → Insert → Audit → Return
- UPDATE: Auth → Check → Access → Trim → Validate → Patch → Audit → Return
- DELETE: Auth → Check → Access → Soft delete patch → Audit → Return
- BULK: Auth → AuthZ → Trim → Validate → Chunked apply → Audit → Return

---

## 💡 Tips & Tricks / Workflow

### New Module Scaffold

```bash
mkdir -p convex/schema/{category}/{entity}/{module}
touch convex/schema/{category}/{entity}/{module}/{module}.ts \
      convex/schema/{category}/{entity}/{module}/validators.ts \
      convex/schema/{category}/{entity}/{module}/types.ts \
      convex/schema/{category}/{entity}/{module}/schemas.ts \
      convex/schema/{category}/{entity}/{module}/index.ts

mkdir -p convex/lib/{category}/{entity}/{module}
touch convex/lib/{category}/{entity}/{module}/constants.ts \
      convex/lib/{category}/{entity}/{module}/types.ts \
      convex/lib/{category}/{entity}/{module}/utils.ts \
      convex/lib/{category}/{entity}/{module}/permissions.ts \
      convex/lib/{category}/{entity}/{module}/queries.ts \
      convex/lib/{category}/{entity}/{module}/mutations.ts \
      convex/lib/{category}/{entity}/{module}/index.ts
```

### Dev Flow

- Start with schema
- Register in schema.ts
- Add constants and types
- Add utils validation
- Add permissions
- Add queries (paginate early)
- Add mutations (audit + soft delete)
- Run consistency review

---

## 🎯 Quick Decision Matrix

Use this when starting a new module:

| Feature | Include If... | Skip If... |
|---------|--------------|------------|
| **searchableText field** | Users search text across multiple fields | Only filtering by exact values |
| **search_all index** | Dataset > 1K items with text search | Small dataset or no text search |
| **Field-specific indexes** | Power users need targeted search | General search is enough |
| **ownerId field** | Multi-tenant app, user-owned data | System-wide data (configs, settings) |
| **publicId field** | External references, API exposure | Internal-only entities |
| **by_owner_and_status index** | Common filter combination | Rarely filtered together |
| **Stats queries** | Dashboard needs metrics | Simple CRUD operations only |
| **Bulk operations** | Admin workflows, mass updates | Single-item operations only |

### Minimal Module (No Search)

```typescript
// Schema: Just the essentials
export const minimalTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  status: validators.status,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);

// Queries: Just core operations
- get{Module}s (with simple filtering)
- get{Module}
- get{Module}ByPublicId

// Mutations: Standard CRUD
- create{Module}
- update{Module}
- delete{Module}
```

### Full-Featured Module (With Search)

```typescript
// Schema: All features
export const fullTable = defineTable({
  name: v.string(),
  searchableText: v.string(),  // ← Added
  // ... all other fields
})
  .searchIndex('search_all', { ... })  // ← Added
  .index(/* all standard indexes */);

// Queries: Complete set
- get{Module}s
- search{Module}s  // ← Added
- get{Module}
- get{Module}ByPublicId
- get{Module}sByStatus
- get{Module}Stats

// Mutations: Full CRUD + Bulk
- create{Module} (with searchableText)
- update{Module} (with searchableText)
- delete{Module}
- bulkUpdate{Module}s
- bulkDelete{Module}s
```

---

## 📚 Reference Examples

- Freelancer Dashboard modules:

  - `convex/lib/software/freelancer_dashboard/`
  - Good example of multiple related modules and cascading permissions
- Simple module reference:

  - `convex/schema/addons/business/expenses/`
  - Clean minimum viable module
- User profiles / auth patterns:

  - `convex/lib/boilerplate/user_profiles/`
  - Role-based access

Key shared files:

- Auth helper: `convex/shared/auth.helper.ts`
- Shared validators: `convex/shared/validators.ts`
- Base validators: `convex/schema/base.validators.ts`
- PublicId utils: `convex/shared/utils/publicId.ts`

---

