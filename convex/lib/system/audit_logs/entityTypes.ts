// convex/lib/system/audit_logs/entityTypes.ts
// Entity type validators - Auto-generated from configuration
//
// TO CUSTOMIZE ENTITY TYPES:
// - DO NOT modify this file
// - Instead, edit: convex/config/app/entities.config.ts
// - Add your app/addon entities there
//
// This file automatically generates Convex validators from your configuration

import { v } from 'convex/values';
import {
  SYSTEM_ENTITY_TYPES,
  SYSTEM_ENTITY_TYPES,
  ALL_APP_ENTITY_TYPES,
  COMMENTABLE_ENTITY_TYPES,
  DOCUMENTABLE_ENTITY_TYPES,
  NOTIFIABLE_ENTITY_TYPES,
  ALL_ENTITY_TYPES,
} from '../../../config';

/**
 * Helper function to create v.union from array of entity types
 */
function createEntityUnion(types: readonly string[]) {
  if (types.length === 0) {
    // Return a validator that never matches if array is empty
    return v.union(v.literal('__never__'));
  }
  return v.union(...types.map(type => v.literal(type)));
}

export const entityTypes = {
  // Core system entities (from system config)
  coreSystem: createEntityUnion(SYSTEM_ENTITY_TYPES),

  // System entities (from system config)
  system: createEntityUnion(SYSTEM_ENTITY_TYPES),

  // App/addon entities (from app config)
  app: createEntityUnion(ALL_APP_ENTITY_TYPES),

  // Entities that can have comments
  commentable: createEntityUnion(COMMENTABLE_ENTITY_TYPES),

  // Entities that can have documents
  documentable: createEntityUnion(DOCUMENTABLE_ENTITY_TYPES),

  // Entities that can receive notifications
  notifiable: createEntityUnion(NOTIFIABLE_ENTITY_TYPES),

  // All entities combined
  all: createEntityUnion(ALL_ENTITY_TYPES),
};
