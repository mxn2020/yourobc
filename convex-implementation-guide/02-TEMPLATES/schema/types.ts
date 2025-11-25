// convex/schema/{category}/{entity}/{module}/types.ts
// Type extractions from validators for {module} module

import { Infer } from 'convex/values';
import { {module}Validators, {module}Fields } from './validators';

/**
 * Extract TypeScript types from validators
 */
export type {Module}Status = Infer<typeof {module}Validators.status>;
export type {Module}Priority = Infer<typeof {module}Validators.priority>;
export type {Module}Visibility = Infer<typeof {module}Validators.visibility>;

/**
 * Extract TypeScript types from complex fields
 */
export type {Module}Dimensions = Infer<typeof {module}Fields.dimensions>;

// Add more type extractions as needed...

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating types.ts:
 * [ ] Import Infer from 'convex/values'
 * [ ] Import validators from ./validators
 * [ ] Extract type for each validator
 * [ ] Extract type for each complex field
 * [ ] Use PascalCase for type names
 * [ ] Keep type names descriptive
 *
 * DO:
 * [ ] Extract all validator types
 * [ ] Extract all complex field types
 * [ ] Use consistent naming ({Module}FieldName)
 * [ ] Keep this file focused on type extraction only
 *
 * DON'T:
 * [ ] Define business logic types here (use lib types.ts)
 * [ ] Duplicate type definitions
 * [ ] Import from schemas.ts
 * [ ] Define inline types
 */
