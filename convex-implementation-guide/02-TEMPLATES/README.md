# Module Templates

> Copy-paste ready templates for rapid module implementation

## Overview

This folder contains TypeScript templates for creating new Convex modules. Each template is production-ready code with placeholders that you can find-and-replace.

## Template Structure

```
02-TEMPLATES/
├── schema/              # Database schema templates
│   ├── validators.ts    # Grouped validators
│   ├── {module}.ts      # Table definition
│   ├── types.ts         # Type extraction
│   ├── schemas.ts       # Schema export
│   └── index.ts         # Barrel export
│
└── library/             # Business logic templates
    ├── constants.ts     # Business constants
    ├── types.ts         # Operation interfaces
    ├── utils.ts         # Validation & helpers
    ├── permissions.ts   # Access control
    ├── queries.ts       # Read operations
    ├── mutations.ts     # Write operations
    └── index.ts         # Barrel export
```

## Quick Start

### 1. Prepare Placeholders

Create a placeholder reference table:

| Placeholder | Your Value |
|------------|------------|
| `{category}` | `software` |
| `{entity}` | `freelancer_dashboard` |
| `{module}` | `projects` |
| `{Module}` | `Projects` |
| `{MODULE}` | `PROJECTS` |
| `{tableName}` | `freelancerProjects` |
| `{displayField}` | `name` | 

### 2. Copy Template Files

```bash
# Copy schema templates
cp -r 02-TEMPLATES/schema/* convex/schema/software/freelancer_dashboard/projects/

# Copy library templates
cp -r 02-TEMPLATES/library/* convex/lib/software/freelancer_dashboard/projects/
```

### 3. Find and Replace

Replace all placeholders with your values:

```bash
# Find: {category}     Replace: software
# Find: {entity}       Replace: freelancer_dashboard
# Find: {module}       Replace: projects
# Find: {Module}       Replace: Projects
# Find: {MODULE}       Replace: PROJECTS
# Find: {tableName}    Replace: freelancerProjects
```

### 4. Customize

Each template includes:
- ✅ Implementation checklist
- ✅ DO/DON'T guidelines
- ✅ Comments indicating where to add more fields
- ✅ Optional features you can remove

Remove sections you don't need:
- Remove `searchableText` and `.searchIndex()` if not using search
- Remove `visibility` field if not needed
- Remove bulk operations if not needed
- Remove optional relationships if not needed

## Template Features

### Schema Templates

**validators.ts**
- Grouped validators pattern
- Reusable union types
- Complex field definitions
- Checklist for validation setup

**{module}.ts**
- Complete table definition
- Required and optional indexes
- Search index (optional)
- Field documentation

**types.ts**
- Type extraction from validators
- Clean TypeScript types

**schemas.ts**
- Export structure for registration
- Multi-table support

**index.ts**
- Barrel exports

### Library Templates

**constants.ts**
- Permission strings
- Status/priority enums
- Validation limits
- Values arrays

**types.ts**
- Entity types
- Operation interfaces
- List response types
- Filter interfaces

**utils.ts**
- Trim functions (generic typed)
- Validation functions
- Search text builder

**permissions.ts**
- Access control functions
- can* functions (return boolean)
- require* functions (throw errors)
- Bulk filtering

**queries.ts**
- Paginated list queries
- Search queries (optional)
- Single entity queries
- Statistics queries

**mutations.ts**
- Create operations
- Update operations
- Soft delete operations
- Bulk operations (optional)

**index.ts**
- Barrel exports

## Usage Tips

### Find/Replace Strategy

1. **Start with exact matches** - Replace `{tableName}` before `{module}`
2. **Use case-sensitive** - `{Module}` and `{module}` are different
3. **Verify after replace** - Check that all placeholders are gone
4. **Test imports** - Ensure all paths are correct

### Customization Points

Each template includes comments like:
```typescript
// Add more fields as needed...
// Add more validators as needed...
// Add more filters as needed...
```

These indicate safe extension points.

### Optional Features

Remove these sections if not needed:
- Search index and searchableText field
- Bulk operations (bulkUpdate, bulkDelete)
- Statistics queries
- Team membership checks
- Visibility field and checks

## Best Practices

### DO:
- ✅ Use templates as a starting point
- ✅ Follow the checklists in each file
- ✅ Keep placeholder reference handy
- ✅ Test after each file
- ✅ Remove unused features
- ✅ Add module-specific logic

### DON'T:
- ❌ Skip validation setup
- ❌ Forget to update entityTitle in audit logs
- ❌ Leave placeholder values
- ❌ Skip permission checks
- ❌ Use hard delete
- ❌ Skip checklists

## Checklist

When using templates:
- [ ] Prepare placeholder table
- [ ] Copy schema templates
- [ ] Copy library templates
- [ ] Find and replace all placeholders
- [ ] Remove optional features you don't need
- [ ] Follow implementation checklist in each file
- [ ] Register schema in main schema.ts
- [ ] Test create operation
- [ ] Test read operations
- [ ] Test update operation
- [ ] Test delete operation
- [ ] Verify permission checks
- [ ] Check audit logging

## Need Help?

- **For implementation guides**: See `01-CORE/` folder
- **For examples**: See `03-EXAMPLES/` folder (when available)
- **For troubleshooting**: See `04-REFERENCE/troubleshooting.md`
- **For advanced patterns**: See `04-REFERENCE/advanced-patterns.md`

---

**Ready to use templates?** → Copy files and start find-and-replace!
