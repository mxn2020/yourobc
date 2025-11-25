// convex/schema/{category}/{entity}/{module}/validators.ts
// Grouped validators and complex fields for {module} module

import { v } from 'convex/values';
import { baseValidators, baseFields } from '@/schema/base.validators';

/**
 * Validators for {module} module
 * Single source of truth for all union types and complex fields
 */
export const {module}Validators = {
  /**
   * Entity lifecycle status
   */
  status: v.union(
    v.literal('draft'),
    v.literal('active'),
    v.literal('archived')
  ),

  /**
   * Priority level
   */
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  /**
   * Visibility/sharing settings
   */
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  // Reuse from base validators
  serviceType: baseValidators.serviceType,
  currency: baseValidators.currency,

  // Add more validators as needed...
} as const;

/**
 * Complex field definitions for {module} module
 */
export const {module}Fields = {
  /**
   * Example: Dimensions object
   */
  dimensions: v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
    unit: v.union(v.literal('cm'), v.literal('in')),
  }),

  // Reuse from base fields
  address: baseFields.address,
  contact: baseFields.contact,
  currencyAmount: baseFields.currencyAmount,

  // Add more complex fields as needed...
} as const;

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating validators.ts:
 * [ ] Import v from 'convex/values'
 * [ ] Import base validators if needed
 * [ ] Define {module}Validators object
 * [ ] Define {module}Fields object
 * [ ] Export both with 'as const'
 * [ ] Use validators in {module}.ts schema
 * [ ] Use validators in mutations args
 * [ ] Use validators in queries filters
 *
 * DO:
 * [ ] Keep all union types here
 * [ ] Reuse base validators when possible
 * [ ] Use descriptive validator names
 * [ ] Document each validator's purpose
 *
 * DON'T:
 * [ ] Import from schemas.ts (circular dependency)
 * [ ] Define inline unions in multiple places
 * [ ] Duplicate validator definitions
 * [ ] Use string literals without validators
 */
