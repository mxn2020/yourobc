# Naming Conventions

> All naming rules and conventions in one place for quick reference.

## Table of Contents

- [Placeholder Replacement](#placeholder-replacement)
- [Case Conventions](#case-conventions)
- [Folder Naming Rules](#folder-naming-rules)
- [Quick Reference Table](#quick-reference-table)

---

## Placeholder Replacement

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

---

## Case Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Folders/Files | snake_case | `email_templates/` |
| Table Names | camelCase | `emailTemplates` |
| TypeScript Types | PascalCase | `EmailTemplate` |
| Constants | SCREAMING_SNAKE_CASE | `EMAIL_CONSTANTS` |
| Variables | camelCase | `emailTemplate` |

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

## Quick Reference Table

### Your Module Placeholder Values

Fill this out for your module:

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

### Display Field Options

Choose ONE for your entity:

| Field | Use For | Example |
|-------|---------|---------|
| `name` | People, products, categories | users, products |
| `title` | Documents, tasks, work items | projects, invoices |
| `displayName` | Ambiguous cases | custom entities |

**Remember**: Update search filters and sortBy logic to use your chosen field!

---

## Common Mistakes

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
