// convex/lib/yourobc/employees/mutations.ts
// Write operations for employees module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { employeesValidators } from '@/schema/yourobc/employees/validators';
import { EMPLOYEES_CONSTANTS } from './constants';
import { validateEmployeeData, validateVacationRequest, sanitizeEmployeeData } from './utils';
import {
  requireEditEmployeeAccess,
  requireDeleteEmployeeAccess,
  requireEditSalaryAccess,
  requireApproveVacationAccess,
  canEditEmployee,
  canDeleteEmployee,
} from './permissions';
import type {
  Employee,
  EmployeeId,
  UpdateEmployeeData,
  VacationDaysId,
  VacationRequest,
} from './types';

type EmployeeUpdatePatch = Partial<UpdateEmployeeData> & Pick<Employee, 'updatedAt' | 'updatedBy'>;

// ============================================================================
// Employee Operations
// ============================================================================

/**
 * Create new employee
 */
export const createEmployee = mutation({
  args: {
    data: v.object({
      name: v.string(),
      userProfileId: v.id('userProfiles'),
      authUserId: v.string(),
      employeeNumber: v.string(),
      type: v.optional(v.literal('office')),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      managerId: v.optional(v.id('yourobcEmployees')),
      employmentType: v.optional(employeesValidators.employmentType),
      office: v.object({
        location: v.string(),
        country: v.string(),
        countryCode: v.string(),
        address: v.optional(v.string()),
      }),
      hireDate: v.optional(v.number()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      salary: v.optional(v.number()),
      currency: v.optional(v.string()),
      paymentFrequency: v.optional(v.union(
        v.literal('hourly'),
        v.literal('weekly'),
        v.literal('bi_weekly'),
        v.literal('monthly'),
        v.literal('annually')
      )),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      workPhone: v.optional(v.string()),
      workEmail: v.optional(v.string()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
      })),
      status: v.optional(employeesValidators.status),
      workStatus: v.optional(employeesValidators.workStatus),
      timezone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<EmployeeId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, EMPLOYEES_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateEmployeeData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Sanitize and prepare data
    const sanitized = sanitizeEmployeeData(data);
    const publicId = await generateUniquePublicId(ctx, 'yourobcEmployees');
    const now = Date.now();

    // 5. CREATE: Insert into database
    const employeeId = await ctx.db.insert('yourobcEmployees', {
      publicId,
      name: sanitized.name,
      userProfileId: sanitized.userProfileId,
      authUserId: sanitized.authUserId,
      employeeNumber: sanitized.employeeNumber,
      type: sanitized.type || 'office',
      department: sanitized.department || '',
      position: sanitized.position || '',
      managerId: sanitized.managerId,
      employmentType: sanitized.employmentType,
      office: sanitized.office,
      hireDate: sanitized.hireDate,
      startDate: sanitized.startDate,
      endDate: sanitized.endDate,
      phone: sanitized.phone || '',
      workPhone: sanitized.workPhone || '',
      workEmail: sanitized.workEmail || '',
      emergencyContact: sanitized.emergencyContact,
      status: sanitized.status || EMPLOYEES_CONSTANTS.STATUS.ACTIVE,
      workStatus: sanitized.workStatus,
      isActive: true,
      isOnline: false,
      timezone: sanitized.timezone || EMPLOYEES_CONSTANTS.DEFAULT_TIMEZONE,
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
      action: 'employee.created',
      entityType: 'system_employee',
      entityId: publicId,
      entityTitle: sanitized.name,
      description: `Created employee: ${sanitized.name}`,
      metadata: {
        data: {
          status: sanitized.status || EMPLOYEES_CONSTANTS.STATUS.ACTIVE,
          department: sanitized.department || '',
          position: sanitized.position || '',
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    }
    );

    // 7. RETURN: Return entity ID
    return employeeId;
  },
});

/**
 * Update existing employee
 */
export const updateEmployee = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    updates: v.object({
      name: v.optional(v.string()),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      managerId: v.optional(v.id('yourobcEmployees')),
      employmentType: v.optional(employeesValidators.employmentType),
      office: v.optional(v.object({
        location: v.string(),
        country: v.string(),
        countryCode: v.string(),
        address: v.optional(v.string()),
      })),
      hireDate: v.optional(v.number()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      workPhone: v.optional(v.string()),
      workEmail: v.optional(v.string()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
      })),
      status: v.optional(employeesValidators.status),
      workStatus: v.optional(employeesValidators.workStatus),
      isActive: v.optional(v.boolean()),
      timezone: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { employeeId, updates }): Promise<EmployeeId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const employee = await ctx.db.get(employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditEmployeeAccess(ctx, employee, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateEmployeeData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Sanitize and prepare update data
    const sanitized = sanitizeEmployeeData(updates);
    const now = Date.now();
    const updateData: EmployeeUpdatePatch = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (sanitized.name !== undefined) updateData.name = sanitized.name;
    if (sanitized.department !== undefined) updateData.department = sanitized.department;
    if (sanitized.position !== undefined) updateData.position = sanitized.position;
    if (sanitized.managerId !== undefined) updateData.managerId = sanitized.managerId;
    if (sanitized.employmentType !== undefined) updateData.employmentType = sanitized.employmentType;
    if (sanitized.office !== undefined) updateData.office = sanitized.office;
    if (sanitized.hireDate !== undefined) updateData.hireDate = sanitized.hireDate;
    if (sanitized.startDate !== undefined) updateData.startDate = sanitized.startDate;
    if (sanitized.endDate !== undefined) updateData.endDate = sanitized.endDate;
    if (sanitized.email !== undefined) updateData.email = sanitized.email;
    if (sanitized.phone !== undefined) updateData.phone = sanitized.phone;
    if (sanitized.workPhone !== undefined) updateData.workPhone = sanitized.workPhone;
    if (sanitized.workEmail !== undefined) updateData.workEmail = sanitized.workEmail;
    if (sanitized.emergencyContact !== undefined) updateData.emergencyContact = sanitized.emergencyContact;
    if (sanitized.status !== undefined) updateData.status = sanitized.status;
    if (sanitized.workStatus !== undefined) updateData.workStatus = sanitized.workStatus;
    if (sanitized.isActive !== undefined) updateData.isActive = sanitized.isActive;
    if (sanitized.timezone !== undefined) updateData.timezone = sanitized.timezone;

    // 6. UPDATE: Apply changes
    await ctx.db.patch(employeeId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.updated',
      entityType: 'system_employee',
      entityId: employee.publicId,
      entityTitle: updateData.name || employee.name,
      description: `Updated employee: ${updateData.name || employee.name}`,
      metadata: {
        data: {
          changes: updates
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return employeeId;
  },
});

/**
 * Update employee salary
 */
export const updateEmployeeSalary = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    salary: v.number(),
    currency: v.optional(v.string()),
    paymentFrequency: v.optional(v.union(
      v.literal('hourly'),
      v.literal('weekly'),
      v.literal('bi_weekly'),
      v.literal('monthly'),
      v.literal('annually')
    )),
  },
  handler: async (ctx, { employeeId, salary, currency, paymentFrequency }): Promise<EmployeeId> => {
    const user = await requireCurrentUser(ctx);

    const employee = await ctx.db.get(employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check salary edit permission (more restrictive)
    await requireEditSalaryAccess(employee, user);

    // Validate salary
    if (salary < EMPLOYEES_CONSTANTS.LIMITS.MIN_SALARY || salary > EMPLOYEES_CONSTANTS.LIMITS.MAX_SALARY) {
      throw new Error('Invalid salary amount');
    }

    const now = Date.now();
    await ctx.db.patch(employeeId, {
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.salary_updated',
      entityType: 'system_employee',
      entityId: employee.publicId,
      entityTitle: employee.name,
      description: `Updated salary for employee: ${employee.name}`,
      metadata: {
        data: {
          salary,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return employeeId;
  },
});

/**
 * Delete employee (soft delete)
 */
export const deleteEmployee = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { employeeId }): Promise<EmployeeId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const employee = await ctx.db.get(employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmployeeAccess(employee, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(employeeId, {
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
      action: 'employee.deleted',
      entityType: 'system_employee',
      entityId: employee.publicId,
      entityTitle: employee.name,
      description: `Deleted employee: ${employee.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return employeeId;
  },
});

/**
 * Restore soft-deleted employee
 */
export const restoreEmployee = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { employeeId }): Promise<EmployeeId> => {
    const user = await requireCurrentUser(ctx);

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    if (!employee.deletedAt) {
      throw new Error('Employee is not deleted');
    }

    // Check permission
    if (
      employee.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this employee');
    }

    const now = Date.now();
    await ctx.db.patch(employeeId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'employee.restored',
      entityType: 'system_employee',
      entityId: employee.publicId,
      entityTitle: employee.name,
      description: `Restored employee: ${employee.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return employeeId;
  },
});

// ============================================================================
// Vacation Days Operations
// ============================================================================

/**
 * Create vacation days record for employee
 */
export const createVacationDays = mutation({
  args: {
    data: v.object({
      employeeId: v.id('yourobcEmployees'),
      year: v.number(),
      annualEntitlement: v.number(),
      carryoverDays: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { data }): Promise<VacationDaysId> => {
    const user = await requireCurrentUser(ctx);

    await requirePermission(ctx, EMPLOYEES_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // Check if employee exists
    const employee = await ctx.db.get(data.employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check if record already exists for this year
    const existing = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', q => q.eq('employeeId', data.employeeId).eq('year', data.year))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existing) {
      throw new Error('Vacation days record already exists for this employee and year');
    }

    const publicId = await generateUniquePublicId(ctx, 'yourobcVacationDays');
    const now = Date.now();

    const carryoverDays = data.carryoverDays || 0;
    const available = data.annualEntitlement + carryoverDays;

    const vacationDaysId = await ctx.db.insert('yourobcVacationDays', {
      publicId,
      name: `${employee.name} - ${data.year}`,
      employeeId: data.employeeId,
      year: data.year,
      annualEntitlement: data.annualEntitlement,
      carryoverDays,
      available,
      used: 0,
      pending: 0,
      remaining: available,
      entries: [],
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'vacation_days.created',
      entityType: 'system_vacation_days',
      entityId: publicId,
      entityTitle: `${employee.name} - ${data.year}`,
      description: `Created vacation days record for ${employee.name}`,
      metadata: {
        data: {
          year: data.year,
          annualEntitlement: data.annualEntitlement,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return vacationDaysId;
  },
});

/**
 * Request vacation
 */
export const requestVacation = mutation({
  args: {
    employeeId: v.id('yourobcEmployees'),
    data: v.object({
      startDate: v.number(),
      endDate: v.number(),
      days: v.number(),
      type: employeesValidators.vacationType,
      reason: v.optional(v.string()),
      notes: v.optional(v.string()),
      isHalfDay: v.optional(v.boolean()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
      })),
    }),
  },
  handler: async (ctx, { employeeId, data }) => {
    const user = await requireCurrentUser(ctx);

    // Validate vacation request
    const errors = validateVacationRequest(data as VacationRequest);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check employee exists
    const employee = await ctx.db.get(employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check permission (employee can request their own vacation)
    if (
      employee.userProfileId !== user._id &&
      employee.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to request vacation for this employee');
    }

    const year = new Date(data.startDate).getFullYear();

    // Get or create vacation days record
    let vacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', q => q.eq('employeeId', employeeId).eq('year', year))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!vacationDays) {
      // Create new vacation days record with default entitlement
      const publicId = await generateUniquePublicId(ctx, 'yourobcVacationDays');
      const now = Date.now();

      const vacationDaysId = await ctx.db.insert('yourobcVacationDays', {
        publicId,
        name: `${employee.name} - ${year}`,
        employeeId,
        year,
        annualEntitlement: EMPLOYEES_CONSTANTS.DEFAULT_ANNUAL_VACATION_DAYS,
        carryoverDays: 0,
        available: EMPLOYEES_CONSTANTS.DEFAULT_ANNUAL_VACATION_DAYS,
        used: 0,
        pending: 0,
        remaining: EMPLOYEES_CONSTANTS.DEFAULT_ANNUAL_VACATION_DAYS,
        entries: [],
        ownerId: user._id,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
      });

      vacationDays = await ctx.db.get(vacationDaysId);
      if (!vacationDays) throw new Error('Failed to create vacation days record');
    }

    // Check if enough days available
    if (vacationDays.remaining < data.days) {
      throw new Error(`Insufficient vacation days. Available: ${vacationDays.remaining}, Requested: ${data.days}`);
    }

    // Create vacation entry
    const entryId = `vacation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newEntry = {
      entryId,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days,
      type: data.type,
      status: EMPLOYEES_CONSTANTS.VACATION_STATUS.PENDING as any,
      requestedDate: now,
      requestedBy: user.authUserId || user._id,
      reason: data.reason?.trim(),
      notes: data.notes?.trim(),
      isHalfDay: data.isHalfDay,
      emergencyContact: data.emergencyContact,
    };

    // Update vacation days record
    const updatedEntries = [...vacationDays.entries, newEntry];
    const newPending = vacationDays.pending + data.days;
    const newRemaining = vacationDays.available - vacationDays.used - newPending;

    await ctx.db.patch(vacationDays._id, {
      entries: updatedEntries,
      pending: newPending,
      remaining: newRemaining,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'vacation.requested',
      entityType: 'system_vacation',
      entityId: entryId,
      entityTitle: `${employee.name} - Vacation Request`,
      description: `Requested ${data.days} days of ${data.type} vacation`,
      metadata: {
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          days: data.days,
          type: data.type,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return vacationDays._id;
  },
});

/**
 * Approve vacation request
 */
export const approveVacation = mutation({
  args: {
    vacationDaysId: v.id('yourobcVacationDays'),
    entryId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { vacationDaysId, entryId, notes }) => {
    const user = await requireCurrentUser(ctx);

    const vacationDays = await ctx.db.get(vacationDaysId);
    if (!vacationDays || vacationDays.deletedAt) {
      throw new Error('Vacation days record not found');
    }

    const employee = await ctx.db.get(vacationDays.employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check approval permission
    await requireApproveVacationAccess(ctx, employee as Employee, user);

    // Find entry
    const entryIndex = vacationDays.entries.findIndex(e => e.entryId === entryId);
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found');
    }

    const entry = vacationDays.entries[entryIndex];

    if (entry.status !== EMPLOYEES_CONSTANTS.VACATION_STATUS.PENDING) {
      throw new Error('Only pending vacation requests can be approved');
    }

    const now = Date.now();

    // Update entry
    const updatedEntries = [...vacationDays.entries];
    updatedEntries[entryIndex] = {
      ...entry,
      status: EMPLOYEES_CONSTANTS.VACATION_STATUS.APPROVED as any,
      approvedBy: user.authUserId || user._id,
      approvedDate: now,
      approvalNotes: notes?.trim(),
    };

    // Update calculations
    const newUsed = vacationDays.used + entry.days;
    const newPending = vacationDays.pending - entry.days;
    const newRemaining = vacationDays.available - newUsed - newPending;

    await ctx.db.patch(vacationDaysId, {
      entries: updatedEntries,
      used: newUsed,
      pending: newPending,
      remaining: newRemaining,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'vacation.approved',
      entityType: 'system_vacation',
      entityId: entryId,
      entityTitle: `${employee.name} - Vacation Approved`,
      description: `Approved ${entry.days} days of ${entry.type} vacation`,
      metadata: {
        data: {
          startDate: entry.startDate,
          endDate: entry.endDate,
          days: entry.days,
          type: entry.type,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return vacationDaysId;
  },
});

/**
 * Reject vacation request
 */
export const rejectVacation = mutation({
  args: {
    vacationDaysId: v.id('yourobcVacationDays'),
    entryId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, { vacationDaysId, entryId, reason }) => {
    const user = await requireCurrentUser(ctx);

    const vacationDays = await ctx.db.get(vacationDaysId);
    if (!vacationDays || vacationDays.deletedAt) {
      throw new Error('Vacation days record not found');
    }

    const employee = await ctx.db.get(vacationDays.employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check approval permission
    await requireApproveVacationAccess(ctx, employee as Employee, user);

    // Find entry
    const entryIndex = vacationDays.entries.findIndex(e => e.entryId === entryId);
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found');
    }

    const entry = vacationDays.entries[entryIndex];

    if (entry.status !== EMPLOYEES_CONSTANTS.VACATION_STATUS.PENDING) {
      throw new Error('Only pending vacation requests can be rejected');
    }

    const now = Date.now();

    // Update entry
    const updatedEntries = [...vacationDays.entries];
    updatedEntries[entryIndex] = {
      ...entry,
      status: EMPLOYEES_CONSTANTS.VACATION_STATUS.REJECTED as any,
      rejectedBy: user.authUserId || user._id,
      rejectedDate: now,
      rejectionReason: reason.trim(),
    };

    // Update calculations
    const newPending = vacationDays.pending - entry.days;
    const newRemaining = vacationDays.available - vacationDays.used - newPending;

    await ctx.db.patch(vacationDaysId, {
      entries: updatedEntries,
      pending: newPending,
      remaining: newRemaining,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'vacation.rejected',
      entityType: 'system_vacation',
      entityId: entryId,
      entityTitle: `${employee.name} - Vacation Rejected`,
      description: `Rejected ${entry.days} days of ${entry.type} vacation`,
      metadata: {
        data: {
          startDate: entry.startDate,
          endDate: entry.endDate,
          days: entry.days,
          type: entry.type,
          reason,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return vacationDaysId;
  },
});

/**
 * Cancel vacation request
 */
export const cancelVacation = mutation({
  args: {
    vacationDaysId: v.id('yourobcVacationDays'),
    entryId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { vacationDaysId, entryId, reason }) => {
    const user = await requireCurrentUser(ctx);

    const vacationDays = await ctx.db.get(vacationDaysId);
    if (!vacationDays || vacationDays.deletedAt) {
      throw new Error('Vacation days record not found');
    }

    const employee = await ctx.db.get(vacationDays.employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    // Check permission (employee can cancel their own, manager/admin can cancel any)
    const canCancel =
      employee.userProfileId === user._id ||
      employee.ownerId === user._id ||
      user.role === 'admin' ||
      user.role === 'superadmin';

    if (!canCancel) {
      const userEmployee = await ctx.db
        .query('yourobcEmployees')
        .withIndex('by_userProfile', q => q.eq('userProfileId', user._id))
        .filter(q => q.eq(q.field('deletedAt'), undefined))
        .first();

      if (!userEmployee || employee.managerId !== userEmployee._id) {
        throw new Error('You do not have permission to cancel this vacation request');
      }
    }

    // Find entry
    const entryIndex = vacationDays.entries.findIndex(e => e.entryId === entryId);
    if (entryIndex === -1) {
      throw new Error('Vacation entry not found');
    }

    const entry = vacationDays.entries[entryIndex];

    if (entry.status === EMPLOYEES_CONSTANTS.VACATION_STATUS.CANCELLED ||
      entry.status === EMPLOYEES_CONSTANTS.VACATION_STATUS.COMPLETED) {
      throw new Error('This vacation request cannot be cancelled');
    }

    const now = Date.now();

    // Update entry
    const updatedEntries = [...vacationDays.entries];
    updatedEntries[entryIndex] = {
      ...entry,
      status: EMPLOYEES_CONSTANTS.VACATION_STATUS.CANCELLED as any,
      cancelledBy: user.authUserId || user._id,
      cancelledDate: now,
      cancellationReason: reason?.trim(),
    };

    // Update calculations based on previous status
    let newUsed = vacationDays.used;
    let newPending = vacationDays.pending;

    if (entry.status === EMPLOYEES_CONSTANTS.VACATION_STATUS.APPROVED) {
      newUsed = vacationDays.used - entry.days;
    } else if (entry.status === EMPLOYEES_CONSTANTS.VACATION_STATUS.PENDING) {
      newPending = vacationDays.pending - entry.days;
    }

    const newRemaining = vacationDays.available - newUsed - newPending;

    await ctx.db.patch(vacationDaysId, {
      entries: updatedEntries,
      used: newUsed,
      pending: newPending,
      remaining: newRemaining,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'vacation.cancelled',
      entityType: 'system_vacation',
      entityId: entryId,
      entityTitle: `${employee.name} - Vacation Cancelled`,
      description: `Cancelled ${entry.days} days of ${entry.type} vacation`,
      metadata: {
        data: {
          startDate: entry.startDate,
          endDate: entry.endDate,
          days: entry.days,
          type: entry.type,
          reason: reason?.trim() ?? null,
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return vacationDaysId;
  },
});
