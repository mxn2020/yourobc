// src/features/system/projects/config/index.ts
/**
 * Projects Feature Configuration
 *
 * Manages project creation, collaboration, and organizational settings
 */

import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue, getEnvAsNumber } from '../../_shared/env-utils';
import { ProjectStatus, ProjectVisibility } from '../types';

// ============================================
// 1. TYPES & INTERFACES
// ============================================

export interface ProjectLimits {
  maxProjectsPerUser: number;
  maxProjectsPerTeam: number;
  maxMembersPerProject: number;
  maxTasksPerProject: number;
  maxMilestonesPerProject: number;
  maxStoragePerProjectMB: number;
}

export interface ProjectDefaults {
  visibility: ProjectVisibility;
  status: ProjectStatus;
  allowComments: boolean;
  allowAttachments: boolean;
  requireApproval: boolean;
}

export interface ProjectFeatures {
  templates: boolean;
  milestones: boolean;
  timeTracking: boolean;
  budgetTracking: boolean;
  customFields: boolean;
  automation: boolean;
  integrations: boolean;
  analytics: boolean;
}

// ============================================
// 2. ENVIRONMENT VARIABLES
// ============================================

export const PROJECTS_ENV = {
  // Feature toggle
  ENABLE_PROJECTS: envIsNotFalse('VITE_ENABLE_PROJECTS'),

  // Limits
  MAX_PROJECTS_PER_USER: getEnvAsNumber('VITE_PROJECTS_MAX_PER_USER', 50),
  MAX_PROJECTS_PER_TEAM: getEnvAsNumber('VITE_PROJECTS_MAX_PER_TEAM', 500),
  MAX_MEMBERS_PER_PROJECT: getEnvAsNumber('VITE_PROJECTS_MAX_MEMBERS', 100),
  MAX_TASKS_PER_PROJECT: getEnvAsNumber('VITE_PROJECTS_MAX_TASKS', 1000),
  MAX_MILESTONES_PER_PROJECT: getEnvAsNumber('VITE_PROJECTS_MAX_MILESTONES', 50),
  MAX_STORAGE_MB: getEnvAsNumber('VITE_PROJECTS_MAX_STORAGE_MB', 5000), // 5GB default

  // Defaults
  DEFAULT_VISIBILITY: (getEnvWithDefault('VITE_PROJECTS_DEFAULT_VISIBILITY', 'private') as ProjectVisibility),
  DEFAULT_STATUS: (getEnvWithDefault('VITE_PROJECTS_DEFAULT_STATUS', 'active') as ProjectStatus),

  // Feature flags
  ENABLE_TEMPLATES: envIsNotFalse('VITE_PROJECTS_ENABLE_TEMPLATES'),
  ENABLE_MILESTONES: envIsNotFalse('VITE_PROJECTS_ENABLE_MILESTONES'),
  ENABLE_TIME_TRACKING: envIsTrue('VITE_PROJECTS_ENABLE_TIME_TRACKING'),
  ENABLE_BUDGET_TRACKING: envIsTrue('VITE_PROJECTS_ENABLE_BUDGET_TRACKING'),
  ENABLE_CUSTOM_FIELDS: envIsTrue('VITE_PROJECTS_ENABLE_CUSTOM_FIELDS'),
  ENABLE_AUTOMATION: envIsTrue('VITE_PROJECTS_ENABLE_AUTOMATION'),
  ENABLE_INTEGRATIONS: envIsNotFalse('VITE_PROJECTS_ENABLE_INTEGRATIONS'),
  ENABLE_ANALYTICS: envIsNotFalse('VITE_PROJECTS_ENABLE_ANALYTICS'),

  // Permissions
  ALLOW_COMMENTS: envIsNotFalse('VITE_PROJECTS_ALLOW_COMMENTS'),
  ALLOW_ATTACHMENTS: envIsNotFalse('VITE_PROJECTS_ALLOW_ATTACHMENTS'),
  REQUIRE_APPROVAL: envIsTrue('VITE_PROJECTS_REQUIRE_APPROVAL'),
} as const;

// ============================================
// 3. DEFAULT TEMPLATES
// ============================================

export const PROJECT_TEMPLATES = [
  {
    id: 'software-dev',
    name: 'Software Development',
    description: 'Agile software development with sprints and milestones',
    defaultStatuses: ['backlog', 'in-progress', 'review', 'done'],
    features: {
      milestones: true,
      timeTracking: true,
      customFields: true,
      automation: true,
    },
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns',
    defaultStatuses: ['planning', 'design', 'review', 'launch', 'analysis'],
    features: {
      milestones: true,
      budgetTracking: true,
      analytics: true,
    },
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Organize events with timeline and checklist',
    defaultStatuses: ['planning', 'preparation', 'execution', 'post-event'],
    features: {
      milestones: true,
      timeTracking: false,
      budgetTracking: true,
    },
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Content pipeline for blogs, videos, and social media',
    defaultStatuses: ['ideation', 'draft', 'review', 'scheduled', 'published'],
    features: {
      milestones: false,
      timeTracking: true,
      analytics: true,
    },
  },
] as const;

// ============================================
// 4. MAIN CONFIGURATION OBJECT
// ============================================

export const PROJECTS_CONFIG = {
  // Feature metadata
  name: 'Projects',
  version: '1.0.0',
  enabled: PROJECTS_ENV.ENABLE_PROJECTS,

  // Limits
  limits: {
    maxProjectsPerUser: PROJECTS_ENV.MAX_PROJECTS_PER_USER,
    maxProjectsPerTeam: PROJECTS_ENV.MAX_PROJECTS_PER_TEAM,
    maxMembersPerProject: PROJECTS_ENV.MAX_MEMBERS_PER_PROJECT,
    maxTasksPerProject: PROJECTS_ENV.MAX_TASKS_PER_PROJECT,
    maxMilestonesPerProject: PROJECTS_ENV.MAX_MILESTONES_PER_PROJECT,
    maxStoragePerProjectMB: PROJECTS_ENV.MAX_STORAGE_MB,
  } as ProjectLimits,

  // Defaults
  defaults: {
    visibility: PROJECTS_ENV.DEFAULT_VISIBILITY,
    status: PROJECTS_ENV.DEFAULT_STATUS,
    allowComments: PROJECTS_ENV.ALLOW_COMMENTS,
    allowAttachments: PROJECTS_ENV.ALLOW_ATTACHMENTS,
    requireApproval: PROJECTS_ENV.REQUIRE_APPROVAL,
  } as ProjectDefaults,

  // Feature flags
  features: {
    templates: PROJECTS_ENV.ENABLE_TEMPLATES,
    milestones: PROJECTS_ENV.ENABLE_MILESTONES,
    timeTracking: PROJECTS_ENV.ENABLE_TIME_TRACKING,
    budgetTracking: PROJECTS_ENV.ENABLE_BUDGET_TRACKING,
    customFields: PROJECTS_ENV.ENABLE_CUSTOM_FIELDS,
    automation: PROJECTS_ENV.ENABLE_AUTOMATION,
    integrations: PROJECTS_ENV.ENABLE_INTEGRATIONS,
    analytics: PROJECTS_ENV.ENABLE_ANALYTICS,
  } as ProjectFeatures,

  // Templates
  templates: PROJECTS_ENV.ENABLE_TEMPLATES ? PROJECT_TEMPLATES : [],
} as const;

// ============================================
// 5. VALIDATION FUNCTION
// ============================================

export function validateProjectsConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if feature is enabled
  if (!PROJECTS_ENV.ENABLE_PROJECTS) {
    return { valid: true, errors: [], warnings: ['Projects feature is disabled'] };
  }

  // Validate limits
  if (PROJECTS_ENV.MAX_PROJECTS_PER_USER < 1) {
    errors.push('MAX_PROJECTS_PER_USER must be at least 1');
  }

  if (PROJECTS_ENV.MAX_PROJECTS_PER_TEAM < 1) {
    errors.push('MAX_PROJECTS_PER_TEAM must be at least 1');
  }

  if (PROJECTS_ENV.MAX_MEMBERS_PER_PROJECT < 1) {
    errors.push('MAX_MEMBERS_PER_PROJECT must be at least 1');
  }

  if (PROJECTS_ENV.MAX_TASKS_PER_PROJECT < 1) {
    errors.push('MAX_TASKS_PER_PROJECT must be at least 1');
  }

  // Validate relationships
  if (PROJECTS_ENV.MAX_PROJECTS_PER_USER > PROJECTS_ENV.MAX_PROJECTS_PER_TEAM) {
    warnings.push('MAX_PROJECTS_PER_USER is greater than MAX_PROJECTS_PER_TEAM, this may cause issues');
  }

  // Validate defaults
  const validVisibility: ProjectVisibility[] = ['private', 'team', 'public'];
  if (!validVisibility.includes(PROJECTS_ENV.DEFAULT_VISIBILITY)) {
    errors.push(`Invalid DEFAULT_VISIBILITY: ${PROJECTS_ENV.DEFAULT_VISIBILITY}. Must be one of: ${validVisibility.join(', ')}`);
  }

  const validStatus: ProjectStatus[] = ['active', 'archived', 'on_hold', 'completed', 'cancelled'];
  if (!validStatus.includes(PROJECTS_ENV.DEFAULT_STATUS)) {
    errors.push(`Invalid DEFAULT_STATUS: ${PROJECTS_ENV.DEFAULT_STATUS}. Must be one of: ${validStatus.join(', ')}`);
  }

  // Feature warnings
  if (PROJECTS_ENV.ENABLE_BUDGET_TRACKING && !getEnv('VITE_ENABLE_PAYMENTS')) {
    warnings.push('Budget tracking is enabled but payments feature is disabled');
  }

  if (PROJECTS_ENV.ENABLE_INTEGRATIONS && !getEnv('VITE_ENABLE_INTEGRATIONS')) {
    warnings.push('Project integrations are enabled but integrations feature is disabled');
  }

  if (PROJECTS_ENV.MAX_STORAGE_MB > 10000) {
    warnings.push('Storage limit per project is very high (>10GB), ensure you have sufficient storage capacity');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// 6. HELPER FUNCTIONS
// ============================================

/**
 * Check if projects feature is enabled
 */
export function isProjectsEnabled(): boolean {
  return PROJECTS_ENV.ENABLE_PROJECTS;
}

/**
 * Check if a specific project feature is enabled
 */
export function isProjectFeatureEnabled(feature: keyof ProjectFeatures): boolean {
  return PROJECTS_CONFIG.features[feature];
}

/**
 * Get project limit value
 */
export function getProjectLimit<K extends keyof ProjectLimits>(
  key: K
): ProjectLimits[K] {
  return PROJECTS_CONFIG.limits[key];
}

/**
 * Get project default setting
 */
export function getProjectDefault<K extends keyof ProjectDefaults>(
  key: K
): ProjectDefaults[K] {
  return PROJECTS_CONFIG.defaults[key];
}

/**
 * Check if user has reached project limit
 */
export function hasReachedProjectLimit(currentCount: number, isTeam: boolean = false): boolean {
  const limit = isTeam
    ? PROJECTS_CONFIG.limits.maxProjectsPerTeam
    : PROJECTS_CONFIG.limits.maxProjectsPerUser;
  return currentCount >= limit;
}

/**
 * Check if project can add more members
 */
export function canAddProjectMember(currentMemberCount: number): boolean {
  return currentMemberCount < PROJECTS_CONFIG.limits.maxMembersPerProject;
}

/**
 * Check if project can add more tasks
 */
export function canAddProjectTask(currentTaskCount: number): boolean {
  return currentTaskCount < PROJECTS_CONFIG.limits.maxTasksPerProject;
}

/**
 * Get available templates
 */
export function getAvailableTemplates() {
  return PROJECTS_CONFIG.templates;
}

/**
 * Get template by ID
 */
export function getTemplateById(templateId: string) {
  return PROJECT_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Check if templates are enabled
 */
export function areTemplatesEnabled(): boolean {
  return isProjectFeatureEnabled('templates');
}

// ============================================
// 7. DEFAULT EXPORT
// ============================================

export default PROJECTS_CONFIG;
