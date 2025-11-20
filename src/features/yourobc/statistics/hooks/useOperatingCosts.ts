// src/features/yourobc/statistics/hooks/useOperatingCosts.ts

import { statisticsService } from '../services/StatisticsService'

/**
 * Hooks for operating costs mutations
 * Re-exports from statisticsService for backward compatibility
 */

// Employee Costs
export function useCreateEmployeeCost() {
  return statisticsService.useCreateEmployeeCost()
}

export function useUpdateEmployeeCost() {
  return statisticsService.useUpdateEmployeeCost()
}

export function useDeleteEmployeeCost() {
  return statisticsService.useDeleteEmployeeCost()
}

// Office Costs
export function useCreateOfficeCost() {
  return statisticsService.useCreateOfficeCost()
}

export function useUpdateOfficeCost() {
  return statisticsService.useUpdateOfficeCost()
}

export function useDeleteOfficeCost() {
  return statisticsService.useDeleteOfficeCost()
}

// Misc Expenses
export function useCreateMiscExpense() {
  return statisticsService.useCreateMiscExpense()
}

export function useApproveMiscExpense() {
  return statisticsService.useApproveMiscExpense()
}

export function useUpdateMiscExpense() {
  return statisticsService.useUpdateMiscExpense()
}

export function useDeleteMiscExpense() {
  return statisticsService.useDeleteMiscExpense()
}
