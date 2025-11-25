// convex/lib/yourobc/employees/sessions/types.ts
// TypeScript type definitions for employeeSessions module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmployeeSessionsStatus } from '@/schema/yourobc/employees/sessions/types';

// Entity types
export type EmployeeSession = Doc<'yourobcEmployeeSessions'>;
export type EmployeeSessionId = Id<'yourobcEmployeeSessions'>;

// Data interfaces
export interface CreateEmployeeSessionData {
  employeeId: Id<'yourobcEmployees'>;
  userProfileId: Id<'userProfiles'>;
  authUserId: string;
  startTime: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  sessionType: 'manual' | 'automatic';
  device?: {
    userAgent?: string;
    platform?: string;
    browser?: string;
  };
  ipAddress?: string;
  status?: EmployeeSessionsStatus;
  notes?: string;
}

export interface UpdateEmployeeSessionData {
  endTime?: number;
  duration?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  lastActivity?: number;
  isActive?: boolean;
  inactivityStartTime?: number;
  breaks?: Array<{
    startTime: number;
    endTime?: number;
    type: 'lunch' | 'coffee' | 'personal' | 'meeting';
    duration?: number;
  }>;
  activityLog?: Array<{
    timestamp: number;
    action: string;
    details?: string;
  }>;
  status?: EmployeeSessionsStatus;
  notes?: string;
}

// Response types
export interface EmployeeSessionListResponse {
  items: EmployeeSession[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmployeeSessionFilters {
  status?: EmployeeSessionsStatus[];
  employeeId?: Id<'yourobcEmployees'>;
  startDate?: number;
  endDate?: number;
  isActive?: boolean;
}
