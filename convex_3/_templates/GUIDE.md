# Convex Backend Implementation Guide

> Complete reference for implementing Convex modules with the standardized template system.

## Overview

This guide covers the complete process of implementing Convex backend modules following our standardized patterns. The system uses:

- TanStack Start backend template
- ConvexDB storage + `userProfiles`
- Better Auth + Neon for authentication
- BetterAuth user → Convex `userProfiles` sync on login
- `ctx.auth` contains BetterAuth JWT

## Document Structure

Follow these documents in order for new module implementation:

1. **[Planning](./01-planning.md)** - Module structure, naming conventions, categories
2. **[Schema Implementation](./02-schema-implementation.md)** - Phase 1: Define data structure
3. **[Library Implementation](./03-library-implementation.md)** - Phase 2: Business logic
4. **[Consistency Review](./04-consistency-review.md)** - Phase 3: Quality assurance
5. **[Advanced Patterns](./05-advanced-patterns.md)** - SearchIndex, metadata, bulk operations

## Quick Links

- **New module?** Start with [Planning](./01-planning.md)
- **Schema questions?** See [Schema Implementation](./02-schema-implementation.md)
- **Query patterns?** See [Library Implementation](./03-library-implementation.md#queries)
- **Troubleshooting?** Each doc has its own troubleshooting section
- **Quick reference?** Each doc has reference tables at the end

## Implementation Phases

```md
Phase 1: Schema (02-schema-implementation.md)
├── Define validators
├── Create table definitions
├── Extract types
├── Export schemas
└── Register in schema.ts

Phase 2: Library (03-library-implementation.md)
├── Define constants
├── Create type interfaces
├── Implement validation
├── Create permissions
├── Implement queries
├── Implement mutations
└── Configure exports

Phase 3: Review (04-consistency-review.md)
├── Run consistency checks
├── Verify security patterns
└── Test all operations
```

## Key Principles

- **Schema First**: Always define schema before library
- **Soft Delete**: Never hard delete, always soft delete
- **Audit Everything**: Every mutation logs to auditLogs
- **Trim Then Validate**: Always trim strings before validation
- **Permission Checks**: Auth → Permission → Access pattern
- **Cursor Pagination**: Default for all list queries
- **Type Safety**: No `any` types, use proper TypeScript

## Support

- **Examples**: See existing modules in `convex/lib/software/freelancer_dashboard/`
- **Shared helpers**: Check `convex/shared/` for reusable utilities
- **Questions**: Review troubleshooting sections in each document
