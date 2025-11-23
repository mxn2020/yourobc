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
   - `ownerId: v.id('userProfiles')`

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
  ownerId: v.id('userProfiles'),

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
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_parent', ['parentId'])
  .index('by_category', ['categoryId']);
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
  const trimmed = { ...data };

  if ('name' in trimmed && trimmed.name)
    trimmed.name = trimmed.name.trim() as any;

  if ('description' in trimmed && trimmed.description)
    trimmed.description = trimmed.description.trim() as any;

  if ('tags' in trimmed && trimmed.tags)
    trimmed.tags = trimmed.tags.map(t => t.trim()) as any;

  return trimmed;
}

export function validate{Module}Data(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) errors.push('Name is required');
    if (name.length < {MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH)
      errors.push(`Name must be at least ${MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH} chars`);
    if (name.length > {MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH)
      errors.push(`Name cannot exceed ${MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH} chars`);
  }

  if (data.description !== undefined && data.description.trim()) {
    if (data.description.trim().length > {MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH)
      errors.push(`Description too long`);
  }

  if (data.tags) {
    if (data.tags.length > {MODULE}_CONSTANTS.LIMITS.MAX_TAGS)
      errors.push(`Too many tags`);
    if (data.tags.some(t => !t.trim()))
      errors.push(`Tags cannot be empty`);
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
- `.filter(notDeleted)` everywhere
- Cursor pagination default
- `cursor ?? null`
- No builder-type reassignment
- Indexed filters before pagination
- Permission filtering on the page only

```ts
// convex/lib/{category}/{entity}/{module}/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { filter{Module}sByAccess, requireView{Module}Access } from './permissions';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';

export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filters: v.optional(v.object({
      status: v.optional(v.array({module}Validators.status)),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor, filters = {} } = args;

    const q = (() => {
      if (filters.status?.length === 1) {
        return ctx.db
          .query('{tableName}')
          .withIndex('by_owner_and_status', iq =>
            iq.eq('ownerId', user._id).eq('status', filters.status![0])
          )
          .filter(notDeleted);
      }

      return ctx.db
        .query('{tableName}')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);
    })();

    const page = await q.order('desc').paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    let items = await filter{Module}sByAccess(ctx, page.page, user);

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

export const get{Module} = query({
  args: { id: v.id('{tableName}') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const doc = await ctx.db.get(id);

    if (!doc || doc.deletedAt) throw new Error('Not found');

    await requireView{Module}Access(ctx, doc, user);
    return doc;
  },
});
```

**Search guidance (scalable)**

- For large datasets avoid `.collect()`/in-memory search
- Prefer:

  - Convex search indexes
  - Prefix indexes on normalized fields (`nameLower`, `slug`)
  - Denormalized searchable field + index

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
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { {MODULE}_CONSTANTS } from './constants';
import { trim{Module}Data, validate{Module}Data } from './utils';
import { requireEdit{Module}Access, requireDelete{Module}Access } from './permissions';

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

    const id = await ctx.db.insert('{tableName}', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      status: trimmed.status ?? 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

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
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

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
- `ownerId`
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

