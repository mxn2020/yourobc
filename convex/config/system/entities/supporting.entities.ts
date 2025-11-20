// convex/config/boilerplate/entities/supporting.entities.ts
// ⚠️ BOILERPLATE FILE - DO NOT MODIFY IN YOUR APPS

/**
 * Supporting feature entity types
 * These entities support auxiliary features like comments, documents, reminders, and wiki
 */
export const SUPPORTING_ENTITY_TYPES = [
  'boilerplate_comment',
  'boilerplate_document',
  'boilerplate_reminder',
  'boilerplate_wiki_entry',
] as const;

export type SupportingEntityType = typeof SUPPORTING_ENTITY_TYPES[number];
