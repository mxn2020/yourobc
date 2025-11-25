// convex/lib/yourobc/shipments/permissions.ts
// Access control and authorization logic for shipments module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Shipment } from './types';
import { UserProfile } from '@/schema/system';


// ============================================================================
// View Access
// ============================================================================

/**
 * Check if user can view shipment
 * - Admins and managers can view all shipments
 * - Employees can view shipments they created or are assigned to
 * - Owners can view their own shipments
 */
export async function canViewShipment(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (shipment.ownerId === user._id) return true;

  // Creator can view
  if (shipment.createdBy === user._id) return true;

  // Assigned employee can view
  if (shipment.employeeId === user._id) return true;

  // Check if user is the assigned courier
  if (shipment.assignedCourierId) {
    const courier = await ctx.db.get(shipment.assignedCourierId);
    if (courier && courier.userId === user._id) return true;
  }

  // Check if user has access through customer relationship
  if (shipment.customerId) {
    const customer = await ctx.db.get(shipment.customerId);
    if (customer && customer.ownerId === user._id) return true;
  }

  return false;
}

export async function requireViewShipmentAccess(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<void> {
  if (!(await canViewShipment(ctx, shipment, user))) {
    throw new Error('You do not have permission to view this shipment');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

/**
 * Check if user can edit shipment
 * - Admins and managers can edit all shipments
 * - Employees can edit shipments they created or are assigned to
 * - Cannot edit invoiced or cancelled shipments (unless admin)
 */
export async function canEditShipment(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all (including invoiced/cancelled)
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Cannot edit invoiced or cancelled shipments
  if (shipment.currentStatus === 'invoiced' || shipment.currentStatus === 'cancelled') {
    return false;
  }

  // Owner can edit
  if (shipment.ownerId === user._id) return true;

  // Creator can edit
  if (shipment.createdBy === user._id) return true;

  // Assigned employee can edit
  if (shipment.employeeId === user._id) return true;

  return false;
}

export async function requireEditShipmentAccess(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<void> {
  if (!(await canEditShipment(ctx, shipment, user))) {
    throw new Error('You do not have permission to edit this shipment');
  }
}

// ============================================================================
// Delete Access
// ============================================================================

/**
 * Check if user can delete shipment
 * - Only admins and shipment owners can delete
 * - Cannot delete invoiced shipments (unless superadmin)
 */
export async function canDeleteShipment(
  shipment: Shipment,
  user: UserProfile
): Promise<boolean> {
  // Superadmins can delete anything
  if (user.role === 'superadmin') return true;

  // Cannot delete invoiced shipments
  if (shipment.currentStatus === 'invoiced') return false;

  // Admins can delete
  if (user.role === 'admin') return true;

  // Owner can delete
  if (shipment.ownerId === user._id) return true;

  return false;
}

export async function requireDeleteShipmentAccess(
  shipment: Shipment,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteShipment(shipment, user))) {
    throw new Error('You do not have permission to delete this shipment');
  }
}

// ============================================================================
// Assign Access
// ============================================================================

/**
 * Check if user can assign shipment to courier/employee
 * - Admins and managers can assign shipments
 * - Owners can assign their own shipments
 */
export async function canAssignShipment(
  shipment: Shipment,
  user: UserProfile
): Promise<boolean> {
  // Admins can assign
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can assign
  if (shipment.ownerId === user._id) return true;

  return false;
}

export async function requireAssignShipmentAccess(
  shipment: Shipment,
  user: UserProfile
): Promise<void> {
  if (!(await canAssignShipment(shipment, user))) {
    throw new Error('You do not have permission to assign this shipment');
  }
}

// ============================================================================
// Update Status Access
// ============================================================================

/**
 * Check if user can update shipment status
 * - Admins and managers can update status
 * - Assigned courier can update status
 * - Assigned employee can update status
 */
export async function canUpdateShipmentStatus(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<boolean> {
  // Admins can update
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Assigned employee can update
  if (shipment.employeeId === user._id) return true;

  // Check if user is the assigned courier
  if (shipment.assignedCourierId) {
    const courier = await ctx.db.get(shipment.assignedCourierId);
    if (courier && courier.userId === user._id) return true;
  }

  // Owner can update
  if (shipment.ownerId === user._id) return true;

  return false;
}

export async function requireUpdateShipmentStatusAccess(
  ctx: QueryCtx | MutationCtx,
  shipment: Shipment,
  user: UserProfile
): Promise<void> {
  if (!(await canUpdateShipmentStatus(ctx, shipment, user))) {
    throw new Error('You do not have permission to update this shipment status');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

/**
 * Filter shipments by access permissions
 */
export async function filterShipmentsByAccess(
  ctx: QueryCtx | MutationCtx,
  shipments: Shipment[],
  user: UserProfile
): Promise<Shipment[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return shipments;
  }

  const accessible: Shipment[] = [];

  for (const shipment of shipments) {
    if (await canViewShipment(ctx, shipment, user)) {
      accessible.push(shipment);
    }
  }

  return accessible;
}

// ============================================================================
// Manage All Access
// ============================================================================

/**
 * Check if user can manage all shipments (admin feature)
 */
export function canManageAllShipments(user: UserProfile): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

export function requireManageAllShipmentsAccess(user: UserProfile): void {
  if (!canManageAllShipments(user)) {
    throw new Error('You do not have permission to manage all shipments');
  }
}
