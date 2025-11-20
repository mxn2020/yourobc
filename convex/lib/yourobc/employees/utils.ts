// convex/lib/yourobc/employees/utils.ts
// convex/yourobc/employees/utils.ts

import { EMPLOYEE_CONSTANTS, EMPLOYEE_STATUS_COLORS, WORK_STATUS_COLORS, VACATION_STATUS_COLORS } from './constants';
import type { Employee, CreateEmployeeData, UpdateEmployeeData, Office, VacationEntry } from './types';

import {
  isValidEmail,
  isValidPhone,
  isValidTimezone,
  calculateWorkingHours,
  generateSequentialNumber,
} from '../shared';

export function validateEmployeeData(data: Partial<CreateEmployeeData | UpdateEmployeeData>): string[] {
  const errors: string[] = [];

  if (data.employeeNumber && data.employeeNumber.length > EMPLOYEE_CONSTANTS.LIMITS.MAX_EMPLOYEE_NUMBER_LENGTH) {
    errors.push(`Employee number must be less than ${EMPLOYEE_CONSTANTS.LIMITS.MAX_EMPLOYEE_NUMBER_LENGTH} characters`);
  }

  if (data.department && data.department.length > EMPLOYEE_CONSTANTS.LIMITS.MAX_DEPARTMENT_LENGTH) {
    errors.push(`Department must be less than ${EMPLOYEE_CONSTANTS.LIMITS.MAX_DEPARTMENT_LENGTH} characters`);
  }

  if (data.position && data.position.length > EMPLOYEE_CONSTANTS.LIMITS.MAX_POSITION_LENGTH) {
    errors.push(`Position must be less than ${EMPLOYEE_CONSTANTS.LIMITS.MAX_POSITION_LENGTH} characters`);
  }

  if (data.workPhone && data.workPhone.length > EMPLOYEE_CONSTANTS.LIMITS.MAX_PHONE_LENGTH) {
    errors.push(`Work phone must be less than ${EMPLOYEE_CONSTANTS.LIMITS.MAX_PHONE_LENGTH} characters`);
  }

  if (data.workPhone && !isValidPhone(data.workPhone)) {
    errors.push('Work phone format is invalid');
  }

  if (data.workEmail && !isValidEmail(data.workEmail)) {
    errors.push('Work email format is invalid');
  }

  if (data.timezone && !isValidTimezone(data.timezone)) {
    errors.push('Invalid timezone');
  }

  if (data.office) {
    const officeErrors = validateOfficeData(data.office);
    errors.push(...officeErrors);
  }

  if (data.emergencyContact) {
    const emergencyContactErrors = validateEmergencyContact(data.emergencyContact);
    errors.push(...emergencyContactErrors);
  }

  return errors;
}

export function validateOfficeData(office: Partial<Office>): string[] {
  const errors: string[] = [];

  if (!office.location?.trim()) {
    errors.push('Office location is required');
  }

  if (office.location && office.location.length > EMPLOYEE_CONSTANTS.LIMITS.MAX_OFFICE_LOCATION_LENGTH) {
    errors.push(`Office location must be less than ${EMPLOYEE_CONSTANTS.LIMITS.MAX_OFFICE_LOCATION_LENGTH} characters`);
  }

  if (!office.country?.trim()) {
    errors.push('Office country is required');
  }

  if (!office.countryCode?.trim()) {
    errors.push('Office country code is required');
  }

  return errors;
}

export function validateEmergencyContact(contact: { name?: string; phone?: string; relationship?: string }): string[] {
  const errors: string[] = [];

  if (!contact.name?.trim()) {
    errors.push('Emergency contact name is required');
  }

  if (!contact.phone?.trim()) {
    errors.push('Emergency contact phone is required');
  }

  if (contact.phone && !isValidPhone(contact.phone)) {
    errors.push('Emergency contact phone format is invalid');
  }

  if (!contact.relationship?.trim()) {
    errors.push('Emergency contact relationship is required');
  }

  return errors;
}

export function generateEmployeeNumber(type: 'office', sequence: number): string {
  return generateSequentialNumber('EMP', sequence);
}

export function getEmployeeStatusColor(status: Employee['status']): string {
  return (EMPLOYEE_STATUS_COLORS as any)[status] || '#6b7280';
}

export function getWorkStatusColor(workStatus: Employee['workStatus']): string {
  if (!workStatus) return '#6b7280';
  return (WORK_STATUS_COLORS as any)[workStatus] || '#6b7280';
}

export function getVacationStatusColor(status: string): string {
  return VACATION_STATUS_COLORS[status as keyof typeof VACATION_STATUS_COLORS] || '#6b7280';
}

export function getEmployeeWorkStatus(employee: Employee): {
  isWorking: boolean;
  lastLogin?: number;
  lastLogout?: number;
  todayHours: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todayEntries = employee.timeEntries.filter(
    entry => entry.timestamp >= todayStart && entry.timestamp < todayEnd
  );

  const lastLogin = todayEntries
    .filter(entry => entry.type === EMPLOYEE_CONSTANTS.TIME_ENTRY_TYPE.LOGIN)
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp;

  const lastLogout = todayEntries
    .filter(entry => entry.type === EMPLOYEE_CONSTANTS.TIME_ENTRY_TYPE.LOGOUT)
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp;

  const isWorking = lastLogin && (!lastLogout || lastLogin > lastLogout);
  const todayHours = calculateWorkingHours(todayEntries);

  return {
    isWorking: !!isWorking,
    lastLogin,
    lastLogout,
    todayHours,
  };
}

export function formatEmployeeDisplayName(employee: Employee, userProfile?: { name?: string }): string {
  if (userProfile?.name) {
    return userProfile.name;
  }
  return `Employee ${employee.employeeNumber || employee._id}`;
}

export function sanitizeEmployeeForExport(employee: Employee, includePrivateData = false): Partial<Employee> {
  const publicData = {
    employeeNumber: employee.employeeNumber,
    department: employee.department,
    position: employee.position,
    office: employee.office,
    status: employee.status,
    isActive: employee.isActive,
    isOnline: employee.isOnline,
    timezone: employee.timezone,
    hireDate: employee.hireDate,
    createdAt: employee.createdAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      userProfileId: employee.userProfileId,
      authUserId: employee.authUserId,
      managerId: employee.managerId,
      workPhone: employee.workPhone,
      workEmail: employee.workEmail,
      emergencyContact: employee.emergencyContact,
      timeEntries: employee.timeEntries,
    };
  }

  return publicData;
}

export function validateVacationData(data: {
  startDate: number;
  endDate: number;
  days: number;
  type: string;
}): string[] {
  const errors: string[] = [];

  if (data.startDate >= data.endDate) {
    errors.push('End date must be after start date');
  }

  if (data.days <= 0) {
    errors.push('Vacation days must be greater than 0');
  }

  if (data.days > EMPLOYEE_CONSTANTS.LIMITS.MAX_VACATION_DAYS_PER_YEAR) {
    errors.push(`Vacation days cannot exceed ${EMPLOYEE_CONSTANTS.LIMITS.MAX_VACATION_DAYS_PER_YEAR} days`);
  }

  // Basic validation for calculated days vs date range
  const daysBetweenDates = Math.ceil((data.endDate - data.startDate) / (1000 * 60 * 60 * 24));
  if (data.days > daysBetweenDates + 1) {
    errors.push('Vacation days cannot exceed the date range');
  }

  return errors;
}

export function calculateVacationDays(startDate: number, endDate: number, includeWeekends = true): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    if (includeWeekends) {
      days++;
    } else {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        days++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

export function isEmployeeOnVacation(vacationEntries: VacationEntry[], checkDate: number = Date.now()): boolean {
  return vacationEntries.some(entry =>
    entry.status === 'approved' &&
    checkDate >= entry.startDate &&
    checkDate <= entry.endDate
  );
}

export function getUpcomingVacations(vacationEntries: VacationEntry[], daysAhead = 30): VacationEntry[] {
  const now = Date.now();
  const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000);

  return vacationEntries.filter(entry =>
    entry.status === 'approved' &&
    entry.startDate > now &&
    entry.startDate <= futureDate
  ).sort((a, b) => a.startDate - b.startDate);
}

export function calculateRemainingVacationDays(
  availableDays: number,
  vacationEntries: VacationEntry[],
  year: number
): number {
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();

  const usedDays = vacationEntries
    .filter(entry =>
      entry.status === 'approved' &&
      entry.startDate >= yearStart &&
      entry.endDate <= yearEnd
    )
    .reduce((sum, entry) => sum + entry.days, 0);

  return Math.max(0, availableDays - usedDays);
}

/**
 * Get the current active vacation entry for a specific date
 * Returns the vacation entry that covers the given date, if any
 */
export function getCurrentVacationEntry(
  vacationEntries: VacationEntry[],
  checkDate: number = Date.now()
): VacationEntry | null {
  const currentVacation = vacationEntries.find(entry =>
    entry.status === 'approved' &&
    checkDate >= entry.startDate &&
    checkDate <= entry.endDate
  );

  return currentVacation || null;
}

/**
 * Calculate number of days remaining in a vacation period
 * Returns 0 if vacation has ended
 */
export function calculateDaysRemainingInVacation(
  endDate: number,
  fromDate: number = Date.now()
): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.ceil((endDate - fromDate) / millisecondsPerDay);
  return Math.max(0, daysRemaining);
}

/**
 * Build vacation status object for employee record
 * Creates the denormalized currentVacationStatus field
 */
export function buildVacationStatusObject(
  vacationEntry: VacationEntry,
  checkDate: number = Date.now()
): {
  isOnVacation: boolean;
  vacationEntryId: string;
  startDate: number;
  endDate: number;
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
  reason?: string;
  daysRemaining: number;
} {
  return {
    isOnVacation: true,
    vacationEntryId: vacationEntry.entryId,
    startDate: vacationEntry.startDate,
    endDate: vacationEntry.endDate,
    type: vacationEntry.type,
    reason: vacationEntry.reason,
    daysRemaining: calculateDaysRemainingInVacation(vacationEntry.endDate, checkDate),
  };
}

/**
 * Build or update recent vacations array
 * Keeps only the last 5 completed vacations, sorted by completion date (newest first)
 */
export function buildRecentVacationsArray(
  existingRecentVacations: Array<{
    entryId: string;
    startDate: number;
    endDate: number;
    days: number;
    type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
    completedAt: number;
  }> | undefined,
  completedVacation: {
    entryId: string;
    startDate: number;
    endDate: number;
    days: number;
    type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
  }
): Array<{
  entryId: string;
  startDate: number;
  endDate: number;
  days: number;
  type: 'annual' | 'sick' | 'personal' | 'unpaid' | 'parental' | 'bereavement' | 'maternity' | 'paternity' | 'other';
  completedAt: number;
}> {
  const recent = existingRecentVacations || [];

  // Add the new vacation with completion timestamp
  const newEntry = {
    ...completedVacation,
    completedAt: Date.now(),
  };

  // Prepend new entry and keep only last 5
  const updated = [newEntry, ...recent].slice(0, 5);

  return updated;
}

/**
 * Check if a vacation entry should trigger an employee status update
 * Returns true if the vacation is approved and covers today's date
 */
export function shouldUpdateEmployeeVacationStatus(
  vacationEntry: VacationEntry,
  checkDate: number = Date.now()
): boolean {
  return (
    vacationEntry.status === 'approved' &&
    checkDate >= vacationEntry.startDate &&
    checkDate <= vacationEntry.endDate
  );
}