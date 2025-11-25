// convex/lib/{category}/{entity}/{module}/index.ts
// Public exports for {module} module

/**
 * Barrel exports for library
 */
export { {MODULE}_CONSTANTS, {MODULE}_VALUES } from './constants';
export type * from './types';
export * from './utils';
export * from './permissions';
export * from './queries';
export * from './mutations';

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating index.ts:
 * [ ] Export constants and values
 * [ ] Export all types
 * [ ] Export all utils
 * [ ] Export all permissions
 * [ ] Export all queries
 * [ ] Export all mutations
 * [ ] Keep exports in this order
 *
 * DO:
 * [ ] Use wildcard exports (export *)
 * [ ] Export types separately (export type *)
 * [ ] Keep this file minimal
 * [ ] Export all public APIs
 *
 * DON'T:
 * [ ] Add business logic here
 * [ ] Skip any file exports
 * [ ] Mix up export order
 */
