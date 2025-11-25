# Example 2: Projects with Sub-modules

This example demonstrates **hierarchical parent-child architecture** where a parent module has child sub-modules with shared resources.

## Architecture Pattern

```
projects/ (Parent)
├── _shared/                # Shared validators & fields
├── projects/              # Parent entity
├── tasks/                 # Child entity (belongs to project)
└── milestones/            # Child entity (belongs to project)
```

## Key Features

### 1. Shared Resources (`_shared/`)

**Purpose**: Avoid duplication when parent and children share common fields.

**Files**:
- `validators.ts` - Shared validators (status, priority, etc.)
- `fields.ts` - Shared complex fields (budget, timeEstimate, etc.)

**Usage**:
```typescript
// All modules import from shared
import { sharedProjectValidators } from '../_shared/validators';

// Use in child validators
export const tasksValidators = {
  status: sharedProjectValidators.status,  // Reuse!
  priority: sharedProjectValidators.priority,  // Reuse!
  // ... task-specific validators
};
```

### 2. Parent-Child Relationships

**Key Pattern**: Child tables have **required** `projectId` foreign key.

```typescript
// tasks.ts (Child table)
export const tasksTable = defineTable({
  projectId: v.id('freelancerProjects'),  // REQUIRED parent reference
  // ... other fields
})
  .index('by_project', ['projectId'])  // Index for parent queries
  .index('by_project_and_status', ['projectId', 'status']);
```

### 3. Hierarchical Queries

**Pattern**: Query children through parent relationship.

```typescript
// Get all tasks for a project
const tasks = await ctx.db
  .query('freelancerTasks')
  .withIndex('by_project', q => q.eq('projectId', projectId))
  .collect();

// Get project with all tasks and milestones
const project = await ctx.db.get(projectId);
const tasks = await getProjectTasks(ctx, projectId);
const milestones = await getProjectMilestones(ctx, projectId);

return { project, tasks, milestones };
```

### 4. Cascading Operations

**Pattern**: When parent is deleted/updated, handle children appropriately.

```typescript
// When deleting project, optionally cascade to children
export const deleteProject = mutation({
  handler: async (ctx, { id, cascadeDelete = false }) => {
    // ... permission checks

    if (cascadeDelete) {
      // Delete all child tasks
      const tasks = await ctx.db
        .query('freelancerTasks')
        .withIndex('by_project', q => q.eq('projectId', id))
        .collect();

      for (const task of tasks) {
        await ctx.db.patch(task._id, { deletedAt: now });
      }

      // Delete all child milestones
      // ... similar pattern
    }

    // Delete project
    await ctx.db.patch(id, { deletedAt: now });
  },
});
```

### 5. Combined Schema Registration

**Pattern**: Export all schemas together for registration.

```typescript
// schema/index.ts
export const softwareFreelancerDashboardProjectsModuleSchemas = {
  ...softwareFreelancerDashboardProjectsSchemas,  // Parent
  ...softwareFreelancerDashboardTasksSchemas,     // Child 1
  ...softwareFreelancerDashboardMilestonesSchemas, // Child 2
};

// In main schema.ts
import { softwareFreelancerDashboardProjectsModuleSchemas } from './schema/.../projects';

export default defineSchema({
  ...softwareFreelancerDashboardProjectsModuleSchemas,
});
```

## When to Use This Pattern

✅ **Use parent-child sub-modules when:**
- Entities have clear parent-child relationship
- Children don't exist independently of parent
- You want to share validators/fields between related entities
- You need hierarchical queries (get parent with children)
- Cascading operations make sense

❌ **Don't use this pattern when:**
- Entities are independent peers
- Children need to exist without parents
- No shared logic between entities
- See [Example 3: Siblings](../03-projects-with-siblings/) instead

## File Structure

```
02-projects-with-submodules/
├── schema/
│   ├── _shared/
│   │   ├── validators.ts       # Shared validators
│   │   └── fields.ts           # Shared fields
│   │
│   ├── projects/               # Parent module (5 files)
│   │   ├── validators.ts       # Project-specific + shared
│   │   ├── projects.ts
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   │
│   ├── tasks/                  # Child module 1 (5 files)
│   │   ├── validators.ts       # Task-specific + shared
│   │   ├── tasks.ts            # Has projectId FK
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   │
│   ├── milestones/             # Child module 2 (5 files)
│   │   ├── validators.ts       # Milestone-specific + shared
│   │   ├── milestones.ts       # Has projectId FK
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   │
│   └── index.ts                # Combined exports
│
└── lib/
    ├── _shared/
    │   └── types.ts            # Shared interfaces
    │
    ├── projects/               # Parent logic (7 files)
    │   ├── constants.ts
    │   ├── types.ts
    │   ├── utils.ts
    │   ├── permissions.ts
    │   ├── queries.ts
    │   ├── mutations.ts
    │   └── index.ts
    │
    ├── tasks/                  # Child logic 1 (7 files)
    │   ├── constants.ts
    │   ├── types.ts
    │   ├── utils.ts
    │   ├── permissions.ts      # Inherits project permissions
    │   ├── queries.ts          # Queries by projectId
    │   ├── mutations.ts        # Validates projectId exists
    │   └── index.ts
    │
    ├── milestones/             # Child logic 2 (7 files)
    │   └── [same as tasks]
    │
    └── index.ts                # Combined exports
```

## Implementation Notes

### Shared Validators
- Define once in `_shared/validators.ts`
- Import and reuse in child modules
- Add module-specific validators as needed

### Foreign Key Validation
- Always validate parent exists before creating child
- Use indexed queries for efficient lookups
- Consider cascading deletes carefully

### Permission Inheritance
- Children can inherit parent permissions
- If user can view project, they can view tasks
- Override for specific use cases

### Query Optimization
- Index `by_project` for all children
- Use compound indexes: `by_project_and_status`
- Consider denormalizing frequently accessed parent data

## Comparison with Other Patterns

| Feature | Simple | Sub-modules | Siblings |
|---------|--------|-------------|----------|
| Shared validators | ❌ | ✅ Yes (_shared/) | ❌ |
| Parent-child FK | ❌ | ✅ Required | 🟡 Optional |
| Independent entities | ✅ | ❌ | ✅ |
| Cascading operations | ❌ | ✅ Common | 🟡 Rare |
| Complexity | Low | Medium | Low-Medium |

**See Also**:
- [Example 1: Simple Projects](../01-simple-projects/) - Basic single module
- [Example 3: Projects with Siblings](../03-projects-with-siblings/) - Independent modules
