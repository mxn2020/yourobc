// convex/lib/yourobc/employees/types.ts
// convex/yourobc/employees/types.ts

import type { Doc, Id } from '../../../_generated/dataModel';
import type { TimeEntry } from '../shared';

export type Employee = Doc<'yourobcEmployees'>;
export type EmployeeId = Id<'yourobcEmployees'>;
export type VacationDay = Doc<'yourobcVacationDays'>;
export type VacationDayId = Id<'yourobcVacationDays'>;

export interface Office {
  location: string;
  country: string;
  countryCode: string;
  address?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface VacationEntry {
  entryId: string;
  startDate: number;
  endDate: number;
  days: number;
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
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
  reason?: string;
  emergencyContact?: EmergencyContact;
  notes?: string;
  isHalfDay?: boolean;
}

export interface CreateEmployeeData {
  userProfileId: Id<'userProfiles'>;
  authUserId: string;
  employeeNumber?: string;
  department?: string;
  position?: string;
  managerId?: Id<'yourobcEmployees'>;
  office: Office;
  hireDate?: number;
  workPhone?: string;
  workEmail?: string;
  emergencyContact?: EmergencyContact;
  timezone?: string;
}

export interface UpdateEmployeeData {
  employeeNumber?: string;
  department?: string;
  position?: string;
  managerId?: Id<'yourobcEmployees'>;
  office?: Office;
  hireDate?: number;
  workPhone?: string;
  workEmail?: string;
  emergencyContact?: EmergencyContact;
  status?: 'active' | 'inactive' | 'terminated' | 'on_leave';
  isActive?: boolean;
  isOnline?: boolean;
  timezone?: string;
}

export interface EmployeeFilters {
  status?: ('active' | 'inactive' | 'terminated' | 'on_leave')[];
  isActive?: boolean;
  isOnline?: boolean;
  department?: string[];
  position?: string[];
  office?: string[];
  manager?: Id<'yourobcEmployees'>[];
  search?: string;
}

export interface EmployeeListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'employeeNumber' | 'department' | 'position' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  filters?: EmployeeFilters;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  onlineEmployees: number;
  employeesByStatus: Record<string, number>;
  employeesByDepartment: Record<string, number>;
  employeesByOffice: Record<string, number>;
  avgTasksPerEmployee: number;
}

export interface CreateVacationEntryData {
  employeeId: Id<'yourobcEmployees'>;
  year: number;
  startDate: number;
  endDate: number;
  days: number;
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
  reason?: string;
  emergencyContact?: EmergencyContact;
}

export interface VacationSummary {
  year: number;
  available: number;
  used: number;
  pending: number;
  remaining: number;
}