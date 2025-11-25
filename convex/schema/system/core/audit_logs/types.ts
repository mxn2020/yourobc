// convex/schema/system/core/audit_logs/types.ts
// Type extractions from validators for audit_logs module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { auditLogsFields, auditLogsValidators } from './validators';
import { auditLogsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type AuditLog = Doc<'auditLogs'>;
export type AuditLogId = Id<'auditLogs'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type AuditLogSchema = Infer<typeof auditLogsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type AuditLogSource = Infer<typeof auditLogsValidators.source>;

// ============================================
// Field Types
// ============================================

export type AuditLogMetadata = Infer<typeof auditLogsFields.auditMetadata>;
