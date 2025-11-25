// src/lib/validation/entity-types.ts
// Zod validators derived from convex/types.ts (single source of truth)

import { z } from 'zod'
import { ALL_ENTITY_TYPES } from '@/convex/config'

/**
 * Zod schema for entity type validation
 * Automatically derived from ALL_ENTITY_TYPES constant
 */
export const entityTypeSchema = z.enum(ALL_ENTITY_TYPES)

/**
 * Optional entity type schema for query params
 */
export const entityTypeOptionalSchema = entityTypeSchema.optional()
