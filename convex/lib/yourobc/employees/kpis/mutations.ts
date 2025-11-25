// convex/lib/yourobc/employees/kpis/mutations.ts
// Write operations for employeeKPIs module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { employeeKPIsValidators } from '@/schema/yourobc/employees/kpis/validators';
import { EMPLOYEE_KPIS_CONSTANTS } from './constants';
import {
  validateEmployeeKPIData,
  calculateAchievementPercentage,
  calculateChangePercentage,
  determineKPIStatus,
} from './utils';
import { requireEditEmployeeKPIAccess, requireDeleteEmployeeKPIAccess } from './permissions';
import type { EmployeeKPI, EmployeeKPIId, UpdateEmployeeKPIData } from './types';

type EmployeeKPIUpdatePatch = Partial<UpdateEmployeeKPIData> &
  Pick<EmployeeKPI, 'updatedAt' | 'updatedBy' | 'achievementPercentage' | 'changePercentage'>;

/**
 * Create new employee KPI
 */
export const createEmployeeKPI = mutation({
  args: {
    data: v.object({
      employeeId: v.id('yourobcEmployees'),
      kpiName: v.string(),
      metricType: v.string(),
      description: v.optional(v.string()),
      targetValue: v.number(),
      currentValue: v.number(),
      period: employeeKPIsValidators.period,
      year: v.number(),
      month: v.optional(v.number()),
      quarter: v.optional(v.number()),
      week: v.optional(v.number()),
      day: v.optional(v.number()),
      startDate: v.number(),
      endDate: v.number(),
      warningThreshold: v.optional(v.number()),
      criticalThreshold: v.optional(v.number()),
      status: v.optional(employeeKPIsValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<EmployeeKPIId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, EMPLOYEE_KPIS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateEmployeeKPIData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'yourobcEmployeeKPIs');
    const now = Date.now();

    // Calculate achievement percentage and status
    const achievementPercentage = calculateAchievementPercentage(data.currentValue, data.targetValue);
    const status = data.status || determineKPIStatus(
      achievementPercentage,
      data.warningThreshold,
      data.criticalThreshold
    );

    // 5. CREATE: Insert into database
    const kpiId = await ctx.db.insert('yourobcEmployeeKPIs', {
      publicId,
      employeeId: data.employeeId,
      kpiName: data.kpiName.trim(),
      metricType: data.metricType.trim(),
      description: data.description?.trim(),
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      achievementPercentage,
      period: data.period,
      year: data.year,
      month: data.month,
      quarter: data.quarter,
      week: data.week,
      day: data.day,
      startDate: data.startDate,
      endDate: data.endDate,
      warningThreshold: data.warningThreshold || EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_WARNING_THRESHOLD,
      criticalThreshold: data.criticalThreshold || EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_CRITICAL_THRESHOLD,
      status,
      notes: data.notes?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeKPIs.created',
      entityType: 'system_employeeKPIs',
      entityId: publicId,
      entityTitle: data.kpiName.trim(),
      description: `Created employee KPI: ${data.kpiName.trim()}`,
      metadata: {
      data: {
        status,
        period: data.period,
        achievementPercentage,
      },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return kpiId;
  },
});

/**
 * Update existing employee KPI
 */
export const updateEmployeeKPI = mutation({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
    updates: v.object({
      kpiName: v.optional(v.string()),
      metricType: v.optional(v.string()),
      description: v.optional(v.string()),
      targetValue: v.optional(v.number()),
      currentValue: v.optional(v.number()),
      historicalData: v.optional(v.array(v.object({
        date: v.number(),
        value: v.number(),
        note: v.optional(v.string()),
      }))),
      previousPeriodValue: v.optional(v.number()),
      warningThreshold: v.optional(v.number()),
      criticalThreshold: v.optional(v.number()),
      status: v.optional(employeeKPIsValidators.status),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { kpiId, updates }): Promise<EmployeeKPIId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const kpi = await ctx.db.get(kpiId);
    if (!kpi || kpi.deletedAt) {
      throw new Error('KPI not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmployeeKPIAccess(ctx, kpi, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateEmployeeKPIData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
  const now = Date.now();
  const updateData: EmployeeKPIUpdatePatch = {
    updatedAt: now,
    updatedBy: user._id,
    achievementPercentage: kpi.achievementPercentage,
    changePercentage: kpi.changePercentage,
  };

    if (updates.kpiName !== undefined) {
      updateData.kpiName = updates.kpiName.trim();
    }
    if (updates.metricType !== undefined) {
      updateData.metricType = updates.metricType.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.targetValue !== undefined) {
      updateData.targetValue = updates.targetValue;
    }
    if (updates.currentValue !== undefined) {
      updateData.currentValue = updates.currentValue;
    }
    if (updates.historicalData !== undefined) {
      updateData.historicalData = updates.historicalData;
    }
    if (updates.previousPeriodValue !== undefined) {
      updateData.previousPeriodValue = updates.previousPeriodValue;
      // Calculate change percentage
      const currentValue = updates.currentValue ?? kpi.currentValue;
      updateData.changePercentage = calculateChangePercentage(currentValue, updates.previousPeriodValue);
    }
    if (updates.warningThreshold !== undefined) {
      updateData.warningThreshold = updates.warningThreshold;
    }
    if (updates.criticalThreshold !== undefined) {
      updateData.criticalThreshold = updates.criticalThreshold;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes?.trim();
    }

    // Recalculate achievement percentage if values changed
    const targetValue = updateData.targetValue ?? kpi.targetValue;
    const currentValue = updateData.currentValue ?? kpi.currentValue;
    const achievementPercentage = calculateAchievementPercentage(currentValue, targetValue);
    updateData.achievementPercentage = achievementPercentage;

    // Update status if not explicitly provided
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    } else {
      const warningThreshold = updateData.warningThreshold ?? kpi.warningThreshold ?? EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_WARNING_THRESHOLD;
      const criticalThreshold = updateData.criticalThreshold ?? kpi.criticalThreshold ?? EMPLOYEE_KPIS_CONSTANTS.THRESHOLDS.DEFAULT_CRITICAL_THRESHOLD;
      updateData.status = determineKPIStatus(achievementPercentage, warningThreshold, criticalThreshold);
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(kpiId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeKPIs.updated',
      entityType: 'system_employeeKPIs',
      entityId: kpi.publicId,
      entityTitle: updateData.kpiName || kpi.kpiName,
      description: `Updated employee KPI: ${updateData.kpiName || kpi.kpiName}`,
      metadata: { data: { changes: updates } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return kpiId;
  },
});

/**
 * Delete employee KPI (soft delete)
 */
export const deleteEmployeeKPI = mutation({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
  },
  handler: async (ctx, { kpiId }): Promise<EmployeeKPIId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const kpi = await ctx.db.get(kpiId);
    if (!kpi || kpi.deletedAt) {
      throw new Error('KPI not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmployeeKPIAccess(kpi, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(kpiId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeKPIs.deleted',
      entityType: 'system_employeeKPIs',
      entityId: kpi.publicId,
      entityTitle: kpi.kpiName,
      description: `Deleted employee KPI: ${kpi.kpiName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return kpiId;
  },
});

/**
 * Restore soft-deleted employee KPI
 */
export const restoreEmployeeKPI = mutation({
  args: {
    kpiId: v.id('yourobcEmployeeKPIs'),
  },
  handler: async (ctx, { kpiId }): Promise<EmployeeKPIId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const kpi = await ctx.db.get(kpiId);
    if (!kpi) {
      throw new Error('KPI not found');
    }
    if (!kpi.deletedAt) {
      throw new Error('KPI is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      kpi.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this KPI');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(kpiId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employeeKPIs.restored',
      entityType: 'system_employeeKPIs',
      entityId: kpi.publicId,
      entityTitle: kpi.kpiName,
      description: `Restored employee KPI: ${kpi.kpiName}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return kpiId;
  },
});
