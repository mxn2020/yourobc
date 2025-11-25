# Module Planning & Structure

> Define your module structure, naming conventions, and file organization before writing any code.

## Table of Contents

- [Module File Structure](#module-file-structure)
- [Categories](#categories)
- [Naming Conventions](#naming-conventions)
- [Folder Naming Rules](#folder-naming-rules)
- [Directory Structure Patterns](#directory-structure-patterns)
- [Quick Reference](#quick-reference)
- [Appendix](#appendix)

---

## Module File Structure

Every module follows this standard structure:

```
convex/
├── schema/
│   └── {category}/
│       └── {entity}/
│           └── {module}/
│               ├── {module}.ts       # Table definitions
│               ├── {sub_module}.ts   # Additional tables (optional)
│               ├── validators.ts     # Grouped validators
│               ├── types.ts          # Type extractions
│               ├── schemas.ts        # Schema exports
│               └── index.ts          # Public exports (barrel)
│
└── lib/
    └── {category}/
        └── {entity}/
            └── {module}/
                ├── constants.ts
                ├── types.ts
                ├── utils.ts
                ├── permissions.ts
                ├── queries.ts
                ├── mutations.ts
                ├── index.ts
                │
                ├── {sub_module}/        # Optional: Sub-modules
                │   └── [same structure]
                │
                └── {sibling_module}/    # Optional: Sibling-modules
                    └── [same structure]
```

### Schema Directory Purpose

**Location**: `convex/schema/{category}/{entity}/{module}/`

**Purpose**: Define database structure and validation rules

**Files**:
- `{module}.ts` - Table definitions with `defineTable()`
- `validators.ts` - Reusable validators (unions, objects)
- `types.ts` - TypeScript type extractions
- `schemas.ts` - Schema export objects for registration
- `index.ts` - Public barrel exports

### Library Directory Purpose

**Location**: `convex/lib/{category}/{entity}/{module}/`

**Purpose**: Implement business logic and API endpoints

**Files**:
- `constants.ts` - Business constants, permissions, limits
- `types.ts` - TypeScript interfaces for operations
- `utils.ts` - Validation and helper functions
- `permissions.ts` - Access control logic
- `queries.ts` - Read operations
- `mutations.ts` - Write operations
- `index.ts` - Public exports

---

## Categories

Choose the category that best describes your module:

| Category | Use For | Examples |
|----------|---------|----------|
| `addons` | Reusable tools/features | email system, analytics, notifications |
| `apps` | Full applications | task manager, blog platform |
| `external` | Client projects | client-specific implementations |
| `games` | Game projects | chess, poker, trivia |
| `software` | Business software | CRM, invoicing, project management |

## Naming Conventions

### Placeholder Replacement

Before replacing placeholders, keep terms straight:
- **module** = folder name (plural, snake_case), e.g. `projects`
- **tableName** = Convex table id (camelCase), e.g. `freelancerProjects`

All placeholders must be replaced **including the `{}` brackets**.

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `{category}` | Category name | `software`, `addons`, `games` |
| `{entity}` | Entity name | `freelancer_dashboard`, `chess` |
| `{module}` | Module name (snake_case folder, plural) | `projects`, `clients`, `invoices` |
| `{Module}` | Module name (PascalCase) | `Projects`, `Clients`, `Invoices` |
| `{MODULE}` | Module name (SCREAMING_SNAKE) | `PROJECTS`, `CLIENTS`, `INVOICES` |
| `{tableName}` | Full table name | `freelancerProjects`, `chessGames` |
| `{TableName}` | Table name (PascalCase) | `FreelancerProjects`, `ChessGames` |
| `{table_name}` | Table name (snake_case) | `freelancer_projects`, `chess_games` |

### Naming Examples

**Example: Freelancer Dashboard Projects Module**

```
{category} = software
{entity} = freelancer_dashboard
{module} = projects
{Module} = Projects
{MODULE} = PROJECTS
{tableName} = freelancerProjects
{TableName} = FreelancerProjects
{table_name} = freelancer_projects
```

### Case Conventions

- **Folders/Files**: snake_case (`email_templates/`)
- **Table Names**: camelCase (`emailTemplates`)
- **TypeScript Types**: PascalCase (`EmailTemplate`)
- **Constants**: SCREAMING_SNAKE_CASE (`EMAIL_TEMPLATES_CONSTANTS`)
- **Variables**: camelCase (`emailTemplate`)

---

## Folder Naming Rules

### Reserved/Problematic Names

**❌ NEVER use these folder names:**
- `logs`
- `templates`

These names are reserved or problematic and can conflict with system directories or build tools. Also be cautious with generic names like `shared`, `generated`, or `auth` inside module trees — prefer a descriptive prefix if there's any chance of collision.

### Correct Pattern: Descriptive snake_case

**✅ Always use: `{prefix}_{descriptive_name}`**

| ❌ Bad (Reserved) | ✅ Good (Descriptive) |
|------------------|---------------------|
| `logs` | `email_logs`, `audit_logs`, `system_logs` |
| `templates` | `email_templates`, `form_templates` |
| `metrics` | `system_metrics`, `performance_metrics` |

### Examples

```bash
# ❌ BAD - Reserved names
convex/lib/system/email/logs/
convex/lib/system/email/templates/

# ✅ GOOD - Descriptive snake_case with prefixes
convex/lib/system/email/email_logs/
convex/lib/system/email/email_templates/
convex/lib/system/audit_logs/
convex/lib/data/forms/form_fields/
convex/lib/data/surveys/survey_questions/
```

---

## Directory Structure Patterns

### Pattern 1: Flat Structure (Simple Modules)

**Use when**: Module is straightforward with a single table and basic operations

```
convex/lib/software/freelancer_dashboard/projects/
├── constants.ts
├── types.ts
├── utils.ts
├── permissions.ts
├── queries.ts
├── mutations.ts
└── index.ts
```

**Best for**:
- Single table modules
- Simple CRUD operations
- No complex relationships

### Pattern 2: Nested Structure (Sub-modules)

**Use when**: Module has distinct sub-features that are children of the main module

```
convex/lib/software/freelancer_dashboard/projects/
├── constants.ts
├── types.ts
├── utils.ts
├── permissions.ts
├── queries.ts
├── mutations.ts
├── index.ts
│
├── tasks/              # Sub-module: project tasks
│   ├── constants.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── permissions.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── index.ts
│
└── milestones/         # Sub-module: project milestones
    └── [same structure]
```

**Best for**:
- Parent-child relationships
- Features that only make sense within parent context
- Shared parent logic

### Pattern 3: Sibling Structure (Related Modules)

**Use when**: Modules are related peers, not parent-child

```
convex/lib/software/freelancer_dashboard/
├── projects/           # Sibling module
│   └── [full structure]
├── clients/            # Sibling module
│   └── [full structure]
└── invoices/           # Sibling module
    └── [full structure]
```

**Best for**:
- Independent but related entities
- Cross-module relationships
- Equal hierarchy modules

### Pattern Decision Tree

```
Do the features only exist within a parent context?
├─ YES → Use nested sub-modules
│   Example: Tasks belong to Projects
│
└─ NO → Are they related peers?
    ├─ YES → Use sibling modules at same level
    │   Example: Projects, Clients, Invoices
    │
    └─ NO → Use flat structure
        Example: Single projects module
```

---

## Quick Reference

### Pre-Implementation Checklist

Before creating any files:

- [ ] Choose category (`addons`, `apps`, `external`, `games`, `software`)
- [ ] Define entity name (use snake_case)
- [ ] Define module name (snake_case, plural)
- [ ] Decide if `ownerId` will be required (default yes). Common exemptions:
  - System lookup tables (currencies, countries)
  - Event/log tables (use `userId`)
  - Join tables with indirect ownership
- [ ] Check folder name doesn't use reserved words (`logs`, `templates`)
- [ ] Decide on structure pattern (flat, nested, sibling)
- [ ] Prepare placeholder replacements table
- [ ] Create directory structure

---

## Appendix

### A. Common Mistakes

**Mistake 1: Using reserved folder names**
```bash
# ❌ Wrong
convex/lib/email/logs/

# ✅ Correct
convex/lib/email/email_logs/
```

**Mistake 2: Inconsistent casing**
```bash
# ❌ Wrong
convex/lib/Software/freelancerDashboard/Projects/

# ✅ Correct
convex/lib/software/freelancer_dashboard/projects/
```

**Mistake 3: Missing category/entity hierarchy**
```bash
# ❌ Wrong
convex/lib/projects/

# ✅ Correct
convex/lib/software/freelancer_dashboard/projects/
```

**Mistake 4: Wrong structure pattern**
```bash
# ❌ Wrong - tasks is independent, shouldn't be nested
convex/lib/software/tasks/
convex/lib/software/projects/tasks/

# ✅ Correct - tasks and projects are siblings
convex/lib/software/freelancer_dashboard/tasks/
convex/lib/software/freelancer_dashboard/projects/
```

### B. Real-World Examples

**Example 1: Email System (Addon)**
```
convex/
├── schema/addons/email/
│   ├── email_logs/
│   ├── email_templates/
│   └── email_configs/
└── lib/addons/email/
    ├── email_logs/
    ├── email_templates/
    └── email_configs/
```

**Example 2: Freelancer Dashboard (Software)**
```
convex/
├── schema/software/freelancer_dashboard/
│   ├── projects/
│   ├── clients/
│   ├── invoices/
│   └── expenses/
└── lib/software/freelancer_dashboard/
    ├── projects/
    ├── clients/
    ├── invoices/
    └── expenses/
```

**Example 3: Chess Game (Game)**
```
convex/
├── schema/games/chess/
│   ├── games/
│   ├── moves/
│   └── tournaments/
└── lib/games/chess/
    ├── games/
    ├── moves/
    └── tournaments/
```

### C. Module Relationships

**One-to-Many (Use Sub-modules)**
```
projects/ (parent)
└── tasks/ (child - only exists within project)
```

**Many-to-Many (Use Siblings + Junction)**
```
projects/ (sibling)
clients/ (sibling)
project_clients/ (junction table — separate module). **Naming rule:** `{left}_{right}` in snake_case plural for the folder, and `{left}{Right}` in camelCase for the tableName, keeping the same order everywhere.
```

**Independent (Use Siblings)**
```
projects/ (independent)
clients/ (independent)
invoices/ (independent)
```

### D. Next Steps

Once planning is complete:

1. **Create directory structure** using scaffold command
2. **Move to [Schema Implementation](./02-schema.md)**
3. **Keep placeholder reference table** handy for find-and-replace
4. **Start with validators.ts** in schema directory

---

**Next Document**: [02 - Schema Implementation →](./02-schema.md)
