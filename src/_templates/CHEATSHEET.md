# Frontend Template Cheat Sheet

Quick reference for using the standardized frontend feature templates.

## 🚀 Quick Setup (10 minutes)

```bash
# 1. Create feature directory structure
mkdir -p src/features/boilerplate/[module_name]/{components,hooks,pages,services,types,utils,constants,config}

# 2. Copy templates to feature directory
cp src/_templates/*.template.md src/features/boilerplate/[module_name]/

# 3. Move templates to correct folders
cd src/features/boilerplate/[module_name]

# Component templates → components/
mv page.component.template.md pages/[Entities]Page.tsx
mv details-page.component.template.md pages/[Entity]DetailsPage.tsx
mv form.component.template.md components/[Entity]Form.tsx
mv card.component.template.md components/[Entity]Card.tsx
mv table.component.template.md components/[Entities]Table.tsx
mv modal.component.template.md components/[Entity]FormModal.tsx

# Hook templates → hooks/
mv use-entity.hook.template.md hooks/use[Entities].ts
mv use-entity-permissions.hook.template.md hooks/use[Entity]Permissions.ts
mv use-entity-audit.hook.template.md hooks/use[Entity]Audit.ts

# Service template → services/
mv service.template.md services/[Entities]Service.ts

# Support templates
mv types.template.md types/index.ts
mv constants.template.md constants/index.ts
mv utils.template.md utils/{entity}Helpers.ts
mv config.template.md config/index.ts
mv index.template.md index.ts

# 4. Search & replace placeholders (use your editor)
#    Find → Replace
#    [MODULE] → CUSTOMER (SCREAMING_SNAKE_CASE)
#    [Entity] → Customer (PascalCase)
#    {entity} → customer (camelCase)
#    [entities] → customers (camelCase plural)
#    [Entities] → Customers (PascalCase plural)
#    [tableName] → boilerplateCustomers
#    [module_name] → customers
#    [feature-path] → customers
#    [Module] → Customer

# 5. Create routes
mkdir -p src/routes/{-$locale}/_protected/_boilerplate/[module_name]
```

## 📋 Search & Replace Reference

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[MODULE]` | Constant prefix (SCREAMING_SNAKE_CASE) | `CUSTOMER`, `ORDER` |
| `[Entity]` | Entity name (PascalCase) | `Customer`, `Order` |
| `{entity}` | Entity name (camelCase) | `customer`, `order` |
| `[entities]` | Plural (camelCase) | `customers`, `orders` |
| `[Entities]` | Plural (PascalCase) | `Customers`, `Orders` |
| `[tableName]` | Convex table name | `boilerplateCustomers` |
| `[module_name]` | Directory/module name | `customers`, `orders` |
| `[feature-path]` | Route path | `/customers`, `/orders` |
| `[Module]` | Module name for types | `Customer`, `Order` |

## 🎯 Standard Component Structure

```
src/features/boilerplate/[module_name]/
├── components/
│   ├── [Entity]Card.tsx              # Card display component
│   ├── [Entity]Form.tsx              # Create/edit form
│   ├── [Entity]FormModal.tsx         # Modal wrapper for form
│   ├── [Entity]Stats.tsx             # Statistics component
│   ├── [Entities]PageHeader.tsx      # Page header with actions
│   ├── [Entities]Filters.tsx         # Filter controls
│   ├── [Entity]QuickFilterBadges.tsx # Active filter badges
│   ├── [Entities]Table.tsx           # Table view
│   └── [Entities]HelpSection.tsx     # Help/documentation
│
├── hooks/
│   ├── use[Entities].ts              # Main data & mutations hook
│   ├── use[Entity]Permissions.ts     # Permission checks
│   └── use[Entity]Audit.ts           # Audit logging
│
├── pages/
│   ├── [Entities]Page.tsx            # List/index page
│   ├── [Entity]DetailsPage.tsx       # Single entity detail view
│   └── Create[Entity]Page.tsx        # Create page (optional)
│
├── services/
│   └── [Entities]Service.ts          # API service layer
│
├── types/
│   └── index.ts                      # TypeScript types
│
├── utils/
│   └── {entity}Helpers.ts            # Helper functions
│
├── constants/
│   └── index.ts                      # Feature constants
│
├── config/
│   └── index.ts                      # Feature configuration
│
└── index.ts                          # Public API exports
```

## 🔌 Common Imports

```typescript
// In pages
import { use[Entities], use[Entity]Stats } from '../hooks/use[Entities]'
import { useCanCreate[Entities] } from '../hooks/use[Entity]Permissions'
import { [Entity]Card } from '../components/[Entity]Card'
import { [MODULE]_CONSTANTS } from '../constants'

// In components
import { use[Entity]Actions } from '../hooks/use[Entities]'
import type { [Entity], Create[Entity]Data } from '../types'
import * as {entity}Helpers from '../utils/{entity}Helpers'

// In hooks
import { [entities]Service } from '../services/[Entities]Service'
import { use[Entity]Audit } from './use[Entity]Audit'
import { parseConvexError } from '@/utils/errorHandling'
```

## 🎨 Common Patterns

### 1. List Page Pattern

```typescript
const { data: [entities]Data } = use[Entities]List({ limit: 100 })
const { data: stats } = use[Entity]Stats()
const canCreate = useCanCreate[Entities]()

const [entities] = [entities]Data?.[entities] || []
```

### 2. Detail Page Pattern

```typescript
const { {entity}Id } = useParams()
const { data: {entity}, isLoading, error } = use[Entity]({entity}Id)
const { update[Entity], delete[Entity] } = use[Entity]Actions()
const canEdit = useCanEdit[Entity]({entity}Id)
```

### 3. Form Pattern

```typescript
const [formData, setFormData] = useState<Create[Entity]Data>({
  title: '',
  description: '',
  priority: [MODULE]_CONSTANTS.PRIORITY.MEDIUM,
})

const validateForm = () => {
  const errors = validate[Entity]Data(formData)
  if (errors.length > 0) {
    toast.error(`Validation failed: ${errors.join(', ')}`)
    return false
  }
  return true
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return
  await onSubmit(formData)
}
```

### 4. Permission Check Pattern

```typescript
const { canEdit, canDelete, isOwner } = use[Entity]Permissions({entity})

// Or specific checks
const canCreate = useCanCreate[Entities]()
const canEdit = useCanEdit[Entity]({entity}Id)
```

### 5. Service Pattern

```typescript
export class [Entities]Service {
  get[Entities]QueryOptions(options?: [Entities]ListOptions) {
    return convexQuery(api.lib.boilerplate.[module_name].queries.get[Entities], {
      options,
    })
  }

  use[Entities](options?: [Entities]ListOptions) {
    return useQuery({
      ...this.get[Entities]QueryOptions(options),
      staleTime: 30000,
    })
  }

  useCreate[Entity]() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.[module_name].mutations.create[Entity])
    return useMutation({ mutationFn })
  }
}
```

## 📦 Type Definitions

```typescript
// Entity type
export type [Entity] = Doc<'[tableName]'>
export type [Entity]Id = Id<'[tableName]'>

// Create/Update types
export interface Create[Entity]Data {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  // ... other fields
}

export interface Update[Entity]Data {
  title?: string
  description?: string
  status?: [Entity]['status']
  // ... other fields
}

// Query options
export interface [Entities]ListOptions {
  status?: string
  search?: string
  sortBy?: 'title' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}
```

## 🔧 Constants Pattern

```typescript
export const [MODULE]_CONSTANTS = {
  PERMISSIONS: {
    VIEW: '[module_name]:view',
    CREATE: '[module_name]:create',
    EDIT: '[module_name]:edit',
    DELETE: '[module_name]:delete',
  },

  STATUS: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
  },
} as const
```

## 🛠️ Utility Functions

```typescript
// Validation
export function validate[Entity]Data(data: Partial<Create[Entity]Data>): string[] {
  const errors: string[] = []
  if (!data.title?.trim()) errors.push('Title is required')
  return errors
}

// Date helpers
export function is[Entity]Overdue({entity}: { dueDate?: number }): boolean {
  return !!{entity}.dueDate && {entity}.dueDate < Date.now()
}

// Formatting
export function format[Entity]Name({entity}: { title: string }): string {
  return {entity}.title.trim()
}

// Health calculation
export function calculate[Entity]Health({entity}: { status: string; progress?: number }): string {
  if ({entity}.status === 'completed') return 'excellent'
  if (({entity}.progress || 0) >= 80) return 'excellent'
  if (({entity}.progress || 0) >= 60) return 'good'
  return 'at-risk'
}
```

## 🎯 Common Tasks

### Add a New Field to Entity

1. **Update Convex schema** (`convex/schema/addons/[addon]/{module}.ts`)
2. **Update types** (`types/index.ts`)
   - Add to `Create[Entity]Data`
   - Add to `Update[Entity]Data`
3. **Update form** (`components/[Entity]Form.tsx`)
   - Add form field
   - Add to formData state
   - Add validation if needed
4. **Update display** (`components/[Entity]Card.tsx` or details page)

### Add a New Filter

1. **Update types** (`types/index.ts`)
   - Add to `[Entities]ListOptions`
2. **Update filters component** (`components/[Entities]Filters.tsx`)
   - Add filter control
3. **Update page** (`pages/[Entities]Page.tsx`)
   - Add state for filter
   - Add to filter logic

### Add a New Action

1. **Create Convex mutation** (`convex/lib/boilerplate/{module}/mutations.ts`)
2. **Update service** (`services/[Entities]Service.ts`)
   - Add mutation hook
3. **Update main hook** (`hooks/use[Entities].ts`)
   - Add action function
4. **Update UI** (button/menu in components)

## 🚨 Common Mistakes

### ❌ DON'T

```typescript
// Calling Convex directly in components
const create = useMutation(api.lib.boilerplate.[module_name].mutations.create[Entity])

// Hardcoded strings
if ({entity}.status === 'active')

// No error handling
await create[Entity](data)

// Missing loading states
return <div>{[entities].map(...)}</div>

// No permission checks
<Button onClick={delete[Entity]}>Delete</Button>
```

### ✅ DO

```typescript
// Use service layer
const { [entities], create[Entity] } = use[Entities]()

// Use constants
if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ACTIVE)

// Error handling
try {
  await create[Entity](data)
  toast.success('Created successfully')
} catch (error) {
  toast.error('Failed to create')
}

// Loading states
if (isLoading) return <Loading />

// Permission checks
{canDelete && <Button onClick={delete[Entity]}>Delete</Button>}
```

## 📚 File-by-File Checklist

After copying templates:

- [ ] `pages/[Entities]Page.tsx` - Replace placeholders
- [ ] `pages/[Entity]DetailsPage.tsx` - Replace placeholders
- [ ] `components/[Entity]Form.tsx` - Customize fields
- [ ] `components/[Entity]Card.tsx` - Customize display
- [ ] `components/[Entities]Table.tsx` - Customize columns
- [ ] `components/[Entity]FormModal.tsx` - Replace placeholders
- [ ] `hooks/use[Entities].ts` - Update API paths
- [ ] `hooks/use[Entity]Permissions.ts` - Customize permissions
- [ ] `hooks/use[Entity]Audit.ts` - Customize audit actions
- [ ] `services/[Entities]Service.ts` - Update API paths
- [ ] `types/index.ts` - Define entity-specific types
- [ ] `constants/index.ts` - Define entity-specific constants
- [ ] `utils/{entity}Helpers.ts` - Customize utilities
- [ ] `config/index.ts` - Configure feature flags
- [ ] `index.ts` - Update barrel exports

## 💡 Pro Tips

1. **Start with the backend** - Create Convex schema and mutations first
2. **Use constants** - Always reference `[MODULE]_CONSTANTS` instead of hardcoded strings
3. **Permission checks** - Use permission hooks for UI, rely on backend for security
4. **Error handling** - Always wrap mutations in try-catch with user feedback
5. **Loading states** - Show skeletons/spinners during async operations
6. **Validation** - Validate both client-side (UX) and server-side (security)
7. **Audit logging** - Log important user actions for compliance
8. **Types first** - Define types before implementing components
9. **Service layer** - Always use service layer, never call Convex directly
10. **Test as you go** - Test each component as you build it

## 🔗 Related Documentation

- **Convex Templates**: `/convex/_templates/README.md`
- **Projects Example**: `/src/features/boilerplate/projects/`
- **Component Library**: `/src/components/ui/`
- **TanStack Router**: https://tanstack.com/router

---

**Questions?** Check the README.md or review the projects feature implementation!
