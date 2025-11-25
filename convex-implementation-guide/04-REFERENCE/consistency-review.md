# Consistency Review (Phase 3)

> Quality assurance checklist to verify implementation correctness before deployment.

## Table of Contents

- [Overview](#overview)
- [Review Process](#review-process)
- [1. Field Consistency](#1-field-consistency)
- [2. Validator vs Constants Consistency](#2-validator-vs-constants-consistency)
- [3. Permission Consistency](#3-permission-consistency)
- [4. Validation & Trimming Consistency](#4-validation--trimming-consistency)
- [5. Audit Log Consistency](#5-audit-log-consistency)
- [6. Soft Delete Consistency](#6-soft-delete-consistency)
- [7. SearchIndex Consistency](#7-searchindex-consistency)
- [8. Type Safety Consistency](#8-type-safety-consistency)
- [9. Index Usage Consistency](#9-index-usage-consistency)
- [10. Return Value Consistency](#10-return-value-consistency)
- [11. Import Path Consistency](#11-import-path-consistency)
- [12. Folder Naming Consistency](#12-folder-naming-consistency)
- [Quick Reference](#quick-reference)
- [Automated Checks](#automated-checks)
- [Appendix](#appendix)

---

## Overview

Phase 3 is the quality assurance step. Run these checks after completing schema and library implementation to ensure:
> **Invariant:** all default reads exclude soft-deleted docs (`deletedAt` is undefined) unless explicitly retrieving deleted items.

- Correctness: All required patterns are followed
- Consistency: Naming and structure are uniform
- Security: Permissions and auth are complete
- Performance: Indexes and queries are optimized

### When to Run This Review

- ✅ After completing all schema files
- ✅ After completing all library files
- ✅ Before first deployment
- ✅ After major refactoring
- ✅ Before code review

### Review Goals

- Catch implementation errors early
- Ensure security patterns are complete
- Verify performance optimizations
- Maintain codebase consistency

---

## Review Process

Follow this order for systematic review:

```
1. Field Consistency          → Main display fields match everywhere
2. Validator/Constants        → Values are synchronized
3. Permissions                → Auth/authz is complete
4. Validation/Trimming        → All inputs are sanitized
5. Audit Logs                 → All mutations log
6. Soft Delete                → No hard deletes exist
7. SearchIndex Consistency    → Search is properly implemented (or removed)
8. Type Safety                → No `any` types
9. Index Usage                → Queries use indexes
10. Return Values             → Consistent shapes
11. Import Paths              → No circular deps
12. Folder Naming             → No reserved names
```

**Recommended approach**: Check one section at a time, fix issues, then move to next.

---

## 1. Field Consistency

### What to Check

Verify the main display field (name/title/displayName) is used consistently across:
- Schema table definition
- Schema indexes
- Audit logs
- Search queries

### Manual Checks

**Schema has display field**:
```bash
# Should find: name: v.string() or title: v.string()
grep -r "name:\|title:\|displayName:" convex/schema/{category}/{entity}/{module}/
```

**Schema indexes display field**:
```bash
# Should find: .index('by_name', ['name'])
grep -r "by_name\|by_title\|by_displayName" convex/schema/{category}/{entity}/{module}/{module}.ts
```

**Audit logs use display field**:
```bash
# Should find: entityTitle: trimmed.{displayField} or existing.{displayField}
grep -r "entityTitle:" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Search filters use display field**:
```bash
# Should find: i.{displayField}.toLowerCase() or similar
grep -r "\.{displayField}\.\|\.title\.\|\.displayName\." convex/lib/{category}/{entity}/{module}/queries.ts
```

### Common Issues

❌ **Schema uses `name` but audit logs use `title`**
```typescript
// Schema
name: v.string()

// Audit log (wrong)
entityTitle: trimmed.title  // ❌ Should be trimmed.{displayField}
```

✅ **Fix**: Use same field everywhere
```typescript
entityTitle: trimmed.{displayField}  // ✅ Matches schema
```

### Verification Command

```bash
# Check all display field references
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Schema Definition ==="
grep "name:\|title:\|displayName:" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts

echo "=== Schema Index ==="
grep "by_name\|by_title\|by_displayName" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts

echo "=== Audit Logs ==="
grep "entityTitle:" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts

echo "=== Queries ==="
grep "\.{displayField}\|\.title\|\.displayName" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts
```

---

## 2. Validator vs Constants Consistency

### What to Check

Constants should be the canonical source of truth. Validators should mirror them, not duplicate independently.

### Manual Checks

**Compare validator values to constants**:
```bash
# Check validators
grep -A 10 "Validators = {" convex/schema/{category}/{entity}/{module}/validators.ts

# Check constants
grep -A 20 "CONSTANTS = {" convex/lib/{category}/{entity}/{module}/constants.ts
```

### Example Comparison

**Schema validators**:
```typescript
// convex/schema/.../validators.ts
export const projectsValidators = {
  status: v.union(
    v.literal('active'),    // ← Must match constants
    v.literal('archived'),
    v.literal('completed')
  ),
}
```

**Library constants**:
```typescript
// convex/lib/.../constants.ts
export const PROJECTS_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',      // ← Must match validators
    ARCHIVED: 'archived',
    COMPLETED: 'completed',
  },
}
```

### Common Issues

❌ **Mismatch in values**:
```typescript
// Validator
v.literal('in_progress')  // ❌ Different from constant

// Constant
ACTIVE: 'active'          // ❌ Different from validator
```

✅ **Fix**: Synchronize values
```typescript
// Both should use: 'active', 'archived', 'completed'
```

### Verification Strategy

1. **Extract validator literals**:
   ```bash
   grep "v.literal" convex/schema/{category}/{entity}/{module}/validators.ts
   ```

2. **Extract constant values**:
   ```bash
   grep ":" convex/lib/{category}/{entity}/{module}/constants.ts | grep -v "//"
   ```

3. **Compare manually** - ensure all values match

---

## 3. Permission Consistency

### What to Check

- All mutations call `requireCurrentUser`
- All mutations check permissions
- All queries call `requireCurrentUser` (unless public/internal)
- All list queries filter by access  
  (and visibility/team branches only exist if the schema defines `visibility`)

### Manual Checks

**Count mutations**:
```bash
grep -c "export const" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Count requireCurrentUser in mutations**:
```bash
grep -c "requireCurrentUser" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Count permission checks in mutations**:
```bash
grep -c "requirePermission\|requireEdit\|requireDelete" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Count requireCurrentUser in queries**:
```bash
grep -c "requireCurrentUser" convex/lib/{category}/{entity}/{module}/queries.ts
```

**Check list queries use access filtering**:
```bash
grep -c "filter.*sByAccess" convex/lib/{category}/{entity}/{module}/queries.ts
```

### Expected Results

| Check | Expected | What It Means |
|-------|----------|---------------|
| Mutations count | N | Number of exported mutations |
| requireCurrentUser in mutations | ≥ N | Every mutation must auth |
| Permission checks | ≥ N | Every mutation must authorize |
| requireCurrentUser in queries | ≥ N-M | All queries except public/internal |
| Access filtering in lists | ≥ 1 | List queries filter by permission |

### Common Issues

❌ **Missing auth**:
```typescript
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    // ❌ Missing: const user = await requireCurrentUser(ctx);
    await ctx.db.patch(id, updates);
  },
});
```

✅ **Fix**: Add auth
```typescript
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);  // ✅
    const existing = await ctx.db.get(id);
    await requireEditProjectAccess(ctx, existing, user);  // ✅
    await ctx.db.patch(id, updates);
  },
});
```

❌ **Missing access filter in list**:
```typescript
export const getProjects = query({
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const page = await ctx.db.query('projects').paginate(...);
    return page.page;  // ❌ Missing access filter
  },
});
```

✅ **Fix**: Filter by access
```typescript
export const getProjects = query({
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const page = await ctx.db.query('projects').paginate(...);
    const items = await filterProjectsByAccess(ctx, page.page, user);  // ✅
    return items;
  },
});
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Mutation Count ==="
grep -c "export const" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts

echo "=== Auth Checks ==="
grep -c "requireCurrentUser" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts

echo "=== Permission Checks ==="
grep -c "requirePermission\|requireEdit\|requireDelete" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts

echo "=== Query Auth ==="
grep -c "requireCurrentUser" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts

echo "=== Access Filtering ==="
grep -c "filter.*sByAccess" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts
```

---

## 4. Validation & Trimming Consistency

### What to Check

- All mutations trim before validation
- All string inputs are trimmed
- Validation returns string array
- No mutations skip validation

### Manual Checks

**Check trim is called**:
```bash
grep -c "trim.*Data" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Check validate is called**:
```bash
grep -c "validate.*Data" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Check trim before validate order**:
```bash
grep -A 2 "trim.*Data" convex/lib/{category}/{entity}/{module}/mutations.ts | grep "validate"
```

### Expected Pattern

```typescript
// ✅ Correct order
const trimmed = trim{Module}Data(data);
const errors = validate{Module}Data(trimmed);
if (errors.length) {
  throw new Error(errors.join(', '));
}
```

### Common Issues

❌ **No trimming**:
```typescript
// ❌ Missing trim
const errors = validateProjectData(data);
```

✅ **Fix**: Add trimming
```typescript
// ✅ Trim then validate
const trimmed = trimProjectData(data);
const errors = validateProjectData(trimmed);
```

❌ **Wrong order**:
```typescript
// ❌ Validate then trim
const errors = validateProjectData(data);
const trimmed = trimProjectData(data);
```

✅ **Fix**: Correct order
```typescript
// ✅ Trim then validate
const trimmed = trimProjectData(data);
const errors = validateProjectData(trimmed);
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Mutation Count ==="
MUTATION_COUNT=$(grep -c "export const" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "$MUTATION_COUNT mutations found"

echo "=== Trim Calls ==="
TRIM_COUNT=$(grep -c "trim.*Data" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "$TRIM_COUNT trim calls found"

echo "=== Validate Calls ==="
VALIDATE_COUNT=$(grep -c "validate.*Data" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "$VALIDATE_COUNT validate calls found"

if [ $TRIM_COUNT -ge $MUTATION_COUNT ] && [ $VALIDATE_COUNT -ge $MUTATION_COUNT ]; then
  echo "✅ All mutations trim and validate"
else
  echo "❌ Some mutations missing trim or validate"
fi
```

---

## 5. Audit Log Consistency

### What to Check

- Every mutation inserts audit log
- `entityType` matches table name
- `entityId` uses publicId (not _id)
- Bulk operations use `entityId: 'bulk'`

### Manual Checks

**Count mutations**:
```bash
grep -c "export const" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Count audit log inserts**:
```bash
grep -c "insert('auditLogs'" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Check entityType is correct**:
```bash
grep "entityType:" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Check entityId uses publicId**:
```bash
grep -A 5 "insert('auditLogs'" convex/lib/{category}/{entity}/{module}/mutations.ts | grep "entityId:"
```

### Expected Pattern

**Single entity operation**:
```typescript
await ctx.db.insert('auditLogs', {
  userId: user._id,
  userName: user.{displayField} || user.email || 'Unknown',
  action: '{module}.created',
  entityType: '{tableName}',      // ✅ Matches table name
  entityId: publicId,              // ✅ Uses publicId, not _id
  entityTitle: trimmed.{displayField},       // ✅ Uses display field
  description: `Created {module}: ${trimmed.{displayField}}`,
  createdAt: now,
  createdBy: user._id,
  updatedAt: now,
});
```

**Bulk operation**:
```typescript
await ctx.db.insert('auditLogs', {
  userId: user._id,
  userName: user.{displayField} || user.email || 'Unknown',
  action: '{module}.bulk_updated',
  entityType: '{tableName}',
  entityId: 'bulk',                // ✅ Special ID for bulk
  entityTitle: '{module} bulk update',
  description: `Bulk updated ${updatedCount} items`,
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
```

### Common Issues

❌ **Wrong entityType**:
```typescript
entityType: 'project',  // ❌ Should be 'freelancerProjects'
```

✅ **Fix**: Use table name
```typescript
entityType: 'freelancerProjects',  // ✅
```

❌ **Using _id instead of publicId**:
```typescript
entityId: id,  // ❌ This is the internal _id
```

✅ **Fix**: Use publicId
```typescript
entityId: existing.publicId,  // ✅
```

❌ **Missing audit log**:
```typescript
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    // ❌ Missing audit log
    return id;
  },
});
```

✅ **Fix**: Add audit log
```typescript
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    
    // ✅ Add audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'projects.updated',
      entityType: 'freelancerProjects',
      entityId: existing.publicId,
      entityTitle: existing.{displayField},
      description: `Updated project: ${existing.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });
    
    return id;
  },
});
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"
TABLE_NAME="freelancerProjects"

echo "=== Mutation Count ==="
MUTATION_COUNT=$(grep -c "export const" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "$MUTATION_COUNT mutations found"

echo "=== Audit Log Count ==="
AUDIT_COUNT=$(grep -c "insert('auditLogs'" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "$AUDIT_COUNT audit logs found"

echo "=== EntityType Check ==="
grep "entityType:" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts | sort | uniq
echo "Expected: entityType: '$TABLE_NAME'"

echo "=== EntityId Usage ==="
grep -A 5 "insert('auditLogs'" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts | grep "entityId:"

if [ $AUDIT_COUNT -ge $MUTATION_COUNT ]; then
  echo "✅ All mutations have audit logs"
else
  echo "❌ Some mutations missing audit logs"
fi
```

---

## 6. Soft Delete Consistency

### What to Check

- No `ctx.db.delete()` calls in standard modules
- All **default** queries exclude deleted docs:
  - regular indexes → `.filter(notDeleted)`
  - search indexes → `.eq('deletedAt', undefined)` inside builder
- Delete mutations patch `deletedAt` field

### Manual Checks

**Check for hard deletes (should be 0)**:
```bash
grep -r "ctx.db.delete" convex/lib/{category}/{entity}/{module}/
```

**Check queries use soft delete filter**:
```bash
grep -c "filter(notDeleted)\|eq('deletedAt', undefined)" convex/lib/{category}/{entity}/{module}/queries.ts
```

**Check delete mutations patch deletedAt**:
```bash
grep -A 10 "export const delete" convex/lib/{category}/{entity}/{module}/mutations.ts | grep "deletedAt:"
```

### Expected Patterns

**Regular index queries**:
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅ Use notDeleted helper
  .collect();
```

**Search index queries**:
```typescript
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq =>
    sq.search('searchableText', query)
      .eq('deletedAt', undefined)  // ✅ Use .eq() in builder
  );
```

**Delete mutation**:
```typescript
export const deleteProject = mutation({
  handler: async (ctx, { id }) => {
    const now = Date.now();
    
    // ✅ Soft delete - patch fields
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    
    // ❌ Never use: await ctx.db.delete(id);
  },
});
```

### Common Issues

❌ **Hard delete used**:
```typescript
await ctx.db.delete(id);  // ❌ Never do this
```

✅ **Fix**: Use soft delete
```typescript
await ctx.db.patch(id, {
  deletedAt: now,
  deletedBy: user._id,
  updatedAt: now,
  updatedBy: user._id,
});
```

❌ **Missing soft delete filter**:
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .collect();  // ❌ Missing notDeleted filter
```

✅ **Fix**: Add soft delete filter
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅
  .collect();
```

❌ **Wrong filter method with search index**:
```typescript
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq => sq.search('searchableText', query))
  .filter(notDeleted);  // ❌ Don't use with search index
```

✅ **Fix**: Use .eq() in search builder
```typescript
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq =>
    sq.search('searchableText', query)
      .eq('deletedAt', undefined)  // ✅
  );
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Hard Delete Check (should be 0) ==="
HARD_DELETE=$(grep -r "ctx.db.delete" convex/lib/$CATEGORY/$ENTITY/$MODULE/ | wc -l)
echo "$HARD_DELETE hard deletes found"

if [ $HARD_DELETE -eq 0 ]; then
  echo "✅ No hard deletes found"
else
  echo "❌ Hard deletes found:"
  grep -rn "ctx.db.delete" convex/lib/$CATEGORY/$ENTITY/$MODULE/
fi

echo "=== Soft Delete Filter Check ==="
grep -c "filter(notDeleted)\|eq('deletedAt', undefined)" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts

echo "=== Delete Mutation Check ==="
grep -A 10 "export const delete" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts | grep "deletedAt:"
```

---

## 7. SearchIndex Consistency

### What to Check

**If using search indexes:**
- Schema has **required** `searchableText: v.string()` field
- Schema has matching `.searchIndex()` definition
- Create mutation sets searchableText on insert
- Update mutation recomputes searchableText on patch
- Queries use `.withSearchIndex()`
- Search queries include the canonical not-deleted filter in the builder:
  `.eq('deletedAt', undefined)`

**If NOT using search:**
- No `searchableText` field
- No `.searchIndex()` definitions
- No `buildSearchableText` helper
- Queries use in-memory filtering

### Manual Checks

**Check for searchableText field**:
```bash
grep "searchableText:" convex/schema/{category}/{entity}/{module}/{module}.ts
```

**Check for searchIndex definition**:
```bash
grep "\.searchIndex" convex/schema/{category}/{entity}/{module}/{module}.ts
```

**Check buildSearchableText in mutations**:
```bash
grep "buildSearchableText" convex/lib/{category}/{entity}/{module}/mutations.ts
```

**Check search queries**:
```bash
grep "withSearchIndex" convex/lib/{category}/{entity}/{module}/queries.ts
```

### Decision Matrix

| Has searchableText? | Has .searchIndex()? | Has buildSearchableText? | Status |
|---------------------|---------------------|-------------------------|---------|
| ✅ Yes (required) | ✅ Yes | ✅ Yes | ✅ Correct (using search) |
| ❌ No | ❌ No | ❌ No | ✅ Correct (not using search) |
| ✅ Yes | ❌ No | ✅ Yes | ❌ Missing searchIndex |
| ✅ Yes | ✅ Yes | ❌ No | ❌ Missing builder |
| ❌ No | ✅ Yes | ❌ No | ❌ Missing field |

### Common Issues

❌ **Has searchIndex but missing field**:
```typescript
// Schema
defineTable({
  name: v.string(),
  // ❌ Missing: searchableText: v.string()
})
  .searchIndex('search_all', {  // ❌ Index without field
    searchField: 'searchableText',
  })
```

✅ **Fix**: Add searchableText field
```typescript
defineTable({
  name: v.string(),
  searchableText: v.string(),  // ✅
})
  .searchIndex('search_all', {
    searchField: 'searchableText',
  })
```

❌ **Has searchIndex but not maintaining field**:
```typescript
// Mutation
await ctx.db.insert('tableName', {
  {displayField}: trimmed.{displayField},
  // ❌ Missing: searchableText: buildSearchableText(trimmed)
});
```

✅ **Fix**: Build and include searchableText
```typescript
const searchableText = buildSearchableText(trimmed);  // ✅

await ctx.db.insert('tableName', {
  {displayField}: trimmed.{displayField},
  searchableText,  // ✅
});
```

❌ **Update doesn't rebuild searchableText**:
```typescript
// Update mutation
await ctx.db.patch(id, {
  ...trimmed,
  // ❌ Missing searchableText rebuild
  updatedAt: now,
});
```

✅ **Fix**: Rebuild with current values
```typescript
const searchableText = buildSearchableText({
  {displayField}: trimmed.{displayField} ?? existing.{displayField},
  description: trimmed.description ?? existing.description,
});

await ctx.db.patch(id, {
  ...trimmed,
  searchableText,  // ✅
  updatedAt: now,
});
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== SearchIndex Status ==="

HAS_FIELD=$(grep -c "searchableText:" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts)
HAS_INDEX=$(grep -c "\.searchIndex" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts)
HAS_BUILDER=$(grep -c "buildSearchableText" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)

echo "searchableText field: $HAS_FIELD"
echo "searchIndex definition: $HAS_INDEX"
echo "buildSearchableText calls: $HAS_BUILDER"

if [ $HAS_FIELD -gt 0 ] && [ $HAS_INDEX -gt 0 ] && [ $HAS_BUILDER -gt 0 ]; then
  echo "✅ Search indexes properly implemented"
elif [ $HAS_FIELD -eq 0 ] && [ $HAS_INDEX -eq 0 ] && [ $HAS_BUILDER -eq 0 ]; then
  echo "✅ Not using search indexes (correct)"
else
  echo "❌ Inconsistent search index implementation"
fi
```

---

## 8. Type Safety Consistency

### What to Check

- Minimal `any` usage
- All metadata fields use typed validators (no `v.any()`)
- Metadata is optional
- All tables with `publicId` registered in `PUBLIC_ID_PREFIXES`

### Manual Checks

**Check for `any` types**:
```bash
grep -r ": any" convex/lib/{category}/{entity}/{module}/
```

**Check for untyped metadata**:
```bash
grep -r "metadata.*v\.any()" convex/schema/
```

**Check publicId registration**:
```bash
# Get tables with publicId
grep -r "publicId: v.string()" convex/schema/{category}/{entity}/{module}/

# Compare with registration
cat convex/shared/config/publicId.ts | grep -A 100 "PUBLIC_ID_PREFIXES"
```

### Expected Patterns

**Typed metadata**:
```typescript
// ✅ Correct - typed metadata
export const projectsFields = {
  projectMetadata: v.object({
    budget: v.optional(v.number()),
    deadline: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  }),
};

// Schema
metadata: v.optional(projectsFields.projectMetadata),  // ✅
```

**PublicId registration**:
```typescript
// convex/shared/config/publicId.ts
export const PUBLIC_ID_PREFIXES = {
  freelancerProjects: 'fprj',  // ✅ Registered
  // ...
} as const;
```

### Common Issues

❌ **Using v.any() for metadata**:
```typescript
metadata: v.optional(v.any())  // ❌ No type safety
```

✅ **Fix**: Define typed metadata
```typescript
// validators.ts
projectMetadata: v.object({
  budget: v.optional(v.number()),
  deadline: v.optional(v.number()),
})

// table definition
metadata: v.optional(projectsFields.projectMetadata)  // ✅
```

❌ **Using `any` in utilities**:
```typescript
export function trimProjectData(data: any): any {  // ❌
  // ...
}
```

✅ **Fix**: Use generics
```typescript
export function trimProjectData<
  T extends Partial<CreateProjectData | UpdateProjectData>
>(data: T): T {  // ✅
  // ...
}
```

❌ **Table has publicId but not registered**:
```typescript
// Schema has publicId
publicId: v.string()

// But PUBLIC_ID_PREFIXES missing entry
// ❌ Will cause type error when generating
```

✅ **Fix**: Register in config
```typescript
// convex/shared/config/publicId.ts
export const PUBLIC_ID_PREFIXES = {
  freelancerProjects: 'fprj',  // ✅
} as const;
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Type Safety Check ==="

echo "Any types found:"
grep -rn ": any" convex/lib/$CATEGORY/$ENTITY/$MODULE/ | wc -l

echo "Untyped metadata found:"
grep -rn "metadata.*v\.any()" convex/schema/$CATEGORY/$ENTITY/$MODULE/

echo "=== PublicId Registration Check ==="
echo "Tables with publicId:"
grep -r "publicId: v.string()" convex/schema/$CATEGORY/$ENTITY/$MODULE/

echo "Registered prefixes:"
cat convex/shared/config/publicId.ts | grep "$MODULE"
```

---

## 9. Index Usage Consistency

### What to Check

- Queries use `.withIndex()` when possible
- No full table scans for large tables
- Compound indexes for common filter combinations, ordered to match query prefixes

### Manual Checks

**Find queries without indexes**:
```bash
grep -A 5 "ctx.db.query" convex/lib/{category}/{entity}/{module}/queries.ts | grep -v "withIndex"
```

**Check for .collect() without filters**:
```bash
grep "\.collect()" convex/lib/{category}/{entity}/{module}/queries.ts
```

### Expected Pattern

**✅ Using indexes**:
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))  // ✅
  .filter(notDeleted)
  .collect();
```

**❌ Full table scan**:
```typescript
const items = await ctx.db
  .query('tableName')
  .collect();  // ❌ No index, no filter
```

### Common Issues

❌ **Missing index usage**:
```typescript
const items = await ctx.db
  .query('freelancerProjects')
  .filter(q => q.eq(q.field('ownerId'), user._id))  // ❌ Not using index
  .collect();
```

✅ **Fix**: Use index
```typescript
const items = await ctx.db
  .query('freelancerProjects')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))  // ✅
  .filter(notDeleted)
  .collect();
```

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Index Usage Check ==="

echo "Total queries:"
grep -c "ctx.db.query" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts

echo "Queries with indexes:"
grep -c "withIndex" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts

echo "Queries without indexes:"
grep -A 5 "ctx.db.query" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts | grep -v "withIndex" | grep -c "query"
```

---

## 10. Return Value Consistency

### What to Check

- Mutations return ID
- Bulk operations return summary object
- Queries return stable response shapes

### Expected Patterns

**Single mutation returns ID**:
```typescript
export const createProject = mutation({
  handler: async (ctx, { data }) => {
    const id = await ctx.db.insert('freelancerProjects', { ... });
    return id;  // ✅
  },
});
```

**Bulk mutation returns summary**:
```typescript
export const bulkUpdateProjects = mutation({
  handler: async (ctx, { ids, updates }) => {
    // ... processing
    return {  // ✅
      requestedCount: ids.length,
      updatedCount,
      denied,
    };
  },
});
```

**Query returns consistent shape**:
```typescript
export const getProjects = query({
  handler: async (ctx, args) => {
    // ... processing
    return {  // ✅ Always same shape
      items,
      total: items.length,
      hasMore: !page.isDone,
      cursor: page.continueCursor,
    };
  },
});
```

### Verification

Check return statements in mutations and queries match expected patterns.

---

## 11. Import Path Consistency

### What to Check

- No circular dependencies
- Correct aliasing with `@/`
- Schema doesn't import from library
- Library can import from schema

### Manual Checks

**Check schema imports**:
```bash
grep "import.*from" convex/schema/{category}/{entity}/{module}/*.ts
```

**Check library imports**:
```bash
grep "import.*from" convex/lib/{category}/{entity}/{module}/*.ts
```

### Rules

**✅ Allowed**:
- Schema → Base validators
- Library → Schema (types, validators)
- Library → Shared helpers
- Library → Generated types

**❌ Not allowed**:
- Schema → Library
- Schema → Generated types
- Validators → Schema files

### Verification Commands

```bash
CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"

echo "=== Schema Imports (should not import from lib) ==="
grep "import.*from.*lib" convex/schema/$CATEGORY/$ENTITY/$MODULE/*.ts

echo "=== Validator Imports (should not import from schema files) ==="
grep "import.*from.*schema.*/$MODULE" convex/schema/$CATEGORY/$ENTITY/$MODULE/validators.ts
```

---

## 12. Folder Naming Consistency

### What to Check

- No folders named `logs` or `templates`
- All folders use descriptive snake_case

### Manual Checks

```bash
# Should return NO matches
find convex/lib -type d -name "logs" -o -name "templates"
find convex/schema -type d -name "logs" -o -name "templates"
```

### Expected Result

Both commands should return **nothing**. If they return folders, rename them:

- `logs` → `email_logs`, `audit_logs`, `system_logs`
- `templates` → `email_templates`, `form_templates`

---

## Quick Reference

### Complete Check Script

```bash
#!/bin/bash

CATEGORY="software"
ENTITY="freelancer_dashboard"
MODULE="projects"
TABLE_NAME="freelancerProjects"

echo "========================================="
echo "CONSISTENCY REVIEW: $MODULE"
echo "========================================="

# 1. Field Consistency
echo -e "\n1. FIELD CONSISTENCY"
echo "Display field in schema:"
grep "name:\|title:\|displayName:" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts

# 2. Validator/Constants
echo -e "\n2. VALIDATOR/CONSTANTS"
echo "Check manually - compare validator literals to constant values"

# 3. Permission Consistency
echo -e "\n3. PERMISSION CONSISTENCY"
MUTATION_COUNT=$(grep -c "export const" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
AUTH_COUNT=$(grep -c "requireCurrentUser" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
PERM_COUNT=$(grep -c "requirePermission\|requireEdit\|requireDelete" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "Mutations: $MUTATION_COUNT | Auth: $AUTH_COUNT | Permissions: $PERM_COUNT"

# 4. Trim/Validate
echo -e "\n4. TRIM/VALIDATE CONSISTENCY"
TRIM_COUNT=$(grep -c "trim.*Data" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
VALIDATE_COUNT=$(grep -c "validate.*Data" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "Trim: $TRIM_COUNT | Validate: $VALIDATE_COUNT"

# 5. Audit Logs
echo -e "\n5. AUDIT LOG CONSISTENCY"
AUDIT_COUNT=$(grep -c "insert('auditLogs'" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "Audit logs: $AUDIT_COUNT"
echo "EntityType values:"
grep "entityType:" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts | sort | uniq

# 6. Soft Delete
echo -e "\n6. SOFT DELETE CONSISTENCY"
HARD_DELETE=$(grep -r "ctx.db.delete" convex/lib/$CATEGORY/$ENTITY/$MODULE/ | wc -l)
echo "Hard deletes found: $HARD_DELETE (should be 0)"

# 7. SearchIndex
echo -e "\n7. SEARCHINDEX CONSISTENCY"
HAS_FIELD=$(grep -c "searchableText:" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts)
HAS_INDEX=$(grep -c "\.searchIndex" convex/schema/$CATEGORY/$ENTITY/$MODULE/$MODULE.ts)
HAS_BUILDER=$(grep -c "buildSearchableText" convex/lib/$CATEGORY/$ENTITY/$MODULE/mutations.ts)
echo "Field: $HAS_FIELD | Index: $HAS_INDEX | Builder: $HAS_BUILDER"

# 8. Type Safety
echo -e "\n8. TYPE SAFETY"
ANY_COUNT=$(grep -rn ": any" convex/lib/$CATEGORY/$ENTITY/$MODULE/ | wc -l)
echo "Any types found: $ANY_COUNT (should be minimal)"

# 9. Index Usage
echo -e "\n9. INDEX USAGE"
QUERY_COUNT=$(grep -c "ctx.db.query" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts)
INDEX_COUNT=$(grep -c "withIndex" convex/lib/$CATEGORY/$ENTITY/$MODULE/queries.ts)
echo "Queries: $QUERY_COUNT | With indexes: $INDEX_COUNT"

# 10. Return Values
echo -e "\n10. RETURN VALUE CONSISTENCY"
echo "Check manually - mutations return ID, bulk returns summary"

# 11. Import Paths
echo -e "\n11. IMPORT PATH CONSISTENCY"
echo "Schema importing from lib (should be empty):"
grep -c "import.*from.*lib" convex/schema/$CATEGORY/$ENTITY/$MODULE/*.ts

# 12. Folder Naming
echo -e "\n12. FOLDER NAMING CONSISTENCY"
echo "Reserved names found (should be empty):"
find convex/{lib,schema} -type d -name "logs" -o -name "templates"

echo -e "\n========================================="
echo "REVIEW COMPLETE"
echo "========================================="
```

Save as `check-consistency.sh` and run:
```bash
chmod +x check-consistency.sh
./check-consistency.sh
```

---

## Automated Checks

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/consistency-check.yml
name: Consistency Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for hard deletes
        run: |
          if grep -r "ctx.db.delete" convex/lib/; then
            echo "❌ Hard deletes found"
            exit 1
          fi
      
      - name: Check for reserved folder names
        run: |
          if find convex/{lib,schema} -type d -name "logs" -o -name "templates" | grep -q .; then
            echo "❌ Reserved folder names found"
            exit 1
          fi
      
      - name: Check for any types
        run: |
          COUNT=$(grep -rn ": any" convex/lib/ | wc -l)
          if [ $COUNT -gt 5 ]; then
            echo "❌ Too many any types: $COUNT"
            exit 1
          fi
```

---

## Appendix

### A. Common Patterns Summary

**Auth pattern**:
```typescript
const user = await requireCurrentUser(ctx);
await requirePermission(ctx, PERMISSION, { allowAdmin: true });
```

**Trim/validate pattern**:
```typescript
const trimmed = trimModuleData(data);
const errors = validateModuleData(trimmed);
if (errors.length) throw new Error(errors.join(', '));
```

**Soft delete pattern**:
```typescript
await ctx.db.patch(id, {
  deletedAt: now,
  deletedBy: user._id,
  updatedAt: now,
  updatedBy: user._id,
});
```

**Audit log pattern**:
```typescript
await ctx.db.insert('auditLogs', {
  userId: user._id,
  userName: user.{displayField} || user.email || 'Unknown',
  action: 'module.action',
  entityType: 'tableName',
  entityId: publicId,
  entityTitle: name,
  description: `Action description`,
  createdAt: now,
  createdBy: user._id,
  updatedAt: now,
});
```

### B. Checklist Summary

Print this and check off as you verify:

```
□ Field consistency (display field everywhere)
□ Validator/constants match
□ All mutations auth + authorize
□ All queries auth (unless public)
□ All list queries filter by access
□ All mutations trim then validate
□ All string inputs trimmed
□ All mutations create audit logs
□ EntityType matches table name
□ EntityId uses publicId
□ No hard deletes (ctx.db.delete)
□ All queries filter soft deletes correctly
□ SearchIndex properly implemented or removed
□ Minimal any types
□ Metadata is typed
□ Tables with publicId are registered
□ Queries use indexes
□ No full table scans
□ Mutations return ID
□ Bulk returns summary
□ No circular imports
□ No reserved folder names
```

---

**Next Document**: [05 - Advanced Patterns →](./05-advanced-patterns.md)
