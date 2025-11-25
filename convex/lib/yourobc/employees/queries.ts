// convex/lib/yourobc/employees/queries.ts
// Read operations for employees module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { employeesValidators } from '@/schema/yourobc/employees/validators';
import {
  filterEmployeesByAccess,
  filterVacationDaysByAccess,
  requireViewEmployeeAccess,
  requireViewVacationDaysAccess,
  canViewSalary,
} from './permissions';
import type { EmployeeListResponse, VacationDaysListResponse, EmployeeStats, VacationStats } from './types';

/**
 * Get paginated list of employees with filtering
 */
export const getEmployees = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(employeesValidators.status)),
      workStatus: v.optional(v.array(employeesValidators.workStatus)),
      department: v.optional(v.string()),
      position: v.optional(v.string()),
      managerId: v.optional(v.id('yourobcEmployees')),
      isActive: v.optional(v.boolean()),
      isOnline: v.optional(v.boolean()),
      search: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<EmployeeListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    employees = await filterEmployeesByAccess(ctx, employees, user);

    // Apply status filter
    if (filters.status?.length) {
      employees = employees.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply work status filter
    if (filters.workStatus?.length) {
      employees = employees.filter(item =>
        item.workStatus && filters.workStatus!.includes(item.workStatus)
      );
    }

    // Apply department filter
    if (filters.department) {
      employees = employees.filter(item =>
        item.department === filters.department
      );
    }

    // Apply position filter
    if (filters.position) {
      employees = employees.filter(item =>
        item.position === filters.position
      );
    }

    // Apply manager filter
    if (filters.managerId) {
      employees = employees.filter(item =>
        item.managerId === filters.managerId
      );
    }

    // Apply isActive filter
    if (filters.isActive !== undefined) {
      employees = employees.filter(item => item.isActive === filters.isActive);
    }

    // Apply isOnline filter
    if (filters.isOnline !== undefined) {
      employees = employees.filter(item => item.isOnline === filters.isOnline);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      employees = employees.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.email && item.email.toLowerCase().includes(term)) ||
        (item.employeeNumber && item.employeeNumber.toLowerCase().includes(term)) ||
        (item.department && item.department.toLowerCase().includes(term)) ||
        (item.position && item.position.toLowerCase().includes(term))
      );
    }

    // Paginate
    const total = employees.length;
    const items = employees.slice(offset, offset + limit);

    // Filter out salary information for users without permission
    const itemsWithFilteredSalary = await Promise.all(
      items.map(async (employee) => {
        const canView = await canViewSalary(ctx, employee, user);
        if (!canView && 'salary' in employee) {
          const { salary, ...rest } = employee as any;
          return rest as typeof employee;
        }
        return employee;
      })
    );

    return {
      items: itemsWithFilteredSalary,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single employee by ID
 */
export const getEmployee = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { employeeId }) => {
    const user = await requireCurrentUser(ctx);

    const employee = await ctx.db.get(employeeId);
    if (!employee || employee.deletedAt) {
      throw new Error('Employee not found');
    }

    await requireViewEmployeeAccess(ctx, employee, user);

    // Filter salary if user doesn't have permission
    const canView = await canViewSalary(ctx, employee, user);
    if (!canView && 'salary' in employee) {
      const { salary, ...rest } = employee as any;
      return rest as typeof employee;
    }

    return employee;
  },
});

/**
 * Get employee by public ID
 */
export const getEmployeeByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!employee) {
      throw new Error('Employee not found');
    }

    await requireViewEmployeeAccess(ctx, employee, user);

    // Filter salary if user doesn't have permission
    const canView = await canViewSalary(ctx, employee, user);
    if (!canView && 'salary' in employee) {
      const { salary, ...rest } = employee as any;
      return rest as typeof employee;
    }

    return employee;
  },
});

/**
 * Get employee by user profile ID
 */
export const getEmployeeByUserProfileId = query({
  args: {
    userProfileId: v.id('userProfiles'),
  },
  handler: async (ctx, { userProfileId }) => {
    const user = await requireCurrentUser(ctx);

    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_userProfile', q => q.eq('userProfileId', userProfileId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!employee) {
      throw new Error('Employee not found');
    }

    await requireViewEmployeeAccess(ctx, employee, user);

    // Filter salary if user doesn't have permission
    const canView = await canViewSalary(ctx, employee, user);
    if (!canView && 'salary' in employee) {
      const { salary, ...rest } = employee as any;
      return rest as typeof employee;
    }

    return employee;
  },
});

/**
 * Get employee statistics
 */
export const getEmployeeStats = query({
  args: {},
  handler: async (ctx): Promise<EmployeeStats> => {
    const user = await requireCurrentUser(ctx);

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterEmployeesByAccess(ctx, employees, user);

    const byStatus: Record<string, number> = {
      active: 0,
      inactive: 0,
      terminated: 0,
      on_leave: 0,
      probation: 0,
    };

    const byDepartment: Record<string, number> = {};
    const byEmploymentType: Record<string, number> = {};
    let online = 0;
    let onVacation = 0;

    for (const employee of accessible) {
      // Count by status
      byStatus[employee.status] = (byStatus[employee.status] || 0) + 1;

      // Count by department
      if (employee.department) {
        byDepartment[employee.department] = (byDepartment[employee.department] || 0) + 1;
      }

      // Count by employment type
      if (employee.employmentType) {
        byEmploymentType[employee.employmentType] = (byEmploymentType[employee.employmentType] || 0) + 1;
      }

      // Count online
      if (employee.isOnline) {
        online++;
      }

      // Count on vacation
      if (employee.currentVacationStatus?.isOnVacation) {
        onVacation++;
      }
    }

    return {
      total: accessible.length,
      byStatus: byStatus as any,
      byDepartment,
      byEmploymentType,
      online,
      onVacation,
    };
  },
});

/**
 * Get employees by manager
 */
export const getEmployeesByManager = query({
  args: {
    managerId: v.id('yourobcEmployees'),
  },
  handler: async (ctx, { managerId }) => {
    const user = await requireCurrentUser(ctx);

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_manager', q => q.eq('managerId', managerId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterEmployeesByAccess(ctx, employees, user);

    return accessible;
  },
});

/**
 * Get employees by department
 */
export const getEmployeesByDepartment = query({
  args: {
    department: v.string(),
  },
  handler: async (ctx, { department }) => {
    const user = await requireCurrentUser(ctx);

    const employees = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_department', q => q.eq('department', department))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterEmployeesByAccess(ctx, employees, user);

    return accessible;
  },
});

/**
 * Get vacation days for employee
 */
export const getVacationDays = query({
  args: {
    employeeId: v.id('yourobcEmployees'),
    year: v.optional(v.number()),
  },
  handler: async (ctx, { employeeId, year }) => {
    const user = await requireCurrentUser(ctx);

    const currentYear = year || new Date().getFullYear();

    const vacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', q => q.eq('employeeId', employeeId).eq('year', currentYear))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!vacationDays) {
      return null;
    }

    await requireViewVacationDaysAccess(ctx, vacationDays, user);

    return vacationDays;
  },
});

/**
 * Get all vacation days records
 */
export const getAllVacationDays = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      employeeId: v.optional(v.id('yourobcEmployees')),
      year: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<VacationDaysListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    let vacationDaysList = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    vacationDaysList = await filterVacationDaysByAccess(ctx, vacationDaysList, user);

    // Apply employee filter
    if (filters.employeeId) {
      vacationDaysList = vacationDaysList.filter(item => item.employeeId === filters.employeeId);
    }

    // Apply year filter
    if (filters.year) {
      vacationDaysList = vacationDaysList.filter(item => item.year === filters.year);
    }

    // Paginate
    const total = vacationDaysList.length;
    const items = vacationDaysList.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get vacation statistics
 */
export const getVacationStats = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    year: v.optional(v.number()),
  },
  handler: async (ctx, { employeeId, year }): Promise<VacationStats> => {
    const user = await requireCurrentUser(ctx);
    const currentYear = year || new Date().getFullYear();

    let query = ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_year', q => q.eq('year', currentYear))
      .filter(q => q.eq(q.field('deletedAt'), undefined));

    const vacationDaysList = await query.collect();
    const accessible = await filterVacationDaysByAccess(ctx, vacationDaysList, user);

    // Filter by employee if specified
    const filtered = employeeId
      ? accessible.filter(item => item.employeeId === employeeId)
      : accessible;

    let totalDays = 0;
    let usedDays = 0;
    let pendingDays = 0;
    let remainingDays = 0;
    const byType: Record<string, number> = {
      annual: 0,
      sick: 0,
      personal: 0,
      maternity: 0,
      paternity: 0,
      unpaid: 0,
      bereavement: 0,
      other: 0,
    };

    for (const vacationDays of filtered) {
      totalDays += vacationDays.annualEntitlement + vacationDays.carryoverDays;
      usedDays += vacationDays.used;
      pendingDays += vacationDays.pending;
      remainingDays += vacationDays.remaining;

      // Count by type
      for (const entry of vacationDays.entries) {
        if (entry.status === 'approved' || entry.status === 'completed') {
          byType[entry.type] = (byType[entry.type] || 0) + entry.days;
        }
      }
    }

    return {
      totalDays,
      usedDays,
      pendingDays,
      remainingDays,
      byType: byType as any,
    };
  },
});
