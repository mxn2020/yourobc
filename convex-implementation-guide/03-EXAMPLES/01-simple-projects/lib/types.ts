// convex/lib/software/freelancer_dashboard/projects/types.ts
// TypeScript type definitions for projects module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ProjectStatus,
  ProjectPriority,
  ProjectVisibility,
  ProjectBudget,
  ProjectSettings,
  MemberRole,
  MemberStatus,
} from '@/schema/software/freelancer_dashboard/projects/types';

// Base entity types
export type Project = Doc<'freelancerProjects'>;
export type ProjectId = Id<'freelancerProjects'>;
export type ProjectMember = Doc<'freelancerProjectMembers'>;
export type ProjectMemberId = Id<'freelancerProjectMembers'>;

// Create operation data
export interface CreateProjectData {
  name: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  clientId?: Id<'clients'>;
  budget?: ProjectBudget;
  startDate?: number;
  deadline?: number;
  settings?: Partial<ProjectSettings>;
  tags?: string[];
}

// Update operation data
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  budget?: ProjectBudget;
  startDate?: number;
  deadline?: number;
  settings?: Partial<ProjectSettings>;
  tags?: string[];
}

// List response
export interface ProjectListResponse {
  items: Project[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  clientId?: Id<'clients'>;
  search?: string;
}

// Member operations
export interface AddMemberData {
  projectId: ProjectId;
  userId: Id<'userProfiles'>;
  role: MemberRole;
}

export interface UpdateMemberData {
  role?: MemberRole;
  status?: MemberStatus;
}
