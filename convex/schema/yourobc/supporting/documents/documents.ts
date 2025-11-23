// convex/schema/yourobc/supporting/documents/documents.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { entityTypes } from '@/config/entityTypes';
import { auditFields, softDeleteFields } from '@/schema/base';
import { documentsValidators } from './validators';

export const documentsTable = defineTable({
  entityType: entityTypes.documentable,
  entityId: v.string(),
  documentType: documentsValidators.documentType,
  filename: v.string(),
  originalFilename: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  fileUrl: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  isPublic: v.boolean(),
  isConfidential: v.boolean(),
  status: documentsValidators.documentStatus,
  uploadedBy: v.string(),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_documentType', ['documentType'])
  .index('by_uploadedBy', ['uploadedBy'])
  .index('by_public', ['isPublic'])
  .index('by_confidential', ['isConfidential'])
  .index('by_status', ['status'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
