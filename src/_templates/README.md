# Frontend Module Templates

Standardized templates for creating consistent, high-quality frontend feature modules across the codebase. These templates provide complete patterns for components, hooks, services, pages, and utilities.

## 📁 Template Files

### Component Templates

| File | Purpose |
|------|---------|
| `page.component.template.md` | List/index page component with filtering, sorting, and pagination |
| `details-page.component.template.md` | Detail/view page for a single entity |
| `form.component.template.md` | Create/edit form component with validation |
| `card.component.template.md` | Card component for displaying entity in list view |
| `modal.component.template.md` | Modal dialog for forms or detail views |
| `table.component.template.md` | Table component with sorting and actions |

### Hook Templates

| File | Purpose |
|------|---------|
| `use-entity.hook.template.md` | Main data fetching and mutation hook |
| `use-entity-actions.hook.template.md` | Entity action handlers (create, update, delete) |
| `use-entity-permissions.hook.template.md` | Permission checking hooks |
| `use-entity-audit.hook.template.md` | Audit logging hook |

### Service Template

| File | Purpose |
|------|---------|
| `service.template.md` | Service layer for API interactions with Convex |

### Support Templates

| File | Purpose |
|------|---------|
| `types.template.md` | TypeScript type definitions and interfaces |
| `constants.template.md` | Feature constants (statuses, limits, etc.) |
| `utils.template.md` | Helper functions and utilities |
| `config.template.md` | Feature configuration |
| `index.template.md` | Barrel export file for clean public API |

## 🚀 Quick Start

### 1. Copy Templates

Copy all template files to your feature directory:

```bash
# Example: Creating a new 'customers' feature
mkdir -p src/features/boilerplate/customers
cp src/_templates/*.template.md src/features/boilerplate/customers/
```

### 2. Create Directory Structure

Set up the standard feature structure:

```bash
cd src/features/boilerplate/customers
mkdir -p components hooks pages services types utils constants config
```

### 3. Rename and Organize Files

Move templates to appropriate directories and rename:

```bash
# Move component templates
mv page.component.template.md pages/CustomersPage.tsx
mv details-page.component.template.md pages/CustomerDetailsPage.tsx
mv form.component.template.md components/CustomerForm.tsx
mv card.component.template.md components/CustomerCard.tsx
mv modal.component.template.md components/CustomerFormModal.tsx
mv table.component.template.md components/CustomersTable.tsx

# Move hook templates
mv use-entity.hook.template.md hooks/useCustomers.ts
mv use-entity-actions.hook.template.md hooks/useCustomerActions.ts
mv use-entity-permissions.hook.template.md hooks/useCustomerPermissions.ts
mv use-entity-audit.hook.template.md hooks/useCustomerAudit.ts

# Move service template
mv service.template.md services/CustomersService.ts

# Move support templates
mv types.template.md types/index.ts
mv constants.template.md constants/index.ts
mv utils.template.md utils/customerHelpers.ts
mv config.template.md config/index.ts
mv index.template.md index.ts
```

### 4. Search and Replace

Replace placeholder names throughout all files:

| Find | Replace | Example |
|------|---------|---------|
| `[MODULE]` | Module name (SCREAMING_SNAKE_CASE) | `CUSTOMER`, `ORDER` |
| `[Entity]` | Entity name (PascalCase) | `Customer`, `Order` |
| `{entity}` | Entity name (camelCase) | `customer`, `order` |
| `[entities]` | Entity plural (camelCase) | `customers`, `orders` |
| `[Entities]` | Entity plural (PascalCase) | `Customers`, `Orders` |
| `[tableName]` | Convex table name | `boilerplateCustomers`, `boilerplateOrders` |
| `[module_name]` | Directory name | `customers`, `orders` |
| `[feature-path]` | Feature route path | `/customers`, `/orders` |

**Using your editor:**
- VS Code: `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows)
- Search and replace each placeholder across all files in the directory

### 5. Create Routes

Set up routing for your feature:

```bash
# Create route directory
mkdir -p src/routes/{-$locale}/_protected/_boilerplate/customers

# Create route files
touch src/routes/{-$locale}/_protected/_boilerplate/customers/index.tsx
touch src/routes/{-$locale}/_protected/_boilerplate/customers/$customerId/index.tsx
```

### 6. Customize Your Module

Edit each file to match your entity's needs. See [Customization Guide](#-customization-guide) below.

## ✅ Standard Feature Structure

Each feature module should have this structure:

```
src/features/boilerplate/[feature]/
├── components/           # UI components
│   ├── [Entity]Card.tsx
│   ├── [Entity]Form.tsx
│   ├── [Entity]FormModal.tsx
│   ├── [Entities]Table.tsx
│   ├── [Entities]PageHeader.tsx
│   ├── [Entities]Filters.tsx
│   └── [sub-features]/   # Sub-feature components
├── hooks/                # React hooks
│   ├── use[Entities].ts
│   ├── use[Entity]Actions.ts
│   ├── use[Entity]Permissions.ts
│   └── use[Entity]Audit.ts
├── pages/                # Page components
│   ├── [Entities]Page.tsx
│   ├── [Entity]DetailsPage.tsx
│   └── Create[Entity]Page.tsx
├── services/             # Service layer
│   └── [Entities]Service.ts
├── types/                # TypeScript types
│   └── index.ts
├── utils/                # Helper functions
│   └── {entity}Helpers.ts
├── constants/            # Constants
│   └── index.ts
├── config/               # Configuration
│   └── index.ts
└── index.ts              # Public API exports
```

## 📋 Standard Components

### Page Components

**List Page** (`[Entities]Page.tsx`):
- Displays list of entities with filtering, sorting, pagination
- Includes stats/summary section
- Has create/import actions in header
- Supports card view and table view
- Shows empty state when no data

**Details Page** (`[Entity]DetailsPage.tsx`):
- Shows single entity details
- Includes edit/delete actions
- Has tabs for related data (if applicable)
- Displays audit trail
- Handles loading and error states

**Create/Edit Page** (`Create[Entity]Page.tsx`):
- Form for creating/editing entity
- Validation and error handling
- Success/error notifications
- Redirect on success

### Component Patterns

**Card Component** (`[Entity]Card.tsx`):
- Displays entity summary in card format
- Shows key information at a glance
- Includes quick actions (edit, delete, etc.)
- Supports different variants (compact, full)
- Has hover and selection states

**Form Component** (`[Entity]Form.tsx`):
- Reusable form for create/edit
- Client-side validation
- Field-level error display
- Loading states for submit
- Cancel and save actions

**Table Component** (`[Entities]Table.tsx`):
- Data table with sorting
- Row actions (edit, delete, etc.)
- Bulk selection and actions
- Loading skeleton
- Empty state

**Modal Component** (`[Entity]FormModal.tsx`):
- Dialog wrapper for forms
- Handles open/close state
- Escape to close
- Overlay click handling
- Success callbacks

## 🎯 Customization Guide

### types/index.ts

Define TypeScript types for your feature:

```typescript
import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Customer = Doc<'boilerplateCustomers'>
export type CustomerId = Id<'boilerplateCustomers'>

export interface CreateCustomerData {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
}

export interface UpdateCustomerData {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: Customer['status']
}

export interface CustomersListOptions {
  status?: string
  search?: string
  sortBy?: 'name' | 'createdAt' | 'company'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}
```

### constants/index.ts

Define feature-specific constants:

```typescript
export const CUSTOMER_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 255,
    MAX_NOTES_LENGTH: 2000,
  },

  DEFAULTS: {
    PAGE_SIZE: 20,
    SORT_BY: 'createdAt' as const,
    SORT_ORDER: 'desc' as const,
  },
} as const
```

### utils/{entity}Helpers.ts

Implement helper functions:

```typescript
import type { Customer } from '../types'
import { CUSTOMER_CONSTANTS } from '../constants'

export function isCustomerActive(customer: Customer): boolean {
  return customer.status === CUSTOMER_CONSTANTS.STATUS.ACTIVE && !customer.deletedAt
}

export function formatCustomerName(customer: Customer): string {
  return customer.name.trim()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getCustomerDisplayName(customer: Customer): string {
  return customer.company ? `${customer.name} (${customer.company})` : customer.name
}
```

### services/[Entities]Service.ts

Create service layer for API interactions:

```typescript
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { CustomersListOptions, CreateCustomerData, UpdateCustomerData } from '../types'

export class CustomersService {
  // Queries
  useCustomers(options?: CustomersListOptions) {
    return useQuery(api.lib.boilerplate.customers.queries.getCustomers, options || {})
  }

  useCustomer(customerId: Id<'boilerplateCustomers'>) {
    return useQuery(api.lib.boilerplate.customers.queries.getCustomer, { customerId })
  }

  useCustomerStats() {
    return useQuery(api.lib.boilerplate.customers.queries.getCustomerStats)
  }

  // Mutations
  useCreateCustomer() {
    return useMutation(api.lib.boilerplate.customers.mutations.createCustomer)
  }

  useUpdateCustomer() {
    return useMutation(api.lib.boilerplate.customers.mutations.updateCustomer)
  }

  useDeleteCustomer() {
    return useMutation(api.lib.boilerplate.customers.mutations.deleteCustomer)
  }
}

export const customersService = new CustomersService()
```

### hooks/use[Entities].ts

Main data hook:

```typescript
import { useCallback } from 'react'
import { customersService } from '../services/CustomersService'
import type { CreateCustomerData, UpdateCustomerData, CustomersListOptions } from '../types'

export function useCustomers(options?: CustomersListOptions) {
  const { data: customersData, isPending, error } = customersService.useCustomers(options)
  const { data: stats } = customersService.useCustomerStats()

  const createCustomer = customersService.useCreateCustomer()
  const updateCustomer = customersService.useUpdateCustomer()
  const deleteCustomer = customersService.useDeleteCustomer()

  const handleCreateCustomer = useCallback(
    async (data: CreateCustomerData) => {
      try {
        const result = await createCustomer({ data })
        return result
      } catch (error) {
        console.error('Failed to create customer:', error)
        throw error
      }
    },
    [createCustomer]
  )

  return {
    customers: customersData?.customers || [],
    stats,
    isLoading: isPending,
    error,
    createCustomer: handleCreateCustomer,
    updateCustomer,
    deleteCustomer,
  }
}
```

## 🔍 Deployment Checklist

### Feature Setup
- [ ] Templates copied and renamed (.md → .tsx/.ts)
- [ ] Placeholders replaced (Entity, entity, entities, etc.)
- [ ] Directory structure created
- [ ] Files organized into correct folders
- [ ] index.ts exports all public APIs

### Backend Integration
- [ ] Convex mutations and queries exist
- [ ] Service layer configured with correct API paths
- [ ] Types match Convex schema types
- [ ] Table names are correct

### Implementation
- [ ] Types defined
- [ ] Constants customized
- [ ] Utilities implemented
- [ ] Service layer complete
- [ ] Hooks implemented
- [ ] Components created
- [ ] Pages created
- [ ] Routes configured

### UI/UX
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states shown
- [ ] Success/error notifications
- [ ] Form validation working
- [ ] Responsive design
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Internationalization (i18n) if needed

### Testing
- [ ] Test with sample data
- [ ] Test CRUD operations
- [ ] Test permission checks
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test responsive design
- [ ] Test keyboard navigation

## 🚨 Common Mistakes

### ❌ DON'T

```typescript
// Calling Convex mutations directly in components
const createCustomer = useMutation(api.lib.boilerplate.customers.mutations.createCustomer)

// No error handling
await createCustomer({ data })

// Not using service layer
const customers = useQuery(api.lib.boilerplate.customers.queries.getCustomers)

// Hardcoded strings
if (customer.status === 'active')

// Missing loading states
return <div>{customers.map(...)}</div>
```

### ✅ DO

```typescript
// Use service layer
const { customers, isLoading, createCustomer } = useCustomers()

// Error handling
try {
  await createCustomer(data)
  toast.success('Customer created successfully')
} catch (error) {
  toast.error('Failed to create customer')
}

// Use constants
import { CUSTOMER_CONSTANTS } from '../constants'
if (customer.status === CUSTOMER_CONSTANTS.STATUS.ACTIVE)

// Loading states
if (isLoading) return <Loading />
```

## 📚 Additional Resources

### Reference Implementations
- **Projects:** `src/features/boilerplate/projects/` - Comprehensive example
- **User Profiles:** `src/features/boilerplate/user_profiles/` - User management

### Related Documentation
- **Convex Templates:** `convex/_templates/README.md` - Backend templates
- **Component Library:** `src/components/ui/` - Reusable UI components
- **Routing Guide:** TanStack Router documentation

## 🐛 Troubleshooting

### Module not found errors
- Verify import paths are correct
- Check barrel exports in index.ts
- Ensure files are in correct directories

### TypeScript errors
- Verify types match Convex schema
- Check `Id<'tableName'>` and `Doc<'tableName'>` references
- Ensure all imports resolve correctly

### Hook errors
- Verify hooks are called inside React components
- Check hook dependencies in useCallback/useMemo
- Ensure conditional hook calls aren't happening

### Convex query/mutation errors
- Verify API paths match Convex functions
- Check table names match schema
- Ensure authenticated if required

## 💡 Best Practices

1. **Start Simple** - Implement basic list and detail pages first
2. **Test Early** - Test each component as you build it
3. **Follow Patterns** - Maintain consistency with existing features
4. **Use TypeScript** - Leverage types for compile-time safety
5. **Service Layer** - Always use service layer, never call Convex directly in components
6. **Error Handling** - Handle errors gracefully with user-friendly messages
7. **Loading States** - Always show loading states during async operations
8. **Accessibility** - Add ARIA labels and keyboard navigation
9. **Responsive** - Test on different screen sizes
10. **Internationalization** - Use i18n for all user-facing text

## 📝 Template Versions

**Current Version:** 1.0.0
**Last Updated:** 2025-01-18
**Based on:** Projects feature implementation (geenius-boilerplate v8.5)

---

**Questions?** Review the templates, check existing implementations (especially `projects`), or consult the team documentation.
