// convex/lib/boilerplate/[module_name]/types.ts

/**
 * ⚠️ CRITICAL: Every entity MUST have a main display field! ⚠️
 *
 * Choose ONE based on entity type: name (users/products), title (projects/tasks), or displayName (ambiguous cases).
 * Required for AuditLog, UI display, and search functionality.
 */

import type { Doc, Id } from '@/generated/dataModel';
import { Infer } from 'convex/values';
// Import grouped validators from validators.ts for mutation args
import { {module}Validators } from '@/schema/[addon]/{category}/validators';
// Import table validators from types.ts for Infer type generation
import { statusTypes } from '@/schema/base';

// ============================================================================
// Base Types from Convex Schema
// ============================================================================

export type [Entity] = Doc<'[tableName]'>;
export type [Entity]Id = Id<'[tableName]'>;

// ============================================================================
// Enum Types from Validators (Using Infer)
// ============================================================================

/**
 * Use Infer to extract TypeScript types from validators.
 * This ensures type safety between schema validators and TypeScript types.
 */

export type [Entity]Status = Infer<typeof {module}Validators.status>;
// Result: 'draft' | 'active' | 'completed' | 'archived' (or whatever your validator defines)

export type [Entity]Visibility = Infer<typeof {module}Validators.visibility>;
// Result: 'private' | 'team' | 'public'

export type [Entity]Priority = Infer<typeof statusTypes.priority>;
// Result: 'low' | 'medium' | 'high' | 'urgent'

// Add more enum types as needed from your validators
// export type [Entity]Category = Infer<typeof {module}Validators.category>;
// export type [Entity]Mode = Infer<typeof {module}Validators.mode>;

// ============================================================================
// Form Data Types
// ============================================================================

/**
 * MAIN DISPLAY FIELD REQUIREMENT
 *
 * Every entity needs ONE main display field:
 * - name: for users, products, organizations
 * - title: for projects, tasks, invoices, posts
 * - displayName: when "name" is ambiguous
 *
 * Required in Create[Entity]Data, optional in Update[Entity]Data.
 * Used for AuditLog tracking, UI display, and search.
 */

export interface Create[Entity]Data {
  name: string;  // Main display field (name/title/displayName)
  description?: string;

  // Use Infer types from validators for type safety
  status?: [Entity]Status;
  priority?: [Entity]Priority;
  visibility?: [Entity]Visibility;

  tags?: string[];
  category?: string;
  startDate?: number;
  dueDate?: number;
  settings?: Partial<[Entity]['settings']>;
  extendedMetadata?: [Entity]['extendedMetadata'];
  // Add your entity-specific fields here
}

export interface Update[Entity]Data {
  name?: string;  // Main display field (name/title/displayName)
  description?: string;

  // Use Infer types from validators for type safety
  status?: [Entity]Status;
  priority?: [Entity]Priority;
  visibility?: [Entity]Visibility;

  tags?: string[];
  category?: string;
  startDate?: number;
  dueDate?: number;
  settings?: Partial<[Entity]['settings']>;
  extendedMetadata?: [Entity]['extendedMetadata'];
  // Add your entity-specific fields here
}

// ============================================================================
// Extended Types with Computed Fields
// ============================================================================

export interface [Entity]WithDetails extends [Entity] {
  // Add computed fields as needed
  isOverdue?: boolean;
  memberDetails?: Array<{
    userId: Id<'userProfiles'>;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }>;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

export interface [Entity]Filters {
  // Use Infer types for type-safe filter arrays
  status?: [Entity]Status[];
  priority?: [Entity]Priority[];
  visibility?: [Entity]Visibility[];

  category?: string;
  ownerId?: string;
  collaboratorId?: string;
  tags?: string[];
  dueDateBefore?: number;
  dueDateAfter?: number;
}

export interface [Entity]sListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  filters?: [Entity]Filters;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface [Entity]Stats {
  total[Entity]s: number;
  active[Entity]s: number;
  completed[Entity]s: number;
  archived[Entity]s?: number;
  onHold[Entity]s?: number;
  overdue[Entity]s?: number;
  atRisk[Entity]s?: number;
  averageProgress?: number;
  {entity}sByStatus: {
    active: number;
    completed: number;
    archived: number;
    on_hold: number;
  };
  {entity}sByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  {entity}sByCategory: Record<string, number>;
}

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * USAGE NOTES
 *
 * Validator Imports:
 * - Import grouped validators from validators.ts for mutation args
 * - Import table validators from types.ts for Infer type generation
 *
 * Type Extraction with Infer:
 * - Use Infer to extract types from validators (single source of truth)
 * - Example: export type [Entity]Status = Infer<typeof {module}Validators.status>
 * - Ensures type safety across schema, mutations, queries, and types
 *
 * Main Display Field:
 * - Required in Create[Entity]Data, optional in Update[Entity]Data
 * - Choose name (users/products), title (projects/tasks), or displayName (ambiguous cases)
 * - Essential for AuditLog, UI display, and search functionality
 */
