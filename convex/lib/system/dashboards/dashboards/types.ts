// convex/lib/system/dashboards/dashboards/types.ts
// TypeScript type definitions for dashboards module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  DashboardLayout,
  Widget,
  WidgetType,
  ChartType,
  AggregationType,
  FormatType,
} from '@/schema/system/dashboards/dashboards/types';

// ============================================
// Entity Types
// ============================================

export type Dashboard = Doc<'dashboards'>;
export type DashboardId = Id<'dashboards'>;

// Re-export schema types
export type { DashboardLayout, Widget, WidgetType, ChartType, AggregationType, FormatType };

// ============================================
// Data Interfaces
// ============================================

export interface CreateDashboardData {
  name: string;
  description?: string;
  layout?: DashboardLayout;
  widgets?: Widget[];
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateDashboardData {
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  widgets?: Widget[];
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

// ============================================
// Response Types
// ============================================

export interface DashboardListResponse {
  items: Dashboard[];
  total: number;
  hasMore: boolean;
}

// ============================================
// Filter Types
// ============================================

export interface DashboardFilters {
  layout?: DashboardLayout[];
  isDefault?: boolean;
  isPublic?: boolean;
  search?: string;
}
