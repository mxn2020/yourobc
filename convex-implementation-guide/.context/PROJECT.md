# Project Context

## What We're Building
Convex module implementation guide - structured templates for building database-backed features.

## Current Stack
- **Backend**: Convex (serverless database + backend)
- **Language**: TypeScript
- **Patterns**: Schema-first, permission-based, soft-delete

## Module Structure
```
schema/{category}/{entity}/{module}/    # Database definitions
lib/{category}/{entity}/{module}/       # Business logic
```

## Core Principles
1. Schema defines structure → Library implements logic
2. Every mutation: auth → validate → execute → audit
3. Soft delete only (never hard delete)
4. Permission checks at query/mutation level

## Current Task
See ACTIVE-TASK.md

## Architecture Decisions
See DECISIONS.md
