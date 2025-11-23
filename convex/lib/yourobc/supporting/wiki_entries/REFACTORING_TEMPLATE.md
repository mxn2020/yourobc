# Wiki Entries Lib Module - Refactoring Template

This module needs the following 7 files to be created following the pattern established in `exchange_rates/`:

## Files to Create

### 1. constants.ts
Extract from root supporting/constants.ts:
- WIKI_DEFAULTS
- WIKI_LIMITS
- Module-specific permissions
- Create WIKI_ENTRIES_VALUES

### 2. types.ts
Define operation interfaces:
- WikiEntry (Doc<'yourobcWikiEntries'>)
- WikiEntryId
- CreateWikiEntryData
- UpdateWikiEntryData
- WikiEntryListResponse
- WikiEntryFilters

### 3. utils.ts
Extract and refactor from root supporting/utils.ts:
- validateWikiEntry → validateWikiEntryData
- generateWikiSlug (convert to kebab-case slug generation)
- extractWikiSearchTerms → buildSearchableText
- trimWikiEntryData (with generic typing)

### 4. permissions.ts
Create access control functions:
- canViewWikiEntry(s) - based on isPublic + ownership
- canEditWikiEntry(s)
- canPublishWikiEntry(s) - separate from edit
- canDeleteWikiEntry(s)
- filterWikiEntriesByAccess

### 5. queries.ts
Extract from root supporting/queries.ts:
- getWikiEntries (with cursor pagination)
- getWikiEntry
- getWikiEntryBySlug
- searchWikiEntries (implement simple text search)
- listPublicWikiEntries

### 6. mutations.ts
Extract from root supporting/mutations.ts:
- createWikiEntry
- updateWikiEntry
- incrementViewCount (on read access)
- deleteWikiEntry
- publishWikiEntry (change status: draft → published)

### 7. index.ts
Barrel exports following exchange_rates/index.ts pattern

## Key Changes from Original Code

1. **Pagination**: Convert offset-based to cursor-based in getWikiEntries
2. **Table Name**: Already `yourobcWikiEntries` in schema
3. **Index Names**: Update `by_created` → `by_created_at`, add `by_owner_and_status` compound index
4. **Slug Generation**: Implement URL-safe slug generation in constants/utils
5. **Searchable Text**: Add buildSearchableText for title + content + tags
6. **Validation**: Validate title length, slug uniqueness (at app level)
7. **Trim Pattern**: Add trimWikiEntryData with proper generic typing
8. **View Tracking**: Implement incrementViewCount mutation
9. **Publish**: Separate publishWikiEntry mutation from update
10. **Audit Logs**: Use entityType: 'yourobcWikiEntries'

## Schema Layer Already Created
- `/convex/schema/yourobc/supporting/wiki_entries/` is complete with all 5 files
- Note: No searchIndex defined yet - add if search functionality needed

## Additional Considerations

### Search Implementation Options:
1. **Simple**: In-memory filtering of title + tags (current approach in queries)
2. **Full-text**: Add searchIndex to schema, implement searchWikiEntries query
3. **Hybrid**: Use compound indexes + in-memory filtering (recommended)

### Category/Tag Management:
- Currently uses classificationFields (category field)
- Ensure CREATE and UPDATE operations handle category properly
- May want separate tags array for better search
