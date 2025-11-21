# Convex Backend Implementation Guide

> Complete reference for implementing Convex modules with the standardized template system.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Module Structure](#module-structure)
3. [Implementation Steps](#implementation-steps)
4. [Schema Files](#schema-files)
5. [Library Files](#library-files)
6. [Consistency Review](#consistency-review)
7. [Security & Permissions](#security--permissions)
8. [Common Operations](#common-operations)
9. [Troubleshooting](#troubleshooting)
10. [Performance Optimization](#performance-optimization)

---

## 🚀 Quick Start

### Module File Structure

Every module follows this standard structure:

```
convex/
├── schema/
│   └── {category}/
│       └── {entity}/
│           └── {module}/
│               ├── {module}.ts       # Table definitions
│               ├── {sub_module}.ts   # Additional tables (if needed)
│               ├── validators.ts     # Grouped validators
│               ├── types.ts         # Type extractions
│               ├── schemas.ts       # Schema exports
│               └── index.ts        # Public API exports
│
└── lib/
    └── {category}/
        └── {entity}/
            └── {module}/
                ├── constants.ts     # Business constants
                ├── types.ts        # TypeScript types
                ├── utils.ts        # Validation & helpers
                ├── permissions.ts  # Authorization logic
                ├── queries.ts      # Read operations
                ├── mutations.ts    # Write operations
                └── index.ts        # Public API exports
```

### Categories

- `addons` - Reusable tools/features
- `apps` - Full applications
- `external` - Client projects
- `games` - Game projects
- `software` - Business software

### Search & Replace Placeholders

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `{category}` | Category name | `software`, `addons`, `games` |
| `{entity}` | Entity name | `freelancer_dashboard`, `chess` |
| `{module}` | Module name | `projects`, `clients`, `invoices` |
| `{Module}` | PascalCase module | `Projects`, `Clients`, `Invoices` |
| `{MODULE}` | SCREAMING_SNAKE | `PROJECTS`, `CLIENTS`, `INVOICES` |
| `{tableName}` | Full table name | `freelancerProjects`, `chessGames` |

---

## 📁 Module Structure

### Schema Directory (`convex/schema/{category}/{entity}/{module}/`)

```
{module}/
├── {module}.ts          # Table definitions with validators
├── {sub_module}.ts      # Additional tables (if needed)
├── validators.ts        # Grouped validators (v.union, etc.)
├── types.ts            # Type extractions from validators
├── schemas.ts          # Schema export objects
└── index.ts          # Public API barrel exports
```

### Library Directory (`convex/lib/{category}/{entity}/{module}/`)

```
{module}/
├── constants.ts         # Business constants, limits, permissions
├── types.ts            # TypeScript interfaces and types
├── utils.ts            # Validation functions and helpers
├── permissions.ts      # Access control logic (optional)
├── queries.ts          # Read operations
├── mutations.ts        # Write operations
└── index.ts            # Public API barrel exports
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
18. Review string trimming on all text inputs
19. Confirm soft delete implementation
20. Test all CRUD operations

---

## 📋 Schema Files

### Required Fields for All Tables

Every table MUST include:

1. **Main Display Field** (choose one):
   - `name: v.string()` - Users, products, categories, organizations
   - `title: v.string()` - Posts, projects, tasks, invoices, proposals
   - `displayName: v.string()` - When "name" is ambiguous

2. **Core Fields**:
   - `publicId: v.string()` - External identifier
   - `ownerId: v.id('userProfiles')` - Entity owner

3. **Audit Fields** (spread from base):
   - `...auditFields` - createdAt, createdBy, updatedAt, updatedBy
   - `...softDeleteFields` - deletedAt, deletedBy

4. **Required Indexes**:
   - `by_public_id` - `['publicId']`
   - `by_name` (or `by_title`/`by_displayName`) - `['name']`
   - `by_owner` - `['ownerId']`
   - `by_deleted_at` - `['deletedAt']`

### File Conventions

All schema files start with:
```typescript
// convex/schema/{category}/{entity}/{module}/{filename}.ts
// {Brief description of file purpose}

```

---

### 1. validators.ts

**Purpose:** Define grouped validators using `v.union()`, `v.object()`, etc.

**Key Points:**
- NO schema imports (prevents circular dependencies)
- Only import `v` from `'convex/values'`
- Export as `{module}Validators` constant
- Use for status, priority, visibility, category fields

```typescript
// convex/schema/{category}/{entity}/{module}/validators.ts
// Grouped validators for {module} module

import { v } from 'convex/values';

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
} as const;
```

---

### 2. {module}.ts

**Purpose:** Define database tables with `defineTable()`.

**Key Points:**
- Import validators from `./validators`
- Import base fields from `@/schema/base`
- Use validators for union type fields
- Define all required indexes
- Export as `{module}Table`

```typescript
// convex/schema/{category}/{entity}/{module}/{module}.ts
// Table definitions for {module} module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { {module}Validators } from './validators';

export const {module}Table = defineTable({
  // Required: Main display field
  name: v.string(), // or title, displayName
  
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  
  // Module-specific fields
  description: v.optional(v.string()),
  status: {module}Validators.status,
  priority: v.optional({module}Validators.priority),
  visibility: v.optional({module}Validators.visibility),
  
  // Module-specific relations
  parentId: v.optional(v.id('{tableName}')),
  categoryId: v.optional(v.id('categories')),
  
  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name']) // or by_title, by_displayName
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  
  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_parent', ['parentId'])
  .index('by_category', ['categoryId']);
```

---

### 3. types.ts

**Purpose:** Extract TypeScript types from validators.

**Key Points:**
- Import `Infer` from `'convex/values'`
- Import validators from `./validators`
- Use `Infer<typeof validator>` for type extraction
- NO schema imports here

```typescript
// convex/schema/{category}/{entity}/{module}/types.ts
// Type extractions from validators for {module} module

import { Infer } from 'convex/values';
import { {module}Validators } from './validators';

// Extract types from validators
export type {Module}Status = Infer<typeof {module}Validators.status>;
export type {Module}Priority = Infer<typeof {module}Validators.priority>;
export type {Module}Visibility = Infer<typeof {module}Validators.visibility>;
```

---

### 4. schemas.ts

**Purpose:** Export schema objects for registration.

**Key Points:**
- Import table definitions from `./{module}`
- Export as `{category}{Entity}{Module}Schemas`
- Used in main `schema.ts` registration

```typescript
// convex/schema/{category}/{entity}/{module}/schemas.ts
// Schema exports for {module} module

import { {module}Table } from './{module}';

export const {category}{Entity}{Module}Schemas = {
  {tableName}: {module}Table,
};
```

---

### Schema Registration

After creating schema files, register in main schema:

```typescript
// convex/schema.ts
import { defineSchema } from 'convex/server';
import { {category}{Entity}{Module}Schemas } from './schema/{category}/{entity}/{module}/schemas';

export default defineSchema({
  ...{category}{Entity}{Module}Schemas,
  // ... other schemas
});
```

---

## 📚 Library Files

### File Conventions

All library files start with:
```typescript
// convex/lib/{category}/{entity}/{module}/{filename}.ts
// {Brief description of file purpose}

```

---

### 1. constants.ts

**Purpose:** Define business constants, permissions, limits, and validation rules.

**Key Points:**
- Export as `{MODULE}_CONSTANTS` in SCREAMING_SNAKE_CASE
- Include PERMISSIONS, STATUS (mirrors validators), LIMITS
- Use `as const` for type safety
- Reference in validation and authorization

```typescript
// convex/lib/{category}/{entity}/{module}/constants.ts
// Business constants, permissions, and limits for {module} module

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
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MIN_NAME_LENGTH: 3,
    MAX_TAGS: 10,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
} as const;
```

---

### 2. types.ts

**Purpose:** Define TypeScript interfaces and types for the module.

**Key Points:**
- Import Doc and Id from `@/generated/dataModel`
- Import schema types from `@/schema/{category}/{entity}/{module}/types`
- Define interfaces for Create/Update data
- Define response types

```typescript
// convex/lib/{category}/{entity}/{module}/types.ts
// TypeScript type definitions for {module} module

import type { Doc, Id } from '@/generated/dataModel';
import type { {Module}Status, {Module}Priority, {Module}Visibility } from '@/schema/{category}/{entity}/{module}/types';

// Entity types
export type {Module} = Doc<'{tableName}'>;
export type {Module}Id = Id<'{tableName}'>;

// Data interfaces
export interface Create{Module}Data {
  name: string; // Main display field (required)
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

// Response types
export interface {Module}WithRelations extends {Module} {
  parent?: {Module} | null;
  children?: {Module}[];
  category?: Doc<'categories'> | null;
}

export interface {Module}ListResponse {
  items: {Module}[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface {Module}Filters {
  status?: {Module}Status[];
  priority?: {Module}Priority[];
  visibility?: {Module}Visibility[];
  search?: string;
  categoryId?: Id<'categories'>;
  parentId?: {Module}Id;
}
```

---

### 3. utils.ts

**Purpose:** Implement validation functions and helper utilities.

**Key Points:**
- Import constants from `./constants`
- Return `string[]` for validation errors
- Include formatting and transformation helpers
- Keep functions pure (no side effects)

```typescript
// convex/lib/{category}/{entity}/{module}/utils.ts
// Validation functions and utility helpers for {module} module

import { {MODULE}_CONSTANTS } from './constants';
import type { Create{Module}Data, Update{Module}Data } from './types';

/**
 * Validate {module} data for creation/update
 */
export function validate{Module}Data(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    
    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < {MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > {MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!{MODULE}_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > {MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > {MODULE}_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${MODULE}_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }
    
    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Format {module} display name
 */
export function format{Module}DisplayName({module}: { name: string; status?: string }): string {
  const statusBadge = {module}.status ? ` [${module}.status]` : '';
  return `${module}.name${statusBadge}`;
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if {module} is editable
 */
export function is{Module}Editable({module}: { status: string; deletedAt?: number }): boolean {
  if ({module}.deletedAt) return false;
  return {module}.status !== 'completed' && {module}.status !== 'archived';
}
```

---

### 4. permissions.ts

**Purpose:** Implement authorization logic with modular access checks.

**Key Points:**
- Separate `can*` and `require*` functions
- Create filter functions for bulk access control
- Check ownership, admin role, visibility
- Keep consistent patterns across all entities
- Support related entity access (e.g., invoice via project)

```typescript
// convex/lib/{category}/{entity}/{module}/permissions.ts
// Access control and authorization logic for {module} module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { {Module} } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// View Access
// ============================================================================

export async function canView{Module}(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Public visibility
  if ('visibility' in {module} && {module}.visibility === 'public') return true;

  // Owner can view
  if ('ownerId' in {module} && {module}.ownerId === user._id) return true;

  // Creator can view
  if ({module}.createdBy === user._id) return true;

  // Team visibility - check membership (if applicable)
  if ('visibility' in {module} && {module}.visibility === 'team') {
    // Implement team membership check here
    // Example: check if user is member of related entity
  }

  return false;
}

export async function requireView{Module}Access(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canView{Module}(ctx, {module}, user))) {
    throw new Error('You do not have permission to view this {module}');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

export async function canEdit{Module}(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if ({module}.ownerId === user._id) return true;

  // Check if {module} is locked/completed
  if ({module}.status === 'completed' || {module}.status === 'archived') {
    // Only admins can edit completed/archived items
    return false;
  }

  return false;
}

export async function requireEdit{Module}Access(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canEdit{Module}(ctx, {module}, user))) {
    throw new Error('You do not have permission to edit this {module}');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

export async function canDelete{Module}(
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if ({module}.ownerId === user._id) return true;
  return false;
}

export async function requireDelete{Module}Access(
  {module}: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canDelete{Module}({module}, user))) {
    throw new Error('You do not have permission to delete this {module}');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filter{Module}sByAccess(
  ctx: QueryCtx | MutationCtx,
  {module}s: {Module}[],
  user: UserProfile
): Promise<{Module}[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return {module}s;
  }

  const accessible: {Module}[] = [];

  for (const {module} of {module}s) {
    if (await canView{Module}(ctx, {module}, user)) {
      accessible.push({module});
    }
  }

  return accessible;
}
```

**Pattern for Related Entity Access:**

When entities have relationships (e.g., invoices belong to projects), add cascading access checks:

```typescript
export async function canViewInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Standard checks
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (invoice.ownerId === user._id) return true;

  // Check related project access
  if (invoice.projectId) {
    const project = await ctx.db.get(invoice.projectId);
    if (project && await canViewProject(ctx, project, user)) {
      return true;
    }
  }

  // Check related client access
  const client = await ctx.db.get(invoice.clientId);
  if (client && await canViewClient(ctx, client, user)) {
    return true;
  }

  return false;
}
```

---

### 5. queries.ts

**Purpose:** Implement read operations (get, list, search, filter).

**Key Points:**
- Always authenticate with `requireCurrentUser`
- Filter by `deletedAt` (soft delete)
- Apply permission checks via filter functions
- Use indexes for performance
- Return consistent response types

```typescript
// convex/lib/{category}/{entity}/{module}/queries.ts
// Read operations for {module} module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { filter{Module}sByAccess } from './permissions';
import type { {Module}ListResponse, {Module}Filters } from './types';

/**
 * Get paginated list of {module}s with filtering
 */
export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array({module}Validators.status)),
      priority: v.optional(v.array({module}Validators.priority)),
      visibility: v.optional(v.array({module}Validators.visibility)),
      search: v.optional(v.string()),
      categoryId: v.optional(v.id('categories')),
      parentId: v.optional(v.id('{tableName}')),
    })),
  },
  handler: async (ctx, args): Promise<{Module}ListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let {module}s = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    {module}s = await filter{Module}sByAccess(ctx, {module}s, user);

    // Apply status filter
    if (filters.status?.length) {
      {module}s = {module}s.filter(item => 
        filters.status!.includes(item.status)
      );
    }

    // Apply priority filter
    if (filters.priority?.length) {
      {module}s = {module}s.filter(item => 
        item.priority && filters.priority!.includes(item.priority)
      );
    }

    // Apply visibility filter
    if (filters.visibility?.length) {
      {module}s = {module}s.filter(item => 
        item.visibility && filters.visibility!.includes(item.visibility)
      );
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      {module}s = {module}s.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (filters.categoryId) {
      {module}s = {module}s.filter(item => item.categoryId === filters.categoryId);
    }

    // Apply parent filter
    if (filters.parentId) {
      {module}s = {module}s.filter(item => item.parentId === filters.parentId);
    }

    // Paginate
    const total = {module}s.length;
    const items = {module}s.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single {module} by ID
 */
export const get{Module} = query({
  args: {
    {module}Id: v.id('{tableName}'),
  },
  handler: async (ctx, { {module}Id }) => {
    const user = await requireCurrentUser(ctx);
    
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, {module}, user);

    return {module};
  },
});

/**
 * Get {module} by public ID
 */
export const get{Module}ByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const {module} = await ctx.db
      .query('{tableName}')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!{module}) {
      throw new Error('{Module} not found');
    }

    await requireView{Module}Access(ctx, {module}, user);

    return {module};
  },
});

/**
 * Get {module} statistics
 */
export const get{Module}Stats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const {module}s = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filter{Module}sByAccess(ctx, {module}s, user);

    return {
      total: accessible.length,
      byStatus: {
        active: accessible.filter(item => item.status === 'active').length,
        archived: accessible.filter(item => item.status === 'archived').length,
        completed: accessible.filter(item => item.status === 'completed').length,
      },
      byPriority: {
        low: accessible.filter(item => item.priority === 'low').length,
        medium: accessible.filter(item => item.priority === 'medium').length,
        high: accessible.filter(item => item.priority === 'high').length,
        urgent: accessible.filter(item => item.priority === 'urgent').length,
      },
    };
  },
});
```

---

### 6. mutations.ts

**Purpose:** Implement write operations (create, update, delete).

**Key Points:**
- Always authenticate and authorize
- Validate all inputs
- Trim all string inputs
- Generate publicId for new entities
- Create audit logs for all operations
- Use soft delete (never hard delete)
- Return entity ID consistently

```typescript
// convex/lib/{category}/{entity}/{module}/mutations.ts
// Write operations for {module} module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
import { {MODULE}_CONSTANTS } from './constants';
import { validate{Module}Data } from './utils';
import { requireEdit{Module}Access, requireDelete{Module}Access } from './permissions';
import type { {Module}Id } from './types';

/**
 * Create new {module}
 */
export const create{Module} = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      visibility: v.optional({module}Validators.visibility),
      parentId: v.optional(v.id('{tableName}')),
      categoryId: v.optional(v.id('categories')),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }): Promise<{Module}Id> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validate{Module}Data(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, '{tableName}');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const {module}Id = await ctx.db.insert('{tableName}', {
      publicId,
      name: data.name.trim(),
      description: data.description?.trim(),
      status: data.status || 'active',
      priority: data.priority,
      visibility: data.visibility || 'private',
      parentId: data.parentId,
      categoryId: data.categoryId,
      tags: data.tags?.map(tag => tag.trim()),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.created',
      entityType: 'system_{module}',
      entityId: publicId,
      entityTitle: data.name.trim(), // Use main display field
      description: `Created {module}: ${data.name.trim()}`,
      metadata: {
        status: data.status || 'active',
        visibility: data.visibility || 'private',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return {module}Id;
  },
});

/**
 * Update existing {module}
 */
export const update{Module} = mutation({
  args: {
    {module}Id: v.id('{tableName}'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      visibility: v.optional({module}Validators.visibility),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { {module}Id, updates }): Promise<{Module}Id> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) {
      throw new Error('{Module} not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEdit{Module}Access(ctx, {module}, user);

    // 4. VALIDATE: Check update data validity
    const errors = validate{Module}Data(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.visibility !== undefined) {
      updateData.visibility = updates.visibility;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map(tag => tag.trim());
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch({module}Id, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.updated',
      entityType: 'system_{module}',
      entityId: {module}.publicId,
      entityTitle: updateData.name || {module}.name,
      description: `Updated {module}: ${updateData.name || {module}.name}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return {module}Id;
  },
});

/**
 * Delete {module} (soft delete)
 */
export const delete{Module} = mutation({
  args: {
    {module}Id: v.id('{tableName}'),
  },
  handler: async (ctx, { {module}Id }): Promise<{Module}Id> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) {
      throw new Error('{Module} not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDelete{Module}Access({module}, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch({module}Id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.deleted',
      entityType: 'system_{module}',
      entityId: {module}.publicId,
      entityTitle: {module}.name,
      description: `Deleted {module}: ${module}.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return {module}Id;
  },
});

/**
 * Restore soft-deleted {module}
 */
export const restore{Module} = mutation({
  args: {
    {module}Id: v.id('{tableName}'),
  },
  handler: async (ctx, { {module}Id }): Promise<{Module}Id> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const {module} = await ctx.db.get({module}Id);
    if (!{module}) {
      throw new Error('{Module} not found');
    }
    if (!{module}.deletedAt) {
      throw new Error('{Module} is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      {module}.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this {module}');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch({module}Id, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.restored',
      entityType: 'system_{module}',
      entityId: {module}.publicId,
      entityTitle: {module}.name,
      description: `Restored {module}: ${module}.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return {module}Id;
  },
});

/**
 * Archive {module} (status-based soft delete alternative)
 */
export const archive{Module} = mutation({
  args: {
    {module}Id: v.id('{tableName}'),
  },
  handler: async (ctx, { {module}Id }): Promise<{Module}Id> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) {
      throw new Error('{Module} not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEdit{Module}Access(ctx, {module}, user);

    // 4. ARCHIVE: Update status
    const now = Date.now();
    await ctx.db.patch({module}Id, {
      status: 'archived',
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.archived',
      entityType: 'system_{module}',
      entityId: {module}.publicId,
      entityTitle: {module}.name,
      description: `Archived {module}: ${module}.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return {module}Id;
  },
});

/**
 * Bulk update multiple {module}s
 */
export const bulkUpdate{Module}s = mutation({
  args: {
    {module}Ids: v.array(v.id('{tableName}')),
    updates: v.object({
      status: v.optional({module}Validators.status),
      priority: v.optional({module}Validators.priority),
      visibility: v.optional({module}Validators.visibility),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { {module}Ids, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check bulk edit permission
    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check update data
    const errors = validate{Module}Data(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    // 4. PROCESS: Update each entity
    for (const {module}Id of {module}Ids) {
      try {
        const {module} = await ctx.db.get({module}Id);
        if (!{module} || {module}.deletedAt) {
          failed.push({ id: {module}Id, reason: 'Not found' });
          continue;
        }

        // Check individual edit access
        const canEdit = await canEdit{Module}(ctx, {module}, user);
        if (!canEdit) {
          failed.push({ id: {module}Id, reason: 'No permission' });
          continue;
        }

        // Apply updates
        const updateData: any = {
          updatedAt: now,
          updatedBy: user._id,
        };

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map(tag => tag.trim());
        }

        await ctx.db.patch({module}Id, updateData);
        results.push({ id: {module}Id, success: true });
      } catch (error) {
        failed.push({ id: {module}Id, reason: error.message });
      }
    }

    // 5. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.bulk_updated',
      entityType: 'system_{module}',
      entityId: 'bulk',
      entityTitle: `${results.length} {module}s`,
      description: `Bulk updated ${results.length} {module}s`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return results summary
    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple {module}s (soft delete)
 */
export const bulkDelete{Module}s = mutation({
  args: {
    {module}Ids: v.array(v.id('{tableName}')),
  },
  handler: async (ctx, { {module}Ids }) => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check delete permission
    await requirePermission(ctx, {MODULE}_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results = [];
    const failed = [];

    // 3. PROCESS: Delete each entity
    for (const {module}Id of {module}Ids) {
      try {
        const {module} = await ctx.db.get({module}Id);
        if (!{module} || {module}.deletedAt) {
          failed.push({ id: {module}Id, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDelete{Module}({module}, user);
        if (!canDelete) {
          failed.push({ id: {module}Id, reason: 'No permission' });
          continue;
        }

        // Soft delete
        await ctx.db.patch({module}Id, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
          updatedBy: user._id,
        });

        results.push({ id: {module}Id, success: true });
      } catch (error) {
        failed.push({ id: {module}Id, reason: error.message });
      }
    }

    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.bulk_deleted',
      entityType: 'system_{module}',
      entityId: 'bulk',
      entityTitle: `${results.length} {module}s`,
      description: `Bulk deleted ${results.length} {module}s`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});
```

---

### 7. index.ts

**Purpose:** Create barrel export file for clean public API.

**Key Points:**
- Export constants
- Export types
- Export utilities
- Export queries
- Export mutations
- Use `export type *` for type-only exports

```typescript
// convex/lib/{category}/{entity}/{module}/index.ts
// Public API exports for {module} module

// Constants
export { {MODULE}_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validate{Module}Data,
  format{Module}DisplayName,
  generateSlug,
  is{Module}Editable,
} from './utils';

// Permissions
export {
  canView{Module},
  canEdit{Module},
  canDelete{Module},
  requireView{Module}Access,
  requireEdit{Module}Access,
  requireDelete{Module}Access,
  filter{Module}sByAccess,
} from './permissions';

// Queries
export {
  get{Module}s,
  get{Module},
  get{Module}ByPublicId,
  get{Module}Stats,
} from './queries';

// Mutations
export {
  create{Module},
  update{Module},
  delete{Module},
  restore{Module},
  archive{Module},
  bulkUpdate{Module}s,
  bulkDelete{Module}s,
} from './mutations';
```

---

## ✅ Consistency Review

After implementing all files, perform these checks:

### 1. Field Consistency

**Check:** Main display field across all files

```bash
# Search for the main display field
# Should be consistent: name, title, or displayName
grep -r "name:" convex/schema/{category}/{entity}/{module}/
grep -r "entityTitle:" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Verify:**
- [ ] Schema has main display field with correct type
- [ ] Schema has index for main display field
- [ ] All audit logs use main display field for `entityTitle`
- [ ] Validation checks main display field
- [ ] Queries filter/search on main display field

### 2. Validator Consistency

**Check:** Validators match across schema and library

```bash
# Compare validator definitions
diff convex/schema/{category}/{entity}/{module}/validators.ts \
     convex/lib/{category}/{entity}/{module}/constants.ts
```

**Verify:**
- [ ] `validators.ts` has all union validators
- [ ] `constants.ts` STATUS/PRIORITY values match validators
- [ ] Mutation args use validators from schema
- [ ] Type extractions in schema `types.ts` use validators
- [ ] Library `types.ts` imports from schema types

### 3. Permission Consistency

**Check:** All mutations have proper authorization

```bash
# Search for mutations without requireCurrentUser
grep -A 5 "handler: async" convex/lib/{category}/{entity}/{module}/mutations.ts | grep -v "requireCurrentUser"
```

**Verify:**
- [ ] All mutations call `requireCurrentUser(ctx)`
- [ ] All mutations check permissions (requirePermission or requireAccess)
- [ ] All queries call `requireCurrentUser(ctx)`
- [ ] All queries apply access filtering
- [ ] Permission constants defined in `constants.ts`
- [ ] Permission functions defined in `permissions.ts`

### 4. Validation Consistency

**Check:** All inputs are validated and trimmed

```bash
# Search for string fields without trim()
grep "data\." convex/lib/{category}/{entity}/{module}/mutations.ts | grep -v "trim()"
```

**Verify:**
- [ ] All mutations call validation functions
- [ ] All string inputs are trimmed
- [ ] All array elements are trimmed (tags, etc.)
- [ ] Validation errors return `string[]`
- [ ] Validation checks all business rules
- [ ] Error messages are clear and actionable

### 5. Audit Log Consistency

**Check:** All mutations create audit logs

```bash
# Count mutations vs audit logs
grep -c "export const" convex/lib/{category}/{entity}/{module}/mutations.ts
grep -c "auditLogs" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Verify:**
- [ ] All mutations insert audit logs
- [ ] Audit logs use correct action names
- [ ] Audit logs capture `entityTitle` (main display field)
- [ ] Audit logs include relevant metadata
- [ ] Audit logs have `createdAt`, `createdBy`, `updatedAt`

### 6. Soft Delete Consistency

**Check:** No hard deletes exist

```bash
# Search for hard deletes (should only be in admin functions)
grep "ctx.db.delete" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Verify:**
- [ ] No `ctx.db.delete()` in standard mutations
- [ ] All delete operations use soft delete
- [ ] Soft delete sets `deletedAt`, `deletedBy`, `updatedAt`, `updatedBy`
- [ ] All queries filter `deletedAt === undefined`
- [ ] Restore function clears soft delete fields

### 7. Type Safety Consistency

**Check:** TypeScript types are properly defined

```bash
# Check for `any` types (should be minimal)
grep -n ": any" convex/lib/{category}/{entity}/{module}/
```

**Verify:**
- [ ] Entity type imported from `Doc<'tableName'>`
- [ ] ID type imported from `Id<'tableName'>`
- [ ] Create/Update interfaces defined
- [ ] Schema types imported from schema `types.ts`
- [ ] Validator types use `Infer<typeof>`
- [ ] Minimal use of `any` types

### 8. Index Usage Consistency

**Check:** Queries use indexes properly

```bash
# Find queries without withIndex
grep -A 10 "ctx.db.query" convex/lib/{category}/{entity}/{module}/queries.ts | grep -v "withIndex"
```

**Verify:**
- [ ] All queries use `.withIndex()` when possible
- [ ] Index names match schema definitions
- [ ] Compound indexes used efficiently
- [ ] Filters applied after index queries
- [ ] No full table scans on large tables

### 9. Return Value Consistency

**Check:** All mutations return consistently

```bash
# Check return statements in mutations
grep -A 2 "// 8. RETURN" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Verify:**
- [ ] All mutations return entity ID
- [ ] Bulk operations return summary objects
- [ ] Query responses use defined response types
- [ ] Error messages are consistent
- [ ] Success responses are predictable

### 10. Import Path Consistency

**Check:** All imports use correct paths

```bash
# Check for incorrect import paths
grep -r "import.*from.*@/" convex/lib/{category}/{entity}/{module}/
```

**Verify:**
- [ ] Schema imports use `@/schema/{category}/{entity}/{module}/`
- [ ] Generated types use `@/generated/`
- [ ] Auth helper uses `@/lib/auth.helper`
- [ ] Relative imports for same module files
- [ ] No circular dependencies

---

## 🔒 Security & Permissions

### Permission Structure

Every module should implement these permission patterns:

#### 1. Permission Constants

```typescript
// In constants.ts
export const {MODULE}_CONSTANTS = {
  PERMISSIONS: {
    VIEW: '{module}:view',
    CREATE: '{module}:create',
    EDIT: '{module}:edit',
    DELETE: '{module}:delete',
    PUBLISH: '{module}:publish',
    BULK_EDIT: '{module}:bulk_edit',
  },
} as const;
```

#### 2. Access Check Functions

```typescript
// In permissions.ts

// View access - most permissive
export async function canView{Module}(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if ({module}.visibility === 'public') return true;
  if ({module}.ownerId === user._id) return true;
  if ({module}.createdBy === user._id) return true;
  return false;
}

// Edit access - more restrictive
export async function canEdit{Module}(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if ({module}.ownerId === user._id) return true;
  if ({module}.status === 'completed' || {module}.status === 'archived') return false;
  return false;
}

// Delete access - most restrictive
export async function canDelete{Module}(
  {module}: {Module},
  user: UserProfile
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if ({module}.ownerId === user._id) return true;
  return false;
}
```

#### 3. Require Functions

```typescript
// Throw errors if access denied
export async function requireView{Module}Access(
  ctx: QueryCtx | MutationCtx,
  {module}: {Module},
  user: UserProfile
): Promise<void> {
  if (!(await canView{Module}(ctx, {module}, user))) {
    throw new Error('You do not have permission to view this {module}');
  }
}
```

#### 4. Bulk Filtering

```typescript
// Filter arrays by access
export async function filter{Module}sByAccess(
  ctx: QueryCtx | MutationCtx,
  {module}s: {Module}[],
  user: UserProfile
): Promise<{Module}[]> {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return {module}s;
  }

  const accessible: {Module}[] = [];
  for (const {module} of {module}s) {
    if (await canView{Module}(ctx, {module}, user)) {
      accessible.push({module});
    }
  }
  return accessible;
}
```

### Related Entity Access

For entities with relationships, cascade access checks:

```typescript
export async function canViewInvoice(
  ctx: QueryCtx | MutationCtx,
  invoice: Invoice,
  user: UserProfile
): Promise<boolean> {
  // Standard checks
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (invoice.ownerId === user._id) return true;

  // Check related project
  if (invoice.projectId) {
    const project = await ctx.db.get(invoice.projectId);
    if (project && await canViewProject(ctx, project, user)) {
      return true;
    }
  }

  // Check related client
  const client = await ctx.db.get(invoice.clientId);
  if (client && await canViewClient(ctx, client, user)) {
    return true;
  }

  return false;
}
```

---

## ⚡ Common Operations

### CREATE Operation Pattern

```typescript
export const create{Module} = mutation({
  args: { data: v.object({ /* ... */ }) },
  handler: async (ctx, { data }) => {
    // 1. AUTH
    const user = await requireCurrentUser(ctx);
    
    // 2. AUTHZ
    await requirePermission(ctx, PERMISSIONS.CREATE, { allowAdmin: true });
    
    // 3. VALIDATE
    const errors = validate{Module}Data(data);
    if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
    
    // 4. PROCESS
    const publicId = await generateUniquePublicId(ctx, '{tableName}');
    const now = Date.now();
    
    // 5. CREATE
    const {module}Id = await ctx.db.insert('{tableName}', {
      publicId,
      name: data.name.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });
    
    // 6. AUDIT
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: '{module}.created',
      entityType: 'system_{module}',
      entityId: publicId,
      entityTitle: data.name.trim(),
      description: `Created {module}: ${data.name.trim()}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });
    
    // 7. RETURN
    return {module}Id;
  },
});
```

### UPDATE Operation Pattern

```typescript
export const update{Module} = mutation({
  args: {
    {module}Id: v.id('{tableName}'),
    updates: v.object({ /* ... */ }),
  },
  handler: async (ctx, { {module}Id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) throw new Error('Not found');
    
    await requireEdit{Module}Access(ctx, {module}, user);
    
    const errors = validate{Module}Data(updates);
    if (errors.length) throw new Error(`Validation failed: ${errors.join(', ')}`);
    
    const now = Date.now();
    await ctx.db.patch({module}Id, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
    });
    
    await ctx.db.insert('auditLogs', { /* ... */ });
    
    return {module}Id;
  },
});
```

### LIST Operation Pattern

```typescript
export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({ /* ... */ })),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;
    
    // Use index
    let {module}s = await ctx.db
      .query('{tableName}')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();
    
    // Apply access filter
    {module}s = await filter{Module}sByAccess(ctx, {module}s, user);
    
    // Apply other filters
    if (filters.status?.length) {
      {module}s = {module}s.filter(m => filters.status.includes(m.status));
    }
    
    // Paginate
    const total = {module}s.length;
    const items = {module}s.slice(offset, offset + limit);
    
    return { items, total, hasMore: total > offset + limit };
  },
});
```

### SOFT DELETE Operation Pattern

```typescript
export const delete{Module} = mutation({
  args: { {module}Id: v.id('{tableName}') },
  handler: async (ctx, { {module}Id }) => {
    const user = await requireCurrentUser(ctx);
    const {module} = await ctx.db.get({module}Id);
    if (!{module} || {module}.deletedAt) throw new Error('Not found');
    
    await requireDelete{Module}Access({module}, user);
    
    const now = Date.now();
    await ctx.db.patch({module}Id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    
    await ctx.db.insert('auditLogs', { /* ... */ });
    
    return {module}Id;
  },
});
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "Entity not found" after creation

**Problem:** Entity created but query returns undefined.

**Solution:**
```typescript
// ✅ Correct
const id = await ctx.db.insert('{tableName}', data);
const entity = await ctx.db.get(id);
if (!entity || entity.deletedAt) throw new Error('Not found');

// ❌ Wrong
const id = ctx.db.insert('{tableName}', data); // Missing await
```

#### 2. "Permission denied" for owner

**Problem:** Owner can't edit their own entity.

**Solution:** Check ownership FIRST in permission functions
```typescript
export async function canEdit{Module}(ctx, {module}, user) {
  // Check ownership FIRST
  if ({module}.ownerId === user._id) return true;
  
  // Then check admin
  if (user.role === 'admin') return true;
  
  // Finally other checks
  return false;
}
```

#### 3. Audit logs show "undefined" for entity title

**Problem:** `entityTitle` field is undefined.

**Solution:** Ensure using main display field
```typescript
// ✅ Correct - use main display field
await ctx.db.insert('auditLogs', {
  entityTitle: data.name, // or data.title, data.displayName
  // ...
});

// ❌ Wrong - using wrong field
await ctx.db.insert('auditLogs', {
  entityTitle: data.id, // This is not the display field
  // ...
});
```

#### 4. Circular dependency error

**Problem:** Import cycle between validators and schemas.

**Solution:** Keep validators.ts clean
```typescript
// ✅ Correct - validators.ts with NO schema imports
import { v } from 'convex/values';

export const {module}Validators = {
  status: v.union(v.literal('active'), v.literal('archived')),
};

// ❌ Wrong - validators.ts importing schemas
import { {module}Schemas } from './schemas'; // NO!
```

#### 5. Validator type mismatch

**Problem:** Type errors with status/priority/visibility.

**Solution:** Import validators from validators.ts
```typescript
// ✅ Correct
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators';
args: { status: v.optional({module}Validators.status) }

// ❌ Wrong
args: { status: v.optional(v.string()) }
```

#### 6. Index not being used

**Problem:** Query is slow despite having an index.

**Solution:** Use `.withIndex()` properly
```typescript
// ✅ Correct - uses index
const results = await ctx.db
  .query('{tableName}')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .collect();

// ❌ Wrong - full table scan
const results = await ctx.db
  .query('{tableName}')
  .filter(q => q.eq(q.field('status'), 'active'))
  .collect();
```

#### 7. Soft-deleted items appearing in queries

**Problem:** Deleted items still show up in results.

**Solution:** Always filter deletedAt
```typescript
// ✅ Correct
const items = await ctx.db
  .query('{tableName}')
  .filter(q => q.eq(q.field('deletedAt'), undefined))
  .collect();

// ❌ Wrong - includes deleted items
const items = await ctx.db
  .query('{tableName}')
  .collect();
```

#### 8. Permission check bypassed

**Problem:** Users accessing entities they shouldn't.

**Solution:** Use filter functions in queries
```typescript
// ✅ Correct
let items = await ctx.db.query('{tableName}').collect();
items = await filter{Module}sByAccess(ctx, items, user);

// ❌ Wrong - returns all items
const items = await ctx.db.query('{tableName}').collect();
return items;
```

---

## ⚙️ Performance Optimization

### Index Strategy

#### Use Compound Indexes Efficiently

```typescript
// ✅ Good - one compound index covers multiple queries
.index('by_owner_and_status', ['ownerId', 'status'])

// This supports:
// 1. by owner: q.eq('ownerId', userId)
// 2. by owner and status: q.eq('ownerId', userId).eq('status', 'active')
```

#### Avoid Redundant Indexes

```typescript
// ❌ Bad - redundant indexes
.index('by_owner', ['ownerId'])
.index('by_owner_and_status', ['ownerId', 'status'])
// Only need the compound index!

// ✅ Good - minimal indexes
.index('by_owner_and_status', ['ownerId', 'status'])
```

### Query Optimization

#### Use Indexes Over Filters

```typescript
// ❌ Bad - filter after collect (loads everything)
const all = await ctx.db.query('{tableName}').collect();
const active = all.filter(item => item.status === 'active');

// ✅ Good - use index (only loads needed docs)
const active = await ctx.db
  .query('{tableName}')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .collect();
```

#### Batch Lookups

```typescript
// ❌ Bad - N+1 queries
const entities = await ctx.db.query('{tableName}').collect();
for (const entity of entities) {
  entity.owner = await ctx.db.get(entity.ownerId); // N queries
}

// ✅ Good - batch lookup
const entities = await ctx.db.query('{tableName}').collect();
const ownerIds = [...new Set(entities.map(e => e.ownerId))];
const owners = await Promise.all(ownerIds.map(id => ctx.db.get(id)));
const ownerMap = new Map(owners.filter(Boolean).map(o => [o!._id, o]));
entities.forEach(e => e.owner = ownerMap.get(e.ownerId));
```

#### Pagination for Large Datasets

```typescript
// ✅ Always paginate large lists
export const get{Module}s = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, cursor }) => {
    const results = await ctx.db
      .query('{tableName}')
      .withIndex('by_created_at')
      .order('desc')
      .paginate({ numItems: limit, cursor });
    
    return results;
  },
});
```

### Caching Strategies

#### Denormalize When Appropriate

```typescript
// For frequently accessed counts, denormalize
export const {module}Table = defineTable({
  name: v.string(),
  commentCount: v.number(), // Cached count
  likeCount: v.number(),    // Cached count
  viewCount: v.number(),    // Cached count
  // ...
});

// Update counts on mutations
export const addComment = mutation({
  handler: async (ctx, { {module}Id, comment }) => {
    await ctx.db.insert('comments', { {module}Id, ...comment });
    
    // Increment cached count
    const {module} = await ctx.db.get({module}Id);
    if ({module}) {
      await ctx.db.patch({module}Id, {
        commentCount: ({module}.commentCount || 0) + 1,
        updatedAt: Date.now(),
      });
    }
  },
});
```

### Performance Checklist

- [ ] No unbounded `.collect()` calls
- [ ] All frequent queries use indexes
- [ ] Compound indexes used for common filter combinations
- [ ] Batch lookups instead of N+1 queries
- [ ] Pagination for lists with 100+ items
- [ ] Denormalized counts for frequently accessed aggregates
- [ ] Filter functions optimize for admin users (skip checks)

---

## 📊 Quick Reference Tables

### Standard Indexes

| Index Name | Fields | Use Case |
|------------|--------|----------|
| `by_public_id` | `['publicId']` | Lookup by external ID (required) |
| `by_name` | `['name']` | Lookup/search by display field (required) |
| `by_owner` | `['ownerId']` | User's owned entities |
| `by_deleted_at` | `['deletedAt']` | Filter soft-deleted (required) |
| `by_status` | `['status']` | Filter by status |
| `by_created_at` | `['createdAt']` | Sort by creation time |
| `by_owner_and_status` | `['ownerId', 'status']` | User's entities by status |

### Standard Fields

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `publicId` | `v.string()` | ✅ Yes | External identifier |
| `name` / `title` / `displayName` | `v.string()` | ✅ Yes | Main display field |
| `ownerId` | `v.id('userProfiles')` | ✅ Yes | Entity owner |
| `status` | Union validator | ✅ Yes | Entity status |
| `createdAt` | `v.number()` | ✅ Yes | Creation timestamp |
| `updatedAt` | `v.number()` | ✅ Yes | Last update |
| `createdBy` | `v.id('userProfiles')` | ✅ Yes | Creator |
| `updatedBy` | `v.id('userProfiles')` | ✅ Yes | Last editor |
| `deletedAt` | `v.optional(v.number())` | ✅ Yes | Soft delete timestamp |
| `deletedBy` | `v.optional(v.id('userProfiles'))` | ✅ Yes | Who deleted |
| `description` | `v.optional(v.string())` | Optional | Details |
| `visibility` | Union validator | Optional | Access level |
| `priority` | Union validator | Optional | Priority level |

### Permission Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `requirePermission` | Global permissions | Admin-only features |
| `canView{Module}` | Check view access | Before showing entity |
| `canEdit{Module}` | Check edit access | Before update |
| `canDelete{Module}` | Check delete access | Before deletion |
| `requireView{Module}Access` | Enforce view access | In get queries |
| `requireEdit{Module}Access` | Enforce edit access | In mutations |
| `requireDelete{Module}Access` | Enforce delete access | In delete mutations |
| `filter{Module}sByAccess` | Bulk filtering | In list queries |

### Mutation Patterns

| Pattern | Steps | Key Points |
|---------|-------|------------|
| CREATE | 1. AUTH → 2. AUTHZ → 3. VALIDATE → 4. PROCESS → 5. CREATE → 6. AUDIT → 7. RETURN | Generate publicId, trim strings, audit log |
| UPDATE | 1. AUTH → 2. CHECK → 3. AUTHZ → 4. VALIDATE → 5. PROCESS → 6. UPDATE → 7. AUDIT → 8. RETURN | Partial updates, maintain timestamps |
| DELETE | 1. AUTH → 2. CHECK → 3. AUTHZ → 4. SOFT DELETE → 5. AUDIT → 6. RETURN | Never hard delete, set deletedAt |
| RESTORE | 1. AUTH → 2. CHECK → 3. AUTHZ → 4. RESTORE → 5. AUDIT → 6. RETURN | Clear deletedAt fields |
| BULK | 1. AUTH → 2. AUTHZ → 3. VALIDATE → 4. PROCESS → 5. AUDIT → 6. RETURN | Check each item, single audit log |

---

## 📋 Implementation Checklist

### Module Setup
- [ ] Module directory structure created
- [ ] All required files created (4 schema + 7 library)
- [ ] Placeholders replaced in all files
- [ ] File headers added (filepath, description, empty line)

### Schema Implementation
- [ ] `validators.ts` - Grouped validators defined (no schema imports)
- [ ] `{module}.ts` - Table definitions with validators
- [ ] `types.ts` - Type extractions from validators
- [ ] `schemas.ts` - Schema export objects
- [ ] Schema registered in main `schema.ts`

### Required Schema Elements
- [ ] Main display field added (name/title/displayName)
- [ ] Main display field indexed (`by_name`, `by_title`, etc.)
- [ ] `publicId` field and index added
- [ ] `ownerId` field added
- [ ] Audit fields spread (`...auditFields, ...softDeleteFields`)
- [ ] All standard indexes added
- [ ] Module-specific indexes added

### Library Implementation
- [ ] `constants.ts` - Permissions, status values, limits defined
- [ ] `types.ts` - Interfaces for Create/Update data
- [ ] `utils.ts` - Validation functions implemented
- [ ] `permissions.ts` - Access control functions implemented
- [ ] `queries.ts` - Read operations implemented
- [ ] `mutations.ts` - Write operations implemented
- [ ] `index.ts` - Barrel exports configured

### Security Implementation
- [ ] All mutations call `requireCurrentUser(ctx)`
- [ ] All mutations check permissions
- [ ] All queries call `requireCurrentUser(ctx)`
- [ ] All queries filter by access
- [ ] Permission constants defined
- [ ] `can*` functions implemented
- [ ] `require*` functions implemented
- [ ] `filter*ByAccess` function implemented

### Validation Implementation
- [ ] Validation function returns `string[]`
- [ ] All required fields validated
- [ ] All string fields trimmed
- [ ] Length limits checked
- [ ] Pattern validation (where applicable)
- [ ] Business rules enforced

### Mutation Implementation
- [ ] CREATE with all 7 steps
- [ ] UPDATE with all 8 steps
- [ ] DELETE (soft) with all 6 steps
- [ ] RESTORE (optional)
- [ ] ARCHIVE (optional)
- [ ] BULK operations (optional)

### Query Implementation
- [ ] LIST with pagination
- [ ] LIST with filtering
- [ ] GET by ID
- [ ] GET by publicId
- [ ] STATS/aggregations (optional)

### Audit Trail
- [ ] All mutations create audit logs
- [ ] `entityTitle` uses main display field
- [ ] Action names follow pattern: `{module}.{action}`
- [ ] Entity type follows pattern: `system_{module}`
- [ ] Descriptions are clear
- [ ] Metadata included where relevant

### Consistency Review
- [ ] Main display field consistent everywhere
- [ ] Validators match between schema and constants
- [ ] All mutations have authentication
- [ ] All mutations have authorization
- [ ] All inputs validated
- [ ] All strings trimmed
- [ ] All operations use soft delete
- [ ] All queries filter `deletedAt`
- [ ] Type imports correct
- [ ] No circular dependencies

### Testing
- [ ] CREATE operation tested
- [ ] UPDATE operation tested
- [ ] DELETE operation tested
- [ ] LIST operation tested
- [ ] GET operations tested
- [ ] Permission checks verified
- [ ] Validation rules working
- [ ] Audit logs created correctly

---

## 🎓 Best Practices

### Code Organization

1. **Follow the structure** - Don't deviate from the standard layout
2. **One concern per file** - Keep files focused on their purpose
3. **Use barrel exports** - Clean public API via `index.ts`
4. **Comment complex logic** - Explain "why", not "what"
5. **Keep functions small** - Single responsibility principle

### Type Safety

1. **Import from generated types** - Use `Doc<>` and `Id<>` 
2. **Extract validator types** - Use `Infer<typeof>` for unions
3. **Define interfaces** - Create/Update data interfaces
4. **Avoid `any` types** - Use proper types or `unknown`
5. **Use const assertions** - Add `as const` to constants

### Security

1. **Authenticate first** - Always call `requireCurrentUser(ctx)`
2. **Check ownership** - Verify before admin/permission checks
3. **Filter queries** - Apply access filtering to all lists
4. **Validate inputs** - Never trust user data
5. **Use soft delete** - Preserve audit trail

### Performance

1. **Use indexes** - Query with `.withIndex()` when possible
2. **Batch lookups** - Avoid N+1 queries
3. **Paginate lists** - Don't load entire tables
4. **Denormalize counts** - Cache frequently accessed aggregates
5. **Optimize for admins** - Skip checks when user.role is admin

### Maintainability

1. **Consistent naming** - Follow placeholder conventions
2. **Document decisions** - Add comments for business rules
3. **Test edge cases** - Verify error handling
4. **Update audit logs** - Keep action descriptions clear
5. **Review consistency** - Run through checklist

---

## 📚 Reference Examples

### Working Implementations

- **Freelancer Dashboard:** `convex/lib/software/freelancer_dashboard/`
  - Multiple related modules (projects, clients, invoices, expenses)
  - Comprehensive permissions with cascading access
  - Related entity access patterns

- **Simple Module:** `convex/schema/addons/business/expenses/`
  - Clean, minimal implementation
  - Good starting point for new modules

- **User Profiles:** `convex/lib/boilerplate/user_profiles/`
  - User management patterns
  - Role-based access control

### Key Files

- **Auth Helper:** `convex/lib/auth.helper.ts` - Authentication utilities
- **Shared Errors:** `convex/lib/shared/errors.ts` - Standard error throwers
- **Base Validators:** `convex/schema/base.ts` - Reusable base patterns

---

## 🚀 Getting Started

### For a New Module

1. **Create directory structure** for schema and library
2. **Copy template files** and rename (remove `.template.md`)
3. **Search and replace** all placeholders
4. **Implement schema files** (validators → tables → types → schemas)
5. **Register schema** in main `schema.ts`
6. **Implement library files** (constants → types → utils → permissions → queries → mutations → index)
7. **Run consistency review** using checklist
8. **Test all operations** with sample data

### For an Existing Module Update

1. **Review current structure** against this guide
2. **Identify missing elements** (fields, indexes, permissions)
3. **Update schema** if needed (add fields, indexes)
4. **Update library** to match new patterns
5. **Add missing operations** (restore, bulk, etc.)
6. **Run consistency review** to find gaps
7. **Test updated operations** thoroughly

---

## 💡 Tips & Tricks

### Development Workflow

1. **Start with schema** - Define data structure first
2. **Test queries early** - Verify indexes work
3. **Build incrementally** - One operation at a time
4. **Use type errors** - Let TypeScript guide you
5. **Test permissions** - Verify with different user roles

### Debugging

1. **Check Convex logs** - View mutation/query execution
2. **Verify indexes** - Ensure queries use indexes
3. **Test with different users** - Check permission logic
4. **Review audit logs** - Verify operations recorded
5. **Check soft delete** - Ensure deleted items filtered

### Common Shortcuts

```bash
# Create all schema files at once
mkdir -p convex/schema/{category}/{entity}/{module}
cd convex/schema/{category}/{entity}/{module}
touch {module}.ts validators.ts types.ts schemas.ts

# Create all library files at once
mkdir -p convex/lib/{category}/{entity}/{module}
cd convex/lib/{category}/{entity}/{module}
touch constants.ts types.ts utils.ts permissions.ts queries.ts mutations.ts index.ts

# Search and replace placeholders (VS Code)
# Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows)
# Search: {placeholder}
# Replace: actual_value
# Replace All in Files
```

---

**🎉 You're ready to build! Follow this guide step-by-step for consistent, high-quality Convex modules.**

