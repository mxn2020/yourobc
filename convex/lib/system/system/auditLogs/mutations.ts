// convex/lib/system/system/auditLogs/mutations.ts
// Write operations for auditLogs module (admin only)

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/lib/auth.helper';
import { requireDeleteAuditLogAccess } from './permissions';
import type { AuditLogId } from './types';

/**
 * Delete audit log (soft delete) - Admin only
 * Note: Audit logs are typically never deleted, but this is provided for compliance
 */
export const deleteAuditLog = mutation({
  args: { auditLogId: v.id('auditLogs') },
  handler: async (ctx, { auditLogId }): Promise<AuditLogId> => {
    const user = await requireCurrentUser(ctx);
    const auditLog = await ctx.db.get(auditLogId);
    if (!auditLog || auditLog.deletedAt) {
      throw new Error('Audit log not found');
    }

    await requireDeleteAuditLogAccess(auditLog, user);

    const now = Date.now();
    await ctx.db.patch(auditLogId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return auditLogId;
  },
});
