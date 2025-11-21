// convex/lib/system/blog/providerSync/constants.ts
export const BLOG_PROVIDER_SYNC_CONSTANTS = {
  PERMISSIONS: { VIEW: 'blog_provider_sync:view', CREATE: 'blog_provider_sync:create', EDIT: 'blog_provider_sync:edit', DELETE: 'blog_provider_sync:delete', SYNC: 'blog_provider_sync:sync' },
  STATUS: { ENABLED: 'enabled', DISABLED: 'disabled' },
  SYNC_DIRECTION: { IMPORT: 'import', EXPORT: 'export', BIDIRECTIONAL: 'bidirectional' },
  SYNC_STATUS: { SUCCESS: 'success', PARTIAL: 'partial', ERROR: 'error' },
  LIMITS: { MAX_TITLE_LENGTH: 100, MAX_API_URL_LENGTH: 500, MIN_SYNC_INTERVAL: 300000 },
  DEFAULTS: { STATUS: 'disabled' as const, ENABLED: false, AUTO_SYNC: false, SYNC_INTERVAL: 3600000 },
} as const;
