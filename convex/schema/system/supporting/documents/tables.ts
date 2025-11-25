// convex/schema/system/supporting/documents/tables.ts
// Table definitions for documents

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { documentsValidators, documentsFields } from './validators';

export const documentsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Entity relationship
  entityType: v.string(),
  entityId: v.string(),

  // Document details
  type: documentsValidators.documentType,
  status: documentsValidators.documentStatus,

  // File information
  fileUrl: v.string(),
  fileName: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),

  // Metadata
  description: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  version: v.optional(v.number()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt']);
