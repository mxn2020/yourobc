// src/features/yourobc/tasks/config/tasksConfig.ts
/**
 * Tasks Module Configuration
 * This configuration file allows enabling/disabling features of the tasks module
 */

export interface TasksConfig {
  // Core task features
  core: {
    automaticTaskGeneration: boolean // Auto-generate tasks based on shipment status
    manualTaskCreation: boolean // Users can manually create tasks
    taskDelegation: boolean // Tasks can be assigned to team members
    nextTaskDisplay: boolean // Show next pending task in dashboard
  }

  // Dashboard display features
  dashboard: {
    enabled: boolean
    taskDashboard: boolean // Enable the new Task Dashboard page
    combinedView: boolean // Show combined view (shipments, tasks, quotes)
    detailedView: boolean // Show detailed view with tabs
    statsOverview: boolean // Show statistics overview cards
    refreshing: boolean // Allow manual refresh
    autoRefresh: boolean // Enable auto-refresh functionality
    showTasksInShipmentTable: boolean
    showTaskFilters: boolean
    showSlaWarnings: boolean
    showAssignee: boolean
    compactModeInTable: boolean
  }

  // SLA (Service Level Agreement) features
  sla: {
    enabled: boolean
    slaWarningMinutes: number // Warning time before SLA deadline (default: 15)
    showTimeRemaining: boolean
    showOverdueBadges: boolean
  }

  // Notification features
  notifications: {
    enabled: boolean
    slaWarnings: boolean // Push notifications before SLA deadline
    taskAssignments: boolean // Notify when task is assigned
    inAppNotifications: boolean
    emailNotifications: boolean
  }

  // Task management features
  management: {
    allowDelegation: boolean // Admins/Managers can reassign tasks
    allowEditing: boolean // Edit task details
    allowDeletion: boolean
    preserveDeadlineOnDelegation: boolean
  }

  // Automatic task creation rules
  automation: {
    enabled: boolean
    createOnStatusChange: boolean
    requirePodCompletionChecks: boolean
    requireCustomerReference: boolean
    requireNfoHawbMawb: boolean // NFO shipments require HAWB/MAWB
    requireCostChecks: boolean
  }

  // Validation rules
  validation: {
    blockWithoutCustomerReference: boolean
    blockWithoutHawbMawb: boolean
    showCostConfirmationPopup: boolean
  }

  // UI/Display features
  ui: {
    showPriorityIcons: boolean
    showOverdueBadges: boolean
    showTimeRemaining: boolean
    compactMode: boolean
  }

  // Advanced features
  advanced: {
    taskTemplates: boolean
    bulkOperations: boolean
    taskDependencies: boolean
    recurringTasks: boolean
    taskComments: boolean
    taskAttachments: boolean
  }
}

/**
 * Default configuration matching YOUROBC.md requirements
 */
export const DEFAULT_TASKS_CONFIG: TasksConfig = {
  core: {
    automaticTaskGeneration: true,
    manualTaskCreation: true,
    taskDelegation: true,
    nextTaskDisplay: true,
  },

  dashboard: {
    enabled: true,
    taskDashboard: true,
    combinedView: true,
    detailedView: true,
    statsOverview: true,
    refreshing: true,
    autoRefresh: true,
    showTasksInShipmentTable: true,
    showTaskFilters: true,
    showSlaWarnings: true,
    showAssignee: true,
    compactModeInTable: true,
  },

  sla: {
    enabled: true,
    slaWarningMinutes: 15,
    showTimeRemaining: true,
    showOverdueBadges: true,
  },

  notifications: {
    enabled: true,
    slaWarnings: true,
    taskAssignments: true,
    inAppNotifications: true,
    emailNotifications: false, // Disabled as per YOUROBC.md
  },

  management: {
    allowDelegation: true,
    allowEditing: true,
    allowDeletion: false, // Not mentioned in requirements
    preserveDeadlineOnDelegation: true,
  },

  automation: {
    enabled: true,
    createOnStatusChange: true,
    requirePodCompletionChecks: true,
    requireCustomerReference: true,
    requireNfoHawbMawb: true,
    requireCostChecks: true,
  },

  validation: {
    blockWithoutCustomerReference: true,
    blockWithoutHawbMawb: true,
    showCostConfirmationPopup: true,
  },

  ui: {
    showPriorityIcons: true,
    showOverdueBadges: true,
    showTimeRemaining: true,
    compactMode: true,
  },

  advanced: {
    taskTemplates: false,
    bulkOperations: false,
    taskDependencies: false,
    recurringTasks: false,
    taskComments: false,
    taskAttachments: false,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_TASKS_CONFIG: TasksConfig = {
  core: {
    automaticTaskGeneration: true,
    manualTaskCreation: true,
    taskDelegation: true,
    nextTaskDisplay: true,
  },

  dashboard: {
    enabled: true,
    taskDashboard: true,
    combinedView: true,
    detailedView: false,
    statsOverview: true,
    refreshing: true,
    autoRefresh: false,
    showTasksInShipmentTable: true,
    showTaskFilters: false,
    showSlaWarnings: true,
    showAssignee: true,
    compactModeInTable: true,
  },

  sla: {
    enabled: true,
    slaWarningMinutes: 15,
    showTimeRemaining: false,
    showOverdueBadges: false,
  },

  notifications: {
    enabled: true,
    slaWarnings: true,
    taskAssignments: true,
    inAppNotifications: true,
    emailNotifications: false,
  },

  management: {
    allowDelegation: true,
    allowEditing: false,
    allowDeletion: false,
    preserveDeadlineOnDelegation: true,
  },

  automation: {
    enabled: true,
    createOnStatusChange: true,
    requirePodCompletionChecks: true,
    requireCustomerReference: true,
    requireNfoHawbMawb: true,
    requireCostChecks: true,
  },

  validation: {
    blockWithoutCustomerReference: true,
    blockWithoutHawbMawb: true,
    showCostConfirmationPopup: true,
  },

  ui: {
    showPriorityIcons: false,
    showOverdueBadges: true,
    showTimeRemaining: false,
    compactMode: true,
  },

  advanced: {
    taskTemplates: false,
    bulkOperations: false,
    taskDependencies: false,
    recurringTasks: false,
    taskComments: false,
    taskAttachments: false,
  },
}

/**
 * Get the current tasks module configuration
 */
export function getTasksConfig(): TasksConfig {
  const configOverride = process.env.NEXT_PUBLIC_TASKS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_TASKS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse TASKS_CONFIG, using defaults')
    }
  }

  return DEFAULT_TASKS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: TasksConfig,
  category: keyof TasksConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Get a configuration value
 */
export function getConfigValue<T>(
  config: TasksConfig,
  category: keyof TasksConfig,
  feature: string
): T {
  const categoryConfig = config[category] as any
  return categoryConfig[feature] as T
}

/**
 * Get SLA warning time in minutes
 */
export function getSlaWarningMinutes(config: TasksConfig): number {
  return config.sla.slaWarningMinutes
}

export const TASKS_CONFIG = getTasksConfig()

export default TASKS_CONFIG
