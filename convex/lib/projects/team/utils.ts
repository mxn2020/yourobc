// convex/lib/projects/team/utils.ts

import { TEAM_CONSTANTS, ROLE_HIERARCHY } from './constants';
import type { ProjectMember } from './types';

export function getRoleWeight(role: ProjectMember['role']): number {
  return ROLE_HIERARCHY[role] || ROLE_HIERARCHY[TEAM_CONSTANTS.ROLE.VIEWER];
}

export function canManageMember(
  managerRole: ProjectMember['role'],
  memberRole: ProjectMember['role']
): boolean {
  // Owners can manage everyone
  if (managerRole === TEAM_CONSTANTS.ROLE.OWNER) return true;

  // Admins can manage members and viewers, but not other admins
  if (managerRole === TEAM_CONSTANTS.ROLE.ADMIN) {
    return (
      memberRole === TEAM_CONSTANTS.ROLE.MEMBER ||
      memberRole === TEAM_CONSTANTS.ROLE.VIEWER
    );
  }

  return false;
}

export function validateMemberData(data: Partial<ProjectMember>): string[] {
  const errors: string[] = [];

  if (data.userId === undefined && !data.userId) {
    errors.push('User ID is required');
  }

  if (data.projectId === undefined && !data.projectId) {
    errors.push('Project ID is required');
  }

  if (data.department && data.department.length > 100) {
    errors.push('Department name must be less than 100 characters');
  }

  if (data.jobTitle && data.jobTitle.length > 100) {
    errors.push('Job title must be less than 100 characters');
  }

  if (
    data.permissions &&
    data.permissions.length > 50
  ) {
    errors.push('Maximum 50 custom permissions allowed');
  }

  return errors;
}

export function canAssignRole(
  assignerRole: ProjectMember['role'],
  targetRole: ProjectMember['role']
): boolean {
  const assignerWeight = getRoleWeight(assignerRole);
  const targetWeight = getRoleWeight(targetRole);

  // Can only assign roles lower than your own
  return assignerWeight > targetWeight;
}

export function isMemberActive(member: ProjectMember): boolean {
  return (
    member.status === TEAM_CONSTANTS.STATUS.ACTIVE &&
    !member.deletedAt
  );
}

export function getMemberActivityStatus(member: ProjectMember): 'active' | 'idle' | 'inactive' {
  if (!member.lastActiveAt) return 'inactive';

  const now = Date.now();
  const daysSinceActive = (now - member.lastActiveAt) / (1000 * 60 * 60 * 24);

  if (daysSinceActive < 7) return 'active';
  if (daysSinceActive < 30) return 'idle';
  return 'inactive';
}