# Troubleshooting Guide

> Common issues and their solutions across all phases of module implementation.

## Table of Contents

- [Schema Issues](#schema-issues)
- [Library Issues](#library-issues)
- [Query Issues](#query-issues)
- [Mutation Issues](#mutation-issues)
- [Performance Issues](#performance-issues)

---

## Schema Issues

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

**Solution**: Review Required Fields section in schema guide

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

## Library Issues

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

---

## Query Issues

### Error: searchableText Not Updating

**Problem**: Search returns old content after update

**Solution**: Rebuild searchableText in update mutation

```typescript
// ✅ Must rebuild with current values
const searchableText = buildSearchableText({
  {displayField}: trimmed.{displayField} ?? existing.{displayField},
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

### Error: Soft Delete Filter Not Working

**Problem**: Deleted items still appearing in queries

**Solution**: Use correct soft delete pattern

```typescript
// ✅ Regular indexes - use .filter(notDeleted)
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅ After index
  .collect();

// ✅ Search indexes - use .eq() in builder
const results = await ctx.db
  .query('tableName')
  .withSearchIndex('search_all', sq =>
    sq.search('searchableText', query)
      .eq('deletedAt', undefined)  // ✅ In builder
  );
  // ❌ DON'T add .filter(notDeleted) here
```

---

## Mutation Issues

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

### Error: Audit Log Missing

**Problem**: Mutation doesn't create audit log

**Solution**: Always log mutations

```typescript
// ✅ Always audit mutations
await ctx.db.insert('auditLogs', {
  userId: user._id,
  userName: user.{displayField} || user.email || 'Unknown',
  action: '{module}.created',
  entityType: '{tableName}',
  entityId: publicId,
  entityTitle: trimmed.{displayField},
  description: `Created {module}: ${trimmed.{displayField}}`,
  createdAt: now,
  createdBy: user._id,
  updatedAt: now,
});
```

### Error: Bulk Operation Timeout

**Problem**: Bulk operation fails with timeout

**Solution**: Check chunk size and reduce if needed

```typescript
// ✅ Reduce chunk size for complex operations
const chunks = chunkIds(ids, 25);  // Default is 50
```

---

## Performance Issues

### Problem: Slow Queries

**Checklist**:
1. Are you using indexes?
2. Is the most selective field first in compound indexes?
3. Are you paginating instead of collecting everything?
4. Are you avoiding N+1 queries?

**Solution**: Review Query Performance Tips

```typescript
// ❌ Bad - No index
const items = await ctx.db.query('tableName').collect();

// ✅ Good - Indexed + paginated
const page = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)
  .order('desc')
  .paginate({ numItems: 50, cursor: null });
```

### Problem: N+1 Queries

**Solution**: Batch fetch related data

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

---

## General Tips

1. **Check console for errors** - Convex logs detailed error messages
2. **Review types** - TypeScript errors often point to the issue
3. **Test incrementally** - Don't implement everything at once
4. **Use console.log** - Add logging to understand data flow
5. **Check existing modules** - Look at working examples for patterns
6. **Read error messages** - They usually tell you exactly what's wrong

For more specific issues, refer to the troubleshooting sections in:
- [Schema Implementation](../01-CORE/02-schema.md#troubleshooting)
- [Library Implementation](../01-CORE/03-library.md#troubleshooting)
