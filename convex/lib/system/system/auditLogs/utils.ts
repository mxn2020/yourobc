// convex/lib/system/system/auditLogs/utils.ts
// Validation functions and utility helpers for auditLogs module

/**
 * Format audit log display name
 */
export function formatAuditLogDisplayName(log: { action: string; userName: string }): string {
  return `${log.userName}: ${log.action}`;
}

/**
 * Parse action name into readable format
 */
export function formatActionName(action: string): string {
  return action
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
