// convex/schema/addons/[addon_name]/base.ts

import { v } from 'convex/values'

// ============================================================================
// Required Table Fields (Use in Every Table)
// ============================================================================

/**
 * CRITICAL: Every table MUST include one of these main display fields:
 * - name: v.string()         // For entities like users, products, categories, organizations
 * - title: v.string()        // For entities like posts, projects, tasks, invoices, proposals
 * - displayName: v.string()  // For entities where "name" might be ambiguous
 *
 * WHY REQUIRED:
 * - AuditLogs use this field to display entity information (entityTitle)
 * - UI components use this for displaying entity names
 * - Search and filtering often use this field
 * - Provides consistent reference across the application
 *
 * INDEXING (REQUIRED):
 * - ALWAYS add an index for the display field to enable efficient queries
 * - .index('by_name', ['name'])
 * - .index('by_title', ['title'])
 * - .index('by_displayName', ['displayName'])
 *
 * CHOOSING THE RIGHT FIELD NAME:
 * - Use 'name' for: users, products, categories, organizations, teams, roles
 * - Use 'title' for: posts, projects, tasks, invoices, proposals, documents, articles
 * - Use 'displayName' for: entities where "name" has special meaning (e.g., username vs display name)
 */

// ============================================================================
// Status Validators (Single Source of Truth)
// ============================================================================

export const statusValidator = v.union(
  v.literal('draft'),
  v.literal('active'),
  v.literal('archived')
)

export const difficultyValidator = v.union(
  v.literal('beginner'),
  v.literal('intermediate'),
  v.literal('advanced')
)

export const visibilityValidator = v.union(
  v.literal('public'),
  v.literal('private'),
  v.literal('shared'),
  v.literal('organization')
)

export const priorityValidator = v.union(
  v.literal('low'),
  v.literal('medium'),
  v.literal('high'),
  v.literal('critical')
)

// ============================================================================
// TypeScript Types (Exported from validators)
// ============================================================================

export type Status = 'draft' | 'active' | 'archived'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Visibility = 'public' | 'private' | 'shared' | 'organization'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

// ============================================================================
// Audit Fields (Reusable)
// ============================================================================

export const auditFields = {
  createdBy: v.string(), // authUserId
  createdAt: v.number(),
  updatedBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
}

export const softDeleteFields = {
  deletedAt: v.optional(v.number()),
  deletedBy: v.optional(v.string()),
}

// ============================================================================
// Reusable Schemas
// ============================================================================

export const metadataSchema = {
  tags: v.array(v.string()),
  category: v.optional(v.string()),
  customFields: v.optional(v.object({})),
}

// Position Schema (for visual editors)
export const positionSchema = v.object({
  x: v.number(),
  y: v.number(),
})

// Connection Schema (for graph/workflow structures)
export const connectionSchema = v.object({
  sourceNodeId: v.string(),
  sourceHandle: v.optional(v.string()),
  targetNodeId: v.string(),
  targetHandle: v.optional(v.string()),
  label: v.optional(v.string()),
})

// Variable Schema (for dynamic data)
export const variableSchema = v.object({
  name: v.string(),
  type: v.string(), // 'string', 'number', 'boolean', 'object', 'array'
  defaultValue: v.optional(v.any()),
  description: v.optional(v.string()),
})

// Statistics Schema (for usage tracking)
export const statsSchema = v.object({
  usageCount: v.number(),
  rating: v.optional(v.number()),
  ratingCount: v.optional(v.number()),
})

// ============================================================================
// Additional Domain-Specific Validators (Add as needed)
// ============================================================================

// Example: File type validator
export const fileTypeValidator = v.union(
  v.literal('image'),
  v.literal('document'),
  v.literal('video'),
  v.literal('audio'),
  v.literal('other')
)

// Example: Role validator
export const roleValidator = v.union(
  v.literal('viewer'),
  v.literal('editor'),
  v.literal('admin'),
  v.literal('owner')
)

// Example: Sort order validator (common across many queries)
export const sortOrderValidator = v.union(
  v.literal('asc'),
  v.literal('desc')
)

// Export corresponding types
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other'
export type Role = 'viewer' | 'editor' | 'admin' | 'owner'
export type SortOrder = 'asc' | 'desc'

// ============================================================================
// Grouped Validators Pattern (Alternative Organization)
// ============================================================================

/**
 * You can also organize validators as grouped objects.
 * This is especially useful when you have many related validators.
 *
 * Example: statusTypes object groups all status-related validators
 */

export const statusTypes = {
  project: v.union(
    v.literal('planning'),
    v.literal('active'),
    v.literal('on_hold'),
    v.literal('completed'),
    v.literal('archived')
  ),
  task: v.union(
    v.literal('todo'),
    v.literal('in_progress'),
    v.literal('review'),
    v.literal('done'),
    v.literal('cancelled')
  ),
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),
}

/**
 * Corresponding TypeScript types for grouped validators
 */
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Visibility = 'private' | 'team' | 'public'

/**
 * Usage of grouped validators:
 *
 * In schema:
 *   status: statusTypes.project,
 *   priority: statusTypes.priority,
 *
 * In mutations:
 *   import { statusTypes } from '@/schema/base'
 *   args: {
 *     status: v.optional(statusTypes.project),
 *     priority: v.optional(statusTypes.priority),
 *   }
 */

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * This file is the SINGLE SOURCE OF TRUTH for all validators and types.
 *
 * ✅ DO:
 * - Define all Convex validators here using v.union(), v.literal(), etc.
 * - Export corresponding TypeScript types
 * - Import these validators in schema table definitions
 * - Import these validators in mutations/queries args
 * - Import these types in TypeScript type definitions
 *
 * ❌ DON'T:
 * - Redefine validators in constants.ts
 * - Redefine validators in mutations.ts or queries.ts
 * - Duplicate type definitions elsewhere
 * - Use inline v.union() in multiple places
 *
 * EXAMPLES:
 *
 * In schema table (for entity-type tables):
 *   import { statusValidator, statusTypes, auditFields } from './base'
 *
 *   // Example 1: Using 'name' for a category/product entity
 *   export const categories = defineTable({
 *     name: v.string(),                     // REQUIRED: Main display field (see documentation above)
 *     description: v.optional(v.string()),
 *     status: statusValidator,
 *     ...auditFields,
 *   }).index('by_name', ['name'])          // REQUIRED: Index for main display field
 *
 *   // Example 2: Using 'title' for a project/task entity
 *   export const projects = defineTable({
 *     title: v.string(),                    // REQUIRED: Main display field (see documentation above)
 *     description: v.optional(v.string()),
 *     status: statusTypes.project,
 *     priority: statusTypes.priority,
 *     ...auditFields,
 *   }).index('by_title', ['title'])        // REQUIRED: Index for main display field
 *
 *   // Example 3: Using 'displayName' when 'name' is ambiguous
 *   export const users = defineTable({
 *     displayName: v.string(),              // REQUIRED: Main display field (see documentation above)
 *     username: v.string(),                 // Different from displayName
 *     email: v.string(),
 *     ...auditFields,
 *   })
 *     .index('by_displayName', ['displayName'])  // REQUIRED: Index for main display field
 *     .index('by_username', ['username'])
 *
 * In mutations args:
 *   import { statusValidator, statusTypes } from '@/schema/addons/[addon_name]/base'
 *   export const updateEntity = mutation({
 *     args: {
 *       data: v.object({
 *         status: v.optional(statusValidator),
 *         priority: v.optional(statusTypes.priority),
 *         visibility: v.optional(statusTypes.visibility),
 *       }),
 *     },
 *     handler: async (ctx, { data }) => {
 *       // Type-safe! No casting needed
 *       await ctx.db.patch(id, {
 *         status: data.status,           // Correct literal type
 *         priority: data.priority,       // Correct literal type
 *       })
 *     }
 *   })
 *
 * In query args:
 *   import { statusTypes, sortOrderValidator } from '@/schema/addons/[addon_name]/base'
 *   export const getEntities = query({
 *     args: {
 *       options: v.optional(v.object({
 *         sortOrder: v.optional(sortOrderValidator),
 *         filters: v.optional(v.object({
 *           status: v.optional(v.array(statusTypes.project)),
 *           priority: v.optional(statusTypes.priority),
 *         })),
 *       })),
 *     },
 *     handler: async (ctx, { options = {} }) => {
 *       // ... filtering logic with type-safe status values
 *     }
 *   })
 *
 * In TypeScript types:
 *   import type { Status, ProjectStatus, Priority } from '@/schema/addons/[addon_name]/base'
 *   export interface EntityData {
 *     status: Status                    // Simple validator type
 *     projectStatus: ProjectStatus      // Grouped validator type
 *     priority: Priority                // Grouped validator type
 *   }
 *
 * Note: For module-specific validators (not shared across addon),
 * create validators.ts in your module directory instead.
 * See schema-validators.template.md for details.
 */
