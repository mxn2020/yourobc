# Supporting Entity Refactoring Guide

## 📋 Overview

This guide documents the refactoring of the `yourobc/supporting` entity from a flat, centralized structure to a **per-module subdirectory structure** following the new coding pattern.

**Status**:
- ✅ exchangeRates: COMPLETE (fully refactored)
- 📝 inquirySources: SCHEMA COMPLETE, LIB TEMPLATE PROVIDED
- 📝 wikiEntries: SCHEMA COMPLETE, LIB TEMPLATE PROVIDED
- ⏳ comments, counters, documents, followupReminders, notifications: PENDING

---

## ✅ Completed Work

### Phase 1: Schema Layer (All 3 Priority Modules)

#### exchangeRates
- ✅ `convex/schema/yourobc/supporting/exchange_rates/validators.ts`
- ✅ `convex/schema/yourobc/supporting/exchange_rates/exchange_rates.ts` (table with updated indexes)
- ✅ `convex/schema/yourobc/supporting/exchange_rates/types.ts`
- ✅ `convex/schema/yourobc/supporting/exchange_rates/schemas.ts`
- ✅ `convex/schema/yourobc/supporting/exchange_rates/index.ts`

**Key Updates:**
- Table renamed: `exchangeRates` → `yourobcExchangeRates`
- Index names updated: `by_created` → `by_created_at`, `by_deleted` → `by_deleted_at`
- All standard audit fields and soft delete fields included

#### inquirySources
- ✅ `convex/schema/yourobc/supporting/inquiry_sources/validators.ts`
- ✅ `convex/schema/yourobc/supporting/inquiry_sources/inquiry_sources.ts` (table with updated indexes)
- ✅ `convex/schema/yourobc/supporting/inquiry_sources/types.ts`
- ✅ `convex/schema/yourobc/supporting/inquiry_sources/schemas.ts`
- ✅ `convex/schema/yourobc/supporting/inquiry_sources/index.ts`

**Key Updates:**
- Table renamed: `inquirySources` → `yourobcInquirySources`
- Index names updated: `by_created` → `by_created_at`, `by_deleted` → `by_deleted_at`

#### wikiEntries
- ✅ `convex/schema/yourobc/supporting/wiki_entries/validators.ts`
- ✅ `convex/schema/yourobc/supporting/wiki_entries/wiki_entries.ts` (table with updated indexes)
- ✅ `convex/schema/yourobc/supporting/wiki_entries/types.ts`
- ✅ `convex/schema/yourobc/supporting/wiki_entries/schemas.ts`
- ✅ `convex/schema/yourobc/supporting/wiki_entries/index.ts`

**Key Updates:**
- Table already named: `yourobcWikiEntries`
- Index names updated: `by_created` → `by_created_at`, `by_deleted` → `by_deleted_at`
- Classification fields maintained

### Phase 2: Lib Layer - exchangeRates Module (COMPLETE)

- ✅ `convex/lib/yourobc/supporting/exchange_rates/constants.ts` (with EXCHANGE_RATES_VALUES)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/types.ts` (CreateExchangeRateData, UpdateExchangeRateData, etc.)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/utils.ts` (generic trim, validation)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/permissions.ts` (access control)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/queries.ts` (cursor-based pagination)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/mutations.ts` (CRUD with audit logs)
- ✅ `convex/lib/yourobc/supporting/exchange_rates/index.ts` (barrel exports)

**Implementation Highlights:**
- Cursor-based pagination instead of offset-based
- Generic trim function with proper TypeScript (no `any`)
- Trim → Validate → Execute pattern
- Soft delete with audit logging
- Permission checks (view, edit, delete)
- Index naming consistency

---

## 📝 In Progress / Templates Provided

### Lib Layer - inquirySources Module

**Template File**: `convex/lib/yourobc/supporting/inquiry_sources/REFACTORING_TEMPLATE.md`

**Files to Create**:
1. constants.ts
2. types.ts
3. utils.ts
4. permissions.ts
5. queries.ts (cursor-based)
6. mutations.ts
7. index.ts

**Expected Changes**:
- Similar structure to exchange_rates module
- Extract inquiry source specific logic from root supporting files
- Update table references and index names
- Implement cursor-based pagination

### Lib Layer - wikiEntries Module

**Template File**: `convex/lib/yourobc/supporting/wiki_entries/REFACTORING_TEMPLATE.md`

**Files to Create**:
1. constants.ts
2. types.ts
3. utils.ts
4. permissions.ts
5. queries.ts (cursor-based, with search)
6. mutations.ts (including publishWikiEntry)
7. index.ts

**Expected Changes**:
- Similar structure to exchange_rates module
- Extract wiki specific logic from root supporting files
- Implement slug generation and search utilities
- Separate publish operation from update
- View count tracking

---

## ⏳ Remaining Work (5 Modules)

These modules still need both schema and lib refactoring:
- comments
- counters
- documents
- followupReminders
- notifications

Can follow the same pattern established by the 3 priority modules.

---

## 🔄 Root Files Update (PENDING)

After all per-module refactoring is complete, update these root files:

### convex/lib/yourobc/supporting/constants.ts
- Remove constants for refactored modules
- Re-export from per-module constants
- Keep constants for remaining 5 modules

### convex/lib/yourobc/supporting/types.ts
- Remove types for refactored modules
- Import types from per-module types.ts
- Keep types for remaining 5 modules

### convex/lib/yourobc/supporting/utils.ts
- Remove utilities for refactored modules
- Re-export from per-module utils
- Keep utilities for remaining 5 modules

### convex/lib/yourobc/supporting/permissions.ts
- Remove permission functions for refactored modules
- Re-export from per-module permissions
- Keep permissions for remaining 5 modules

### convex/lib/yourobc/supporting/queries.ts
- Remove queries for refactored modules
- Re-export from per-module queries
- Keep queries for remaining 5 modules

### convex/lib/yourobc/supporting/mutations.ts
- Remove mutations for refactored modules
- Re-export from per-module mutations
- Keep mutations for remaining 5 modules

### convex/lib/yourobc/supporting/index.ts
- Update all exports to include per-module re-exports
- Maintain backward compatibility with existing imports

### convex/schema.ts
- Register new schemas:
  ```typescript
  import { supportingExchangeRatesSchemas } from './schema/yourobc/supporting/exchange_rates/schemas';
  import { supportingInquirySourcesSchemas } from './schema/yourobc/supporting/inquiry_sources/schemas';
  import { supportingWikiEntriesSchemas } from './schema/yourobc/supporting/wiki_entries/schemas';

  export default defineSchema({
    ...supportingExchangeRatesSchemas,
    ...supportingInquirySourcesSchemas,
    ...supportingWikiEntriesSchemas,
    // ... other schemas
  });
  ```

---

## 🎯 Pattern Reference

All newly created modules follow this structure and pattern:

### Schema Layer Structure
```
convex/schema/yourobc/supporting/{module}/
├── validators.ts          # Reusable validators
├── {module}.ts            # Table definition with indexes
├── types.ts               # TypeScript type extractions
├── schemas.ts             # Export object for registration
└── index.ts               # Barrel exports
```

### Lib Layer Structure
```
convex/lib/yourobc/supporting/{module}/
├── constants.ts           # Constants + enum values
├── types.ts               # Operation interfaces
├── utils.ts               # Validation + helpers (generic trim)
├── permissions.ts         # Access control
├── queries.ts             # Read operations (cursor pagination)
├── mutations.ts           # Write operations (soft delete, audit)
└── index.ts               # Barrel exports
```

### Key Pattern Elements

1. **Pagination**: Cursor-based with `.paginate()` method
2. **Soft Delete**: Always use soft delete, filter with `notDeleted`
3. **Trim → Validate**: All mutations trim input before validation
4. **Audit Logs**: Every mutation logs to auditLogs table
5. **Permissions**: Separate `can*` (boolean) from `require*` (throws) functions
6. **Generic Typing**: No `any` types in trim/utility functions
7. **Index Naming**: `by_owner_id`, `by_created_at`, `by_deleted_at` (standardized)
8. **Module Values**: Export `{MODULE}_VALUES` for use in validators

---

## 🚀 Next Steps

### Option 1: Complete All 3 Priority Modules (Recommended)
1. Copy logic from exchange_rates module to create complete inquirySources lib
2. Copy logic from exchange_rates module to create complete wikiEntries lib
3. Update root supporting files with re-exports
4. Register new schemas in convex/schema.ts
5. Test all functionality

### Option 2: Complete Incrementally
- Finish inquirySources (using provided template)
- Finish wikiEntries (using provided template)
- One at a time, following exchange_rates as template

### Option 3: Extend to Remaining 5 Modules
- After 3 are complete, apply same pattern to:
  - comments
  - counters
  - documents
  - followupReminders
  - notifications

---

## ✨ Benefits of Refactoring

1. **Maintainability**: Much cleaner code organization
2. **Scalability**: Easier to add new supporting modules
3. **Performance**: Smaller, focused files vs. massive centralized files
4. **Pattern Consistency**: All modules follow same conventions
5. **Cursor Pagination**: Better performance with large datasets
6. **Type Safety**: Proper generic typing throughout
7. **Code Reusability**: Clear module boundaries enable easier code sharing

---

## 📚 Reference Files

- **exchangeRates (Complete Example)**: `convex/lib/yourobc/supporting/exchange_rates/`
- **Shipments (Similar Pattern)**: `convex/lib/yourobc/shipments/` (from first refactoring)
- **Template Guide**: See individual module REFACTORING_TEMPLATE.md files

---

## 🔗 Related Files

- **Base Validators**: `convex/schema/base.validators.ts`
- **Base Fields**: `convex/schema/base.ts` (auditFields, softDeleteFields, classificationFields)
- **Auth Helper**: `convex/shared/auth.helper.ts` (requireCurrentUser, requirePermission)
- **DB Helper**: `convex/shared/db.helper.ts` (notDeleted filter)
