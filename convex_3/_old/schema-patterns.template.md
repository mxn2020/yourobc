# Convex Schema Template

## Simplified Single Pattern Structure

All schemas follow a consistent three-level organization:
```
{category}/{entity}/{module}/
├── {module}.ts          # Schema definitions
├── validators.ts        # Grouped validators
├── types.ts            # Type extractions
└── schemas.ts          # Schema exports
```

---

## ⚠️ Critical Table Requirements

**Every table MUST include:**

### 1. Main Display Field (REQUIRED)
- **One of:** `name`, `title`, or `displayName`
- **Purpose:**
  - Used in auditLogs for entity identification (`entityTitle`)
  - Used in UI for displaying entity information
  - Required for meaningful logging and debugging
- **Must be indexed:** `.index('by_name', ['name'])`

### 2. publicId (REQUIRED)
- Unique public identifier for external APIs
- Must be indexed: `.index('by_public_id', ['publicId'])`

### 3. Audit Fields (REQUIRED)
- Use `...auditFields` from base
- Use `...softDeleteFields` from base

**❌ Tables without a main display field will cause auditLog failures!**

---

## Directory Structure

### Category Level
```
convex/schema/{category}/
├── index.ts             # Category exports
└── schemas.ts           # Category schema aggregator
```

**Available categories:**
- `addons` - Simple reusable tools for boilerplate
- `apps` - Full apps with multiple features
- `external` - Project examples for external clients
- `games` - Game projects using game engines
- `software` - Full SME business software examples

### Entity Level
```
convex/schema/{category}/{entity}/
├── [module1]/           # Individual module folders
├── [module2]/
└── schemas.ts           # Entity schema aggregator
```

**Entity:** Independent projects within a category (e.g., `business`, `crm`, `chess`)

### Module Level
```
convex/schema/{category}/{entity}/{module}/
├── {module}.ts          # Table definitions (1+ tables)
├── validators.ts        # Grouped validators (REQUIRED)
├── types.ts            # Type extractions
└── schemas.ts          # Module schema exports
```

**Module:** Single feature with related tables (e.g., `expenses`, `invoices`, `feedback`)

---

## Implementation Example: addons/business/expenses

### Step 1: Create Module Structure
```bash
mkdir -p convex/schema/addons/business/expenses
cd convex/schema/addons/business/expenses
```

### Step 2: Create validators.ts (REQUIRED)
```typescript
// convex/schema/addons/business/expenses/validators.ts

import { v } from 'convex/values'

// ============================================================================
// Expense Validators
// ============================================================================

export const expenseValidators = {
  status: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('reimbursed'),
    v.literal('cancelled')
  ),
  
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),
  
  paymentMethod: v.union(
    v.literal('cash'),
    v.literal('credit_card'),
    v.literal('debit_card'),
    v.literal('bank_transfer'),
    v.literal('digital_wallet'),
    v.literal('other')
  ),
}
```

### Step 3: Create {module}.ts (Table Definitions)
```typescript
// convex/schema/addons/business/expenses/expenses.ts

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statusTypes, auditFields, softDeleteFields, metadataSchema } from '@/schema/base'
import { expenseValidators } from './validators'

// ============================================================================
// Main Expense Table
// ============================================================================

export const addonBusinessExpenseTable = defineTable({
  // Public ID (REQUIRED)
  publicId: v.string(),

  // Main display field (REQUIRED)
  title: v.string(),

  // Core fields
  description: v.optional(v.string()),
  amount: v.number(),
  currency: v.string(),

  // Status & Classification - Use validators
  status: expenseValidators.status,
  priority: statusTypes.priority,
  visibility: expenseValidators.visibility,

  // Ownership
  ownerId: v.id('userProfiles'),

  // Dates
  expenseDate: v.number(),
  lastActivityAt: v.number(),

  // Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])  // REQUIRED: Index for main display field
  .index('by_owner', ['ownerId'])
  .index('by_status', ['status'])
  .index('by_deleted_at', ['deletedAt'])

// ============================================================================
// Related Tables (if needed)
// ============================================================================

export const addonBusinessExpenseCategoryTable = defineTable({
  publicId: v.string(),
  name: v.string(),  // Main display field
  ownerId: v.id('userProfiles'),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])  // REQUIRED
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
```

### Step 4: Create schemas.ts (Module Exports)
```typescript
// convex/schema/addons/business/expenses/schemas.ts

import {
  addonBusinessExpenseTable,
  addonBusinessExpenseCategoryTable
} from './expenses'

export const addonBusinessExpensesSchemas = {
  addonBusinessExpenses: addonBusinessExpenseTable,
  addonBusinessExpenseCategories: addonBusinessExpenseCategoryTable,
}
```

### Step 5: Create types.ts (Type Extractions)
```typescript
// convex/schema/addons/business/expenses/types.ts

import { type Infer } from 'convex/values'
import { addonBusinessExpensesSchemas } from './schemas'

// ============================================================================
// Table Validators (For TypeScript type generation)
// ============================================================================

export const addonBusinessExpenses = addonBusinessExpensesSchemas.addonBusinessExpenses.validator
export const addonBusinessExpenseCategories = addonBusinessExpensesSchemas.addonBusinessExpenseCategories.validator

// ============================================================================
// TypeScript Types from Validators
// ============================================================================

export type AddonBusinessExpense = Infer<typeof addonBusinessExpenses>
export type AddonBusinessExpenseCategory = Infer<typeof addonBusinessExpenseCategories>
```

### Step 6: Update Entity schemas.ts
```typescript
// convex/schema/addons/business/schemas.ts

import { addonBusinessExpensesSchemas } from './expenses/schemas'
import { addonBusinessFeedbackSchemas } from './feedback/schemas'
import { addonBusinessInvoicesSchemas } from './invoices/schemas'
// ... import other modules

export const addonBusinessSchemas = {
  ...addonBusinessExpensesSchemas,
  ...addonBusinessFeedbackSchemas,
  ...addonBusinessInvoicesSchemas,
  // ... spread other modules
}
```

### Step 7: Update Category schemas.ts
```typescript
// convex/schema/addons/schemas.ts

import { addonBusinessSchemas } from './business/schemas'
// ... import other entities

export const addonsSchemas = {
  ...addonBusinessSchemas,
  // ... spread other entities
}
```

### Step 8: Register in Main Schema
```typescript
// convex/schema.ts

import { defineSchema } from 'convex/server'
import { addonsSchemas } from './schema/addons/schemas'
import { appsSchemas } from './schema/apps/schemas'
// ... other categories

export default defineSchema({
  ...addonsSchemas,
  ...appsSchemas,
  // ... other categories
})
```

---

## Usage in Library Files

### Mutations
```typescript
// convex/lib/addons/business/expenses/mutations.ts

import { mutation } from '@/generated/server'
import { v } from 'convex/values'
import { expenseValidators } from '@/schema/addons/business/expenses/validators'
import { statusTypes } from '@/schema/base'

export const createExpense = mutation({
  args: {
    data: v.object({
      title: v.string(),  // Main display field (REQUIRED)
      amount: v.number(),
      
      // Use validators for type-safe args
      status: v.optional(expenseValidators.status),
      visibility: v.optional(expenseValidators.visibility),
      paymentMethod: v.optional(expenseValidators.paymentMethod),
      priority: v.optional(statusTypes.priority),
    }),
  },
  handler: async (ctx, { data }) => {
    // ... implementation
  },
})
```

### Queries
```typescript
// convex/lib/addons/business/expenses/queries.ts

import { query } from '@/generated/server'
import { v } from 'convex/values'
import { expenseValidators } from '@/schema/addons/business/expenses/validators'

export const getExpenses = query({
  args: {
    options: v.optional(v.object({
      filters: v.optional(v.object({
        status: v.optional(v.array(expenseValidators.status)),
        visibility: v.optional(expenseValidators.visibility),
      })),
    })),
  },
  handler: async (ctx, { options = {} }) => {
    // ... implementation
  },
})
```

---

## Naming Conventions

### Table Names
```
{category}{Entity}{Module}{TableName}Table

Examples:
- addonBusinessExpenseTable
- addonBusinessExpenseCategoryTable
- appCrmContactTable
- gameDinoGameTable
```

### Schema Objects
```
{category}{Entity}{Module}Schemas

Examples:
- addonBusinessExpensesSchemas
- addonBusinessFeedbackSchemas
- appCrmContactsSchemas
```

### Validators
```
{module}Validators

Examples:
- expenseValidators
- feedbackValidators
- invoiceValidators
```

### Types
```
{Category}{Entity}{Module}{TableName}

Examples:
- AddonBusinessExpense
- AddonBusinessExpenseCategory
- AppCrmContact
```

---

## Standard Fields & Indexes

### Required Fields
```typescript
{
  // REQUIRED - Main display field (choose one)
  name: v.string(),           // For most entities
  // OR title: v.string(),    // For documents/invoices/posts
  // OR displayName: v.string(), // When "name" is ambiguous

  // REQUIRED
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  ...auditFields,
  ...softDeleteFields,

  // Recommended
  lastActivityAt: v.number(),
  metadata: metadataSchema,
}
```

### Required Indexes
```typescript
.index('by_public_id', ['publicId'])      // REQUIRED
.index('by_name', ['name'])               // REQUIRED (or by_title, by_displayName)
.index('by_owner', ['ownerId'])           // REQUIRED
.index('by_deleted_at', ['deletedAt'])    // REQUIRED
.index('by_last_activity', ['lastActivityAt'])  // Recommended
```

---

## Implementation Checklist

### Module Setup
- [ ] Create module directory structure
- [ ] Create validators.ts with grouped validators
- [ ] Create {module}.ts with table definitions
- [ ] Create schemas.ts with exports
- [ ] Create types.ts with type extractions
- [ ] Update entity schemas.ts
- [ ] Update category schemas.ts (if first entity)
- [ ] Register in main schema.ts

### Table Requirements
- [ ] Main display field added (name/title/displayName)
- [ ] Main display field indexed
- [ ] publicId field and index added
- [ ] Audit fields spread
- [ ] Soft delete fields spread
- [ ] Standard indexes added

### Validators
- [ ] Module validators created in validators.ts
- [ ] No schema imports in validators.ts
- [ ] Validators used in table definitions
- [ ] Validators used in mutation args
- [ ] Validators used in query filters

---

## Best Practices

### ✅ DO
1. **Always include main display field** in every table
2. **Always index the main display field**
3. **Create validators.ts** for every module
4. **Import validators** in mutations/queries for type-safe args
5. **Use spread syntax** for audit and metadata fields
6. **Keep modules focused** - one feature per module
7. **Use descriptive names** for validators and types

### ❌ DON'T
1. **Don't create tables without main display field**
2. **Don't make display fields optional**
3. **Don't use inline unions** in schemas (use validators)
4. **Don't import schemas in validators.ts** (circular dependency)
5. **Don't duplicate validator definitions**
6. **Don't hard delete** (always soft delete)

---

## Quick Reference

### File Purposes

| File | Purpose | Required |
|------|---------|----------|
| `{module}.ts` | Table definitions | ✅ Yes |
| `validators.ts` | Grouped validators | ✅ Yes |
| `schemas.ts` | Export schema objects | ✅ Yes |
| `types.ts` | Type extractions | ✅ Yes |

### Import Paths
```typescript
// In {module}.ts
import { auditFields, statusTypes } from '@/schema/base'
import { {module}Validators } from './validators'

// In library mutations/queries
import { {module}Validators } from '@/schema/{category}/{entity}/{module}/validators'
import { statusTypes } from '@/schema/base'

// In types
import { {category}[Entity][Module]Schemas } from './schemas'
```

---

**You're ready to build! Follow this single, consistent pattern for all new schemas.**
