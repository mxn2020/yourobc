// src/features/system/projects/types/team.types.ts

import type { Id } from '@/convex/_generated/dataModel'

/**
 * Team member role types
 */
export type MemberRole =
  | 'owner'
  | 'admin'
  | 'member'
  | 'viewer'

/**
 * Team member status types
 */
export type MemberStatus =
  | 'active'
  | 'inactive'
  | 'invited'
  | 'removed'

/**
 * Member settings structure
 */
export interface MemberSettings {
  emailNotifications?: boolean
  canManageTasks?: boolean
  canInviteMembers?: boolean
  canEditProject?: boolean
}

/**
 * Member metadata structure
 */
export interface MemberMetadata {
  avatar?: string
  bio?: string
  skills?: string[]
}

/**
 * Data structure for adding a new member to a project
 */
export interface AddMemberData {
  projectId: Id<"projects">
  userId: Id<"userProfiles">
  role?: MemberRole
  department?: string
  jobTitle?: string
  permissions?: string[]
  settings?: MemberSettings
}

/**
 * Data structure for updating an existing member
 */
export interface UpdateMemberData {
  role?: MemberRole
  department?: string
  jobTitle?: string
  status?: MemberStatus
  permissions?: string[]
  settings?: MemberSettings
  metadata?: MemberMetadata
}
