// convex/lib/yourobc/employees/types.ts
// TypeScript type definitions for employees module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  EmployeeStatus,
  WorkStatus,
  VacationType,
  VacationStatus,
  EmploymentType,
} from '@/schema/yourobc/employees/types';

// Entity types
export type Employee = Doc<'yourobcEmployees'>;
export type EmployeeId = Id<'yourobcEmployees'>;
export type VacationDays = Doc<'yourobcVacationDays'>;
export type VacationDaysId = Id<'yourobcVacationDays'>;

// Data interfaces for Employee
export interface CreateEmployeeData {
  name: string;
  userProfileId: Id<'userProfiles'>;
  authUserId: string;
  employeeNumber: string;
  type?: 'office';
  department?: string;
  position?: string;
  managerId?: EmployeeId;
  employmentType?: EmploymentType;
  office: {
    location: string;
    country: string;
    countryCode: string;
    address?: string;
  };
  hireDate?: number;
  startDate?: number;
  endDate?: number;
  salary?: number;
  currency?: string;
  paymentFrequency?: 'hourly' | 'weekly' | 'bi_weekly' | 'monthly' | 'annually';
  email?: string;
  phone?: string;
  workPhone?: string;
  workEmail?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status?: EmployeeStatus;
  workStatus?: WorkStatus;
  timezone?: string;
}

export interface UpdateEmployeeData {
  name?: string;
  department?: string;
  position?: string;
  managerId?: EmployeeId;
  employmentType?: EmploymentType;
  office?: {
    location: string;
    country: string;
    countryCode: string;
    address?: string;
  };
  hireDate?: number;
  startDate?: number;
  endDate?: number;
  salary?: number;
  currency?: string;
  paymentFrequency?: 'hourly' | 'weekly' | 'bi_weekly' | 'monthly' | 'annually';
  email?: string;
  phone?: string;
  workPhone?: string;
  workEmail?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  status?: EmployeeStatus;
  workStatus?: WorkStatus;
  isActive?: boolean;
  timezone?: string;
}

// Time entry interface
export interface TimeEntry {
  entryId: string;
  type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end';
  timestamp: number;
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  notes?: string;
}

// Vacation request interface
export interface VacationRequest {
  startDate: number;
  endDate: number;
  days: number;
  type: VacationType;
  reason?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  isHalfDay?: boolean;
}

// Vacation entry interface
export interface VacationEntry extends VacationRequest {
  entryId: string;
  status: VacationStatus;
  approvedBy?: string;
  approvedDate?: number;
  approvalNotes?: string;
  rejectedBy?: string;
  rejectedDate?: number;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledDate?: number;
  cancellationReason?: string;
  requestedDate: number;
  requestedBy: string;
}

// Data interfaces for Vacation Days
export interface CreateVacationDaysData {
  employeeId: EmployeeId;
  year: number;
  annualEntitlement: number;
  carryoverDays?: number;
}

export interface UpdateVacationDaysData {
  annualEntitlement?: number;
  carryoverDays?: number;
}

// Response types
export interface EmployeeWithRelations extends Employee {
  manager?: Employee | null;
  subordinates?: Employee[];
  vacationDays?: VacationDays | null;
}

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
  hasMore: boolean;
}

export interface VacationDaysListResponse {
  items: VacationDays[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmployeeFilters {
  status?: EmployeeStatus[];
  workStatus?: WorkStatus[];
  department?: string;
  position?: string;
  managerId?: EmployeeId;
  isActive?: boolean;
  isOnline?: boolean;
  search?: string;
}

export interface VacationFilters {
  employeeId?: EmployeeId;
  year?: number;
  status?: VacationStatus[];
  type?: VacationType[];
}

// Stats types
export interface EmployeeStats {
  total: number;
  byStatus: Record<EmployeeStatus, number>;
  byDepartment: Record<string, number>;
  byEmploymentType: Record<string, number>;
  online: number;
  onVacation: number;
}

export interface VacationStats {
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  byType: Record<VacationType, number>;
}
