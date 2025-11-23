# System Schema & Library Audit (Convex Templates Compliance)

Scope: System schemas and libraries under `convex/` reviewed against `_templates/02-schema-implementation.md`, `_templates/03-library-implementation.md`, and `_templates/04-consistency-review.md`. Focused on required fields/indexes, avoidance of `v.any`, audit/soft-delete invariants, permission + trimming patterns, and index/name alignment.

## High-Level Risks
- Missing required core fields (`publicId`, display field, `ownerId`) and template-mandated indexes on several system tables.
- Invalid or mismatched indexes (referencing undefined fields or using deprecated names) likely to break queries and consistency checks.
- `v.any` and `Record<string, any>` usages across schemas/libraries, violating template guidance and weakening validation.
- Library modules with schema code or misaligned with template file structure (missing constants/VALUES, permissions not centralized).
- Queries using indexes that do not exist in schema and/or omitting soft-delete filters, risking runtime failures and data leakage.

## Schema Findings (system)
- `convex/schema/system/user_profiles/user_profiles/user_profiles.ts`: No `ownerId`; custom audit fields instead of shared `auditFields`/`softDeleteFields` and `createdBy` marked optional; required-field exemption not documented.
- `convex/schema/system/system_metrics/system_metrics/systemMetrics.ts`: No `ownerId`; custom audit fields with optional `createdBy`; uses nested-field indexes and lacks standard audit fields from `auditFields`.
- `convex/schema/system/analytics/analytics.ts`: `analyticsEventsTable` and `analyticsMetricsTable` lack a display field (`name/title/displayName`) and do not index it; several indexes use deprecated names (`by_created`, `by_deleted`); no required `by_public_id` display index for events/metrics.
- `convex/schema/system/dashboards/dashboards.ts`: Uses deprecated index name `by_owner` instead of template-standard `by_owner_id`.
- `convex/schema/system/email/logs.ts`, `templates.ts`, `configs.ts`: Define indexes on `lastActivityAt` which is not present in the schema; multiple `v.any` usages (templateData/providerResponse/previewData). `email/logs.ts` uses `userId` without documenting ownerId exemption.
- `convex/schema/system/permission_requests/permission_requests/permissionRequests.ts`: Custom audit fields instead of shared `auditFields`; misses standardized audit/soft-delete spread pattern.
- `convex/schema/system/user_settings/user_model_preferences/user_model_preferences.ts`: Uses `userId` in place of required `ownerId` without exemption; index named `by_display_name` instead of `by_displayName`; imports base via relative path rather than alias.
- `convex/schema/system/supporting/*.ts` (comments, notifications, documents, wikiEntries, exchangeRates, followupReminders, inquirySources, counters): Missing required display field + `publicId` + `ownerId` and their indexes; index names use deprecated forms (`by_created`, `by_deleted`); multiple `v.any` usages (e.g., replies array); no template-required `by_public_id`/display/owner indexes.
- `convex/schema/system/user_profiles/user_profiles/validators.ts` & `convex/schema/system/email/validators.ts`: Permit `v.any` in custom fields (`customFields`, `additionalSettings`) against template guidance to avoid `v.any`.

## Library Findings (system)
- `convex/lib/system/auditLogs/queries.ts` & `adminQueries.ts`: Use index `by_user` which does not exist (schema exposes `by_user_id`); queries do not filter out `deletedAt`; pagination performed after full collection; risks runtime failures and soft-delete violations.
- `convex/lib/system/dashboards/queries.ts`: Relies on deprecated index `by_owner`; collects full result set before filtering/search/pagination (performance + soft-delete risk); should use indexed, cursor-based pagination per template.
- `convex/lib/system/analytics/queries.ts`: Several queries (e.g., `getMetric`, `getAnalyticsSummary`, `getPageViews`) do not scope by `ownerId` despite schema being owner-scoped; some fetch full collections without pagination; uses deprecated indexes (`by_created`, `by_deleted`) mirroring schema issues.
- `convex/lib/system/appConfigs/types.ts`: Uses `Record<string, any>` and casts to `any`; constants lack `{MODULE}_VALUES`, and validators in schema are not derived from constants, breaking constants↔validators consistency rule.
- `convex/lib/system/appSettings/constants.ts` & related utils: Constants missing `{MODULE}_VALUES`; validators are not tied to constants; trims/validation only partially applied to inputs.
- `convex/lib/system/supporting/*.ts`: Files contain schema definitions (`defineTable`) instead of library code; missing required library structure (constants/types/utils/permissions/queries/mutations) mandated by template Phase 2, blocking reuse and permission enforcement.
- `convex/lib/system/userProfiles/*`: Permissions/queries/mutations use role checks but no module-specific constants/VALUES alignment; ensure trimming + audit logging follow template patterns (current code uses `requireAdmin`/`requireCurrentUser` without explicit module permissions).
- `convex/lib/system/email/*`: Uses `v.any` in args/types (templateData/providerResponse) and does not bind validators to constants VALUES; relies on schema indexes containing undefined `lastActivityAt` fields—risk of runtime errors if used.

## Recommended Next Steps
- Add required core fields and indexes to non-compliant schemas (display field, `publicId`, `ownerId`, `by_public_id`, display-field index, `by_owner_id`, `by_deleted_at`), or document explicit exemptions inline.
- Replace custom audit field blocks with shared `auditFields`/`softDeleteFields` to satisfy template invariants; make `createdBy` non-optional unless exemption is documented.
- Remove/replace `v.any`/`Record<string, any>` with explicit unions or typed objects; align schema validators with library constants via `{MODULE}_VALUES`.
- Fix invalid/deprecated indexes (e.g., remove `lastActivityAt` indexes or add the field, rename `by_owner` → `by_owner_id`, `by_created` → `by_created_at`, `by_deleted` → `by_deleted_at`).
- Update library queries to use existing indexes, include soft-delete filters by default, and avoid full collection before filtering/pagination; scope analytics queries by `ownerId`.
- Rebuild `convex/lib/system/supporting` as proper library modules following template structure (constants/types/utils/permissions/queries/mutations) instead of embedding schema code.
- Align audit log queries with schema indexes (`by_user_id`) and ensure audit log inserts occur for all mutations per template Phase 2.
