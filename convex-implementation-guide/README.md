# Convex Module Implementation Guide

> Complete reference for implementing Convex modules with standardized patterns.

## Quick Start (For AI)

1. **Read context**: `.context/PROJECT.md`
2. **Check active task**: `.context/ACTIVE-TASK.md`
3. **Read core docs** (in order):
   - `01-CORE/01-planning.md`
   - `01-CORE/02-schema.md`
   - `01-CORE/03-library.md`
4. **Reference examples**: `03-EXAMPLES/` (when available)
5. **Check reference**: `04-REFERENCE/` for advanced topics

## Quick Start (For Humans)

### First Time Setup
1. Read `00-QUICK-START/quick-start.md`
2. Fill out `00-QUICK-START/placeholder-reference.md`
3. Start with Phase 1 (Schema)

### New Module
```bash
# 1. Update context
# Edit .context/ACTIVE-TASK.md with your module details

# 2. Tell AI to implement
"Read .context/ACTIVE-TASK.md and implement the schema phase using the guides in 01-CORE/"

# 3. AI implements and updates ACTIVE-TASK.md automatically
```

## Document Map

### 🚀 Quick Start
- **`00-QUICK-START/`** - Get started in 5 minutes
  - `quick-start.md` - TL;DR guide
  - `checklist.md` - Pre-flight checklist
  - `placeholder-reference.md` - Quick lookup table

### 📚 Core Implementation (Read in Order)
- **`01-CORE/`** - Essential guides for implementation
  - `01-planning.md` - Module planning & structure
  - `02-schema.md` - Schema implementation (Phase 1)
  - `03-library.md` - Library implementation (Phase 2)
  - `naming-conventions.md` - All naming rules

### 📖 Reference (Optional Deep Dives)
- **`04-REFERENCE/`** - Advanced topics and quality checks
  - `consistency-review.md` - Quality assurance
  - `advanced-patterns.md` - Advanced features
  - `troubleshooting.md` - Common issues & fixes
  - `migration-guide.md` - Updating existing modules

### 🎯 Context (AI Session Management)
- **`.context/`** - Project context files
  - `PROJECT.md` - Project overview (AI reads first)
  - `ACTIVE-TASK.md` - Current implementation task
  - `DECISIONS.md` - Architecture decisions log

## Overview

This guide covers the complete process of implementing Convex backend modules following standardized patterns:

- **TanStack Start** backend template
- **ConvexDB** storage + `userProfiles`
- **Better Auth + Neon** for authentication
- **BetterAuth** user → Convex `userProfiles` sync on login
- `ctx.auth` contains BetterAuth JWT

## Implementation Phases

```
Phase 1: Schema (01-CORE/02-schema.md)
├── Define validators
├── Create table definitions
├── Extract types
├── Export schemas
└── Register in schema.ts

Phase 2: Library (01-CORE/03-library.md)
├── Define constants
├── Create type interfaces
├── Implement validation
├── Create permissions
├── Implement queries
├── Implement mutations
└── Configure exports

Phase 3: Review (04-REFERENCE/consistency-review.md)
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

## File Size Guidelines

AI coding assistants work with limited context windows, so files are focused and concise:

- Core docs: ~1000-2000 lines each
- Reference docs: As needed for completeness
- Examples: Complete but minimal

## AI Workflow

The guides include patterns crafted specifically for AI coding assistants:

```
Phase 1: PLANNING
→ AI reads: 01-CORE/01-planning.md
→ Updates: .context/ACTIVE-TASK.md with placeholder values
→ Creates: Directory structure

Phase 2: SCHEMA
→ AI reads: 01-CORE/02-schema.md
→ Implements: Schema files with placeholders replaced
→ References: 03-EXAMPLES/ if stuck (when available)
→ Updates: ACTIVE-TASK.md progress

Phase 3: LIBRARY
→ AI reads: 01-CORE/03-library.md
→ Implements: Library files with placeholders replaced
→ References: 03-EXAMPLES/ if stuck (when available)
→ Updates: ACTIVE-TASK.md progress

Phase 4: REVIEW (Optional)
→ AI reads: 04-REFERENCE/consistency-review.md
→ Runs: Automated checks
→ Reports: Issues found
```

## Structure Benefits

1. **Context First**: `.context/` files give AI instant orientation
2. **Incremental Complexity**: Quick Start → Core → Reference
3. **Clear Boundaries**: Breaking tasks into phases yields better results
4. **Self-Maintaining**: AI updates ACTIVE-TASK.md automatically
5. **Reference Ready**: Quick access to common patterns

## Getting Started

### For a New Module

1. Read [Quick Start Guide](00-QUICK-START/quick-start.md)
2. Follow [Planning Guide](01-CORE/01-planning.md)
3. Implement [Schema](01-CORE/02-schema.md) (Phase 1)
4. Implement [Library](01-CORE/03-library.md) (Phase 2)
5. Run [Consistency Review](04-REFERENCE/consistency-review.md)

### For Existing Modules

1. Review [Consistency Review](04-REFERENCE/consistency-review.md)
2. Check [Migration Guide](04-REFERENCE/migration-guide.md)
3. Update to current patterns
4. Test thoroughly

## Support

- **Troubleshooting**: See [Troubleshooting Guide](04-REFERENCE/troubleshooting.md)
- **Examples**: Real working code (when available in `03-EXAMPLES/`)
- **Shared helpers**: Check `convex/shared/` for reusable utilities

---

**Ready to start?** → [Quick Start Guide](00-QUICK-START/quick-start.md)
