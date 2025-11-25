// convex/schema/software/freelancer_dashboard/projects/projects.ts
// Main projects table definition

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { projectsValidators, projectsFields } from './validators';

/**
 * Projects table
 * Represents client projects with timeline, budget, and team
 */
export const projectsTable = defineTable({
  // Main display field
  name: v.string(),

  // Core required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Project details
  description: v.optional(v.string()),
  status: projectsValidators.status,
  priority: v.optional(projectsValidators.priority),
  visibility: projectsValidators.visibility,

  // Relationships
  clientId: v.optional(v.id('clients')),

  // Budget and timeline
  budget: v.optional(projectsFields.budget),
  startDate: v.optional(v.number()),
  deadline: v.optional(v.number()),
  completedAt: v.optional(v.number()),

  // Settings
  settings: projectsFields.settings,

  // Tags
  tags: v.optional(v.array(v.string())),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Query optimization indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_client', ['clientId'])
  .index('by_created_at', ['createdAt'])
  .index('by_deadline', ['deadline']);
