// convex/schema/{category}/{entity}/{module}/index.ts
// Public schema exports for {module} module

/**
 * Barrel exports for schema
 */
export * from './validators';
export * from './types';
export * from './schemas';

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating index.ts:
 * [ ] Export all from validators.ts
 * [ ] Export all from types.ts
 * [ ] Export all from schemas.ts
 * [ ] Keep exports in this order
 *
 * DO:
 * [ ] Use wildcard exports (export *)
 * [ ] Keep this file minimal
 * [ ] Export all public APIs
 *
 * DON'T:
 * [ ] Add business logic here
 * [ ] Skip any file exports
 * [ ] Use selective exports unless needed
 */
