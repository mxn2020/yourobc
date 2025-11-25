# Advanced Patterns

> Deep dive into SearchIndex, metadata, bulk operations, and other advanced implementation patterns.

## Table of Contents

- [Overview](#overview)
- [SearchIndex Patterns](#searchindex-patterns)
- [Metadata Patterns](#metadata-patterns)
- [Bulk Operations](#bulk-operations)
- [PublicId Configuration](#publicid-configuration)
- [Pagination Patterns](#pagination-patterns)
- [Performance Optimization](#performance-optimization)
- [Security Patterns](#security-patterns)
- [Common Operations](#common-operations)
- [Real-World Examples](#real-world-examples)
- [Quick Reference](#quick-reference)
- [Troubleshooting](#troubleshooting)
- [Appendix](#appendix)

---

## Overview

This document covers advanced patterns for:

- Full-text search implementation
- Typed metadata structures
- Bulk operations with chunking
- PublicId generation and registration
- Advanced pagination strategies
- Performance optimization techniques
- Security best practices

### When to Use These Patterns

| Pattern | Use When | Complexity |
|---------|----------|------------|
| SearchIndex | Dataset > 1K, text search needed | Medium |
| Typed Metadata | Flexible contextual data | Low |
| Bulk Operations | Admin workflows, mass updates | Medium |
| PublicId | External references, APIs | Low |
| Advanced Pagination | Large datasets, complex filters | Medium |
| Performance Optimization | Slow queries, scaling issues | High |

---

## SearchIndex Patterns

### Decision Guide

```
Do users need to search text content?
├─ NO → Skip search entirely
│   └─ Use in-memory filtering
│
└─ YES → What type of search?
    │
    ├─ Simple (1-3 fields)
    │   └─ Use single combined search
    │
    ├─ Field-specific (power users)
    │   └─ Use multiple indexes
    │
    └─ No search yet
        └─ Start without, add later
```

### Pattern 1: No Search (Recommended Start)

**When to use**: Small datasets (<1K items), prototyping, simple filtering

**Implementation**:

```typescript
// Schema - NO search fields
export const projectsTable = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  // ... other fields
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId']);
  // NO .searchIndex() definitions
```

```typescript
// Query - in-memory filtering
export const getProjects = query({
  handler: async (ctx, args) => {
    const { filters } = args;
    
    let items = await ctx.db
      .query('freelancerProjects')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .collect();
    
    // Simple text search in-memory
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(term) ||
        (i.description && i.description.toLowerCase().includes(term))
      );
    }
    
    return items;
  },
});
```

**Pros**:
- ✅ Simple to implement
- ✅ No maintenance overhead
- ✅ Good for small datasets

**Cons**:
- ❌ Slow for large datasets
- ❌ No fuzzy matching
- ❌ Quality depends on your own filtering logic

---

### Pattern 2: Single Combined Search

**When to use**: Most production use cases, 1-3 searchable fields, dataset > 1K items

**Schema Implementation**:

```typescript
// 1. Add searchableText field
export const projectsTable = defineTable({
  name: v.string(),
  searchableText: v.string(),  // ← Required if any .searchIndex uses it
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  // ... other fields
})
  // 2. Add search index
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  })
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId']);
```

**Utils - Build searchableText**:

```typescript
// convex/lib/{category}/{entity}/{module}/utils.ts

/**
 * Build searchable text from multiple fields
 * Combines all searchable content into single string
 */
export function buildSearchableText(
  data: Partial<CreateProjectData | UpdateProjectData>
): string {
  const parts: string[] = [];

  if (data.name) parts.push(data.name);
  if (data.description) parts.push(data.description);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags);
  
  // Add any other searchable fields
  // if (data.notes) parts.push(data.notes);

  return parts.join(' ').toLowerCase().trim();
}
```

**Mutation - Maintain searchableText**:

```typescript
// CREATE
export const createProject = mutation({
  handler: async (ctx, { data }) => {
    const trimmed = trimProjectData(data);
    const errors = validateProjectData(trimmed);
    if (errors.length) throw new Error(errors.join(', '));

    // Build searchableText
    const searchableText = buildSearchableText(trimmed);

    const id = await ctx.db.insert('freelancerProjects', {
      ...trimmed,
      searchableText,  // ← Include in insert
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    return id;
  },
});

// UPDATE
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    const existing = await ctx.db.get(id);
    const trimmed = trimProjectData(updates);
    
    // Rebuild with merged data
    const searchableText = buildSearchableText({
      name: trimmed.name ?? existing.name,
      description: trimmed.description ?? existing.description,
      tags: trimmed.tags ?? existing.tags,
    });

    await ctx.db.patch(id, {
      ...trimmed,
      searchableText,  // ← Update searchableText
      updatedAt: now,
      updatedBy: user._id,
    });

    return id;
  },
});
```

**Query - Use search index**:

```typescript
export const searchProjects = query({
  args: {
    searchQuery: v.optional(v.string()),
    status: v.optional(projectsValidators.status),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { searchQuery, status, limit = 50, cursor } = args;

    // Fallback to indexed query if no search
    if (!searchQuery?.trim()) {
      const q = ctx.db
        .query('freelancerProjects')
        .withIndex('by_owner_id', iq => iq.eq('ownerId', user._id))
        .filter(notDeleted);

      const page = await q.order('desc').paginate({
        numItems: limit,
        cursor: cursor ?? null,
      });

      return {
        items: await filterProjectsByAccess(ctx, page.page, user),
        total: page.page.length,
        hasMore: !page.isDone,
        cursor: page.continueCursor,
      };
    }

    // Search with filters
    const searchBuilder = ctx.db
      .query('freelancerProjects')
      .withSearchIndex('search_all', sq => {
        let q = sq
          .search('searchableText', searchQuery)
          .eq('ownerId', user._id)
          .eq('deletedAt', undefined);  // ✅ Use .eq() in search builder

        if (status) {
          q = q.eq('status', status);
        }

        return q;
      });

    const page = await searchBuilder.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filterProjectsByAccess(ctx, page.page, user),
      total: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
```

**Pros**:
- ✅ Fast full-text search
- ✅ Single field to maintain
- ✅ Good for most use cases

**Cons**:
- ❌ Adds noticeable per-doc overhead (order-of-hundreds of bytes)
- ❌ Must maintain on updates
- ❌ Can't search individual fields separately

---

### Pattern 3: Field-Specific Search

**When to use**: Power users, admin interfaces, need to search specific fields independently

**Schema Implementation**:

```typescript
export const projectsTable = defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
})
  // Separate index for each field
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
  .searchIndex('search_by_notes', {
    searchField: 'notes',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  });
```

**Query - Field-specific search**:

```typescript
export const searchProjectsByField = query({
  args: {
    searchQuery: v.string(),
    searchField: v.union(
      v.literal('name'),
      v.literal('description'),
      v.literal('tags'),
      v.literal('notes'),
      v.literal('all')
    ),
    status: v.optional(projectsValidators.status),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const query = args.searchQuery.trim();

    if (!query) {
      throw new Error('Search query is required');
    }

    const { limit = 50, cursor, status } = args;

    // Helper to build search query
    const buildSearchQuery = (indexName: string, searchField: string) => {
      return ctx.db
        .query('freelancerProjects')
        .withSearchIndex(indexName, sq => {
          let search = sq
            .search(searchField, query)
            .eq('ownerId', user._id)
            .eq('deletedAt', undefined);

          if (status) {
            search = search.eq('status', status);
          }

          return search;
        });
    };

    // Route to appropriate index
    const searchQuery = (() => {
      switch (args.searchField) {
        case 'name':
          return buildSearchQuery('search_by_name', 'name');
        case 'description':
          return buildSearchQuery('search_by_description', 'description');
        case 'tags':
          return buildSearchQuery('search_by_tags', 'tags');
        case 'notes':
          return buildSearchQuery('search_by_notes', 'notes');
        case 'all':
        default:
          // Search all fields and combine results
          // This is complex - usually better to use Pattern 2
          throw new Error('Use searchProjects for all-field search');
      }
    })();

    const page = await searchQuery.paginate({
      numItems: limit,
      cursor: cursor ?? null,
    });

    return {
      items: await filterProjectsByAccess(ctx, page.page, user),
      total: page.page.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
```

**Pros**:
- ✅ Very fast field-specific search
- ✅ No denormalized fields
- ✅ Precise search control

**Cons**:
- ❌ More indexes = more storage
- ❌ ~100 bytes per field per document
- ❌ Complex to implement "search all"

---

### SearchIndex Best Practices

1. **Start without search** - Add only when needed
2. **Use Pattern 2 for most cases** - Single combined search
3. **Keep searchableText lowercase** - For case-insensitive search
4. **Always rebuild on update** - Merge existing + new values
5. **Use the canonical not-deleted filter in the search builder**  
   `.eq('deletedAt', undefined)`
6. **Add filterFields** - For common filters (ownerId, status, deletedAt)
7. **Fallback to indexed query** - When no search term provided

---

## Metadata Patterns

### Overview

Metadata stores operational/contextual data that doesn't fit in regular fields. Always use typed metadata - never `v.any()`.

### Pattern 1: Typed Metadata (Recommended)

**When to use**: Always - provides type safety and validation

**Implementation**:

```typescript
// validators.ts
export const projectsFields = {
  projectMetadata: v.object({
    // Budget tracking
    budgetAllocated: v.optional(v.number()),
    budgetSpent: v.optional(v.number()),
    
    // Time tracking
    estimatedHours: v.optional(v.number()),
    actualHours: v.optional(v.number()),
    
    // Dates
    lastReviewedAt: v.optional(v.number()),
    nextMilestoneDate: v.optional(v.number()),
    
    // Arrays
    stakeholders: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    
    // Nested objects
    budget: v.optional(v.object({
      amount: v.number(),
      currency: v.string(),
      spent: v.number(),
    })),
  }),
} as const;

// table definition
export const projectsTable = defineTable({
  name: v.string(),
  metadata: v.optional(projectsFields.projectMetadata),  // ✅ Typed
  // ... other fields
})
```

**Usage in mutations**:

```typescript
export const createProject = mutation({
  handler: async (ctx, { data }) => {
    const id = await ctx.db.insert('freelancerProjects', {
      name: data.name,
      metadata: {  // ✅ Type-safe
        budgetAllocated: data.budget,
        estimatedHours: data.hours,
        stakeholders: data.team,
      },
      // ... other fields
    });
    
    return id;
  },
});
```

**Pros**:
- ✅ Full type safety
- ✅ Convex validates structure
- ✅ IDE autocomplete works
- ✅ Self-documenting

**Cons**:
- ❌ Must update schema for new fields
- ❌ Less flexible than `v.any()`

---

### Pattern 2: Flexible Metadata with Type Safety

**When to use**: Change tracking, truly unknown shapes (rare)

**Implementation**:

```typescript
// For flexible but typed values
const metadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.record(v.string(), v.any()) // nested maps (rare; prefer explicit typing)
);

export const auditLogsFields = {
  auditMetadata: v.object({
    operation: v.optional(v.string()),
    
    // Change tracking with type safety
    oldValues: v.optional(v.record(v.string(), metadataValue)),
    newValues: v.optional(v.record(v.string(), metadataValue)),
    
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    source: v.optional(v.union(
      v.literal('web'),
      v.literal('api'),
      v.literal('system')
    )),
    
    // If you truly need arbitrary extra fields:
    // add a dedicated map instead of an index signature.
    extras: v.optional(v.record(v.string(), metadataValue)),
  }),
};
```

**Usage**:

```typescript
await ctx.db.insert('auditLogs', {
  action: 'project.updated',
  metadata: {
    operation: 'update',
    oldValues: {
      name: 'Old Project Name',
      status: 'active',
      budget: 5000,
    },
    newValues: {
      name: 'New Project Name',
      status: 'active',
      budget: 7500,
    },
    changedFields: ['name', 'budget'],  // Additional field
  },
  // ... other fields
});
```

---

### Metadata Best Practices

1. **Always define typed metadata** - Never use `v.any()` directly
2. **Make metadata optional** - `v.optional(fields.metadata)`
3. **Document purpose** - Comment what metadata contains
4. **Keep flat** - Max 1-2 levels of nesting
5. **Use for operational data** - Not core domain data
6. **Validate on write** - Don't trust client input

**Common metadata uses**:
- Budget and cost tracking
- Time estimates vs actuals
- Last accessed/reviewed timestamps
- User preferences
- Feature flags
- External system IDs
- Change tracking
- Test/debug information

---

## Bulk Operations

### Overview

Bulk operations allow efficient mass updates/deletes with proper access control and audit logging.

### Pattern: Chunked Bulk Operations

**Key requirements**:
- Chunk IDs (default 50 per chunk)
- Check access per entity
- Single audit log for entire operation
- Return summary with denied items

**Implementation**:

```typescript
import { chunkIds } from '@/shared/bulk.helper';

export const bulkUpdateProjects = mutation({
  args: {
    ids: v.array(v.id("freelancerProjects")),
    updates: v.object({
      status: v.optional(projectsValidators.status),
      priority: v.optional(projectsValidators.priority),
      tags: v.optional(v.array(v.string())),
    }),
    chunkSize: v.optional(v.number()),
  },
  handler: async (ctx, { ids, updates, chunkSize }) => {
    const user = await requireCurrentUser(ctx);

    // Permission check
    await requirePermission(ctx, PROJECTS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // Validate updates
    const trimmed = trimProjectData(updates);
    const errors = validateProjectData(trimmed);
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
        const canEdit = await canEditProject(ctx, doc, user);
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
      action: "projects.bulk_updated",
      entityType: "freelancerProjects",
      entityId: "bulk",  // Special ID for bulk
      entityTitle: "Projects bulk update",
      description: `Bulk updated ${updatedCount} projects`,
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
```

### Bulk Operation Variants

**Bulk Delete**:
```typescript
export const bulkDeleteProjects = mutation({
  // Similar structure, but:
  // - Patch deletedAt fields instead of updates
  // - Use canDeleteProject for access check
  // - Action: "projects.bulk_deleted"
});
```

**Bulk Status Update**:
```typescript
export const bulkSetProjectStatus = mutation({
  // Simplified version for single field
  // - Only update status field
  // - Useful for "archive many", "complete many"
});
```

**Bulk Tag Operations**:
```typescript
export const bulkAddProjectTags = mutation({
  // Add tags to existing tags array
  // - Merge with existing tags
  // - Respect MAX_TAGS limit
  // - Remove duplicates
});

export const bulkRemoveProjectTags = mutation({
  // Remove tags from existing tags array
  // - Filter out specified tags
});
```

### Bulk Operation Best Practices

1. **Always chunk** - Default 50 items per chunk
2. **Check access per item** - Don't assume bulk permission
3. **Track denied items** - Return publicIds that failed
4. **Single audit log** - With summary metadata
5. **Use entityId: 'bulk'** - For bulk audit logs
6. **Validate before loop** - Fail fast on invalid updates
7. **Return summary** - requestedCount, updatedCount/deletedCount, denied

---

## PublicId Configuration

### Overview

PublicIds provide stable, external-facing identifiers that are:
- Short and readable (`fprj_abc123xyz`)
- Unique across table
- Safe to expose in URLs/APIs
- Separate from internal `_id`

### Implementation

**Step 1: Register Table**

```typescript
// convex/shared/config/publicId.ts
export const PUBLIC_ID_PREFIXES = {
  freelancerProjects: 'fprj',  // 3-5 chars
  freelancerClients: 'fcli',
  freelancerInvoices: 'finv',
  emailLogs: 'emlog',
  emailTemplates: 'emtpl',
  auditLogs: 'aulog',
  // ... other tables
} as const;
```

**Step 2: Add to Schema**

```typescript
// Schema
export const projectsTable = defineTable({
  publicId: v.string(),
  name: v.string(),
  // ... other fields
})
  .index('by_public_id', ['publicId']);  // Required index
```

**Step 3: Generate in Mutation**

```typescript
import { generateUniquePublicId } from '@/shared/utils/publicId';

export const createProject = mutation({
  handler: async (ctx, { data }) => {
    const publicId = await generateUniquePublicId(ctx, 'freelancerProjects');

    const id = await ctx.db.insert('freelancerProjects', {
      publicId,
      name: data.name,
      // ... other fields
    });

    return id;
  },
});
```

**Step 4: Query by PublicId**

```typescript
export const getProjectByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const project = await ctx.db
      .query('freelancerProjects')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(notDeleted)
      .first();

    if (!project) {
      throw new Error('Project not found');
    }

    await requireViewProjectAccess(ctx, project, user);
    return project;
  },
});
```

### PublicId Best Practices

1. **Register all tables** - In PUBLIC_ID_PREFIXES config
2. **Use 3-5 char prefixes** - Short but meaningful
3. **Group related tables** - `fprj`, `fcli`, `finv` (all `f*` for freelancer)
4. **Always index** - `.index('by_public_id', ['publicId'])`
5. **Use in APIs** - Expose publicId, not _id
6. **Use in audit logs** - `entityId: publicId`
7. **Use in URLs** - `/projects/fprj_abc123xyz`

---

## Pagination Patterns

### Overview

Use cursor-based pagination for consistent, scalable list queries.

### Standard Pagination Pattern

```typescript
export const getProjects = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, cursor } = args;

    const page = await ctx.db
      .query('freelancerProjects')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .filter(notDeleted)
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: cursor ?? null,  // ✅ Important: ?? null
      });

    const items = await filterProjectsByAccess(ctx, page.page, user);

    return {
      items,
      total: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
```

### Client-Side Usage

```typescript
// Initial load
const { items, cursor, hasMore } = await convex.query(
  api.projects.queries.getProjects,
  { limit: 50 }
);

// Load more
if (hasMore) {
  const next = await convex.query(
    api.projects.queries.getProjects,
    { limit: 50, cursor }
  );
}
```

### Pagination Best Practices

1. **Default limit: 50** - Good balance for most cases
2. **Max limit: 100** - Prevent over-fetching
3. **Use cursor ?? null** - Type safety
4. **Return hasMore** - For UI loading state
5. **Return cursor** - For next page
6. **Filter after pagination** - Permission checks on page only
7. **Order consistently** - Usually `.order('desc')` for newest first

---

## Performance Optimization

### Index Strategy

**Rule 1: Most selective field first**
```typescript
// ✅ Good - userId is most selective
.index('by_user_and_date', ['userId', 'createdAt'])

// ❌ Less efficient
.index('by_date_and_user', ['createdAt', 'userId'])
```

**Rule 2: Compound indexes for common filters**
```typescript
// Common: owner + status filter
.index('by_owner_and_status', ['ownerId', 'status'])

// Common: owner + category filter
.index('by_owner_and_category', ['ownerId', 'categoryId'])
```

**Rule 3: Don't over-index**
```typescript
// ❌ Too many indexes
.index('by_owner', ['ownerId'])
.index('by_owner_and_status', ['ownerId', 'status'])
.index('by_owner_and_priority', ['ownerId', 'priority'])
.index('by_owner_status_priority', ['ownerId', 'status', 'priority'])

// ✅ Just what you need
.index('by_owner_id', ['ownerId'])
.index('by_owner_and_status', ['ownerId', 'status'])
```

### Query Optimization

**Avoid N+1 queries**:
```typescript
// ❌ Bad - N+1 queries
for (const project of projects) {
  const client = await ctx.db.get(project.clientId);
}

// ✅ Good - batch fetch
const clientIds = [...new Set(projects.map(p => p.clientId))];
const clients = await Promise.all(
  clientIds.filter(Boolean).map(id => ctx.db.get(id))
);
const clientMap = new Map(clients.map(c => [c._id, c]));
```

**Paginate early**:
```typescript
// ❌ Bad - collect all then filter
const all = await ctx.db.query('projects').collect();
const filtered = all.filter(p => p.status === 'active');

// ✅ Good - filter then paginate
const page = await ctx.db
  .query('projects')
  .withIndex('by_status', q => q.eq('status', 'active'))
  .paginate({ numItems: 50 });
```

**Denormalize counts**:
```typescript
// For hot paths, cache counts on parent
defineTable({
  name: v.string(),
  projectCount: v.number(),  // Denormalized
  activeProjectCount: v.number(),
})

// Update counts in mutations
await ctx.db.patch(clientId, {
  projectCount: client.projectCount + 1,
});
```

---

## Security Patterns

### Defense in Depth

**Layer 1: Authentication**
```typescript
const user = await requireCurrentUser(ctx);
```

**Layer 2: Global Permission**
```typescript
await requirePermission(ctx, 'projects:create', { allowAdmin: true });
```

**Layer 3: Resource Access**
```typescript
await requireEditProjectAccess(ctx, project, user);
```

**Layer 4: Field-Level**
```typescript
// Only owners can change certain fields
if (updates.billingRate && project.ownerId !== user._id) {
  throw new Error('Only owner can change billing rate');
}
```

### Permission Check Order

```typescript
// ✅ Correct order
export async function canEditProject(ctx, project, user) {
  // 1. Admin bypass (most permissive)
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // 2. Owner check
  if (project.ownerId === user._id) {
    return true;
  }

  // 3. Status restrictions (most restrictive)
  if (project.status === 'locked') {
    return false;
  }

  // 4. Default deny
  return false;
}
```

---

## Common Operations

### Cascade Delete Pattern

```typescript
export const deleteProject = mutation({
  handler: async (ctx, { id }) => {
    const project = await ctx.db.get(id);
    
    // Soft delete project
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
    });

    // Cascade to related entities
    const tasks = await ctx.db
      .query('projectTasks')
      .withIndex('by_project', q => q.eq('projectId', id))
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        deletedAt: now,
        deletedBy: user._id,
      });
    }

    // Audit log
    await ctx.db.insert('auditLogs', {
      // ... audit details
      metadata: {
        cascadedTasks: tasks.length,
      },
    });
  },
});
```

### Archive Pattern

```typescript
export const archiveProject = mutation({
  handler: async (ctx, { id }) => {
    const project = await ctx.db.get(id);

    // Archive (different from delete)
    await ctx.db.patch(id, {
      status: 'archived',
      archivedAt: now,
      archivedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      action: 'projects.archived',
      // ...
    });
  },
});
```

### Duplicate/Clone Pattern

```typescript
export const duplicateProject = mutation({
  args: { id: v.id('freelancerProjects') },
  handler: async (ctx, { id }) => {
    const original = await ctx.db.get(id);
    const publicId = await generateUniquePublicId(ctx, 'freelancerProjects');

    const newId = await ctx.db.insert('freelancerProjects', {
      ...original,
      _id: undefined,  // Clear internal ID
      _creationTime: undefined,
      publicId,  // New publicId
      name: `${original.name} (Copy)`,
      status: 'draft',  // Reset status
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return newId;
  },
});
```

---

## Real-World Examples

### Example 1: Freelancer Projects Module

**Location**: `convex/lib/software/freelancer_dashboard/projects/`

**Features**:
- Single combined search
- Bulk operations
- Cascade relationships
- Complex permissions
- PublicId integration

**Study for**:
- Complete module structure
- Related entity handling
- Permission patterns

### Example 2: Email System

**Location**: `convex/lib/addons/email/`

**Features**:
- Multiple related tables
- No search (small dataset)
- System/user permissions
- External provider integration

**Study for**:
- Multi-table module
- System operations
- Provider patterns

### Example 3: Audit Logs

**Location**: `convex/lib/boilerplate/audit_logs/`

**Features**:
- Flexible typed metadata
- High-volume writes
- Read-only operations
- Admin-only access

**Study for**:
- Metadata patterns
- Performance considerations
- Admin patterns

---

## Quick Reference

### SearchIndex Checklist

- [ ] Decide if search is needed
- [ ] Add searchableText field only if using Pattern 2
- [ ] Add .searchIndex() definition
- [ ] Implement buildSearchableText helper
- [ ] Build searchableText in create mutation
- [ ] Rebuild searchableText in update mutation
- [ ] Implement search query
- [ ] Use .eq('deletedAt', undefined) in search builder
- [ ] Add fallback to indexed query

### Metadata Checklist

- [ ] Define typed metadata object
- [ ] Make metadata optional
- [ ] Document what fields mean
- [ ] Use in mutations
- [ ] Never use v.any() directly

### Bulk Operations Checklist

- [ ] Import chunkIds helper
- [ ] Check global permission
- [ ] Trim and validate updates
- [ ] Chunk IDs (default 50)
- [ ] Check access per entity
- [ ] Track denied items
- [ ] Single audit log with summary
- [ ] Return summary object

### PublicId Checklist

- [ ] Register in PUBLIC_ID_PREFIXES
- [ ] Add publicId field to schema
- [ ] Add by_public_id index
- [ ] Generate in create mutation
- [ ] Use in audit logs
- [ ] Implement getByPublicId query

---

## Troubleshooting

### SearchIndex Issues

**Problem**: Search returns old content

**Solution**: Rebuild searchableText in update
```typescript
const searchableText = buildSearchableText({
  name: trimmed.name ?? existing.name,
  description: trimmed.description ?? existing.description,
});
```

**Problem**: Search returns deleted items

**Solution**: Use .eq('deletedAt', undefined) in search builder
```typescript
.withSearchIndex('search_all', sq =>
  sq.search('searchableText', query)
    .eq('deletedAt', undefined)  // ✅
)
```

### Bulk Operation Issues

**Problem**: Bulk operation times out

**Solution**: Reduce chunk size
```typescript
const chunks = chunkIds(ids, 25);  // Smaller chunks
```

**Problem**: Some items silently fail

**Solution**: Check denied array in return value
```typescript
const { updatedCount, denied } = await mutation(...);
if (denied.length > 0) {
  console.log('Failed items:', denied);
}
```

### Performance Issues

**Problem**: Query is slow

**Solutions**:
1. Add index for filter fields
2. Use compound index for combinations
3. Paginate earlier
4. Reduce in-memory filtering

**Problem**: N+1 queries

**Solution**: Batch fetch related entities
```typescript
const clientIds = [...new Set(projects.map(p => p.clientId))];
const clients = await Promise.all(clientIds.map(id => ctx.db.get(id)));
```

---

## Appendix

### A. Pattern Comparison

| Pattern | Complexity | Performance | Flexibility | Use When |
|---------|-----------|-------------|-------------|----------|
| No Search | Low | Good (small) | High | <1K items |
| Combined Search | Medium | Excellent | Medium | Most cases |
| Field-Specific | High | Excellent | Low | Power users |
| Typed Metadata | Low | N/A | Medium | Always |
| Bulk Operations | Medium | Good | Medium | Admin tools |

### B. Storage Overhead

| Feature | Overhead per Document |
|---------|----------------------|
| publicId | ~20 bytes |
| searchableText | ~500 bytes average |
| Single search index | ~500 bytes |
| Field-specific index | ~100 bytes per field |
| Typed metadata | Variable (actual data size) |

### C. Common Mistakes

1. ❌ Using v.any() for metadata
2. ❌ Not rebuilding searchableText on update
3. ❌ Using .filter(notDeleted) with search indexes
4. ❌ Not checking access in bulk operations
5. ❌ Hard deleting instead of soft delete
6. ❌ Not chunking bulk operations
7. ❌ Using _id instead of publicId in audit logs
8. ❌ Over-indexing tables

### D. Performance Benchmarks

**Query performance** (very rough order-of-magnitude; varies by dataset and deployment):

| Operation | No Index | With Index | Search Index |
|-----------|----------|------------|--------------|
| Single lookup | ~5ms | ~1ms | ~2ms |
| Filter 1K items | ~50ms | ~5ms | ~3ms |
| Filter 10K items | ~500ms | ~10ms | ~5ms |
| Text search 1K items | ~100ms | N/A | ~5ms |
| Text search 10K items | ~1000ms | N/A | ~10ms |

---

**End of Documentation**

This completes the 5-document implementation guide:
1. ✅ Planning
2. ✅ Schema Implementation
3. ✅ Library Implementation
4. ✅ Consistency Review
5. ✅ Advanced Patterns

All documents are self-contained with embedded reference sections and troubleshooting.
