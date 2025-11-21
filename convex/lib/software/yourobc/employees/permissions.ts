// convex/lib/software/yourobc/employees/permissions.ts
// Access control and authorization logic for employees module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Employee, VacationDays } from './types';
import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;

// ============================================================================
// Employee View Access
// ============================================================================

export async function canViewEmployee(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Employee can view their own record
  if (employee.userProfileId === user._id) return true;

  // Owner can view
  if (employee.ownerId === user._id) return true;

  // Creator can view
  if (employee.createdBy === user._id) return true;

  // Manager can view their subordinates
  if (employee.managerId) {
    const manager = await ctx.db.get(employee.managerId);
    if (manager && manager.userProfileId === user._id) return true;
  }

  // Check if user is manager of this employee
  const userEmployee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_userProfile', q => q.eq('userProfileId', user._id))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (userEmployee && employee.managerId === userEmployee._id) {
    return true;
  }

  return false;
}

export async function requireViewEmployeeAccess(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<void> {
  if (!(await canViewEmployee(ctx, employee, user))) {
    throw new Error('You do not have permission to view this employee');
  }
}

// ============================================================================
// Employee Edit Access
// ============================================================================

export async function canEditEmployee(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can edit
  if (employee.ownerId === user._id) return true;

  // Cannot edit terminated employees (except admins)
  if (employee.status === 'terminated') {
    return false;
  }

  // Manager can edit their subordinates (limited fields)
  if (employee.managerId) {
    const manager = await ctx.db.get(employee.managerId);
    if (manager && manager.userProfileId === user._id) return true;
  }

  // Check if user is manager of this employee
  const userEmployee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_userProfile', q => q.eq('userProfileId', user._id))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (userEmployee && employee.managerId === userEmployee._id) {
    return true;
  }

  return false;
}

export async function requireEditEmployeeAccess(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<void> {
  if (!(await canEditEmployee(ctx, employee, user))) {
    throw new Error('You do not have permission to edit this employee');
  }
}

// ============================================================================
// Employee Delete Access
// ============================================================================

export async function canDeleteEmployee(
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (employee.ownerId === user._id) return true;
  return false;
}

export async function requireDeleteEmployeeAccess(
  employee: Employee,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteEmployee(employee, user))) {
    throw new Error('You do not have permission to delete this employee');
  }
}

// ============================================================================
// Salary Access (Special Permission)
// ============================================================================

export async function canViewSalary(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all salaries
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view all salaries
  if (employee.ownerId === user._id) return true;

  // Employee can view their own salary
  if (employee.userProfileId === user._id) return true;

  // HR role can view salaries (if you implement role-based permissions)
  // This would require checking a roles table or user permissions

  return false;
}

export async function canEditSalary(
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Only admins and owners can edit salaries
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  if (employee.ownerId === user._id) return true;
  return false;
}

export async function requireEditSalaryAccess(
  employee: Employee,
  user: UserProfile
): Promise<void> {
  if (!(await canEditSalary(employee, user))) {
    throw new Error('You do not have permission to edit employee salary');
  }
}

// ============================================================================
// Vacation Access
// ============================================================================

export async function canViewVacationDays(
  ctx: QueryCtx | MutationCtx,
  vacationDays: VacationDays,
  user: UserProfile
): Promise<boolean> {
  // Admins can view all
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can view
  if (vacationDays.ownerId === user._id) return true;

  // Employee can view their own vacation days
  const employee = await ctx.db.get(vacationDays.employeeId);
  if (employee && employee.userProfileId === user._id) return true;

  // Manager can view their subordinates' vacation days
  if (employee && employee.managerId) {
    const manager = await ctx.db.get(employee.managerId);
    if (manager && manager.userProfileId === user._id) return true;
  }

  return false;
}

export async function requireViewVacationDaysAccess(
  ctx: QueryCtx | MutationCtx,
  vacationDays: VacationDays,
  user: UserProfile
): Promise<void> {
  if (!(await canViewVacationDays(ctx, vacationDays, user))) {
    throw new Error('You do not have permission to view these vacation days');
  }
}

export async function canApproveVacation(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<boolean> {
  // Admins can approve all vacation requests
  if (user.role === 'admin' || user.role === 'superadmin') return true;

  // Owner can approve all vacation requests
  if (employee.ownerId === user._id) return true;

  // Manager can approve their subordinates' vacation requests
  if (employee.managerId) {
    const manager = await ctx.db.get(employee.managerId);
    if (manager && manager.userProfileId === user._id) return true;
  }

  // Check if user is manager of this employee
  const userEmployee = await ctx.db
    .query('yourobcEmployees')
    .withIndex('by_userProfile', q => q.eq('userProfileId', user._id))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (userEmployee && employee.managerId === userEmployee._id) {
    return true;
  }

  return false;
}

export async function requireApproveVacationAccess(
  ctx: QueryCtx | MutationCtx,
  employee: Employee,
  user: UserProfile
): Promise<void> {
  if (!(await canApproveVacation(ctx, employee, user))) {
    throw new Error('You do not have permission to approve vacation requests');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterEmployeesByAccess(
  ctx: QueryCtx | MutationCtx,
  employees: Employee[],
  user: UserProfile
): Promise<Employee[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return employees;
  }

  const accessible: Employee[] = [];

  for (const employee of employees) {
    if (await canViewEmployee(ctx, employee, user)) {
      accessible.push(employee);
    }
  }

  return accessible;
}

export async function filterVacationDaysByAccess(
  ctx: QueryCtx | MutationCtx,
  vacationDaysList: VacationDays[],
  user: UserProfile
): Promise<VacationDays[]> {
  // Admins see everything
  if (user.role === 'admin' || user.role === 'superadmin') {
    return vacationDaysList;
  }

  const accessible: VacationDays[] = [];

  for (const vacationDays of vacationDaysList) {
    if (await canViewVacationDays(ctx, vacationDays, user)) {
      accessible.push(vacationDays);
    }
  }

  return accessible;
}
