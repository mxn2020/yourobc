// features/projects/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Project = Doc<'projects'>
export type ProjectId = Id<'projects'>

export type ProjectPriority = Project['priority']
export type ProjectVisibility = Project['visibility']
export type ProjectStatus = Project['status']

export interface CreateProjectData {
  title: string
  description?: string
  priority?: Project['priority']
  visibility?: Project['visibility']
  tags?: string[]
  category?: string
  startDate?: number
  dueDate?: number
  progress?: {
    completedTasks: number
    totalTasks: number
    percentage: number
  }
  collaborators?: string[]
  settings?: Partial<Project['settings']>
  extendedMetadata?: Partial<Project['extendedMetadata']>
}

export interface UpdateProjectData {
  title?: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  visibility?: Project['visibility']
  tags?: string[]
  category?: string
  startDate?: number
  dueDate?: number
  progress?: {
    completedTasks: number
    totalTasks: number
    percentage: number
  }
  collaborators?: string[]
  settings?: Partial<Project['settings']>
  extendedMetadata?: Partial<Project['extendedMetadata']>
}

export interface ProjectFilters {
  status?: Project['status'][]
  priority?: Project['priority'][]
  visibility?: Project['visibility'][]
  category?: string
  ownerId?: Id<"userProfiles">
  search?: string
}

export interface ProjectsListOptions {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'dueDate' | 'priority'
  sortOrder?: 'asc' | 'desc'
  filters?: ProjectFilters
}

