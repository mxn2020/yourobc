// convex/lib/yourobc/employees/queries.ts
// convex/yourobc/employees/queries.ts

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { EMPLOYEE_CONSTANTS } from './constants';
import {
  getEmployeeWorkStatus,
  calculateRemainingVacationDays,
  isEmployeeOnVacation,
  getUpcomingVacations,
  getCurrentVacationEntry,
  buildVacationStatusObject
} from './utils';
import { calculateWorkingHours } from '../shared';

export const getEmployees = query({
  args: {
    authUserId: v.string(),
    options: v.optional(v.object({
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
      sortBy: v.optional(v.string()),
      sortOrder: v.optional(v.union(v.literal('asc'), v.literal('desc'))),
      filters: v.optional(v.object({
        status: v.optional(v.array(v.string())),
        isActive: v.optional(v.boolean()),
        isOnline: v.optional(v.boolean()),
        department: v.optional(v.array(v.string())),
        position: v.optional(v.array(v.string())),
        office: v.optional(v.array(v.string())),
        search: v.optional(v.string()),
      }))
    }))
  },
  handler: async (ctx, { authUserId, options = {} }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW);

    const {
      limit = 50,
      offset = 0,
      sortOrder = 'asc',
      filters = {}
    } = options;

    let employeesQuery = ctx.db.query('yourobcEmployees');

    const { status, isActive, isOnline } = filters;

    if (status?.length) {
      employeesQuery = employeesQuery.filter((q) =>
        q.or(...status.map(s => q.eq(q.field('status'), s)))
      );
    }

    if (isActive !== undefined) {
      employeesQuery = employeesQuery.filter((q) => q.eq(q.field('isActive'), isActive));
    }

    if (isOnline !== undefined) {
      employeesQuery = employeesQuery.filter((q) => q.eq(q.field('isOnline'), isOnline));
    }

    const employees = await employeesQuery
      .order(sortOrder === 'desc' ? 'desc' : 'asc')
      .collect();

    let filteredEmployees = employees;

    if (filters.department?.length) {
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.department && filters.department!.includes(employee.department)
      );
    }

    if (filters.position?.length) {
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.position && filters.position!.includes(employee.position)
      );
    }

    if (filters.office?.length) {
      filteredEmployees = filteredEmployees.filter(employee =>
        filters.office!.includes(employee.office.location)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(employee =>
        employee.employeeNumber.toLowerCase().includes(searchTerm) ||
        employee.workPhone?.toLowerCase().includes(searchTerm) ||
        employee.workEmail?.toLowerCase().includes(searchTerm) ||
        employee.department?.toLowerCase().includes(searchTerm) ||
        employee.position?.toLowerCase().includes(searchTerm)
      );
    }

    const employeesWithProfiles = await Promise.all(
      filteredEmployees.slice(offset, offset + limit).map(async (employee) => {
        const userProfile = await ctx.db.get(employee.userProfileId);
        const manager = employee.managerId ? await ctx.db.get(employee.managerId) : null;
        const managerProfile = manager ? await ctx.db.get(manager.userProfileId) : null;
        const workStatus = getEmployeeWorkStatus(employee);

        // Get current vacation status
        const currentYear = new Date().getFullYear();
        const vacationDays = await ctx.db
          .query('yourobcVacationDays')
          .withIndex('by_employee_year', (q) => q.eq('employeeId', employee._id).eq('year', currentYear))
          .first();

        // Use denormalized status if available, otherwise compute from entries
        let currentVacation = employee.currentVacationStatus;
        if (!currentVacation && vacationDays) {
          const vacationEntry = getCurrentVacationEntry(vacationDays.entries);
          if (vacationEntry) {
            currentVacation = buildVacationStatusObject(vacationEntry);
          }
        }

        const onVacation = employee.currentVacationStatus?.isOnVacation ?? (vacationDays ? isEmployeeOnVacation(vacationDays.entries) : false);
        const upcomingVacations = vacationDays ? getUpcomingVacations(vacationDays.entries, 14) : [];

        // Get direct reports count to determine if manager
        const directReports = await ctx.db
          .query('yourobcEmployees')
          .withIndex('by_manager', (q) => q.eq('managerId', employee._id))
          .collect();

        const directReportsWithProfiles = await Promise.all(
          directReports.map(async (report) => {
            const reportProfile = await ctx.db.get(report.userProfileId);
            return {
              _id: report._id,
              employeeNumber: report.employeeNumber,
              department: report.department,
              position: report.position,
              status: report.status,
              isActive: report.isActive,
              userProfile: reportProfile ? {
                name: reportProfile.name,
                email: reportProfile.email,
                avatar: reportProfile.avatar,
              } : null,
            };
          })
        );

        return {
          ...employee,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.avatar,
          } : null,
          manager: manager && managerProfile ? {
            _id: manager._id,
            employeeNumber: manager.employeeNumber,
            name: managerProfile.name,
          } : null,
          workingHours: workStatus,
          vacationStatus: {
            onVacation,
            currentVacation: currentVacation ? {
              startDate: currentVacation.startDate,
              endDate: currentVacation.endDate,
              type: currentVacation.type,
              reason: currentVacation.reason,
              daysRemaining: currentVacation.daysRemaining,
            } : undefined,
            upcomingVacations: upcomingVacations.slice(0, 2), // Limit to next 2 vacations
          },
          directReports: directReportsWithProfiles,
        };
      })
    );

    return {
      employees: employeesWithProfiles,
      total: filteredEmployees.length,
      hasMore: filteredEmployees.length > offset + limit,
    };
  },
});

export const getEmployee = query({
  args: {
    employeeId: v.optional(v.id('yourobcEmployees')),
    authUserId: v.string()
  },
  handler: async (ctx, { employeeId, authUserId }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW);

    if (!employeeId) {
      return null;
    }

    const employee = await ctx.db.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const userProfile = await ctx.db.get(employee.userProfileId);
    const manager = employee.managerId ? await ctx.db.get(employee.managerId) : null;
    const managerProfile = manager ? await ctx.db.get(manager.userProfileId) : null;
    const workStatus = getEmployeeWorkStatus(employee);

    // Get direct reports
    const directReports = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_manager', (q) => q.eq('managerId', employeeId))
      .collect();

    const directReportsWithProfiles = await Promise.all(
      directReports.map(async (report) => {
        const reportProfile = await ctx.db.get(report.userProfileId);
        return {
          _id: report._id,
          employeeNumber: report.employeeNumber,
          department: report.department,
          position: report.position,
          status: report.status,
          isActive: report.isActive,
          userProfile: reportProfile ? {
            name: reportProfile.name,
            email: reportProfile.email,
            avatar: reportProfile.avatar,
          } : null,
        };
      })
    );

    // Get current vacation status
    const currentYear = new Date().getFullYear();
    const vacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) => q.eq('employeeId', employeeId).eq('year', currentYear))
      .first();

    // Use denormalized status if available, otherwise compute from entries
    let currentVacation = employee.currentVacationStatus;
    if (!currentVacation && vacationDays) {
      const vacationEntry = getCurrentVacationEntry(vacationDays.entries);
      if (vacationEntry) {
        currentVacation = buildVacationStatusObject(vacationEntry);
      }
    }

    const onVacation = employee.currentVacationStatus?.isOnVacation ?? (vacationDays ? isEmployeeOnVacation(vacationDays.entries) : false);
    const upcomingVacations = vacationDays ? getUpcomingVacations(vacationDays.entries, 14) : [];

    return {
      ...employee,
      userProfile: userProfile ? {
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        role: userProfile.role,
        isActive: userProfile.isActive,
      } : null,
      manager: manager && managerProfile ? {
        _id: manager._id,
        employeeNumber: manager.employeeNumber,
        department: manager.department,
        position: manager.position,
        name: managerProfile.name,
        email: managerProfile.email,
      } : null,
      directReports: directReportsWithProfiles,
      workingHours: workStatus,
      vacationStatus: {
        onVacation,
        currentVacation: currentVacation ? {
          startDate: currentVacation.startDate,
          endDate: currentVacation.endDate,
          type: currentVacation.type,
          reason: currentVacation.reason,
          daysRemaining: currentVacation.daysRemaining,
        } : undefined,
        upcomingVacations: upcomingVacations.slice(0, 2), // Limit to next 2 vacations
      },
    };
  },
});

export const getEmployeeByAuthId = query({
  args: {
    authUserId: v.string(),
    targetAuthUserId: v.optional(v.string()),
  },
  handler: async (ctx, { authUserId, targetAuthUserId }) => {
    await requireCurrentUser(ctx, authUserId);

    const targetUserId = targetAuthUserId || authUserId;

    const employee = await ctx.db
      .query('yourobcEmployees')
      .withIndex('by_authUserId', (q) => q.eq('authUserId', targetUserId))
      .first();

    if (!employee) {
      return null;
    }

    const userProfile = await ctx.db.get(employee.userProfileId);
    const manager = employee.managerId ? await ctx.db.get(employee.managerId) : null;
    const managerProfile = manager ? await ctx.db.get(manager.userProfileId) : null;
    const workStatus = getEmployeeWorkStatus(employee);

    return {
      ...employee,
      userProfile,
      manager: manager && managerProfile ? {
        _id: manager._id,
        employeeNumber: manager.employeeNumber,
        name: managerProfile.name,
        email: managerProfile.email,
      } : null,
      workStatus,
    };
  },
});

export const getEmployeeStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW);

    const employees = await ctx.db.query('yourobcEmployees').collect();

    const employeesByDepartment = employees.reduce((acc, employee) => {
      if (employee.department) {
        const key = employee.department;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const employeesByOffice = employees.reduce((acc, employee) => {
      const key = employee.office.location;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get pending vacation requests (current year only)
    const currentYear = new Date().getFullYear();
    const allVacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_year', (q) => q.eq('year', currentYear))
      .collect();

    // Count entries where status is pending
    const vacationRequestsPending = allVacationDays.reduce((count, vacDay) => {
      return count + vacDay.entries.filter(entry => entry.status === 'pending').length;
    }, 0);

    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.isActive).length,
      onlineEmployees: employees.filter(e => e.isOnline).length,
      employeesByStatus: {
        available: employees.filter(e => e.workStatus === EMPLOYEE_CONSTANTS.WORK_STATUS.AVAILABLE).length,
        busy: employees.filter(e => e.workStatus === EMPLOYEE_CONSTANTS.WORK_STATUS.BUSY).length,
        offline: employees.filter(e => e.workStatus === EMPLOYEE_CONSTANTS.WORK_STATUS.OFFLINE).length,
      },
      employeesByDepartment,
      employeesByOffice,
      avgTasksPerEmployee: 0, // This would be calculated based on actual task assignments
      vacationRequestsPending,
    };

    return stats;
  },
});

export const getEmployeeTimeEntries = query({
  args: {
    authUserId: v.string(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, { authUserId, employeeId, dateRange }) => {
    await requireCurrentUser(ctx, authUserId);

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
      await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW_TIME_ENTRIES);
    }

    const employee = await ctx.db.get(targetEmployeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    let timeEntries = employee.timeEntries;

    if (dateRange) {
      timeEntries = timeEntries.filter(entry =>
        entry.timestamp >= dateRange.start &&
        entry.timestamp <= dateRange.end
      );
    }

    const entriesByDay = timeEntries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      const dayKey = date.getTime();

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(entry);

      return acc;
    }, {} as Record<number, typeof timeEntries>);

    const dailySummary = Object.entries(entriesByDay).map(([dayKey, entries]) => ({
      date: parseInt(dayKey),
      entries,
      totalHours: calculateWorkingHours(entries),
      isWorkingDay: entries.length > 0,
    }));

    const totalHours = dailySummary.reduce((sum, day) => sum + day.totalHours, 0);

    return {
      timeEntries,
      dailySummary,
      totalHours,
      workingHours: getEmployeeWorkStatus(employee),
    };
  },
});

export const searchEmployees = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, searchTerm, limit = 20, includeInactive = false }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW);

    if (searchTerm.length < 2) {
      return [];
    }

    let employeesQuery = ctx.db.query('yourobcEmployees');

    if (!includeInactive) {
      employeesQuery = employeesQuery.filter((q) => q.eq(q.field('isActive'), true));
    }

    const employees = await employeesQuery.collect();
    const searchLower = searchTerm.toLowerCase();

    const filtered = employees.filter(employee =>
      employee.employeeNumber.toLowerCase().includes(searchLower) ||
      employee.department?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower) ||
      employee.workPhone?.toLowerCase().includes(searchLower) ||
      employee.workEmail?.toLowerCase().includes(searchLower) ||
      employee.office.location.toLowerCase().includes(searchLower)
    );

    const employeesWithProfiles = await Promise.all(
      filtered.slice(0, limit).map(async (employee) => {
        const userProfile = await ctx.db.get(employee.userProfileId);
        const manager = employee.managerId ? await ctx.db.get(employee.managerId) : null;
        const managerProfile = manager ? await ctx.db.get(manager.userProfileId) : null;
        const workStatus = getEmployeeWorkStatus(employee);

        // Get current vacation status
        const currentYear = new Date().getFullYear();
        const vacationDays = await ctx.db
          .query('yourobcVacationDays')
          .withIndex('by_employee_year', (q) => q.eq('employeeId', employee._id).eq('year', currentYear))
          .first();

        // Use denormalized status if available, otherwise compute from entries
        let currentVacation = employee.currentVacationStatus;
        if (!currentVacation && vacationDays) {
          const vacationEntry = getCurrentVacationEntry(vacationDays.entries);
          if (vacationEntry) {
            currentVacation = buildVacationStatusObject(vacationEntry);
          }
        }

        const onVacation = employee.currentVacationStatus?.isOnVacation ?? (vacationDays ? isEmployeeOnVacation(vacationDays.entries) : false);
        const upcomingVacations = vacationDays ? getUpcomingVacations(vacationDays.entries, 14) : [];

        // Get direct reports count to determine if manager
        const directReports = await ctx.db
          .query('yourobcEmployees')
          .withIndex('by_manager', (q) => q.eq('managerId', employee._id))
          .collect();

        const directReportsWithProfiles = await Promise.all(
          directReports.map(async (report) => {
            const reportProfile = await ctx.db.get(report.userProfileId);
            return {
              _id: report._id,
              employeeNumber: report.employeeNumber,
              department: report.department,
              position: report.position,
              status: report.status,
              isActive: report.isActive,
              userProfile: reportProfile ? {
                name: reportProfile.name,
                email: reportProfile.email,
                avatar: reportProfile.avatar,
              } : null,
            };
          })
        );

        return {
          ...employee,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.avatar,
          } : null,
          workingHours: workStatus,
          manager: manager && managerProfile ? {
            _id: manager._id,
            employeeNumber: manager.employeeNumber,
            name: managerProfile.name,
          } : null,
          vacationStatus: {
            onVacation,
            currentVacation: currentVacation ? {
              startDate: currentVacation.startDate,
              endDate: currentVacation.endDate,
              type: currentVacation.type,
              reason: currentVacation.reason,
              daysRemaining: currentVacation.daysRemaining,
            } : undefined,
            upcomingVacations: upcomingVacations.slice(0, 2), // Limit to next 2 vacations
          },
          directReports: directReportsWithProfiles,
        };
      })
    );

    return employeesWithProfiles;
  },
});

export const getEmployeeVacations = query({
  args: {
    authUserId: v.string(),
    employeeId: v.optional(v.id('yourobcEmployees')),
    year: v.optional(v.number()),
  },
  handler: async (ctx, { authUserId, employeeId, year }) => {
    await requireCurrentUser(ctx, authUserId);

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
      await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW_VACATIONS);
    }

    const currentYear = year || new Date().getFullYear();

    const vacationDays = await ctx.db
      .query('yourobcVacationDays')
      .withIndex('by_employee_year', (q) => q.eq('employeeId', targetEmployeeId).eq('year', currentYear))
      .first();

    if (!vacationDays) {
      return {
        year: currentYear,
        available: EMPLOYEE_CONSTANTS.DEFAULT_VALUES.ANNUAL_VACATION_DAYS,
        used: 0,
        pending: 0,
        remaining: EMPLOYEE_CONSTANTS.DEFAULT_VALUES.ANNUAL_VACATION_DAYS,
        entries: [],
      };
    }

    const pendingDays = vacationDays.entries
      .filter(entry => entry.status === 'pending' && entry.type === 'annual')
      .reduce((sum, entry) => sum + entry.days, 0);

    const remaining = calculateRemainingVacationDays(
      vacationDays.available,
      vacationDays.entries,
      currentYear
    );

    // Enrich entries with approver information
    const entriesWithApprovers = await Promise.all(
      vacationDays.entries.map(async (entry) => {
        let approver = null;
        if (entry.approvedBy) {
          // approvedBy is authUserId (string), need to find employee by authUserId
          const approverEmployee = await ctx.db
            .query('yourobcEmployees')
            .withIndex('by_authUserId', (q) => q.eq('authUserId', entry.approvedBy!))
            .first();
          if (approverEmployee) {
            const approverProfile = await ctx.db.get(approverEmployee.userProfileId);
            approver = {
              _id: approverEmployee._id,
              employeeNumber: approverEmployee.employeeNumber,
              name: approverProfile?.name,
            };
          }
        }
        return {
          ...entry,
          approver,
        };
      })
    );

    return {
      year: currentYear,
      available: vacationDays.available,
      used: vacationDays.used,
      pending: pendingDays,
      remaining,
      entries: entriesWithApprovers,
    };
  },
});

export const getVacationRequests = query({
  args: {
    authUserId: v.string(),
    filters: v.optional(v.object({
      employeeId: v.optional(v.id('yourobcEmployees')),
      year: v.optional(v.number()),
      status: v.optional(v.array(v.string())),
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    }))
  },
  handler: async (ctx, { authUserId, filters = {} }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW_VACATIONS);

    const { limit = 50, offset = 0, year } = filters;
    const currentYear = year || new Date().getFullYear();

    let vacationQuery;

    if (filters.employeeId) {
      const employeeId = filters.employeeId;

      vacationQuery = ctx.db
        .query('yourobcVacationDays')
        .withIndex('by_employee_year', (q) => q.eq('employeeId', employeeId).eq('year', currentYear));
    } else {
      vacationQuery = ctx.db
        .query('yourobcVacationDays')
        .withIndex('by_year', (q) => q.eq('year', currentYear));
    }

    const vacationDays = await vacationQuery.collect();

    // Flatten all entries from all employees
    const allEntries = [];
    for (const vacationDay of vacationDays) {
      const employee = await ctx.db.get(vacationDay.employeeId);
      const userProfile = employee ? await ctx.db.get(employee.userProfileId) : null;

      for (let i = 0; i < vacationDay.entries.length; i++) {
        const entry = vacationDay.entries[i];

        // Apply status filter if provided
        if (filters.status?.length && !filters.status.includes(entry.status)) {
          continue;
        }

        let approver = null;
        if (entry.approvedBy) {
          // approvedBy is authUserId (string), need to find employee by authUserId
          const approverEmployee = await ctx.db
            .query('yourobcEmployees')
            .withIndex('by_authUserId', (q) => q.eq('authUserId', entry.approvedBy!))
            .first();
          if (approverEmployee) {
            const approverProfile = await ctx.db.get(approverEmployee.userProfileId);
            approver = {
              _id: approverEmployee._id,
              employeeNumber: approverEmployee.employeeNumber,
              name: approverProfile?.name,
            };
          }
        }

        allEntries.push({
          vacationDayId: vacationDay._id,
          entryIndex: i,
          employee: employee && userProfile ? {
            _id: employee._id,
            employeeNumber: employee.employeeNumber,
            department: employee.department,
            position: employee.position,
            name: userProfile.name,
          } : null,
          ...entry,
          approver,
        });
      }
    }

    // Sort by start date (most recent first)
    allEntries.sort((a, b) => b.startDate - a.startDate);

    const paginatedEntries = allEntries.slice(offset, offset + limit);

    return {
      vacationRequests: paginatedEntries,
      total: allEntries.length,
      hasMore: allEntries.length > offset + limit,
    };
  },
});

/**
 * Get available user profiles for employee creation
 * Returns active user profiles that don't already have employee records
 */
export const getAvailableUserProfiles = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, EMPLOYEE_CONSTANTS.PERMISSIONS.VIEW);

    // Get all active user profiles
    const allProfiles = await ctx.db
      .query('userProfiles')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    // Get all existing employee records
    const allEmployees = await ctx.db.query('yourobcEmployees').collect();
    const employeeUserProfileIds = new Set(
      allEmployees.map(emp => emp.userProfileId)
    );

    // Filter out profiles that already have employee records
    const availableProfiles = allProfiles.filter(
      profile => !employeeUserProfileIds.has(profile._id)
    );

    // Return only the fields needed for the dropdown
    return availableProfiles.map(profile => ({
      _id: profile._id,
      authUserId: profile.authUserId,
      name: profile.name || 'Unknown',
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
    }));
  },
});