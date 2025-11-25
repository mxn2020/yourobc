# Migration Guide

> Guide for updating existing modules to follow current patterns and conventions.

## When to Migrate

Consider migrating when:
- Module doesn't follow current naming conventions
- Missing required fields (publicId, audit fields)
- Using outdated query patterns
- Not using proper soft delete
- Missing permission checks

## Pre-Migration Checklist

Before starting:
- [ ] Backup your database
- [ ] Review current module structure
- [ ] Identify what needs to change
- [ ] Plan migration steps
- [ ] Test in development first

---

## Schema Migrations

### Adding New Optional Field

**Step 1**: Add as optional in schema
```typescript
newField: v.optional(v.string())
```

**Step 2**: Deploy and backfill
```typescript
// migration.ts
const docs = await ctx.db.query('tableName').collect();
for (const doc of docs) {
  await ctx.db.patch(doc._id, {
    newField: 'default_value',
  });
}
```

**Step 3**: Make field required (if needed)
```typescript
newField: v.string()  // Remove v.optional()
```

### Adding Required Indexes

**Step 1**: Add index to schema
```typescript
.index('by_new_field', ['newField'])
```

**Step 2**: Deploy - Convex builds index automatically

**Step 3**: Update queries to use new index
```typescript
const items = await ctx.db
  .query('tableName')
  .withIndex('by_new_field', q => q.eq('newField', value))
  .collect();
```

### Adding publicId to Existing Table

**Step 1**: Add optional field
```typescript
publicId: v.optional(v.string())
```

**Step 2**: Backfill existing records
```typescript
const docs = await ctx.db
  .query('tableName')
  .filter(q => q.eq(q.field('publicId'), undefined))
  .collect();

for (const doc of docs) {
  const publicId = await generateUniquePublicId(ctx, 'tableName');
  await ctx.db.patch(doc._id, { publicId });
}
```

**Step 3**: Make required
```typescript
publicId: v.string()  // Remove optional
```

---

## Library Migrations

### Updating to Soft Delete

**Old Pattern**:
```typescript
// ❌ Hard delete
await ctx.db.delete(id);
```

**New Pattern**:
```typescript
// ✅ Soft delete
await ctx.db.patch(id, {
  deletedAt: Date.now(),
  deletedBy: user._id,
  updatedAt: Date.now(),
  updatedBy: user._id,
});
```

### Adding Permission Checks

**Old Pattern**:
```typescript
// ❌ No permission check
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});
```

**New Pattern**:
```typescript
// ✅ With permission check
export const updateProject = mutation({
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);

    await requireEditProjectAccess(ctx, existing, user);

    await ctx.db.patch(id, updates);
  },
});
```

### Adding Validation

**Old Pattern**:
```typescript
// ❌ No validation
await ctx.db.insert('tableName', data);
```

**New Pattern**:
```typescript
// ✅ With trim and validate
const trimmed = trimProjectData(data);
const errors = validateProjectData(trimmed);
if (errors.length) {
  throw new Error(errors.join(', '));
}

await ctx.db.insert('tableName', trimmed);
```

---

## Query Migrations

### Updating to Cursor Pagination

**Old Pattern**:
```typescript
// ❌ Collect all
const items = await ctx.db
  .query('tableName')
  .collect();
```

**New Pattern**:
```typescript
// ✅ Cursor pagination
const page = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)
  .order('desc')
  .paginate({
    numItems: 50,
    cursor: args.cursor ?? null,
  });

return {
  items: page.page,
  hasMore: !page.isDone,
  cursor: page.continueCursor,
};
```

### Adding Soft Delete Filtering

**Old Pattern**:
```typescript
// ❌ Includes deleted items
const items = await ctx.db
  .query('tableName')
  .collect();
```

**New Pattern**:
```typescript
// ✅ Filters deleted items
const items = await ctx.db
  .query('tableName')
  .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
  .filter(notDeleted)  // ✅ Add this
  .collect();
```

---

## Migration Scripts

### Template for Data Migration

```typescript
// convex/migrations/001_add_public_ids.ts
import { internalMutation } from './_generated/server';
import { generateUniquePublicId } from './shared/utils/publicId';

export const addPublicIds = internalMutation({
  handler: async (ctx) => {
    const docs = await ctx.db
      .query('tableName')
      .filter(q => q.eq(q.field('publicId'), undefined))
      .collect();

    console.log(`Found ${docs.length} docs without publicId`);

    for (const doc of docs) {
      const publicId = await generateUniquePublicId(ctx, 'tableName');
      await ctx.db.patch(doc._id, { publicId });
    }

    console.log('Migration complete');
  },
});
```

**Run migration**:
```bash
npx convex run migrations/001_add_public_ids:addPublicIds
```

---

## Best Practices

### Migration Rules

**Never**:
- Delete fields (use soft delete)
- Change field types (add new field instead)
- Remove indexes still in use
- Migrate in production first

**Always**:
- Test migrations in development
- Backup data before migration
- Add fields as optional first
- Monitor migration progress
- Update documentation

### Migration Checklist

For each migration:
- [ ] Write migration script
- [ ] Test in development
- [ ] Document what changed
- [ ] Create rollback plan
- [ ] Run migration
- [ ] Verify results
- [ ] Update code to use new fields/patterns
- [ ] Deploy code changes

---

## Rollback Strategies

### Field Addition Rollback

If you added a field and need to roll back:
1. Deploy previous schema (without new field)
2. Convex will ignore the field in existing data
3. Data remains intact but field is unused

### Index Rollback

If you added an index and need to roll back:
1. Remove index from schema
2. Deploy
3. Convex automatically removes the index
4. Update queries to not use removed index

---

## Common Migration Scenarios

### Scenario 1: Add publicId to All Tables

See "Adding publicId to Existing Table" above

### Scenario 2: Convert to Soft Delete

1. Add soft delete fields (optional)
2. Update delete mutations to soft delete
3. Add .filter(notDeleted) to queries
4. Test thoroughly
5. Deploy

### Scenario 3: Update Naming Conventions

1. Create new properly-named modules
2. Migrate data to new tables
3. Update all references
4. Test
5. Deprecate old modules

---

## Need Help?

- Review [Troubleshooting Guide](./troubleshooting.md)
- Check existing module migrations
- Test incrementally
- Ask for review before production migration
