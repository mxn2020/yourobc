// convex/lib/yourobc/tasks/types.ts
// TypeScript type definitions for tasks module

import type { Doc, Id } from '@/generated/dataModel';
import type { TaskStatus, TaskPriority, TaskType } from '@/schema/yourobc/tasks/types';

// Entity types
export type Task = Doc<'yourobcTasks'>;
export type TaskId = Id<'yourobcTasks'>;

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
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
  assignedTo?: Id<'userProfiles'>;
  dueDate?: number;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedQuoteId?: Id<'yourobcQuotes'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  relatedPartnerId?: Id<'yourobcPartners'>;
  checklist?: ChecklistItem[];
  tags?: string[];
  category?: string;
  completionNotes?: string;
  cancellationReason?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  taskType?: TaskType;
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
  returnedCount?: number;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  taskType?: TaskType[];
  assignedTo?: Id<'userProfiles'>;
  search?: string;
  relatedShipmentId?: Id<'yourobcShipments'>;
  relatedQuoteId?: Id<'yourobcQuotes'>;
  relatedCustomerId?: Id<'yourobcCustomers'>;
  overdueOnly?: boolean;
}
