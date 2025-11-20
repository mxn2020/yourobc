// src/features/boilerplate/[module_name]/config/index.ts

/**
 * [Module] Feature Configuration
 * Centralized configuration for the [module_name] feature
 */

export const [MODULE]_CONFIG = {
  // ==========================================
  // FEATURE FLAGS
  // ==========================================
  features: {
    enableComments: true,
    enableAttachments: true,
    enableNotifications: true,
    enableAuditLog: true,
    enableVersioning: false,
    enableTemplates: false,
    enableExport: true,
    enableImport: false,
    enableArchive: true,
    enableTeamCollaboration: true,
    enablePublicSharing: true,
  },

  // ==========================================
  // UI SETTINGS
  // ==========================================
  ui: {
    defaultViewMode: "grid" as const,
    defaultSortBy: "createdAt" as const,
    defaultSortOrder: "desc" as const,
    itemsPerPage: 20,
    maxItemsPerPage: 100,
    enableCardView: true,
    enableTableView: true,
    enableKanbanView: false,
    enableCalendarView: false,
    showStatsSection: true,
    showQuickFilters: true,
    showHelpSection: true,
    compactMode: false,
  },

  // ==========================================
  // QUERY SETTINGS
  // ==========================================
  queries: {
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 1000,
  },

  // ==========================================
  // FORM SETTINGS
  // ==========================================
  forms: {
    autosave: false,
    autosaveDelay: 3000, // 3 seconds
    showCharacterCount: true,
    showFieldHelp: true,
    validateOnBlur: true,
    validateOnChange: false,
  },

  // ==========================================
  // NOTIFICATION SETTINGS
  // ==========================================
  notifications: {
    showCreateSuccess: true,
    showUpdateSuccess: true,
    showDeleteSuccess: true,
    showErrors: true,
    autoCloseDelay: 5000, // 5 seconds
    position: "top-right" as const,
  },

  // ==========================================
  // PERMISSIONS
  // ==========================================
  permissions: {
    requireAuthForView: false,
    requireAuthForCreate: true,
    requireAuthForEdit: true,
    requireAuthForDelete: true,
    allowGuestView: true,
    allowPublicSharing: true,
  },

  // ==========================================
  // AUDIT LOG SETTINGS
  // ==========================================
  audit: {
    enabled: true,
    logCreated: true,
    logUpdated: true,
    logDeleted: true,
    logViewed: false,
    logExported: true,
    retentionDays: 90,
  },

  // ==========================================
  // EXPORT SETTINGS
  // ==========================================
  export: {
    allowedFormats: ["json", "csv", "pdf"] as const,
    includeMetadata: true,
    includeAuditLog: false,
    maxBatchSize: 1000,
  },

  // ==========================================
  // SEARCH SETTINGS
  // ==========================================
  search: {
    minSearchLength: 2,
    debounceDelay: 300, // milliseconds
    searchFields: ["title", "description", "tags", "category"],
    caseSensitive: false,
    fuzzyMatch: false,
  },

  // ==========================================
  // ADVANCED FEATURES
  // ==========================================
  advanced: {
    enableBulkActions: true,
    enableAdvancedFilters: true,
    enableSavedFilters: false,
    enableCustomFields: false,
    enableWorkflows: false,
    enableAutomations: false,
    enableIntegrations: false,
  },
} as const;

// ==========================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// ==========================================

/**
 * Get configuration with environment-specific overrides
 */
export function get[Module]Config() {
  const config = { ...[MODULE]_CONFIG };

  // Development overrides
  if (import.meta.env.DEV) {
    config.queries.refetchOnWindowFocus = true;
    config.forms.autosave = true;
    config.audit.logViewed = true;
  }

  // Production overrides
  if (import.meta.env.PROD) {
    config.queries.retry = 5;
    config.notifications.autoCloseDelay = 3000;
  }

  return config;
}

// ==========================================
// TYPE EXPORTS
// ==========================================

export type [Module]Config = typeof [MODULE]_CONFIG;
export type [Module]ViewMode = typeof [MODULE]_CONFIG.ui.defaultViewMode;
export type [Module]ExportFormat = typeof [MODULE]_CONFIG.export.allowedFormats[number];
