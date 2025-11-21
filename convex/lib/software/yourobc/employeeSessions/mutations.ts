// convex/lib/software/yourobc/employeeSessions/mutations.ts
// Write operations for employeeSessions module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { employeeSessionsValidators } from '@/schema/software/yourobc/employeeSessions/validators';
import { sessionTypeValidator, breakTypeValidator } from '@/schema/yourobc/base';
import { EMPLOYEE_SESSIONS_CONSTANTS } from './constants';
import { validateEmployeeSessionData, generateSessionId, calculateSessionDuration } from './utils';
import { requireEditEmployeeSessionAccess, requireDeleteEmployeeSessionAccess } from './permissions';
import type { EmployeeSessionId } from './types';

/**
 * Create new employee session
 */
export const createEmployeeSession = mutation({
  args: {
    data: v.object({
      employeeId: v.id('yourobcEmployees'),
      userProfileId: v.id('userProfiles'),
      authUserId: v.string(),
      startTime: v.number(),
      location: v.optional(v.object({
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        address: v.optional(v.string()),
      })),
      sessionType: sessionTypeValidator,
      device: v.optional(v.object({
        userAgent: v.optional(v.string()),
        platform: v.optional(v.string()),
        browser: v.optional(v.string()),
      })),
      ipAddress: v.optional(v.string()),
      status: v.optional(employeeSessionsValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<EmployeeSessionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, EMPLOYEE_SESSIONS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateEmployeeSessionData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcEmployeeSessions');
    const sessionId = generateSessionId(data.employeeId, data.startTime);
    const now = Date.now();

    // 5. CREATE: Insert into database
    const sessionDbId = await ctx.db.insert('yourobcEmployeeSessions', {
      publicId,
      sessionId,
      employeeId: data.employeeId,
      userProfileId: data.userProfileId,
      authUserId: data.authUserId,
      startTime: data.startTime,
      location: data.location,
      lastActivity: data.startTime,
      isActive: true,
      sessionType: data.sessionType,
      device: data.device,
      ipAddress: data.ipAddress,
      breaks: [],
      activityLog: [],
      status: data.status || 'active',
      notes: data.notes?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeSessions.created',
      entityType: 'system_employeeSessions',
      entityId: publicId,
      entityTitle: sessionId,
      description: `Created employee session: ${sessionId}`,
      metadata: {
        status: data.status || 'active',
        sessionType: data.sessionType,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return sessionDbId;
  },
});

/**
 * Update existing employee session
 */
export const updateEmployeeSession = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
    updates: v.object({
      endTime: v.optional(v.number()),
      duration: v.optional(v.number()),
      location: v.optional(v.object({
        latitude: v.optional(v.number()),
        longitude: v.optional(v.number()),
        address: v.optional(v.string()),
      })),
      lastActivity: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
      inactivityStartTime: v.optional(v.number()),
      breaks: v.optional(v.array(v.object({
        startTime: v.number(),
        endTime: v.optional(v.number()),
        type: breakTypeValidator,
        duration: v.optional(v.number()),
      }))),
      status: v.optional(employeeSessionsValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { sessionId, updates }): Promise<EmployeeSessionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const session = await ctx.db.get(sessionId);
    if (!session || session.deletedAt) {
      throw new Error('Session not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmployeeSessionAccess(ctx, session, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateEmployeeSessionData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.endTime !== undefined) {
      updateData.endTime = updates.endTime;
      // Auto-calculate duration if endTime provided
      if (!updates.duration) {
        updateData.duration = calculateSessionDuration(session.startTime, updates.endTime);
      }
    }
    if (updates.duration !== undefined) {
      updateData.duration = updates.duration;
    }
    if (updates.location !== undefined) {
      updateData.location = updates.location;
    }
    if (updates.lastActivity !== undefined) {
      updateData.lastActivity = updates.lastActivity;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }
    if (updates.inactivityStartTime !== undefined) {
      updateData.inactivityStartTime = updates.inactivityStartTime;
    }
    if (updates.breaks !== undefined) {
      updateData.breaks = updates.breaks;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim();
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(sessionId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeSessions.updated',
      entityType: 'system_employeeSessions',
      entityId: session.publicId,
      entityTitle: session.sessionId,
      description: `Updated employee session: ${session.sessionId}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return sessionId;
  },
});

/**
 * Delete employee session (soft delete)
 */
export const deleteEmployeeSession = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, { sessionId }): Promise<EmployeeSessionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const session = await ctx.db.get(sessionId);
    if (!session || session.deletedAt) {
      throw new Error('Session not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmployeeSessionAccess(session, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(sessionId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeSessions.deleted',
      entityType: 'system_employeeSessions',
      entityId: session.publicId,
      entityTitle: session.sessionId,
      description: `Deleted employee session: ${session.sessionId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return sessionId;
  },
});

/**
 * Restore soft-deleted employee session
 */
export const restoreEmployeeSession = mutation({
  args: {
    sessionId: v.id('yourobcEmployeeSessions'),
  },
  handler: async (ctx, { sessionId }): Promise<EmployeeSessionId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    if (!session.deletedAt) {
      throw new Error('Session is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      session.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this session');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(sessionId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeSessions.restored',
      entityType: 'system_employeeSessions',
      entityId: session.publicId,
      entityTitle: session.sessionId,
      description: `Restored employee session: ${session.sessionId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return sessionId;
  },
});
