/**
 * YourOBC Employees Mutations
 *
 * This module handles all employee-related mutations including creation,
 * updates, time entries, and vacation requests.
 *
 * @module convex/lib/yourobc/employees/mutations
 */

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { EMPLOYEE_CONSTANTS } from './constants';
import {
  validateEmployeeData,
  generateEmployeeNumber,
  validateVacationData,
  calculateVacationDays,
  getCurrentVacationEntry,
  buildVacationStatusObject,
  buildRecentVacationsArray,
  shouldUpdateEmployeeVacationStatus
} from './utils';
import {
  employeeStatusValidator,
  vacationTypeValidator,
  vacationStatusValidator,
  timeEntryTypeValidator
} from '../../../schema/yourobc/base';

/**
 * Office schema validator
 */
const officeSchema = v.object({
  location: v.string(),
  country: v.string(),
  countryCode: v.string(),
  address: v.optional(v.string()),
});

/**
 * Emergency contact schema validator
 */
const emergencyContactSchema = v.object({
  name: v.string(),
  phone: v.string(),
  relationship: v.string(),
});

/**
 * Time entry schema validator
 */
const timeEntrySchema = v.object({
  type: timeEntryTypeValidator,
  timestamp: v.number(),
  location: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const createEmployee = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      userProfileId: v.id('userProfiles'),
      authUserId: v.string(),
      employeeNumber: v.optional(v.string()),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      managerId: v.optional(v.id('yourobcEmployees')),
      office: officeSchema,
      hireDate: v.optional(v.number()),
      workPhone: v.optional(v.string()),
      workEmail: v.optional(v.string()),
      emergencyContact: v.optional(emergencyContactSchema),
      timezone: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateEmployeeData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const userProfile = await ctx.db.get(data.userProfileId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const existing = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', data.authUserId))
      .first();

    if (existing) {
      throw new Error('Employee record already exists for this user');
    }

    let employeeNumber = data.employeeNumber;
    if (!employeeNumber) {
      const existingEmployees = await ctx.db.query('yourobcEmployees').collect();
      employeeNumber = generateEmployeeNumber('office', existingEmployees.length + 1);
    }

    const existingNumber = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_employeeNumber', (q) => q.eq('employeeNumber', employeeNumber))
      .first();

    if (existingNumber) {
      throw new Error('Employee number already exists');
    }

    if (data.managerId) {
      const manager = await ctx.db.get(data.managerId);
      if (!manager) {
        throw new Error('Manager not found');
      }
    }

    const now = Date.now();

    const employeeData = {
      userProfileId: data.userProfileId,
      authUserId: data.authUserId,
      employeeNumber,
      type: EMPLOYEE_CONSTANTS.TYPE.OFFICE,
      department: data.department,
      position: data.position,
      managerId: data.managerId,
      office: data.office,
      hireDate: data.hireDate,
      workPhone: data.workPhone?.trim(),
      workEmail: data.workEmail?.trim(),
      emergencyContact: data.emergencyContact,
      status: EMPLOYEE_CONSTANTS.STATUS.ACTIVE,
      workStatus: EMPLOYEE_CONSTANTS.WORK_STATUS.AVAILABLE,
      isActive: true,
      isOnline: false,
      timeEntries: [] as Array<{
        type: 'login' | 'logout';
        timestamp: number;
        location?: string;
        notes?: string;
      }>,
      timezone: data.timezone || EMPLOYEE_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
      createdAt: now,
      updatedAt: now,
    };

    const employeeId = await ctx.db.insert('yourobcEmployees', employeeData as any);

    // Create initial vacation days record for the current year
    const currentYear = new Date().getFullYear();
    const annualEntitlement = EMPLOYEE_CONSTANTS.DEFAULT_VALUES.ANNUAL_VACATION_DAYS;
    await ctx.db.insert('yourobcVacationDays', {
      employeeId,
      year: currentYear,
      annualEntitlement,
      carryoverDays: 0,
      available: annualEntitlement,
      used: 0,
      pending: 0,
      remaining: annualEntitlement,
      entries: [],
      createdAt: now,
      createdBy: authUserId,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.created',
      entityType: 'yourobc_employee',
      entityId: employeeId,
      entityTitle: `Employee ${employeeNumber}`,
      description: `Created employee record for ${userProfile.name}`,
      createdAt: now,
    });

    return employeeId;
  },
});

export const updateEmployee = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
    data: v.object({
      employeeNumber: v.optional(v.string()),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      managerId: v.optional(v.id('yourobcEmployees')),
      office: v.optional(officeSchema),
      hireDate: v.optional(v.number()),
      workPhone: v.optional(v.string()),
      workEmail: v.optional(v.string()),
      emergencyContact: v.optional(emergencyContactSchema),
      status: v.optional(employeeStatusValidator),
      isActive: v.optional(v.boolean()),
      isOnline: v.optional(v.boolean()),
      timezone: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, employeeId, data }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.EDIT);

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const errors = validateEmployeeData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    if (data.employeeNumber && data.employeeNumber !== employee.employeeNumber) {
      const employeeNumber = data.employeeNumber;
      const existing = await ctx.db
        .query('yourobcEmployees')
        .withIndex('by_employeeNumber', (q) => q.eq('employeeNumber', employeeNumber))
        .first();

      if (existing && existing._id !== employeeId) {
        throw new Error('Employee number already exists');
      }
    }

    if (data.managerId) {
      const manager = await ctx.db.get(data.managerId);
      if (!manager) {
        throw new Error('Manager not found');
      }
      
      if (data.managerId === employeeId) {
        throw new Error('Employee cannot be their own manager');
      }
    }

    const now = Date.now();
    const updateData = { 
      ...data,
      updatedAt: now,
    };
    
    if (data.workPhone) updateData.workPhone = data.workPhone.trim();
    if (data.workEmail) updateData.workEmail = data.workEmail.trim();

    await ctx.db.patch(employeeId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.updated',
      entityType: 'yourobc_employee',
      entityId: employeeId,
      entityTitle: `Employee ${employee.employeeNumber}`,
      description: `Updated employee record`,
      createdAt: now,
    });

    return employeeId;
  },
});

export const recordEmployeeTimeEntry = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    timeEntry: timeEntrySchema,
  },
  handler: async (ctx, { authUserId, employeeId, timeEntry }) => {
    let employee;
    if (employeeId) {
      await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW_TIME_ENTRIES);
      employee = await ctx.db.get(employeeId);
    } else {
      employee = await ctx.db
        .query('yourobcEmployees')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
    }

    if (!employee) {
      throw new Error('Employee not found');
    }

    const updatedEntries = [...employee.timeEntries, timeEntry];

    await ctx.db.patch(employee._id, {
      timeEntries: updatedEntries,
      updatedAt: Date.now(),
    });

    return employee._id;
  },
});

export const deleteEmployee = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { authUserId, employeeId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.DELETE);

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if employee is managing other employees
    const managedEmployees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_manager', (q) => q.eq('managerId', employeeId))
      .first();

    if (managedEmployees) {
      throw new Error('Cannot delete employee who manages other employees. Reassign managed employees first.');
    }

    const now = Date.now();

    // Soft delete employee
    await ctx.db.patch(employeeId, {
      deletedAt: now,
      deletedBy: authUserId,
    });

    // Soft delete related vacation records
    const vacationRecords = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
      .collect();

    for (const vacationRecord of vacationRecords) {
      await ctx.db.patch(vacationRecord._id, {
        deletedAt: now,
        deletedBy: authUserId,
      });
    }
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.deleted',
      entityType: 'yourobc_employee',
      entityId: employeeId,
      entityTitle: `Employee ${employee.employeeNumber}`,
      description: `Deleted employee record`,
      createdAt: now,
    });

    return employeeId;
  },
});

export const requestVacation = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    data: v.object({
      year: v.number(),
      startDate: v.number(),
      endDate: v.number(),
      days: v.number(),
      type: vacationTypeValidator,
      reason: v.optional(v.string()),
      emergencyContact: v.optional(emergencyContactSchema),
    })
  },
  handler: async (ctx, { authUserId, employeeId, data }) => {
    let targetEmployeeId = employeeId;
    if (!targetEmployeeId) {
      const employee = await ctx.db
        .query('yourobcEmployees')
        .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
        .first();
      
      if (!employee) {
        throw new Error('Employee record not found');
      }
      targetEmployeeId = employee._id;
    }

    if (targetEmployeeId !== employeeId) {
      await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.EDIT_VACATIONS);
    }

    const errors = validateVacationData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const employee = await ctx.db.get(targetEmployeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const allVacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee', (q) => q.eq('employeeId', targetEmployeeId))
      .filter((q) => q.eq(q.field('year'), data.year))
      .collect();

    let vacationDays = allVacationDays[0];

    if (!vacationDays) {
      // Create vacation days record for the year
      const now = Date.now();
      const annualEntitlement = EMPLOYEE_CONSTANTS.DEFAULT_VALUES.ANNUAL_VACATION_DAYS;
      const vacationId = await ctx.db.insert('yourobcVacationDays', {
        employeeId: targetEmployeeId,
        year: data.year,
        annualEntitlement,
        carryoverDays: 0,
        available: annualEntitlement,
        used: 0,
        pending: 0,
        remaining: annualEntitlement,
        entries: [],
        createdAt: now,
        createdBy: authUserId,
      });

      // Fetch the newly created record
      const fetchedVacationDays = await ctx.db.get(vacationId);
      if (!fetchedVacationDays) {
        throw new Error('Failed to create vacation days record');
      }
      vacationDays = fetchedVacationDays;
    }

    // Check for overlapping vacation requests
    const hasOverlap = vacationDays.entries.some(entry => 
      (data.startDate <= entry.endDate && data.endDate >= entry.startDate)
    );

    if (hasOverlap) {
      throw new Error('Vacation request overlaps with existing vacation');
    }

    const newEntry = {
      entryId: `VAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      type: data.type,
      status: 'pending' as const,
      requestedBy: authUserId,
      requestedDate: Date.now(),
      reason: data.reason,
      emergencyContact: data.emergencyContact,
    };

    const updatedEntries = [...vacationDays.entries, newEntry];

    await ctx.db.patch(vacationDays._id, {
      entries: updatedEntries,
      updatedAt: Date.now(),
    });

    return vacationDays._id;
  },
});

export const approveVacation = mutation({
  args: {
    authUserId: v.string(),
    vacationDayId: v.id('yourobcVacationDays'),
    entryIndex: v.number(),
    approved: v.boolean(), // true=approve, false=reject
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, vacationDayId, entryIndex, approved, reason }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.APPROVE_VACATIONS);

    const vacationDays = await ctx.db.get(vacationDayId);
    if (!vacationDays) {
      throw new Error('Vacation record not found');
    }

    if (entryIndex < 0 || entryIndex >= vacationDays.entries.length) {
      throw new Error('Invalid vacation entry index');
    }

    const employee = await ctx.db.get(vacationDays.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const approver = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', authUserId))
      .first();

    if (!approver) {
      throw new Error('Approver employee record not found');
    }

    const updatedEntries = [...vacationDays.entries];
    const now = Date.now();
    const oldEntry = vacationDays.entries[entryIndex];

    if (approved) {
      // Approve the request
      updatedEntries[entryIndex] = {
        ...oldEntry,
        status: 'approved' as const,
        approvedBy: authUserId,
        approvedDate: now,
        approvalNotes: reason,
      };
    } else {
      // Reject the request
      updatedEntries[entryIndex] = {
        ...oldEntry,
        status: 'rejected' as const,
        rejectedBy: authUserId,
        rejectedDate: now,
        rejectionReason: reason,
      };
    }

    // Update used/pending days
    let newUsedDays = vacationDays.used;
    let newPending = vacationDays.pending;
    let newRemaining = vacationDays.remaining;

    if (approved && oldEntry.status === 'pending') {
      // Move from pending to used
      newPending -= oldEntry.days;
      newUsedDays += oldEntry.days;
      newRemaining = vacationDays.available - newUsedDays - newPending;
    } else if (!approved && oldEntry.status === 'pending') {
      // Remove from pending
      newPending -= oldEntry.days;
      newRemaining = vacationDays.available - newUsedDays - newPending;
    }

    await ctx.db.patch(vacationDayId, {
      entries: updatedEntries,
      used: newUsedDays,
      pending: newPending,
      remaining: newRemaining,
      updatedAt: now,
    });

    // Sync employee vacation status
    const updatedEntry = updatedEntries[entryIndex];

    if (approved && shouldUpdateEmployeeVacationStatus(updatedEntry, now)) {
      // Vacation is approved and currently active - update employee record
      const vacationStatus = buildVacationStatusObject(updatedEntry, now);
      await ctx.db.patch(employee._id, {
        currentVacationStatus: vacationStatus,
        updatedAt: now,
      });
    } else if (!approved && employee.currentVacationStatus?.vacationEntryId === updatedEntry.entryId) {
      // Vacation was rejected/cancelled and it was the current vacation - clear it
      await ctx.db.patch(employee._id, {
        currentVacationStatus: undefined,
        updatedAt: now,
      });
    }

    return vacationDayId;
  },
});

/**
 * Sync employee vacation status
 * Updates the employee's currentVacationStatus based on their vacation entries
 * Call this to refresh vacation status when needed
 */
export const syncEmployeeVacationStatus = mutation({
  args: {
    authUserId: v.string(),
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { authUserId, employeeId }) => {
    await requireCurrentUser(ctx, authUserId);

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const now = Date.now();
    const currentYear = new Date(now).getFullYear();

    // Get vacation days for current year
    const vacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) => q.eq('employeeId', employeeId).eq('year', currentYear))
      .first();

    if (!vacationDays) {
      // No vacation record - clear any existing status
      if (employee.currentVacationStatus) {
        await ctx.db.patch(employeeId, {
          currentVacationStatus: undefined,
          updatedAt: now,
        });
      }
      return { updated: false, status: 'no_vacation_record' };
    }

    // Find current vacation entry
    const currentVacation = getCurrentVacationEntry(vacationDays.entries, now);

    if (currentVacation) {
      // Employee is on vacation - update status
      const vacationStatus = buildVacationStatusObject(currentVacation, now);
      await ctx.db.patch(employeeId, {
        currentVacationStatus: vacationStatus,
        updatedAt: now,
      });
      return { updated: true, status: 'on_vacation', vacationEntryId: currentVacation.entryId };
    } else if (employee.currentVacationStatus) {
      // Employee was on vacation but vacation has ended
      // Move to recent vacations and clear current status
      const completedVacation = {
        entryId: employee.currentVacationStatus.vacationEntryId,
        startDate: employee.currentVacationStatus.startDate,
        endDate: employee.currentVacationStatus.endDate,
        days: Math.ceil((employee.currentVacationStatus.endDate - employee.currentVacationStatus.startDate) / (1000 * 60 * 60 * 24)) + 1,
        type: employee.currentVacationStatus.type,
      };

      const recentVacations = buildRecentVacationsArray(employee.recentVacations, completedVacation);

      await ctx.db.patch(employeeId, {
        currentVacationStatus: undefined,
        recentVacations,
        updatedAt: now,
      });
      return { updated: true, status: 'vacation_ended' };
    }

    return { updated: false, status: 'not_on_vacation' };
  },
});