// convex/schema/system/supporting/documents/documents.ts
// Table definitions for documents module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';
import { documentValidators } from './validators';

export const documentsTable = defineTable({
  // Required: Main display field
  title: v.optional(v.string()),
  name: v.string(), // filename serves as name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  status: documentValidators.status,

  // Document-specific fields
  entityType: entityTypes.documentable,
  entityId: v.string(),
  documentType: documentValidators.type,

  // File Information
  filename: v.string(),
  originalFilename: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  fileUrl: v.string(),

  // Metadata
  description: v.optional(v.string()),

  // Access Control
  isPublic: v.boolean(),
  isConfidential: v.boolean(),
  uploadedBy: v.id('userProfiles'),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_document_type', ['documentType'])
  .index('by_uploaded_by', ['uploadedBy'])
  .index('by_public', ['isPublic'])
  .index('by_confidential', ['isConfidential'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);
