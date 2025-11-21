// convex/lib/software/yourobc/dashboard/types.ts
/**
 * Dashboard Library Types
 *
 * Type definitions for the dashboard module business logic.
 */

import { Doc, Id } from '../../../../_generated/dataModel';

/**
 * Dashboard Alert Acknowledgment Document Type
 */
export type DashboardAlertAcknowledgmentDoc = Doc<'dashboardAlertAcknowledgments'>;

/**
 * Dashboard Alert Acknowledgment ID Type
 */
export type DashboardAlertAcknowledgmentId = Id<'dashboardAlertAcknowledgments'>;

/**
 * Create Dashboard Alert Acknowledgment Input
 */
export interface CreateDashboardAlertAcknowledgmentInput {
  userId: string;
  alertId: string;
}

/**
 * Update Dashboard Alert Acknowledgment Input
 */
export interface UpdateDashboardAlertAcknowledgmentInput {
  publicId: string;
  acknowledgedAt?: number;
}

/**
 * Dashboard Alert Acknowledgment Query Options
 */
export interface DashboardAlertAcknowledgmentQueryOptions {
  userId?: string;
  alertId?: string;
  ownerId?: string;
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
