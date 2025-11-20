// convex/lib/system/projects/team/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type ProjectMember = Doc<'projectMembers'>;
export type ProjectMemberId = Id<'projectMembers'>;

export interface CreateMemberData {
  projectId: Id<'projects'>;
  userId: Id<'userProfiles'>;
  role?: ProjectMember['role'];
  department?: string;
  jobTitle?: string;
  permissions?: string[];
  settings?: Partial<ProjectMember['settings']>;
}

export interface UpdateMemberData {
  role?: ProjectMember['role'];
  department?: string;
  jobTitle?: string;
  status?: ProjectMember['status'];
  permissions?: string[];
  settings?: Partial<ProjectMember['settings']>;
  extendedMetadata?: Partial<ProjectMember['extendedMetadata']>;
}

export interface TeamFilters {
  projectId?: Id<'projects'>;
  userId?: Id<'userProfiles'>;
  role?: ProjectMember['role'][];
  status?: ProjectMember['status'][];
  department?: string;
  search?: string;
}

export interface TeamListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'joinedAt' | 'lastActiveAt' | 'role';
  sortOrder?: 'asc' | 'desc';
  filters?: TeamFilters;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  invitedMembers: number;
  inactiveMembers: number;
  byRole: {
    owners: number;
    admins: number;
    members: number;
    viewers: number;
  };
  byDepartment?: Record<string, number>;
}