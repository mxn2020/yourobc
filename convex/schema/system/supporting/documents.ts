// convex/schema/system/supporting/documents.ts
/**
 * Documents Table Schema
 *
 * Tracks document storage and metadata with access control.
 * Manages file attachments for various entities.
 *
 * @module convex/schema/system/supporting/documents
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '@/config/entityTypes'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';

/**
 * Documents table
 * Tracks document storage and metadata with access control
 */
export const documentsTable = defineTable({
  // Core fields
  entityType: entityTypes.documentable,
  entityId: v.string(),
  documentType: supportingValidators.documentType,

  // File Information
  filename: v.string(),
  originalFilename: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  fileUrl: v.string(),

  // Metadata
  title: v.optional(v.string()),
  description: v.optional(v.string()),

  // Access Control
  isPublic: v.boolean(),
  isConfidential: v.boolean(),
  status: supportingValidators.documentStatus,
  uploadedBy: v.string(),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_documentType', ['documentType'])
  .index('by_uploadedBy', ['uploadedBy'])
  .index('by_public', ['isPublic'])
  .index('by_confidential', ['isConfidential'])
  .index('by_status', ['status'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
