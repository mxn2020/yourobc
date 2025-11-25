# Schema Implementation (Phase 1)

> Define your database structure, validators, and types before implementing any business logic.

## Table of Contents

- [Overview](#overview)
- [Implementation Steps](#implementation-steps)
- [File 1: validators.ts](#file-1-validatorsts)
- [File 2: {module}.ts](#file-2-modulets)
- [File 3: types.ts](#file-3-typests)
- [File 4: schemas.ts](#file-4-schemasts)
- [File 5: index.ts](#file-5-indexts)
- [Schema Registration](#schema-registration)
- [Required Fields](#required-fields)
- [Required Indexes](#required-indexes)
- [SearchIndex Decision Guide](#searchindex-decision-guide)
- [Quick Reference](#quick-reference)
- [Troubleshooting](#troubleshooting)
- [Appendix](#appendix)

---

## Overview

Schema implementation is **Phase 1** of module creation. This phase defines:

- Data structure (tables and fields)
- Validation rules (validators)
- Type definitions (TypeScript types)
- Database indexes for queries

### Why Schema First?

1. **Foundation**: Business logic depends on data structure
2. **Type Safety**: TypeScript types flow from schema
3. **Validation**: Convex validates data at runtime
4. **Performance**: Indexes must be defined upfront

### File Creation Order

```
1. validators.ts   → Define reusable validators
2. {module}.ts     → Define table with fields
3. types.ts        → Extract TypeScript types
4. schemas.ts      → Export for registration
5. index.ts        → Barrel exports
6. schema.ts       → Register in main schema
```

---

## Implementation Steps

### Step 1: Create Directory Structure

```bash
# Replace with your values
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

mkdir -p convex/schema/$CATEGORY/$ENTITY/$MODULE
cd convex/schema/$CATEGORY/$ENTITY/$MODULE
touch validators.ts ${MODULE}.ts types.ts schemas.ts index.ts
```

### Step 2: Implement Files in Order

Follow the sections below in sequence:

1. [validators.ts](#file-1-validatorsts)
2. [{module}.ts](#file-2-modulets)
3. [types.ts](#file-3-typests)
4. [schemas.ts](#file-4-schemasts)
5. [index.ts](#file-5-indexts)

### Step 3: Register Schema

See [Schema Registration](#schema-registration)

---

## File 1: validators.ts

### Purpose

Define grouped validators using `v.union()`, `v.object()`, etc. for reuse across schema and library.

### Rules

- ✅ **NO schema imports** (prevents circular dependencies)
- ✅ Only import `v` from `'convex/values'`
- ✅ Can import from `@/schema/base.validators` (**base.validators must also not import schema tables**)
- ✅ Export `{module}Validators` for unions
- ✅ Export `{module}Fields` for complex objects
- ❌ Optionality is **NOT** decided here

### Template

```typescript
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
  
  // Reuse from base validators
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
  
  // Reuse from base fields
  address: baseFields.address,
  contact: baseFields.contact,
  currencyAmount: baseFields.currencyAmount,
} as const;
```

### Real Example: Projects Module

```typescript
// convex/schema/software/freelancer_dashboard/projects/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';
import { PROJECTS_VALUES } from "@/lib/.../constants";

export const projectsValidators = {
  status: v.union(...PROJECTS_VALUES.status.map(v.literal)),
  priority: v.union(...PROJECTS_VALUES.priority.map(v.literal)),
  billingType: v.union(...PROJECTS_VALUES.billingType.map(v.literal)),
  currency: baseValidators.currency,
} as const;

export const projectsFields = {
  budget: v.object({
    amount: v.number(),
    currency: baseValidators.currency,
  }),
} as const;
```

### Common Patterns

**Status Enums**:
```typescript
status: v.union(
  v.literal('draft'),
  v.literal('active'),
  v.literal('archived')
)
```

**Priority Enums**:
```typescript
priority: v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high')
)
```

**Complex Objects**:
```typescript
metadata: v.object({
  key1: v.string(),
  key2: v.optional(v.number()),
  nested: v.object({
    field: v.boolean(),
  }),
})
```

---

## File 2: {module}.ts

### Purpose

Define database tables with `defineTable()`.

### Rules

- ✅ Optionality **IS** decided here with `v.optional()`
- ✅ Use validators from `./validators`
- ✅ Spread base audit fields
- ✅ Define required indexes
- ✅ Export `{module}Table`

### Template

```typescript
// convex/schema/{category}/{entity}/{module}/{module}.ts
// Table definitions for {module} module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { {module}Validators, {module}Fields } from './validators';

export const {module}Table = defineTable({
  // Main display field (choose one)
  name: v.string(),
  // OR: title: v.string(),
  // OR: displayName: v.string(),

  // Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who owns this resource

  // Denormalized search field (ONLY if a searchIndex exists).
  // If included, it is REQUIRED and must be set on create and recomputed on patch.
  searchableText: v.string(),  // ← Remove entirely if not using search

  // Module-specific fields
  description: v.optional(v.string()),
  status: {module}Validators.status,
  priority: v.optional({module}Validators.priority),
  visibility: v.optional({module}Validators.visibility),

  // Complex fields
  dimensions: v.optional({module}Fields.dimensions),

  // Optional relationships (only add if the domain requires them)
  parentId: v.optional(v.id('{tableName}')),      // only for hierarchical domains
  categoryId: v.optional(v.id('categories')),     // only if categorization exists

  // Tags
  tags: v.optional(v.array(v.string())),

  // Audit fields (required)
  ...auditFields,
  ...softDeleteFields,
})
  // Full-text search indexes (optional - see SearchIndex Decision Guide)
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  })

  // Standard indexes (required)
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])  // or by_title, by_displayName
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  
  // Common optional indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_owner_and_category', ['ownerId', 'categoryId'])
  .index('by_parent', ['parentId'])
  .index('by_category', ['categoryId'])
  .index('by_created_at', ['createdAt']);
```

### Real Example: Projects Module

```typescript
// convex/schema/software/freelancer_dashboard/projects/projects.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators, projectsFields } from './validators';

export const projectsTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  
  description: v.optional(v.string()),
  status: projectsValidators.status,
  priority: v.optional(projectsValidators.priority),
  
  clientId: v.optional(v.id('freelancerClients')),
  
  budget: v.optional(projectsFields.budget),
  startDate: v.optional(v.number()),
  deadline: v.optional(v.number()),
  
  tags: v.optional(v.array(v.string())),
  
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_owner_and_client', ['ownerId', 'clientId'])
  .index('by_created_at', ['createdAt']);
```

---

## File 3: types.ts

### Purpose

Extract TypeScript types from validators using `Infer`.

### Rules

- ✅ Only import from `./validators`
- ✅ Use `Infer` from `convex/values`
- ✅ Export types with `{Module}` prefix
- ❌ No business logic here

### Template

```typescript
// convex/schema/{category}/{entity}/{module}/types.ts
// Type extractions from validators for {module} module

import { Infer } from 'convex/values';
import { {module}Validators, {module}Fields } from './validators';

export type {Module}Status = Infer<typeof {module}Validators.status>;
export type {Module}Priority = Infer<typeof {module}Validators.priority>;
export type {Module}Visibility = Infer<typeof {module}Validators.visibility>;
export type {Module}Dimensions = Infer<typeof {module}Fields.dimensions>;
```

### Real Example: Projects Module

```typescript
// convex/schema/software/freelancer_dashboard/projects/types.ts
import { Infer } from 'convex/values';
import { projectsValidators, projectsFields } from './validators';

export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectBillingType = Infer<typeof projectsValidators.billingType>;
export type ProjectBudget = Infer<typeof projectsFields.budget>;
```

---

## File 4: schemas.ts

### Purpose

Export schema objects for registration in main `schema.ts`.

### Rules

- ✅ Import table from `./{module}`
- ✅ Export as `{category}{Entity}{Module}Schemas`
- ✅ Use object with `{tableName}` key

### Template

```typescript
// convex/schema/{category}/{entity}/{module}/schemas.ts
// Schema exports for {module} module

import { {module}Table } from './{module}';

export const {category}{Entity}{Module}Schemas = {
  {tableName}: {module}Table,
};
```

### Real Example: Projects Module

```typescript
// convex/schema/software/freelancer_dashboard/projects/schemas.ts
import { projectsTable } from './projects';

export const softwareFreelancerDashboardProjectsSchemas = {
  freelancerProjects: projectsTable,
};
```

### Multi-Table Example

```typescript
// convex/schema/addons/email/schemas.ts
import { emailLogsTable } from './email_logs';
import { emailTemplatesTable } from './email_templates';
import { emailConfigsTable } from './email_configs';

export const addonsEmailSchemas = {
  emailLogs: emailLogsTable,
  emailTemplates: emailTemplatesTable,
  emailConfigs: emailConfigsTable,
};
```

---

## File 5: index.ts

### Purpose

Barrel exports for public schema API.

### Template

```typescript
// convex/schema/{category}/{entity}/{module}/index.ts
// Public schema exports for {module} module

export * from './validators';
export * from './types';
export * from './schemas';
```

---

## Schema Registration

### Main Schema File

**Location**: `convex/schema.ts`

**Add your module schemas**:

```typescript
// convex/schema.ts
import { defineSchema } from 'convex/server';

// Import your module schemas
import { {category}{Entity}{Module}Schemas } from './schema/{category}/{entity}/{module}/schemas';

export default defineSchema({
  // Spread your module schemas
  ...{category}{Entity}{Module}Schemas,
  
  // Other module schemas
  // ...otherModuleSchemas,
});
```

### Real Example

```typescript
// convex/schema.ts
import { defineSchema } from 'convex/server';
import { softwareFreelancerDashboardProjectsSchemas } from './schema/software/freelancer_dashboard/projects/schemas';
import { softwareFreelancerDashboardClientsSchemas } from './schema/software/freelancer_dashboard/clients/schemas';
import { addonsEmailSchemas } from './schema/addons/email/schemas';

export default defineSchema({
  ...softwareFreelancerDashboardProjectsSchemas,
  ...softwareFreelancerDashboardClientsSchemas,
  ...addonsEmailSchemas,
  // ... other schemas
});
```

---

## Required Fields

Every table **MUST** include these fields unless explicitly exempt. If exempt, document why at the top of the table file.  
**Default invariant:** all reads exclude soft-deleted docs (`deletedAt` is undefined) unless a query explicitly targets deleted items.

### Core Fields

| Field | Type | Purpose | Required |
|-------|------|---------|----------|
| Display field | `v.string()` | Main identifier | ✅ Yes |
| `publicId` | `v.string()` | External reference | ✅ Yes |
| `ownerId` | `v.id('userProfiles')` | Resource owner | ✅ Yes (domain tables) |

### Display Field (Choose One)

Pick the most appropriate for your domain:

- `name: v.string()` - Most common (projects, clients, products)
- `title: v.string()` - Content/documents (articles, posts, pages)
- `displayName: v.string()` - User-facing names (profiles, categories)

### Audit Fields (Always Required)

Spread these fields in every table:

```typescript
import { auditFields, softDeleteFields } from '@/schema/base';

defineTable({
  // ... your fields
  
  ...auditFields,      // createdAt, createdBy, updatedAt, updatedBy
  ...softDeleteFields, // deletedAt, deletedBy
})
```

**What's included**:

```typescript
// auditFields
createdAt: v.number()     // Timestamp of creation (ms since epoch, UTC)
createdBy: v.id('userProfiles')  // User who created
updatedAt: v.number()     // Timestamp of last update (ms since epoch, UTC)
updatedBy: v.optional(v.id('userProfiles'))  // User who updated

// softDeleteFields
deletedAt: v.optional(v.number())  // Timestamp of deletion
deletedBy: v.optional(v.id('userProfiles'))  // User who deleted
```

### OwnerId vs UserId

**Use `ownerId`** for:
- Domain tables where users own/manage resources
- Multi-tenant data (projects, clients, invoices)
- Resources with access control

**Use `userId`** for:
- Log tables where you track who performed an action
- Event tables (audit logs, activity logs)
- System tables tracking user actions

**Example**:
```typescript
// Domain table - use ownerId
defineTable({
  name: v.string(),
  ownerId: v.id('userProfiles'), // Who owns this project
  // ...
})

// Log table - use userId
defineTable({
  action: v.string(),
  userId: v.id('userProfiles'), // Who performed this action
  // ...
})
```

---

## Required Indexes

### Standard Indexes (Always Include)

| Index Name | Fields | Purpose |
|------------|--------|---------|
| `by_public_id` | `['publicId']` | Lookup by external ID. **`publicId` must be unique per table and is enforced at the app level via `generateUniquePublicId` (Convex indexes are not uniqueness constraints).** |
| `by_name` | `['name']` | Lookup by display field |
| `by_owner_id` | `['ownerId']` | Filter by owner |
| `by_deleted_at` | `['deletedAt']` | Soft delete filtering |

**Alternative names** (use display field):
- `by_name` for `name` field
- `by_title` for `title` field
- `by_displayName` for `displayName` field

### Common Optional Indexes

Add these based on your query patterns:

| Index Name | Fields | When to Use |
|------------|--------|-------------|
| `by_status` | `['status']` | Filter by status |
| `by_owner_and_status` | `['ownerId', 'status']` | Combined filter (common) |
| `by_owner_and_category` | `['ownerId', 'categoryId']` | Category filtering |
| `by_parent` | `['parentId']` | Hierarchical data |
| `by_category` | `['categoryId']` | Category-only filter |
| `by_created_at` | `['createdAt']` | Sort by creation time |

### Index Naming Convention

**Legacy** (deprecated):
- `by_owner` ❌
- `by_created` ❌

**Current** (use these):
- `by_owner_id` ✅
- `by_created_at` ✅

**Pattern**: `by_{field_name}` where field_name matches the actual field

---

## SearchIndex Decision Guide

### Should You Add Search Indexes?

```
Do users need to search text content?
├─ NO → Skip search indexes entirely
│   - Remove searchableText field
│   - Remove all .searchIndex() definitions
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
        - Keep simple string filtering in queries
        - Good for small datasets (<1000 items)
        - Lower overhead, simpler code
```

### Search Index Patterns

**Pattern 1: No Search (Recommended Start)**

```typescript
export const projectsTable = defineTable({
  name: v.string(),
  // NO searchableText field
  description: v.optional(v.string()),
  // ... other fields
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  // ... NO .searchIndex() definitions
```

**Pattern 2: Single Combined Search**
Use this only when users truly need full-text search. Keep `searchableText` compact (avoid huge blobs), lower-case + trim it in helpers, and remember: **search index builders only support equality filters (`eq`) plus `search()` — range filters don’t work there.**

```typescript
export const projectsTable = defineTable({
  name: v.string(),
  searchableText: v.string(),  // ← Add this (required when searchIndex exists)
  // Canonical search filter later must include: .eq('deletedAt', undefined)
  description: v.optional(v.string()),
  // ... other fields
})
  .searchIndex('search_all', {  // ← Add this
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  })
  .index('by_public_id', ['publicId'])
  // ... other indexes
```

**Pattern 3: Field-Specific Search (Advanced)**

```typescript
export const projectsTable = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  // ... other fields
})
  // Separate index for each searchable field
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
  // ... standard indexes
```

---

## Quick Reference

### Schema Implementation Checklist

**validators.ts**:
- [ ] Import `v` from `convex/values`
- [ ] Define `{module}Validators` for unions
- [ ] Define `{module}Fields` for objects
- [ ] Export with `as const`
- [ ] No schema imports

**{module}.ts**:
- [ ] Import `defineTable`, `v`, audit fields
- [ ] Import validators from `./validators`
- [ ] Define main display field (name/title/displayName)
- [ ] Add `publicId`, `ownerId`
- [ ] Add module-specific fields
- [ ] Spread `...auditFields`, `...softDeleteFields`
- [ ] Add all required indexes
- [ ] Export as `{module}Table`

**types.ts**:
- [ ] Import `Infer` from `convex/values`
- [ ] Import validators from `./validators`
- [ ] Extract all enum/object types

**schemas.ts**:
- [ ] Import table from `./{module}`
- [ ] Export as `{category}{Entity}{Module}Schemas`
- [ ] Use correct `{tableName}` key

**index.ts**:
- [ ] Export all from validators, types, schemas

**schema.ts** (registration):
- [ ] Import schemas from module
- [ ] Spread into `defineSchema()`

### Index Strategy

**Use compound indexes** for common filter combinations:
```typescript
.index('by_owner_and_status', ['ownerId', 'status'])
```

**Order matters** — Convex only uses compound index prefixes, so put the equality filter field(s) first (usually most selective). **Range filters (`gte`, `lte`) must be applied to the *last* field of an index.** If you need date-range queries, make sure the ranged field is last (or use a single-field index like `by_created_at: ['createdAt']`).
```typescript
// ✅ Good - userId is most selective
.index('by_user_and_date', ['userId', 'createdAt'])

// ❌ Less efficient - date is less selective
.index('by_date_and_user', ['createdAt', 'userId'])
```

---

## Troubleshooting

### Error: Circular Dependency

**Problem**: `validators.ts` imports from schema file

**Solution**: Validators must NEVER import schemas
```typescript
// ❌ Wrong
import { projectsTable } from './projects';

// ✅ Correct
import { v } from 'convex/values';
```

### Error: Table Not Found

**Problem**: Forgot to register in `schema.ts`

**Solution**: Import and spread schemas
```typescript
import { {category}{Entity}{Module}Schemas } from './schema/...';

export default defineSchema({
  ...{category}{Entity}{Module}Schemas,
});
```

### Error: Index Already Exists

**Problem**: Duplicate index name

**Solution**: Check all indexes have unique names
```bash
grep "\.index(" convex/schema/{category}/{entity}/{module}/{module}.ts
```

### Warning: Missing Required Field

**Problem**: Table missing publicId, ownerId, or audit fields

**Solution**: Review [Required Fields](#required-fields) section

### Error: Invalid Validator

**Problem**: Using wrong validator type

**Solution**: Check validator syntax
```typescript
// ❌ Wrong
status: v.union('active', 'archived')

// ✅ Correct
status: v.union(
  v.literal('active'),
  v.literal('archived')
)
```

---

## Appendix

### A. Base Validators Reference

**Location**: `convex/schema/base.validators.ts`

**Available validators**:
```typescript
baseValidators.currency
baseValidators.serviceType
baseValidators.contactRole
baseValidators.documentType
```

**Available fields**:
```typescript
baseFields.address
baseFields.contact
baseFields.currencyAmount
baseFields.metadata
```

### B. Audit Fields Definition

```typescript
// convex/schema/base.ts
export const auditFields = {
  createdAt: v.number(),
  createdBy: v.id('userProfiles'),
  updatedAt: v.number(),
  updatedBy: v.optional(v.id('userProfiles')),
};

export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.id('userProfiles')),
};
```

### C. Real Module Examples

**Simple Module** (single table):
```
convex/schema/software/freelancer_dashboard/projects/
├── validators.ts
├── projects.ts
├── types.ts
├── schemas.ts
└── index.ts
```

**Complex Module** (multiple tables):
```
convex/schema/addons/email/
├── email_logs/
│   ├── validators.ts
│   ├── email_logs.ts
│   ├── types.ts
│   └── index.ts
├── email_templates/
│   └── [same structure]
├── schemas.ts  # Combined export
└── index.ts
```

### D. Schema Best Practices

1. **Keep validators pure** - no business logic
2. **Use descriptive names** - `projectStatus` not just `status`
3. **Group related fields** - use objects for addresses, contacts
4. **Plan indexes early** - based on expected queries
5. **Document exemptions** - if skipping required fields
6. **Use base validators** - don't duplicate common patterns
7. **Start simple** - add search indexes later if needed

### E. Migration Guide

**When changing schema**:

1. **Add new optional field**:
   ```typescript
   newField: v.optional(v.string())
   ```

2. **Deploy and backfill**:
   ```typescript
   // migration.ts
   const docs = await ctx.db.query('tableName').collect();
   for (const doc of docs) {
     await ctx.db.patch(doc._id, {
       newField: 'default_value',
     });
   }
   ```

3. **Make field required**:
   ```typescript
   newField: v.string()  // Remove v.optional()
   ```

**Never**:
- Delete fields (soft delete instead)
- Change field types (add new field instead)
- Remove indexes still in use

---

**Next Document**: [03 - Library Implementation →](./03-library-implementation.md)
