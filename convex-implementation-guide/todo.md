## Recommended Folder Structure

```
_convex-implementation-guide/
├── README.md                          # Quick start, structure overview
│
├── 00-QUICK-START/
│   ├── quick-start.md                 # TL;DR - Get coding in 5 minutes
│   ├── checklist.md                   # Pre-flight checklist
│   └── placeholder-reference.md       # Quick lookup table
│
├── 01-CORE/                           # AI reads these FIRST
│   ├── 01-planning.md                 # Module planning & structure
│   ├── 02-schema.md                   # Schema implementation
│   ├── 03-library.md                  # Library implementation
│   └── naming-conventions.md          # All naming rules in one place
│
├── 02-TEMPLATES/                      # Copy-paste file templates
│   ├── schema/
│   │   ├── validators.ts              # Template with placeholders
│   │   ├── {module}.ts                # Table definition template
│   │   ├── types.ts                   # Type extraction template
│   │   ├── schemas.ts                 # Schema export template
│   │   └── index.ts                   # Barrel export template
│   │
│   ├── library/
│   │   ├── constants.ts               # Constants template
│   │   ├── types.ts                   # Library types template
│   │   ├── utils.ts                   # Utils template
│   │   ├── permissions.ts             # Permissions template
│   │   ├── queries.ts                 # Queries template
│   │   ├── mutations.ts               # Mutations template
│   │   └── index.ts                   # Barrel export template
│   │
│   └── README.md                      # How to use templates
│
├── 03-EXAMPLES/                       # Real working code
│   ├── simple-module/                 # Basic example (projects)
│   │   ├── schema/
│   │   │   └── [complete files]
│   │   └── lib/
│   │       └── [complete files]
│   │
│   ├── complex-module/                # Advanced example (email system)
│   │   └── [complete files]
│   │
│   └── README.md                      # Example explanations
│
├── 04-REFERENCE/                      # Optional deep-dives
│   ├── consistency-review.md          # Phase 3 - Quality checks
│   ├── advanced-patterns.md           # Phase 4 - Advanced features
│   ├── troubleshooting.md             # Common issues & fixes
│   └── migration-guide.md             # Updating existing modules
│
└── .context/                          # AI session management
    ├── PROJECT.md                     # Project context (AI reads this)
    ├── ACTIVE-TASK.md                 # Current implementation task
    └── DECISIONS.md                   # Architecture decisions log
```

## Key Files for AI to Read

### 1. `.context/PROJECT.md` (AI reads FIRST)
Create a context file that the AI reads at the start of each session:

```markdown
# Project Context

## What We're Building
Convex module implementation guide - structured templates for building database-backed features.

## Current Stack
- **Backend**: Convex (serverless database + backend)
- **Language**: TypeScript
- **Patterns**: Schema-first, permission-based, soft-delete

## Module Structure
```
schema/{category}/{entity}/{module}/    # Database definitions
lib/{category}/{entity}/{module}/       # Business logic
```

## Core Principles
1. Schema defines structure → Library implements logic
2. Every mutation: auth → validate → execute → audit
3. Soft delete only (never hard delete)
4. Permission checks at query/mutation level

## Current Task
See ACTIVE-TASK.md

## Architecture Decisions
See DECISIONS.md
```

### 2. `.context/ACTIVE-TASK.md` (AI updates this)
The AI maintains this file automatically as you work:

```markdown
# Active Task: Implement [Module Name]

## Status: Schema Phase

## Placeholder Values
- category: `software`
- entity: `freelancer_dashboard`
- module: `projects`
- tableName: `freelancerProjects`

## Completed Steps
- [x] Created directory structure
- [x] Implemented validators.ts
- [ ] Implementing projects.ts

## Next Steps
1. Complete projects.ts table definition
2. Add required indexes
3. Move to types.ts

## Blockers
None

## Notes
- Using single combined search pattern
- OwnerId is required (standard domain table)
```

### 3. `README.md` (Entry point)

```markdown
# Convex Module Implementation Guide

## Quick Start (For AI)

1. **Read context**: `.context/PROJECT.md`
2. **Check active task**: `.context/ACTIVE-TASK.md`
3. **Read core docs** (in order):
   - `01-CORE/01-planning.md`
   - `01-CORE/02-schema.md`
   - `01-CORE/03-library.md`
4. **Copy templates**: `02-TEMPLATES/[schema|library]/`
5. **Reference examples**: `03-EXAMPLES/simple-module/`

## Quick Start (For Humans)

### First Time Setup
1. Read `00-QUICK-START/quick-start.md`
2. Fill out `00-QUICK-START/placeholder-reference.md`
3. Start with Phase 1 (Schema)

### New Module
```bash
# 1. Update context
# Edit .context/ACTIVE-TASK.md with your module details

# 2. Tell AI to implement
"Read .context/ACTIVE-TASK.md and implement the schema phase using templates from 02-TEMPLATES/schema/"

# 3. AI implements and updates ACTIVE-TASK.md automatically
```

## Document Map

### Always Read (Core Implementation)
- `01-CORE/` - **Read these first, in order**
  - Planning → Schema → Library

### Templates (Copy-Paste)
- `02-TEMPLATES/` - Working file templates with placeholders

### Examples (Reference)
- `03-EXAMPLES/` - Complete working modules

### Optional (Deep Dives)
- `04-REFERENCE/` - Quality checks, advanced patterns, troubleshooting

## AI Workflow

The templates include PRPs (Product Requirements Prompts) crafted specifically for AI coding assistants:

```
Phase 1: PLANNING
→ AI reads: 01-CORE/01-planning.md
→ Updates: .context/ACTIVE-TASK.md with placeholder values
→ Creates: Directory structure

Phase 2: SCHEMA
→ AI reads: 01-CORE/02-schema.md
→ Copies: 02-TEMPLATES/schema/* → convex/schema/
→ Replaces: All placeholders
→ References: 03-EXAMPLES/simple-module/schema/ if stuck
→ Updates: ACTIVE-TASK.md progress

Phase 3: LIBRARY
→ AI reads: 01-CORE/03-library.md
→ Copies: 02-TEMPLATES/library/* → convex/lib/
→ Replaces: All placeholders
→ References: 03-EXAMPLES/simple-module/lib/ if stuck
→ Updates: ACTIVE-TASK.md progress

Phase 4: REVIEW (Optional)
→ AI reads: 04-REFERENCE/consistency-review.md
→ Runs: Automated checks
→ Reports: Issues found
```

## File Size Guidelines

AI coding assistants work with limited context windows, so keep files focused and concise:

- Core docs: < 3000 lines each
- Templates: < 300 lines each
- Examples: Complete but minimal

## Updating the Guide

When adding patterns:
1. Add to core docs if essential for basic implementation
2. Add to reference docs if optional/advanced
3. Update examples to show the pattern
4. Update templates if it's a common pattern
```

### 4. `00-QUICK-START/quick-start.md`

```markdown
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
- Templates: 02-TEMPLATES/schema/
- Example: 03-EXAMPLES/simple-module/schema/

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
- Templates: 02-TEMPLATES/library/
- Example: 03-EXAMPLES/simple-module/lib/
```

## Done!

Your module is now implemented. Optional next steps:
- Run consistency review: `04-REFERENCE/consistency-review.md`
- Add advanced features: `04-REFERENCE/advanced-patterns.md`
```

### 5. `00-QUICK-START/placeholder-reference.md`

```markdown
# Placeholder Reference

Quick lookup table for find-and-replace operations.

## Your Module

Fill this out first:

| Placeholder | Your Value | Example |
|------------|------------|---------|
| `{category}` | _________ | `software` |
| `{entity}` | _________ | `freelancer_dashboard` |
| `{module}` | _________ | `projects` |
| `{Module}` | _________ | `Projects` |
| `{MODULE}` | _________ | `PROJECTS` |
| `{tableName}` | _________ | `freelancerProjects` |
| `{TableName}` | _________ | `FreelancerProjects` |
| `{table_name}` | _________ | `freelancer_projects` |
| `{displayField}` | `name` | 

## Case Convention Rules

| Type | Convention | Example |
|------|-----------|---------|
| Folders | snake_case | `email_templates/` |
| Table names | camelCase | `emailTemplates` |
| TypeScript types | PascalCase | `EmailTemplate` |
| Constants | SCREAMING_SNAKE_CASE | `EMAIL_CONSTANTS` |
| Variables | camelCase | `emailTemplate` |

## Display Field Options

Choose ONE for your entity:

| Field | Use For | Example |
|-------|---------|---------|
| `name` | People, products, categories | users, products |
| `title` | Documents, tasks, work items | projects, invoices |
| `displayName` | Ambiguous cases | custom entities |

**Remember**: Update search filters and sortBy logic to use your chosen field!
```

## Why This Structure Works for AI

This structure follows AI best practices:

1. **Context First**: `.context/` files give AI instant orientation
2. **Incremental Complexity**: Core docs → Templates → Examples → Reference
3. **Working Examples**: AI performs better with patterns to follow
4. **Clear Boundaries**: Breaking tasks into smaller chunks yields better results
5. **Self-Maintaining**: AI updates ACTIVE-TASK.md automatically

## Next Steps for You

1. **Split your existing docs**:
   - Copy planning/schema/library to `01-CORE/`
   - Extract templates to `02-TEMPLATES/`
   - Copy consistency review to `04-REFERENCE/`
   - Copy advanced patterns to `04-REFERENCE/`

2. **Create template files** with placeholders from your boilerplate

3. **Add real examples** from your existing codebase

4. **Write `.context/PROJECT.md`** describing your Convex patterns

5. **Test with AI**: Start fresh chat → "Read .context/PROJECT.md" → observe results

Would you like me to help you create any specific files, like turning your existing boilerplate into templates or writing the initial `.context/PROJECT.md`?
