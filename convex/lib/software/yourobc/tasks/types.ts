// convex/lib/software/yourobc/tasks/types.ts
// TypeScript type definitions for tasks module

import type { Doc, Id } from '@/generated/dataModel';
import type { TasksStatus, TasksPriority, TasksType } from '@/schema/software/yourobc/tasks/types';

// Entity types
export type Task = Doc<'softwareYourObcTasks'>;
export type TaskId = Id<'softwareYourObcTasks'>;

// Checklist item type
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
  completedBy?: Id<'userProfiles'>;
}

// Data interfaces
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TasksStatus;
  priority?: TasksPriority;
  taskType?: TasksType;
  assignedTo?: Id<'userProfiles'>;
  dueDate?: number;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedQuoteId?: Id<'yourobcQuotes'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  relatedPartnerId?: Id<'yourobcPartners'>;
  checklist?: ChecklistItem[];
  tags?: string[];
  category?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TasksStatus;
  priority?: TasksPriority;
  taskType?: TasksType;
  assignedTo?: Id<'userProfiles'>;
  dueDate?: number;
  checklist?: ChecklistItem[];
  tags?: string[];
  category?: string;
  completionNotes?: string;
  cancellationReason?: string;
}

// Response types
export interface TaskWithRelations extends Task {
  assignee?: Doc<'userProfiles'> | null;
  relatedShipment?: Doc<'yourobcShipments'> | null;
  relatedQuote?: Doc<'yourobcQuotes'> | null;
  relatedCustomer?: Doc<'yourobcCustomers'> | null;
  relatedPartner?: Doc<'yourobcPartners'> | null;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface TaskFilters {
  status?: TasksStatus[];
  priority?: TasksPriority[];
  taskType?: TasksType[];
  assignedTo?: Id<'userProfiles'>;
  search?: string;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedQuoteId?: Id<'yourobcQuotes'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  overdueOnly?: boolean;
}
