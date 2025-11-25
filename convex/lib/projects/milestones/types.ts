// convex/lib/boilerplate/milestones/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type Milestone = Doc<'projectMilestones'>;
export type MilestoneId = Id<'projectMilestones'>;

export interface Deliverable {
  title: string;
  completed: boolean;
  completedAt?: number;
}

export interface CreateMilestoneData {
  title: string;
  description?: string;
  priority?: Milestone['priority'];
  projectId: Id<'projects'>;
  startDate: number;
  dueDate: number;
  assignedTo?: Id<'userProfiles'>;
  order?: number;
  color?: string;
  dependencies?: Id<'projectMilestones'>[];
  deliverables?: Deliverable[];
  metadata?: Partial<Milestone['metadata']>;
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  status?: Milestone['status'];
  priority?: Milestone['priority'];
  startDate?: number;
  dueDate?: number;
  completedDate?: number;
  progress?: number;
  assignedTo?: Id<'userProfiles'>;
  order?: number;
  color?: string;
  dependencies?: Id<'projectMilestones'>[];
  deliverables?: Deliverable[];
  tasksTotal?: number;
  tasksCompleted?: number;
  metadata?: Partial<Milestone['metadata']>;
}

export interface MilestoneFilters {
  status?: Milestone['status'][];
  priority?: Milestone['priority'][];
  projectId?: Id<'projects'>;
  assignedTo?: Id<'userProfiles'>;
  createdBy?: Id<'userProfiles'>;
  dueDateBefore?: number;
  dueDateAfter?: number;
  search?: string;
}

export interface MilestonesListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'startDate' | 'priority' | 'order';
  sortOrder?: 'asc' | 'desc';
  filters?: MilestoneFilters;
}

export interface MilestoneStats {
  totalMilestones: number;
  upcomingMilestones: number;
  inProgressMilestones: number;
  completedMilestones: number;
  delayedMilestones: number;
  averageProgress: number;
}
