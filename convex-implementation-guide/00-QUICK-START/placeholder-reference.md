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
| Folders/Files | snake_case | `email_templates/` |
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
