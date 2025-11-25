// convex/lib/{category}/{entity}/{module}/types.ts
// TypeScript type definitions for {module} module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  {Module}Status,
  {Module}Priority,
  {Module}Visibility
} from '@/schema/{category}/{entity}/{module}/types';

/**
 * Base entity types
 */
export type {Module} = Doc<'{tableName}'>;
export type {Module}Id = Id<'{tableName}'>;

/**
 * Create operation data
 * @param name - Display name/title (required)
 * @param description - Optional description
 * @param status - Entity status (optional, defaults to active)
 * @param priority - Priority level (optional)
 * @param visibility - Visibility setting (optional)
 * @param tags - Array of tags (optional)
 */
export interface Create{Module}Data {
  name: string;
  description?: string;
  status?: {Module}Status;
  priority?: {Module}Priority;
  visibility?: {Module}Visibility;
  parentId?: {Module}Id;
  categoryId?: Id<'categories'>;
  tags?: string[];
  // Add more fields as needed...
}

/**
 * Update operation data
 * All fields optional for partial updates
 */
export interface Update{Module}Data {
  name?: string;
  description?: string;
  status?: {Module}Status;
  priority?: {Module}Priority;
  visibility?: {Module}Visibility;
  tags?: string[];
  // Add more fields as needed...
}

/**
 * List response with pagination
 * @param items - Array of entities
 * @param returnedCount - Count of items in this page
 * @param hasMore - Whether more items exist
 * @param cursor - Continuation cursor for next page
 */
export interface {Module}ListResponse {
  items: {Module}[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

/**
 * Filter options for queries
 */
export interface {Module}Filters {
  status?: {Module}Status[];
  priority?: {Module}Priority[];
  categoryId?: Id<'categories'>;
  search?: string;
  // Add more filters as needed...
}

// Add more types as needed...

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating types.ts:
 * [ ] Import Doc and Id from dataModel
 * [ ] Import schema types
 * [ ] Define base entity type ({Module})
 * [ ] Define entity ID type ({Module}Id)
 * [ ] Define Create{Module}Data interface
 * [ ] Define Update{Module}Data interface
 * [ ] Define {Module}ListResponse interface
 * [ ] Define {Module}Filters interface (optional)
 * [ ] Document all interface fields
 *
 * DO:
 * [ ] Use schema types for enums
 * [ ] Keep interfaces focused
 * [ ] Document complex types
 * [ ] Use consistent naming
 *
 * DON'T:
 * [ ] Duplicate schema types
 * [ ] Use 'any' type
 * [ ] Skip interface documentation
 * [ ] Mix business logic with types
 */
