// convex/schema/software/yourobc/dashboard/types.ts
/**
 * Dashboard Schema Types
 *
 * Type definitions extracted from dashboard validators.
 * These types provide TypeScript type safety for dashboard-related data.
 */

import { Infer } from 'convex/values';
import {
  dashboardAlertAcknowledgmentValidator,
  createDashboardAlertAcknowledgmentValidator,
  updateDashboardAlertAcknowledgmentValidator,
} from './validators';

/**
 * Dashboard Alert Acknowledgment Type
 *
 * Represents a complete dashboard alert acknowledgment record.
 */
export type DashboardAlertAcknowledgment = Infer<
  typeof dashboardAlertAcknowledgmentValidator
>;

/**
 * Create Dashboard Alert Acknowledgment Input Type
 *
 * Input data required to create a new dashboard alert acknowledgment.
 */
export type CreateDashboardAlertAcknowledgmentInput = Infer<
  typeof createDashboardAlertAcknowledgmentValidator
>;

/**
 * Update Dashboard Alert Acknowledgment Input Type
 *
 * Input data for updating an existing dashboard alert acknowledgment.
 */
export type UpdateDashboardAlertAcknowledgmentInput = Infer<
  typeof updateDashboardAlertAcknowledgmentValidator
>;
