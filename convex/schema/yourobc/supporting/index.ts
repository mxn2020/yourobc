// convex/schema/yourobc/supporting/index.ts
// Public API exports for supporting schema module
// Includes per-module schemas (all 8 modules refactored)

// ============================================================================
// Per-Module Exports (Refactored)
// ============================================================================

// Priority modules (Phase 1)
export * from './exchange_rates';
export * from './inquiry_sources';
export * from './wiki_entries';

// Remaining modules (Phase 2)
export * from './comments';
export * from './counters';
export * from './documents';
export * from './followup_reminders';
export * from './notifications';

// ============================================================================
// Root Supporting Exports
// ============================================================================

export { yourobcSupportingSchemas } from './schemas';
export * from './types';
export { supportingValidators, supportingFields } from './validators';
