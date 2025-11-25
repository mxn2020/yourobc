# Quick Start - 5 Minutes to First Module

## Step 1: Choose Your Module (30 seconds)

| Question | Answer | Result |
|----------|--------|--------|
| What category? | `software` / `addons` / `games` | {category} |
| What entity? | `freelancer_dashboard` | {entity} |
| What module? (plural) | `projects` | {module} |
| What table name? (camelCase) | `freelancerProjects` | {tableName} |

## Step 2: Update Active Task (1 minute)

Copy this to `.context/ACTIVE-TASK.md`:

```markdown
# Active Task: Implement Projects Module

## Placeholder Values
- category: `software`
- entity: `freelancer_dashboard`
- module: `projects`
- Module: `Projects`
- MODULE: `PROJECTS`
- tableName: `freelancerProjects`

## Status: Ready to start schema phase

## Display Field
Using `name` (main display field for this entity type)
```

## Step 3: Tell AI to Start (30 seconds)

```
Read .context/ACTIVE-TASK.md and implement Phase 1 (Schema) using:
- Guide: 01-CORE/02-schema.md
- Example: 03-EXAMPLES/simple-module/schema/ (if available)

Implement files in this order:
1. validators.ts
2. projects.ts
3. types.ts
4. schemas.ts
5. index.ts

Update ACTIVE-TASK.md after each file.
```

## Step 4: AI Implements (3 minutes)

AI will:
1. Copy templates to correct location
2. Replace all `{placeholder}` values
3. Implement each file
4. Update ACTIVE-TASK.md progress

## Step 5: Move to Library Phase

```
Continue to Phase 2 (Library) using:
- Guide: 01-CORE/03-library.md
- Example: 03-EXAMPLES/simple-module/lib/ (if available)
```

## Done!

Your module is now implemented. Optional next steps:
- Run consistency review: `04-REFERENCE/consistency-review.md`
- Add advanced features: `04-REFERENCE/advanced-patterns.md`
