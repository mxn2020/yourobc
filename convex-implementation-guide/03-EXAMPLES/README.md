# Module Architecture Examples

Three complete examples showing different ways to organize Convex modules using the **same domain** (Projects) to highlight architectural decisions.

## Overview

All three examples implement a "Projects" feature but use different architectural patterns:

| Example | Pattern | Complexity | Use Case |
|---------|---------|------------|----------|
| [01-simple-projects](./01-simple-projects/) | Single module, related table | Low | Basic features, straightforward relationships |
| [02-projects-with-submodules](./02-projects-with-submodules/) | Parent-child hierarchy | Medium | Strong parent-child relationships, shared logic |
| [03-projects-with-siblings](./03-projects-with-siblings/) | Independent modules | Low-Medium | Loosely coupled features, pluggable architecture |

## Quick Comparison

### File Structure

**Example 1: Simple**
```
projects/
├── schema/
│   ├── validators.ts       # All validators in one file
│   ├── projects.ts
│   ├── project_members.ts
│   └── ...
└── lib/
    └── [7 files]           # All logic in one directory
```

**Example 2: Sub-modules**
```
projects/
├── schema/
│   ├── _shared/            # ✨ Shared validators/fields
│   ├── projects/           # Parent module
│   ├── tasks/              # Child module (has projectId FK)
│   └── milestones/         # Child module (has projectId FK)
└── lib/
    ├── _shared/
    ├── projects/
    ├── tasks/
    └── milestones/
```

**Example 3: Siblings**
```
projects/
├── schema/
│   ├── projects/           # Independent module 1
│   └── project_calendar/   # Independent module 2 (optional projectId)
└── lib/
    ├── projects/
    └── project_calendar/
```

### Key Differences

| Feature | Simple | Sub-modules | Siblings |
|---------|--------|-------------|----------|
| **Shared validators** | ❌ None | ✅ `_shared/` directory | ❌ Each owns validators |
| **Foreign keys** | ❌ N/A | ✅ Required (`projectId`) | 🟡 Optional (`projectId?`) |
| **Independence** | ✅ Single unit | ❌ Tightly coupled | ✅ Loosely coupled |
| **Cascading deletes** | 🟡 Manual | ✅ Common pattern | ❌ Avoid |
| **Module reusability** | 🟡 Limited | ❌ Tied to parent | ✅ High |
| **Files count** | 12 | ~25 | ~14 per module |
| **Complexity** | Low | Medium | Low-Medium |

## Decision Tree

```
┌─ Do you need parent-child relationships?
│
├─ NO ─┐
│      │
│      ├─ Single feature/table?
│      │  └─ YES → Use Example 1: Simple
│      │
│      └─ Multiple related features?
│         └─ YES → Use Example 3: Siblings
│
└─ YES ─┐
        │
        ├─ Children exist without parent?
        │  └─ YES → Use Example 3: Siblings (with optional FK)
        │
        └─ Children require parent?
           └─ YES ─┐
                   │
                   ├─ Shared validators/logic?
                   │  └─ YES → Use Example 2: Sub-modules
                   │
                   └─ Independent validators?
                      └─ Use Example 1: Simple (multiple tables)
```

## Example Walkthroughs

### Example 1: Simple Projects

**Scenario**: Basic project management with team members.

**Structure**:
- `projects` table (main entity)
- `project_members` table (related entity)
- Shared validators in one file
- All logic in one directory

**Best for**:
- Starter projects
- Simple CRUD operations
- 1-3 related tables
- No deep nesting needed

[→ View Example 1](./01-simple-projects/)

---

### Example 2: Projects with Sub-modules

**Scenario**: Project management with tasks and milestones that belong to projects.

**Structure**:
- `projects` (parent)
- `tasks` (child - requires `projectId`)
- `milestones` (child - requires `projectId`)
- `_shared/` validators used by all

**Best for**:
- Hierarchical data
- Strong parent-child relationships
- Shared business logic
- Cascading operations

[→ View Example 2](./02-projects-with-submodules/)

---

### Example 3: Projects with Siblings

**Scenario**: Project management + independent calendar that can link to projects.

**Structure**:
- `projects` (independent module)
- `project_calendar` (independent module, optional `projectId`)
- Each module has own validators
- Pluggable architecture

**Best for**:
- Loosely coupled features
- Optional integrations
- Pluggable modules
- Different teams/ownership

[→ View Example 3](./03-projects-with-siblings/)

## Migration Paths

### Simple → Sub-modules

When to migrate:
- Adding child entities that can't exist without parent
- Need to share validators/logic
- Want cascading operations

Steps:
1. Create `_shared/` directory
2. Move shared validators
3. Create child module directories
4. Add required `parentId` FKs
5. Update queries to use hierarchy

### Simple → Siblings

When to migrate:
- Adding independent but related feature
- Want pluggable architecture
- Modules have different lifecycles

Steps:
1. Create second sibling directory
2. Add optional cross-references
3. Keep validators separate
4. Update imports

### Sub-modules → Siblings

When to migrate:
- Children need to exist independently
- Want to decouple modules
- Shared logic no longer needed

Steps:
1. Remove `_shared/` directory
2. Copy validators to each module
3. Make FKs optional
4. Update queries to handle optional FKs
5. Remove cascading operations

## Real-World Use Cases

### Simple Pattern
- User profiles + preferences
- Products + reviews
- Blog posts + comments
- Clients + contacts

### Sub-modules Pattern
- E-commerce: Orders (parent) → Order Items (children)
- Project management: Projects → Tasks → Subtasks
- Education: Courses → Lessons → Assignments
- CRM: Deals → Activities → Notes

### Siblings Pattern
- Users + Notifications
- Projects + Calendar
- Products + Inventory
- Content + Media Library

## Performance Considerations

| Pattern | Query Performance | Write Performance | Scalability |
|---------|------------------|-------------------|-------------|
| Simple | ⚡⚡⚡ Fast | ⚡⚡⚡ Fast | ⚡⚡ Good |
| Sub-modules | ⚡⚡ Medium* | ⚡⚡ Medium | ⚡⚡⚡ Excellent |
| Siblings | ⚡⚡⚡ Fast** | ⚡⚡⚡ Fast | ⚡⚡⚡ Excellent |

\* Sub-modules may require multiple queries for hierarchical data
\** Siblings are fastest when not joining across modules

## Common Patterns

### Shared Validators (_shared/)
```typescript
// Only in sub-modules pattern
schema/_shared/validators.ts
  → Shared by parent and children
  → Single source of truth
  → Prevents duplication
```

### Required Foreign Keys
```typescript
// Sub-modules pattern
projectId: v.id('projects'),  // Required
  → Child can't exist without parent
  → Use .index('by_project', ['projectId'])
```

### Optional Foreign Keys
```typescript
// Siblings pattern
projectId: v.optional(v.id('projects')),  // Optional
  → Module works standalone
  → Check existence before querying
  → Use .index('by_project', ['projectId'])
```

### Combined Exports
```typescript
// All patterns export schemas together
export const moduleSchemas = {
  ...table1Schemas,
  ...table2Schemas,
};
```

## Best Practices

### For All Patterns
✅ Use descriptive module names
✅ Follow naming conventions consistently
✅ Index foreign keys
✅ Document architectural decisions
✅ Keep modules focused

### For Sub-modules
✅ Use `_shared/` for common validators
✅ Make parent FK required in children
✅ Document parent-child relationships
✅ Consider cascading operations
✅ Plan for hierarchical queries

### For Siblings
✅ Make cross-references optional
✅ Keep validators independent
✅ Document integration points
✅ Plan for standalone usage
✅ Consider backwards compatibility

## Next Steps

1. **Review examples**: Look at all three to understand differences
2. **Choose pattern**: Use decision tree above
3. **Start simple**: Begin with Example 1, migrate if needed
4. **Copy templates**: Use [02-TEMPLATES](../02-TEMPLATES/) for your module
5. **Refer back**: Use examples as reference during implementation

## Resources

- [Core Implementation Guides](../01-CORE/) - Step-by-step instructions
- [Templates](../02-TEMPLATES/) - Copy-paste file templates
- [Reference](../04-REFERENCE/) - Advanced patterns and troubleshooting
