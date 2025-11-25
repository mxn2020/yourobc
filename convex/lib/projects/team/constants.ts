// convex/lib/projects/team/constants.ts

export const TEAM_CONSTANTS = {
  ROLE: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    INVITED: 'invited',
    REMOVED: 'removed',
  },
  PERMISSIONS: {
    VIEW: 'team.view',
    INVITE: 'team.invite',
    REMOVE: 'team.remove',
    UPDATE_ROLE: 'team.update_role',
  },
  LIMITS: {
    MAX_MEMBERS_PER_PROJECT: 100,
  },
} as const;

export const ROLE_HIERARCHY = {
  [TEAM_CONSTANTS.ROLE.OWNER]: 4,
  [TEAM_CONSTANTS.ROLE.ADMIN]: 3,
  [TEAM_CONSTANTS.ROLE.MEMBER]: 2,
  [TEAM_CONSTANTS.ROLE.VIEWER]: 1,
} as const;

// Type exports for TypeScript safety
export type TeamRole = typeof TEAM_CONSTANTS.ROLE[keyof typeof TEAM_CONSTANTS.ROLE];
export type TeamStatus = typeof TEAM_CONSTANTS.STATUS[keyof typeof TEAM_CONSTANTS.STATUS];