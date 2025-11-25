// convex/lib/yourobc/dashboard/types.ts
/**
 * Dashboard Library Types
 *
 * Type definitions for the dashboard module business logic.
 */

import { Doc, Id } from '@/generated/dataModel';
import type {
  CreateDashboardAlertAcknowledgmentInput as SchemaCreateDashboardAlertAcknowledgmentInput,
  UpdateDashboardAlertAcknowledgmentInput as SchemaUpdateDashboardAlertAcknowledgmentInput,
} from '@/schema/yourobc/dashboard';

/**
 * Dashboard Alert Acknowledgment Document Type
 */
export type DashboardAlertAcknowledgmentDoc = Doc<'dashboardAlertAcknowledgments'>;

/**
 * Dashboard Alert Acknowledgment ID Type
 */
export type DashboardAlertAcknowledgmentId = Id<'dashboardAlertAcknowledgments'>;

export type DashboardAlertAcknowledgmentUserId = Id<'userProfiles'>;

/**
 * Create Dashboard Alert Acknowledgment Input
 */
export type CreateDashboardAlertAcknowledgmentInput = SchemaCreateDashboardAlertAcknowledgmentInput;

/**
 * Update Dashboard Alert Acknowledgment Input
 */
export type UpdateDashboardAlertAcknowledgmentInput = SchemaUpdateDashboardAlertAcknowledgmentInput;

/**
 * Dashboard Alert Acknowledgment Query Options
 */
export interface DashboardAlertAcknowledgmentQueryOptions {
  userId?: DashboardAlertAcknowledgmentUserId;
  alertId?: string;
  ownerId?: DashboardAlertAcknowledgmentUserId;
  includeDeleted?: boolean;
}

/**
 * Dashboard Alert Status
 */
export interface DashboardAlertStatus {
  alertId: string;
  isAcknowledged: boolean;
  acknowledgedAt?: number;
}
