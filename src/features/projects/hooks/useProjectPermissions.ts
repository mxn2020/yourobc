// src/features/projects/hooks/useProjectPermissions.ts

import { useMemo } from "react";
import { useCurrentUser } from "@/features/boilerplate/auth";
import { PROJECT_CONSTANTS } from "../constants";
import type { Project } from "../types";

export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

/**
 * Frontend permission helpers for UI rendering
 * ⚠️ NOT FOR SECURITY - Only for user experience
 * 
 * Note: Uses memberDetails from the project query (projectMembers table)
 */
export function useProjectPermissions(project?: Project & { memberDetails?: Array<{ userId: string; role?: string }> }) {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser || !project) {
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

    const isOwner = project.ownerId === currentUser._id;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
    
    // Check if user is a member and get their role
    const membership = project.memberDetails?.find(
      (member) => member.userId === currentUser._id
    );
    const isMember = !!membership;
    const memberRole = (membership?.role as ProjectMemberRole) || null;
    
    const isPublic = project.visibility === PROJECT_CONSTANTS.VISIBILITY.PUBLIC;

    // View permissions
    const canView = isAdmin || isOwner || isMember || isPublic;

    // Edit permissions - owner, admin, or member with member/admin role
    const canEdit =
      isAdmin ||
      isOwner ||
      memberRole === 'member' ||
      memberRole === 'admin' ||
      currentUser.permissions.includes(PROJECT_CONSTANTS.PERMISSIONS.EDIT) ||
      currentUser.permissions.includes("*");

    // Delete permissions - only owner and system admin
    const canDelete =
      isAdmin ||
      isOwner ||
      currentUser.permissions.includes(PROJECT_CONSTANTS.PERMISSIONS.DELETE) ||
      currentUser.permissions.includes("*");

    // Team management - owner, admin, or member with admin role
    const canManageTeam =
      isAdmin ||
      isOwner ||
      memberRole === 'admin' ||
      currentUser.permissions.includes(PROJECT_CONSTANTS.PERMISSIONS.MANAGE_TEAM) ||
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
  }, [currentUser, project]);
}

/**
 * Check if user can create projects
 */
export function useCanCreateProjects() {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser) return false;

    const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
    const hasPermission =
      currentUser.permissions.includes(PROJECT_CONSTANTS.PERMISSIONS.CREATE) ||
      currentUser.permissions.includes("*");

    return isAdmin || hasPermission;
  }, [currentUser]);
}

/**
 * Get user's role in a specific project
 */
export function useProjectRole(project?: Project & { memberDetails?: Array<{ userId: string; role?: string }> }) {
  const { profile: currentUser } = useCurrentUser();

  return useMemo(() => {
    if (!currentUser || !project) return null;

    if (project.ownerId === currentUser._id) return "owner";
    
    const membership = project.memberDetails?.find(
      (member) => member.userId === currentUser._id
    );

    return (membership?.role as ProjectMemberRole) || null;
  }, [currentUser, project]);
}