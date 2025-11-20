/**
 * Shared types used across supporting features
 */

import type { Id } from '@/convex/_generated/dataModel';

/**
 * Common entity types that supporting features can attach to
 * These are examples - adjust based on your application's entities
 */
export const SUPPORTING_ENTITY_TYPES = [
  'user',
  'project',
  'task',
  'order',
  'invoice',
  'customer',
  'product',
  'service',
] as const;

export type SupportingEntityType = (typeof SUPPORTING_ENTITY_TYPES)[number];

/**
 * Display labels for entity types
 */
export const ENTITY_TYPE_LABELS: Record<SupportingEntityType, string> = {
  user: 'User',
  project: 'Project',
  task: 'Task',
  order: 'Order',
  invoice: 'Invoice',
  customer: 'Customer',
  product: 'Product',
  service: 'Service',
};

/**
 * Common filter options for supporting features
 */
export interface BaseFilters {
  entityType?: string;
  entityId?: string;
  createdBy?: Id<"userProfiles">;
  dateFrom?: number;
  dateTo?: number;
  searchQuery?: string;
  isInternal?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Common sort options
 */
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

/**
 * Common pagination result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Common attachment type
 */
export interface Attachment {
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: number;
  uploadedBy?: string;
}

/**
 * Common metadata for tracking creation/updates
 */
export interface AuditMetadata {
  createdBy: Id<"userProfiles">;
  createdAt: number;
  updatedBy?: string;
  updatedAt?: number;
  deletedBy?: string;
  deletedAt?: number;
}

/**
 * Common mention type
 */
export interface Mention {
  userId: Id<"userProfiles">;
  userName: string;
  mentionedAt?: number;
}

/**
 * Common tag type
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  category?: string;
}

/**
 * Common status type
 */
export type CommonStatus = 'active' | 'inactive' | 'archived' | 'deleted';

/**
 * Common priority type
 */
export type CommonPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Common visibility type
 */
export type VisibilityLevel = 'public' | 'internal' | 'private' | 'restricted';
