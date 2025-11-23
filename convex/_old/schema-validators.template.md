// convex/schema/[category]/[entity]/[module]/validators.ts

/**
 * ============================================================================
 * VALIDATORS TEMPLATE
 * ============================================================================
 *
 * This file defines reusable validators for your module's union types and enums.
 * Validators are the SINGLE SOURCE OF TRUTH for all union types used in:
 * - Schema table definitions
 * - Mutation/query arguments
 * - TypeScript type definitions
 *
 * LOCATION: convex/schema/[category]/[entity]/[module]/validators.ts
 * REQUIRED: Every module MUST have a validators.ts file
 *
 * ============================================================================
 * WHY VALIDATORS MATTER
 * ============================================================================
 *
 * WITHOUT validators (❌ Bad):
 * 
 * // In schema:
 * status: v.union(v.literal('draft'), v.literal('active'))
 * 
 * // In mutations:
 * status: v.union(v.literal('draft'), v.literal('active'))  // Duplicate!
 * 
 * // In queries:
 * status: v.union(v.literal('draft'), v.literal('active'))  // Duplicate!
 * 
 * // TypeScript:
 * type Status = 'draft' | 'active'  // Another duplicate!
 * 
 * Problems:
 * - 4 places to update when adding a new status
 * - Easy to have inconsistencies
 * - String typos not caught until runtime
 * - No central documentation
 *
 * WITH validators (✅ Good):
 * 
 * // In validators.ts (single source):
 * export const moduleValidators = {
 *   status: v.union(v.literal('draft'), v.literal('active'))
 * }
 * 
 * // Everywhere else just imports:
 * import { moduleValidators } from './validators'
 * status: moduleValidators.status  // Always consistent!
 * 
 * Benefits:
 * - Update in ONE place
 * - Type-safe everywhere
 * - No typos possible
 * - Self-documenting
 * - Better IDE autocomplete
 *
 * ============================================================================
 * CRITICAL RULES
 * ============================================================================
 *
 * 1. NO SCHEMA IMPORTS
 *    ❌ NEVER import from schemas.ts in this file
 *    ❌ This causes circular dependency errors
 *    ✅ Only import from 'convex/values'
 *
 * 2. GROUPED OBJECT PATTERN
 *    ✅ Export validators as a single grouped object
 *    ✅ Use consistent naming: {module}Validators
 *    
 *    Example:
 *    export const expenseValidators = { ... }
 *    export const invoiceValidators = { ... }
 *
 * 3. USE IN SCHEMAS
 *    ✅ Import validators in your {module}.ts schema file
 *    ✅ Use validators for all union types
 *    
 *    Example:
 *    import { expenseValidators } from './validators'
 *    status: expenseValidators.status
 *
 * 4. USE IN LIBRARY FILES
 *    ✅ Import validators in mutations/queries
 *    ✅ Use for type-safe arguments
 *    
 *    Example:
 *    import { expenseValidators } from '@/schema/.../validators'
 *    args: { status: v.optional(expenseValidators.status) }
 *
 * ============================================================================
 * VALIDATOR NAMING PATTERNS
 * ============================================================================
 *
 * Choose descriptive names that indicate the domain:
 *
 * STATUS VALIDATORS:
 * - status: General entity lifecycle states
 * - approvalStatus: Approval workflow states
 * - paymentStatus: Payment-specific states
 * - publishStatus: Publishing workflow states
 *
 * CLASSIFICATION VALIDATORS:
 * - category: General categorization
 * - type: Entity type classification
 * - priority: Urgency/importance levels
 * - visibility: Access/sharing settings
 *
 * DOMAIN-SPECIFIC VALIDATORS:
 * - paymentMethod: How payment was made
 * - difficulty: Skill/complexity level
 * - frequency: Recurring interval
 * - role: User role/permission level
 *
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 *
 * 1. IN SCHEMA DEFINITIONS:
 * 
 * // convex/schema/addons/business/expenses/expenses.ts
 * import { expenseValidators } from './validators'
 * 
 * export const addonBusinessExpenseTable = defineTable({
 *   title: v.string(),
 *   status: expenseValidators.status,           // ✅ Type-safe
 *   visibility: expenseValidators.visibility,   // ✅ Type-safe
 *   paymentMethod: expenseValidators.paymentMethod, // ✅ Type-safe
 * })
 *
 * 2. IN MUTATIONS:
 * 
 * // convex/lib/addons/business/expenses/mutations.ts
 * import { expenseValidators } from '@/schema/addons/business/expenses/validators'
 * 
 * export const createExpense = mutation({
 *   args: {
 *     data: v.object({
 *       title: v.string(),
 *       status: v.optional(expenseValidators.status),         // ✅ Type-safe
 *       visibility: v.optional(expenseValidators.visibility), // ✅ Type-safe
 *     }),
 *   },
 *   handler: async (ctx, { data }) => {
 *     // data.status is correctly typed!
 *   },
 * })
 *
 * 3. IN QUERIES:
 * 
 * // convex/lib/addons/business/expenses/queries.ts
 * import { expenseValidators } from '@/schema/addons/business/expenses/validators'
 * 
 * export const getExpenses = query({
 *   args: {
 *     filters: v.optional(v.object({
 *       status: v.optional(v.array(expenseValidators.status)),     // ✅ Array of valid statuses
 *       visibility: v.optional(expenseValidators.visibility),      // ✅ Single visibility
 *     })),
 *   },
 *   handler: async (ctx, { filters }) => {
 *     // Filters are type-safe!
 *   },
 * })
 *
 * ============================================================================
 * TYPESCRIPT TYPES FROM VALIDATORS
 * ============================================================================
 *
 * Extract TypeScript types in types.ts (not here):
 *
 * // types.ts
 * import { type Infer } from 'convex/values'
 * import { expenseValidators } from './validators'
 * 
 * export type ExpenseStatus = Infer<typeof expenseValidators.status>
 * export type ExpenseVisibility = Infer<typeof expenseValidators.visibility>
 *
 * ============================================================================
 * COMMON VALIDATOR PATTERNS
 * ============================================================================
 *
 * BASIC STATUS:
 * status: v.union(
 *   v.literal('draft'),
 *   v.literal('active'),
 *   v.literal('archived')
 * )
 *
 * WORKFLOW STATUS:
 * approvalStatus: v.union(
 *   v.literal('pending'),
 *   v.literal('approved'),
 *   v.literal('rejected'),
 *   v.literal('cancelled')
 * )
 *
 * VISIBILITY:
 * visibility: v.union(
 *   v.literal('private'),
 *   v.literal('team'),
 *   v.literal('public')
 * )
 *
 * PRIORITY:
 * priority: v.union(
 *   v.literal('low'),
 *   v.literal('medium'),
 *   v.literal('high'),
 *   v.literal('urgent')
 * )
 *
 * PAYMENT METHOD:
 * paymentMethod: v.union(
 *   v.literal('cash'),
 *   v.literal('credit_card'),
 *   v.literal('bank_transfer'),
 *   v.literal('digital_wallet')
 * )
 *
 * ============================================================================
 */

import { v } from 'convex/values'

// NO IMPORTS FROM SCHEMAS - This prevents circular dependencies!

// ============================================================================
// [Module] Validators
// ============================================================================

/**
 * Validators for [module] entity
 * 
 * Define all union type validators used in:
 * - Schema table definitions
 * - Mutation/query arguments
 * - TypeScript type definitions
 */
export const [module]Validators = {
  /**
   * Entity lifecycle status
   * Used to track the current state of the entity
   */
  status: v.union(
    v.literal('draft'),
    v.literal('active'),
    v.literal('archived')
  ),

  /**
   * Visibility/sharing settings
   * Determines who can view the entity
   */
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  /**
   * Priority level
   * Indicates urgency or importance
   */
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  // Add more validators as needed for your module...
}

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================

/**
 * When creating a new module:
 * 
 * [ ] 1. Create validators.ts file
 * [ ] 2. Define all union type validators
 * [ ] 3. Import validators in {module}.ts schema
 * [ ] 4. Use validators in table definitions
 * [ ] 5. Import validators in mutations.ts
 * [ ] 6. Use validators in mutation args
 * [ ] 7. Import validators in queries.ts
 * [ ] 8. Use validators in query filters
 * [ ] 9. Extract TypeScript types in types.ts
 * [ ] 10. Test type safety in IDE
 * 
 * Common mistakes to avoid:
 * [ ] DON'T import schemas.ts in validators.ts
 * [ ] DON'T define inline unions in schemas
 * [ ] DON'T duplicate validator definitions
 * [ ] DON'T use string literals where validators exist
 */
 