// src/types/index.ts

import { UserRole } from '@/features/system/auth';
import type { Id } from '../../convex/_generated/dataModel'
import { NotificationType } from '@/convex/types';
import { EntityType } from '@/config';

// ============================================================================
// User ID Type Aliases
// ============================================================================
// These type aliases make the distinction between external auth IDs and
// internal Convex IDs explicit throughout the codebase.

/**
 * External authentication user ID from Better Auth (string format)
 * Used for: authentication, external system correlation
 */
export type AuthUserId = string;

/**
 * Internal Convex database ID for user profiles
 * Used for: database relationships, indexes, foreign keys
 */
export type UserProfileId = Id<"userProfiles">;

export interface ConvexUser {
  authUserId: string;
  email: string;
  name?: string;
  avatar?: string;
  karmaLevel: number;
  tasksCompleted: number;
  tasksAssigned: number;
  role?: UserRole;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: boolean;
    language?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: 'login' | 'register' | 'forgot-password' | 'reset-password' | null;
}

// Convex notification type (matches schema)
export interface ConvexNotification {
  _id: Id<"notifications">;
  _creationTime: number;
  id: string;
  userId: Id<"userProfiles">;
  type: NotificationType;
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  actionUrl?: string;
  entityType?: EntityType;
  entityId?: string;
  createdAt: number;
  updatedAt: number;
}

// Client-side notification type
export interface Notification {
  id: string;
  userId: Id<"userProfiles">;
  type: NotificationType;
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  actionUrl?: string;
  entityType?: EntityType;
  entityId?: string;
  createdAt: Date;
  updatedAt: Date;
}


// Audit Log Types
export interface AuditLogMetadata {
  source?: string;
  operation?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLog {
  id: string;
  userId: Id<"userProfiles">;
  userName: string;
  action: string;
  entityType: EntityType;
  entityId?: string;
  entityTitle?: string;
  description: string;
  metadata?: AuditLogMetadata;
  createdAt: number;
}


export interface ChartDataPoint extends Record<string, unknown> {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  category?: string;
}

// UI Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';
export type TableVariant = 'default' | 'striped';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  variant?: TableVariant;
  onRowClick?: (record: T) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

// Filter and Search Types
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFilters {
  query?: string;
  assignedTo?: Id<"userProfiles">[];
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}
export interface AILogFilters {
  search?: string
  userId?: Id<"userProfiles">
  modelId?: string
  provider?: string
  requestType?: string
  success?: boolean
  startDate?: number
  endDate?: number
  limit?: number
  offset?: number
}

export interface AuditLogFilters {
  query?: string;
  userId?: Id<"userProfiles">;
  action?: string[];
  entityType?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}

// Settings and Preferences Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  layoutPreferences: {
    layout: 'header' | 'sidebar';
  };
  notificationPreferences: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    assignments: boolean;
    deadlines: boolean;
  };
  dashboardPreferences: {
    defaultView: 'cards' | 'table';
    itemsPerPage: number;
    showCompletedProjects: boolean;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

