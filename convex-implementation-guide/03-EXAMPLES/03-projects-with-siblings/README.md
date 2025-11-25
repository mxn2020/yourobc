## Example 3: Projects with Siblings

This example demonstrates **independent sibling modules** that are related but can work standalone.

## Architecture Pattern

```
projects/              # Sibling 1 (independent)
├── projects
└── project_members

project_calendar/      # Sibling 2 (independent)
└── project_calendar
```

## Key Features

### 1. Independent Modules

**Characteristic**: Each sibling module is self-contained.

```typescript
// Projects module - works standalone
projects/
├── validators.ts      # Own validators
├── projects.ts
├── project_members.ts
└── ...

// Calendar module - works standalone
project_calendar/
├── validators.ts      # Own validators (not shared with projects)
├── project_calendar.ts
└── ...
```

### 2. Optional Cross-References

**Key Pattern**: Foreign keys are **optional**, not required.

```typescript
// project_calendar.ts
export const projectCalendarTable = defineTable({
  // ... calendar fields

  // OPTIONAL reference to project (can be null)
  projectId: v.optional(v.id('freelancerProjects')),

  // ... other fields
})
  .index('by_project', ['projectId']);  // Index for optional queries
```

### 3. Cross-Module Queries

**Pattern**: Modules can query each other when needed.

```typescript
// Get calendar events for a project
export const getProjectCalendarEvents = query({
  handler: async (ctx, { projectId }) => {
    // Query sibling module
    return await ctx.db
      .query('freelancerProjectCalendar')
      .withIndex('by_project', q => q.eq('projectId', projectId))
      .collect();
  },
});

// Get project for a calendar event
export const getEventProject = query({
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);

    // Optional reference - check if exists
    if (event.projectId) {
      return await ctx.db.get(event.projectId);
    }

    return null;  // Event not linked to project
  },
});
```

### 4. Pluggable Architecture

**Benefit**: Modules can be added/removed independently.

```typescript
// Register only projects
export default defineSchema({
  ...softwareFreelancerDashboardProjectsSchemas,
});

// OR register both siblings
export default defineSchema({
  ...softwareFreelancerDashboardProjectsSiblingsSchemas,
});

// OR register projects + external calendar module
export default defineSchema({
  ...softwareFreelancerDashboardProjectsSchemas,
  ...externalCalendarSchemas,  // Different calendar implementation
});
```

### 5. No Shared Validators

**Pattern**: Each module maintains its own validators (no `_shared/` directory).

```typescript
// projects/validators.ts
export const projectsValidators = {
  status: v.union(/* project statuses */),
  priority: v.union(/* priorities */),
};

// project_calendar/validators.ts
export const projectCalendarValidators = {
  status: v.union(/* event statuses - different from projects! */),
  eventType: v.union(/* event types */),
};
```

## When to Use This Pattern

✅ **Use sibling modules when:**
- Modules are independent but related
- Modules can exist without each other
- Want pluggable architecture (add/remove modules)
- Different teams own different modules
- Modules have different lifecycles
- Cross-module queries are occasional, not constant

❌ **Don't use this pattern when:**
- Strong parent-child relationship exists
- Modules share significant logic/validators
- Children can't exist without parent
- See [Example 2: Sub-modules](../02-projects-with-submodules/) instead

## File Structure

```
03-projects-with-siblings/
├── schema/
│   ├── projects/               # Sibling module 1
│   │   ├── validators.ts       # Independent validators
│   │   ├── projects.ts
│   │   ├── project_members.ts
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   │
│   ├── project_calendar/       # Sibling module 2
│   │   ├── validators.ts       # Independent validators
│   │   ├── project_calendar.ts # Optional projectId reference
│   │   ├── types.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   │
│   └── index.ts                # Combined exports
│
└── lib/
    ├── projects/               # Sibling logic 1
    │   └── [7 files]
    │
    ├── project_calendar/       # Sibling logic 2
    │   └── [7 files]
    │
    └── index.ts                # Combined exports
```

## Implementation Notes

### Optional Foreign Keys
- Use `v.optional(v.id(...))` for cross-module references
- Always check if FK exists before querying
- Index optional FKs for efficient lookups

### Independent Deployment
- Modules can be deployed separately
- Breaking changes in one don't affect the other
- Each module has independent versioning

### Cross-Module Integration
- Use optional references, not required
- Document integration points clearly
- Consider backwards compatibility

### Query Patterns
```typescript
// Query with optional FK
const events = await ctx.db
  .query('freelancerProjectCalendar')
  .withIndex('by_project', q => q.eq('projectId', projectId))
  .collect();

// Handle missing FK
if (event.projectId) {
  const project = await ctx.db.get(event.projectId);
  // Use project data
} else {
  // Event not linked to project
}
```

## Comparison with Other Patterns

| Feature | Simple | Sub-modules | Siblings |
|---------|--------|-------------|----------|
| Module independence | ✅ | ❌ | ✅ |
| Shared validators | ❌ | ✅ | ❌ |
| FK requirement | N/A | Required | Optional |
| Pluggable | ✅ | ❌ | ✅ |
| Cross-module queries | ❌ | ✅ Easy | 🟡 Occasional |
| Complexity | Low | Medium | Low-Medium |

## Real-World Example

**Projects + Calendar Integration**:
- Projects module: Manage client projects
- Calendar module: Schedule events, meetings, deadlines
- Integration: Link events to projects when relevant
- Independence: Calendar works for non-project events too

**Benefits**:
- Calendar isn't tied to projects
- Can use calendar for personal events
- Can integrate with other modules (tasks, clients, etc.)
- Easy to swap calendar implementations

**See Also**:
- [Example 1: Simple Projects](../01-simple-projects/) - Basic single module
- [Example 2: Sub-modules](../02-projects-with-submodules/) - Parent-child hierarchy
