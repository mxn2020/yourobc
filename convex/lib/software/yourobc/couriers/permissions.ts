// convex/lib/software/yourobc/couriers/permissions.ts
// Permission checks for couriers module

import type { Doc, Id } from '@/generated/dataModel';
import { COURIERS_CONSTANTS, COMMISSIONS_CONSTANTS } from './constants';

// ============================================================================
// Courier Permissions
// ============================================================================

/**
 * Check if user can view courier
 */
export function canViewCourier(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!courier) return false;
  if (courier.deletedAt) return false;

  // Owner can view
  if (courier.ownerId === user._id) return true;

  // TODO: Add role-based access control
  // For now, allow all authenticated users to view
  return true;
}

/**
 * Check if user can edit courier
 */
export function canEditCourier(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!courier) return false;
  if (courier.deletedAt) return false;

  // Owner can edit
  if (courier.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can delete courier
 */
export function canDeleteCourier(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!courier) return false;
  if (courier.deletedAt) return false;

  // Owner can delete
  if (courier.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can restore courier
 */
export function canRestoreCourier(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!courier) return false;
  if (!courier.deletedAt) return false;

  // Owner can restore
  if (courier.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can change courier status
 */
export async function canChangeCourierStatus(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  if (!courier) return false;
  if (courier.deletedAt) return false;

  // Owner can change status
  if (courier.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Validate courier exists and is not deleted
 */
export function validateCourierExists(
  courier: Doc<'yourobcCouriers'> | null
): asserts courier is Doc<'yourobcCouriers'> {
  if (!courier) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.NOT_FOUND);
  }
  if (courier.deletedAt) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.ALREADY_DELETED);
  }
}

/**
 * Require edit permission or throw error
 */
export async function requireEditPermission(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canEditCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_EDIT);
  }
}

/**
 * Require delete permission or throw error
 */
export async function requireDeletePermission(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canDeleteCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_DELETE);
  }
}

/**
 * Require restore permission or throw error
 */
export async function requireRestorePermission(
  courier: Doc<'yourobcCouriers'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canRestoreCourier(courier, user)) {
    throw new Error(COURIERS_CONSTANTS.ERRORS.UNAUTHORIZED_RESTORE);
  }
}

// ============================================================================
// Commission Permissions
// ============================================================================

/**
 * Check if user can view commission
 */
export function canViewCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!commission) return false;
  if (commission.deletedAt) return false;

  // Owner can view
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control
  // For now, allow all authenticated users to view
  return true;
}

/**
 * Check if user can edit commission
 */
export function canEditCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!commission) return false;
  if (commission.deletedAt) return false;

  // Cannot edit paid commissions
  if (commission.status === 'paid') return false;

  // Owner can edit
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can delete commission
 */
export function canDeleteCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!commission) return false;
  if (commission.deletedAt) return false;

  // Cannot delete paid commissions
  if (commission.status === 'paid') return false;

  // Owner can delete
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can restore commission
 */
export function canRestoreCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): boolean {
  if (!commission) return false;
  if (!commission.deletedAt) return false;

  // Owner can restore
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control
  return false;
}

/**
 * Check if user can approve commission
 */
export async function canApproveCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  if (!commission) return false;
  if (commission.deletedAt) return false;
  if (commission.status === 'paid') return false;

  // Owner can approve
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control (managers, admins)
  return false;
}

/**
 * Check if user can pay commission
 */
export async function canPayCommission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  if (!commission) return false;
  if (commission.deletedAt) return false;
  if (commission.status === 'paid') return false;

  // Owner can pay
  if (commission.ownerId === user._id) return true;

  // TODO: Add role-based access control (finance team, admins)
  return false;
}

/**
 * Validate commission exists and is not deleted
 */
export function validateCommissionExists(
  commission: Doc<'yourobcCourierCommissions'> | null
): asserts commission is Doc<'yourobcCourierCommissions'> {
  if (!commission) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.NOT_FOUND);
  }
  if (commission.deletedAt) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.ALREADY_DELETED);
  }
}

/**
 * Require edit permission or throw error
 */
export async function requireCommissionEditPermission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canEditCommission(commission, user)) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.UNAUTHORIZED_EDIT);
  }
}

/**
 * Require delete permission or throw error
 */
export async function requireCommissionDeletePermission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canDeleteCommission(commission, user)) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.UNAUTHORIZED_DELETE);
  }
}

/**
 * Require restore permission or throw error
 */
export async function requireCommissionRestorePermission(
  commission: Doc<'yourobcCourierCommissions'> | null,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!canRestoreCommission(commission, user)) {
    throw new Error(COMMISSIONS_CONSTANTS.ERRORS.UNAUTHORIZED_RESTORE);
  }
}
