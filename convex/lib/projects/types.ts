// convex/lib/projects/types.ts
// TypeScript type definitions for projects module

import type { Doc, Id } from '@/generated/dataModel';
import type { ProjectStatus, ProjectPriority, ProjectVisibility, ProjectRiskLevel } from '@/schema/projects/types';

// Entity types
export type Project = Doc<'projects'>;
export type ProjectId = Id<'projects'>;

// Data interfaces
export interface CreateProjectData {
  title: string;
  description?: string;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  tags?: string[];
  category?: string;
  startDate?: number;
  dueDate?: number;
  settings?: Partial<Project['settings']>;
  extendedMetadata?: Partial<Project['extendedMetadata']>;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  tags?: string[];
  category?: string;
  startDate?: number;
  dueDate?: number;
  settings?: Partial<Project['settings']>;
  extendedMetadata?: Partial<Project['extendedMetadata']>;
}

// Filter types
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  visibility?: ProjectVisibility[];
  category?: string;
  ownerId?: Id<'userProfiles'>;
  collaboratorId?: Id<'userProfiles'>;
  tags?: string[];
  dueDateBefore?: number;
  dueDateAfter?: number;
  search?: string;
}

// List options
export interface ProjectsListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  filters?: ProjectFilters;
}

// Response types
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  hasMore: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  onHoldProjects: number;
  overdueProjects: number;
  atRiskProjects: number;
  averageProgress: number;
  totalBudget: number;
  projectsByStatus: {
    active: number;
    completed: number;
    archived: number;
    on_hold: number;
  };
  projectsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  projectsByCategory: Record<string, number>;
}
