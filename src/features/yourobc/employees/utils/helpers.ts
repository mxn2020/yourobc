// src/features/yourobc/employees/utils/helpers.ts

import { EMPLOYEE_CONSTANTS } from '../types'

/**
 * Format employee display name with fallbacks
 */
export function formatEmployeeDisplayName(employee: {
  userProfile?: { name?: string; email?: string }
  employeeNumber?: string
}): string {
  return (
    employee.userProfile?.name ||
    employee.userProfile?.email ||
    `Employee ${employee.employeeNumber || 'Unknown'}`
  )
}

/**
 * Calculate total working hours from time entries
 */
export function calculateTotalHours(
  entries: Array<{ type: 'login' | 'logout'; timestamp: number }>
): number {
  let totalHours = 0
  let lastLogin: number | null = null

  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp)

  for (const entry of sortedEntries) {
    if (entry.type === 'login') {
      lastLogin = entry.timestamp
    } else if (entry.type === 'logout' && lastLogin) {
      const hours = (entry.timestamp - lastLogin) / (1000 * 60 * 60)
      totalHours += hours
      lastLogin = null
    }
  }

  return totalHours
}

/**
 * Get color for employee status
 */
export function getStatusColor(status: 'available' | 'busy' | 'offline'): string {
  const colors = {
    available: '#10b981',
    busy: '#f59e0b',
    offline: '#6b7280',
  }
  return colors[status]
}

/**
 * Check if vacation request has conflicts
 */
export function hasVacationConflict(
  newRequest: { startDate: number; endDate: number },
  existingRequests: Array<{ startDate: number; endDate: number; approved: boolean }>
): boolean {
  return existingRequests.some(existing => {
    if (!existing.approved) return false

    return (
      (newRequest.startDate >= existing.startDate && newRequest.startDate <= existing.endDate) ||
      (newRequest.endDate >= existing.startDate && newRequest.endDate <= existing.endDate) ||
      (newRequest.startDate <= existing.startDate && newRequest.endDate >= existing.endDate)
    )
  })
}

/**
 * Calculate vacation days between dates (excluding weekends)
 */
export function calculateVacationDays(
  startDate: number,
  endDate: number,
  excludeWeekends = true
): number {
  let days = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      days++
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${minutes}m`
}

/**
 * Check if employee can approve vacation requests
 */
export function canApproveVacations(userRole: string): boolean {
  const allowedRoles = ['admin', 'superadmin', 'hr', 'manager']
  return allowedRoles.includes(userRole)
}

/**
 * Get vacation type icon
 */
export function getVacationTypeIcon(type: string): string {
  const icons = {
    annual: '🏖️',
    sick: '🤒',
    personal: '👤',
    maternity: '👶',
    paternity: '👨‍👶',
  }
  return icons[type as keyof typeof icons] || '📅'
}

/**
 * Validate employee number format
 */
export function isValidEmployeeNumber(employeeNumber: string): boolean {
  // Format: EMP0001, EMP0002, etc.
  const regex = /^EMP\d{4}$/
  return regex.test(employeeNumber)
}

/**
 * Generate next employee number
 */
export function generateNextEmployeeNumber(lastNumber: string): string {
  const match = lastNumber.match(/\d+/)
  if (!match) return 'EMP0001'

  const num = parseInt(match[0]) + 1
  return `EMP${num.toString().padStart(4, '0')}`
}

/**
 * Group employees by department
 */
export function groupByDepartment<T extends { department?: string }>(
  employees: T[]
): Record<string, T[]> {
  return employees.reduce((groups, employee) => {
    const dept = employee.department || 'Unassigned'
    if (!groups[dept]) {
      groups[dept] = []
    }
    groups[dept].push(employee)
    return groups
  }, {} as Record<string, T[]>)
}

/**
 * Calculate employee tenure in days
 */
export function calculateTenure(hireDate?: number): number {
  if (!hireDate) return 0
  return Math.floor((Date.now() - hireDate) / (1000 * 60 * 60 * 24))
}

/**
 * Format tenure in human-readable format
 */
export function formatTenure(days: number): string {
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)

  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`
  }

  if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`
}