// convex/lib/software/yourobc/shipments/permissions.ts
// Permission checks for shipments module

import type { Doc } from '@/generated/dataModel';
import type {
  Shipment,
  ShipmentStatusHistory,
} from '@/schema/software/yourobc/shipments';
import { SHIPMENTS_CONSTANTS } from './constants';

// ============================================================================
// Shipment Permissions
// ============================================================================

/**
 * Check if user can view a shipment
 */
export function canViewShipment(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): boolean {
  // Owner can always view
  if (shipment.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions (admin, team members, etc.)
  // For now, only owner can view
  return false;
}

/**
 * Check if user can edit a shipment
 */
export function canEditShipment(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): boolean {
  // Cannot edit deleted shipments
  if (shipment.deletedAt) {
    return false;
  }

  // Owner can edit
  if (shipment.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions (admin, team members, etc.)
  return false;
}

/**
 * Check if user can delete a shipment
 */
export function canDeleteShipment(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): boolean {
  // Cannot delete already deleted shipments
  if (shipment.deletedAt) {
    return false;
  }

  // Owner can delete
  if (shipment.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions (admin only, etc.)
  return false;
}

/**
 * Check if user can restore a shipment
 */
export function canRestoreShipment(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): boolean {
  // Can only restore deleted shipments
  if (!shipment.deletedAt) {
    return false;
  }

  // Owner can restore
  if (shipment.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions (admin only, etc.)
  return false;
}

/**
 * Require edit permission or throw error
 */
export function requireEditPermission(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): void {
  if (!canEditShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_EDIT);
  }
}

/**
 * Require delete permission or throw error
 */
export function requireDeletePermission(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): void {
  if (!canDeleteShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_DELETE);
  }
}

/**
 * Require restore permission or throw error
 */
export function requireRestorePermission(
  shipment: Shipment,
  user: Doc<'userProfiles'>
): void {
  if (!canRestoreShipment(shipment, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_RESTORE);
  }
}

/**
 * Validate shipment exists and is not deleted (unless includeDeleted is true)
 */
export function validateShipmentExists(
  shipment: Shipment | null,
  includeDeleted: boolean = false
): asserts shipment is Shipment {
  if (!shipment) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.NOT_FOUND);
  }

  if (shipment.deletedAt && !includeDeleted) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.NOT_FOUND);
  }
}

// ============================================================================
// Shipment Status History Permissions
// ============================================================================

/**
 * Check if user can view a shipment status history entry
 */
export function canViewStatusHistory(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): boolean {
  // Owner can always view
  if (statusHistory.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions
  return false;
}

/**
 * Check if user can edit a shipment status history entry
 */
export function canEditStatusHistory(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): boolean {
  // Cannot edit deleted entries
  if (statusHistory.deletedAt) {
    return false;
  }

  // Owner can edit
  if (statusHistory.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions
  return false;
}

/**
 * Check if user can delete a shipment status history entry
 */
export function canDeleteStatusHistory(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): boolean {
  // Cannot delete already deleted entries
  if (statusHistory.deletedAt) {
    return false;
  }

  // Owner can delete
  if (statusHistory.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions
  return false;
}

/**
 * Check if user can restore a shipment status history entry
 */
export function canRestoreStatusHistory(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): boolean {
  // Can only restore deleted entries
  if (!statusHistory.deletedAt) {
    return false;
  }

  // Owner can restore
  if (statusHistory.ownerId === user._id) {
    return true;
  }

  // TODO: Add role-based permissions
  return false;
}

/**
 * Require edit permission for status history or throw error
 */
export function requireEditStatusHistoryPermission(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): void {
  if (!canEditStatusHistory(statusHistory, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_EDIT);
  }
}

/**
 * Require delete permission for status history or throw error
 */
export function requireDeleteStatusHistoryPermission(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): void {
  if (!canDeleteStatusHistory(statusHistory, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_DELETE);
  }
}

/**
 * Require restore permission for status history or throw error
 */
export function requireRestoreStatusHistoryPermission(
  statusHistory: ShipmentStatusHistory,
  user: Doc<'userProfiles'>
): void {
  if (!canRestoreStatusHistory(statusHistory, user)) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.UNAUTHORIZED_RESTORE);
  }
}

/**
 * Validate status history exists and is not deleted (unless includeDeleted is true)
 */
export function validateStatusHistoryExists(
  statusHistory: ShipmentStatusHistory | null,
  includeDeleted: boolean = false
): asserts statusHistory is ShipmentStatusHistory {
  if (!statusHistory) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.STATUS_HISTORY_NOT_FOUND);
  }

  if (statusHistory.deletedAt && !includeDeleted) {
    throw new Error(SHIPMENTS_CONSTANTS.ERRORS.STATUS_HISTORY_NOT_FOUND);
  }
}
