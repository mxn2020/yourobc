// src/features/boilerplate/[module_name]/hooks/use[Entity]Permissions.ts

import { useMemo } from "react";
import { useCurrentUser } from "@/features/boilerplate/auth";
import { [MODULE]_CONSTANTS } from "../constants";
import type { [Entity] } from "../types";

export type [Entity]MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Frontend permission helpers for UI rendering
 * ⚠️ NOT FOR SECURITY - Only for user experience
 *
 * Note: Uses memberDetails from the {entity} query ({entity}Members table)
 */
export function use[Entity]Permissions({entity}?: [Entity] & { memberDetails?: Array<{ userId: string; role?: string }> }) {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser || !{entity}) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canManageTeam: false,
        isOwner: false,
        isMember: false,
        memberRole: null,
      };
    }

    const isOwner = {entity}.ownerId === currentUser._id;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";

    // Check if user is a member and get their role
    const membership = {entity}.memberDetails?.find(
      (member) => member.userId === currentUser._id
    );
    const isMember = !!membership;
    const memberRole = (membership?.role as [Entity]MemberRole) || null;

    const isPublic = {entity}.visibility === [MODULE]_CONSTANTS.VISIBILITY.PUBLIC;

    // View permissions
    const canView = isAdmin || isOwner || isMember || isPublic;

    // Edit permissions - owner, admin, or member with member/admin role
    const canEdit =
      isAdmin ||
      isOwner ||
      memberRole === 'member' ||
      memberRole === 'admin' ||
      currentUser.permissions.includes([MODULE]_CONSTANTS.PERMISSIONS.EDIT) ||
      currentUser.permissions.includes("*");

    // Delete permissions - only owner and system admin
    const canDelete =
      isAdmin ||
      isOwner ||
      currentUser.permissions.includes([MODULE]_CONSTANTS.PERMISSIONS.DELETE) ||
      currentUser.permissions.includes("*");

    // Team management - owner, admin, or member with admin role
    const canManageTeam =
      isAdmin ||
      isOwner ||
      memberRole === 'admin' ||
      currentUser.permissions.includes([MODULE]_CONSTANTS.PERMISSIONS.MANAGE_TEAM) ||
      currentUser.permissions.includes("*");

    return {
      canView,
      canEdit,
      canDelete,
      canManageTeam,
      isOwner,
      isMember,
      memberRole,
    };
  }, [currentUser, {entity}]);
}

/**
 * Check if user can create [entities]
 */
export function useCanCreate[Entities]() {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser) return false;

    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
    const hasPermission =
      currentUser.permissions.includes([MODULE]_CONSTANTS.PERMISSIONS.CREATE) ||
      currentUser.permissions.includes("*");

    return isAdmin || hasPermission;
  }, [currentUser]);
}

/**
 * Check if user can edit specific {entity}
 */
export function useCanEdit[Entity]({entity}Id?: string) {
  const { profile: currentUser } = useCurrentUser();
  const {entity} = use[Entity]({entity}Id);

  return useMemo(() => {
    if (!currentUser || !{entity}) return false;

    const isOwner = {entity}.ownerId === currentUser._id;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";

    return isAdmin || isOwner;
  }, [currentUser, {entity}]);
}

/**
 * Check if user can delete specific {entity}
 */
export function useCanDelete[Entity]({entity}Id?: string) {
  const { profile: currentUser } = useCurrentUser();
  const {entity} = use[Entity]({entity}Id);

  return useMemo(() => {
    if (!currentUser || !{entity}) return false;

    const isOwner = {entity}.ownerId === currentUser._id;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";

    return isAdmin || isOwner;
  }, [currentUser, {entity}]);
}

/**
 * Get user's role in a specific {entity}
 */
export function use[Entity]Role({entity}?: [Entity] & { memberDetails?: Array<{ userId: string; role?: string }> }) {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser || !{entity}) return null;

    if ({entity}.ownerId === currentUser._id) return "owner";

    const membership = {entity}.memberDetails?.find(
      (member) => member.userId === currentUser._id
    );

    return (membership?.role as [Entity]MemberRole) || null;
  }, [currentUser, {entity}]);
}
