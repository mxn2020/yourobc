// convex/lib/yourobc/employeeKPIs/types.ts
// TypeScript type definitions for employeeKPIs module

import type { Doc, Id } from '@/generated/dataModel';
import type { EmployeeKPIsStatus, EmployeeKPIsPeriod } from '@/schema/yourobc/employeeKPIs/types';

// Entity types
export type EmployeeKPI = Doc<'yourobcEmployeeKPIs'>;
export type EmployeeKPIId = Id<'yourobcEmployeeKPIs'>;

// Data interfaces
export interface CreateEmployeeKPIData {
  employeeId: Id<'yourobcEmployees'>;
  kpiName: string;
  metricType: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  period: EmployeeKPIsPeriod;
  year: number;
  month?: number;
  quarter?: number;
  week?: number;
  day?: number;
  startDate: number;
  endDate: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  status?: EmployeeKPIsStatus;
  notes?: string;
}

export interface UpdateEmployeeKPIData {
  kpiName?: string;
  metricType?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  historicalData?: Array<{
    date: number;
    value: number;
    note?: string;
  }>;
  previousPeriodValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  status?: EmployeeKPIsStatus;
  notes?: string;
}

// Response types
export interface EmployeeKPIListResponse {
  items: EmployeeKPI[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface EmployeeKPIFilters {
  status?: EmployeeKPIsStatus[];
  period?: EmployeeKPIsPeriod[];
  employeeId?: Id<'yourobcEmployees'>;
  year?: number;
  month?: number;
  metricType?: string;
}
