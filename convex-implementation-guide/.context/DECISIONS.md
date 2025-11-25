# Architecture Decisions Log

## Format
```
## Decision: [Title]
**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated
**Context**: Why we're considering this
**Decision**: What we decided
**Consequences**: What this means
```

---

## Decision: Use Soft Delete Pattern
**Date**: 2024-01-01
**Status**: Accepted

**Context**: Need to handle deleted records while maintaining data integrity and audit trail.

**Decision**: All deletions will be soft deletes using `deletedAt` and `deletedBy` fields. Never use `ctx.db.delete()`.

**Consequences**:
- Deleted items remain in database
- Queries must filter out deleted items using `.filter(notDeleted)`
- Search indexes must use `.eq('deletedAt', undefined)` in builder
- Can restore deleted items if needed
- Audit trail is preserved

---

## Decision: Cursor-Based Pagination
**Date**: 2024-01-01
**Status**: Accepted

**Context**: Need efficient pagination for large datasets.

**Decision**: All list queries will use cursor-based pagination with default limit of 50 items.

**Consequences**:
- Better performance than offset pagination
- Consistent results even when data changes
- Requires cursor tracking in frontend
- Use `cursor ?? null` pattern in queries

---

## Decision: Schema-First Development
**Date**: 2024-01-01
**Status**: Accepted

**Context**: Need clear structure for module development.

**Decision**: Always implement schema (Phase 1) before library (Phase 2).

**Consequences**:
- Type safety flows from schema to library
- Validators can be reused
- Clear separation of concerns
- Database structure is well-defined before business logic

---

_Add your own decisions below_
