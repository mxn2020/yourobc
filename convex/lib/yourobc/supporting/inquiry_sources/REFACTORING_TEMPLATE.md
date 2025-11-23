# Inquiry Sources Lib Module - Refactoring Template

This module needs the following 7 files to be created following the pattern established in `exchange_rates/`:

## Files to Create

### 1. constants.ts
Extract from root supporting/constants.ts:
- INQUIRY_SOURCE_DEFAULTS
- Module-specific permissions
- Create INQUIRY_SOURCES_VALUES

### 2. types.ts
Define operation interfaces:
- InquirySource (Doc<'yourobcInquirySources'>)
- InquirySourceId
- CreateInquirySourceData
- UpdateInquirySourceData
- InquirySourceListResponse
- InquirySourceFilters

### 3. utils.ts
Extract from root supporting/utils.ts:
- validateInquirySource → validateInquirySourceData
- generateInquirySourceCode
- trimInquirySourceData (with generic typing)

### 4. permissions.ts
Create access control functions:
- canViewInquirySource(s)
- canEditInquirySource(s)
- canDeleteInquirySource(s)
- filterInquirySourcesByAccess

### 5. queries.ts
Extract from root supporting/queries.ts:
- getInquirySources (with cursor pagination)
- getInquirySource
- getInquirySourceByName (if applicable)
- listActiveSources

### 6. mutations.ts
Extract from root supporting/mutations.ts:
- createInquirySource
- updateInquirySource
- deleteInquirySource

### 7. index.ts
Barrel exports following exchange_rates/index.ts pattern

## Key Changes from Original Code

1. **Pagination**: Convert offset-based to cursor-based in getInquirySources
2. **Table Name**: Change from `yourobcInquirySources` to `yourobcInquirySources` (already correct)
3. **Index Names**: Update `by_created` → `by_created_at` in queries
4. **Validation**: Extract validateInquirySource and convert to validateInquirySourceData with generic trim function
5. **Trim Pattern**: Add trimInquirySourceData with proper generic typing (no `any` types)
6. **Audit Logs**: Use entityType: 'yourobcInquirySources'

## Schema Layer Already Created
- `/convex/schema/yourobc/supporting/inquiry_sources/` is complete with all 5 files
