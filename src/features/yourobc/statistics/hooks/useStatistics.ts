// src/features/yourobc/statistics/hooks/useStatistics.ts

import { useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { statisticsService } from '../services/StatisticsService'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  RevenueAnalysis,
  MonthlyRevenue,
  TopCustomers,
  YearOverYearComparison,
  RealProfit,
  EmployeeKPIData,
  AllEmployeeKPIs,
  EmployeeRanking,
  QuotePerformanceAnalysis,
  OperatingCostsSummary,
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  PendingExpenseApproval,
} from '../types'

// ========================================
// REVENUE ANALYSIS HOOKS
// ========================================

/**
 * Hook for revenue analysis queries
 */
export function useRevenueAnalysis(
  startDate: number,
  endDate: number,
  employeeId?: Id<'yourobcEmployees'>,
  customerId?: Id<'yourobcCustomers'>
): {
  data: RevenueAnalysis | undefined
  isLoading: boolean
  error: Error | null
  canViewRevenue: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useRevenueAnalysis(
    authUser?.id || '',
    startDate,
    endDate,
    employeeId,
    customerId
  )

  const canViewRevenue = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.revenue.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRevenue,
    currentUser: authUser,
  }
}

export function useMonthlyRevenue(
  year: number,
  employeeId?: Id<'yourobcEmployees'>
): {
  data: MonthlyRevenue | undefined
  isLoading: boolean
  error: Error | null
  canViewRevenue: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useMonthlyRevenue(
    authUser?.id || '',
    year,
    employeeId
  )

  const canViewRevenue = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.revenue.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRevenue,
    currentUser: authUser,
  }
}

export function useTopCustomersByRevenue(
  startDate: number,
  endDate: number,
  options?: {
    limit?: number
    sortBy?: 'revenue' | 'margin' | 'count'
  }
): {
  data: TopCustomers | undefined
  isLoading: boolean
  error: Error | null
  canViewRevenue: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useTopCustomersByRevenue(
    authUser?.id || '',
    startDate,
    endDate,
    options
  )

  const canViewRevenue = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.revenue.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRevenue,
    currentUser: authUser,
  }
}

export function useYearOverYearComparison(
  currentYear: number,
  employeeId?: Id<'yourobcEmployees'>
): {
  data: YearOverYearComparison | undefined
  isLoading: boolean
  error: Error | null
  canViewRevenue: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useYearOverYearComparison(
    authUser?.id || '',
    currentYear,
    employeeId
  )

  const canViewRevenue = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.revenue.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRevenue,
    currentUser: authUser,
  }
}

export function useRealProfit(
  startDate: number,
  endDate: number
): {
  data: RealProfit | undefined
  isLoading: boolean
  error: Error | null
  canViewRevenue: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useRealProfit(
    authUser?.id || '',
    startDate,
    endDate
  )

  const canViewRevenue = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.revenue.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRevenue,
    currentUser: authUser,
  }
}

// ========================================
// EMPLOYEE KPI HOOKS
// ========================================

/**
 * Hook for employee KPIs queries
 */
export function useEmployeeKPIs(
  employeeId: Id<'yourobcEmployees'>,
  startDate: number,
  endDate: number
): {
  data: EmployeeKPIData | undefined
  isLoading: boolean
  error: Error | null
  canViewKPIs: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeKPIs(
    authUser?.id || '',
    employeeId,
    startDate,
    endDate
  )

  const canViewKPIs = useMemo(() => {
    if (!authUser) return false
    // Can view own KPIs or if admin/manager
    if (authUser.id === employeeId) return true
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.kpis.view')
    )
  }, [authUser, employeeId])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewKPIs,
    currentUser: authUser,
  }
}

export function useAllEmployeeKPIs(
  startDate: number,
  endDate: number
): {
  data: AllEmployeeKPIs | undefined
  isLoading: boolean
  error: Error | null
  canViewAllKPIs: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useAllEmployeeKPIs(
    authUser?.id || '',
    startDate,
    endDate
  )

  const canViewAllKPIs = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.kpis.viewAll')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewAllKPIs,
    currentUser: authUser,
  }
}

export function useEmployeeRanking(
  startDate: number,
  endDate: number,
  rankBy?: 'revenue' | 'margin' | 'orders' | 'conversionRate'
): {
  data: EmployeeRanking | undefined
  isLoading: boolean
  error: Error | null
  canViewRanking: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeRanking(
    authUser?.id || '',
    startDate,
    endDate,
    rankBy
  )

  const canViewRanking = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.kpis.viewAll')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewRanking,
    currentUser: authUser,
  }
}

export function useQuotePerformanceAnalysis(
  startDate: number,
  endDate: number,
  employeeId?: Id<'yourobcEmployees'>
): {
  data: QuotePerformanceAnalysis | undefined
  isLoading: boolean
  error: Error | null
  canViewQuotePerformance: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useQuotePerformanceAnalysis(
    authUser?.id || '',
    startDate,
    endDate,
    employeeId
  )

  const canViewQuotePerformance = useMemo(() => {
    if (!authUser) return false
    // Can view own performance or if admin/manager
    if (employeeId && authUser.id === employeeId) return true
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.quotes.view')
    )
  }, [authUser, employeeId])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewQuotePerformance,
    currentUser: authUser,
  }
}

export function useEmployeeKPITrend(
  employeeId: Id<'yourobcEmployees'>,
  year: number
) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeKPITrend(
    authUser?.id || '',
    employeeId,
    year
  )

  const canViewTrend = useMemo(() => {
    if (!authUser) return false
    // Can view own trend or if admin/manager
    if (authUser.id === employeeId) return true
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.kpis.view')
    )
  }, [authUser, employeeId])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewTrend,
    currentUser: authUser,
  }
}

// ========================================
// OPERATING COSTS HOOKS
// ========================================

/**
 * Hook for operating costs queries
 */
export function useOperatingCostsSummary(
  startDate: number,
  endDate: number
): {
  data: OperatingCostsSummary | undefined
  isLoading: boolean
  error: Error | null
  canViewCosts: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useOperatingCostsSummary(
    authUser?.id || '',
    startDate,
    endDate
  )

  const canViewCosts = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.costs.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewCosts,
    currentUser: authUser,
  }
}

export function useEmployeeCosts(
  employeeId?: Id<'yourobcEmployees'>,
  department?: string
): {
  data: EmployeeCost[] | undefined
  isLoading: boolean
  error: Error | null
  canViewEmployeeCosts: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeCosts(
    authUser?.id || '',
    employeeId,
    department
  )

  const canViewEmployeeCosts = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.costs.viewEmployees')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewEmployeeCosts,
    currentUser: authUser,
  }
}

export function useOfficeCosts(
  category?: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
): {
  data: OfficeCost[] | undefined
  isLoading: boolean
  error: Error | null
  canViewOfficeCosts: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useOfficeCosts(
    authUser?.id || '',
    category
  )

  const canViewOfficeCosts = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.costs.viewOffice')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewOfficeCosts,
    currentUser: authUser,
  }
}

export function useMiscExpenses(
  category?: 'trade_show' | 'marketing' | 'tools' | 'software' | 'travel' | 'entertainment' | 'other',
  approved?: boolean,
  employeeId?: Id<'yourobcEmployees'>
): {
  data: MiscExpense[] | undefined
  isLoading: boolean
  error: Error | null
  canViewExpenses: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useMiscExpenses(
    authUser?.id || '',
    category,
    approved,
    employeeId
  )

  const canViewExpenses = useMemo(() => {
    if (!authUser) return false
    // Can view own expenses or if admin
    if (employeeId && authUser.id === employeeId) return true
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.costs.viewExpenses')
    )
  }, [authUser, employeeId])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewExpenses,
    currentUser: authUser,
  }
}

export function usePendingExpenseApprovals(): {
  data: PendingExpenseApproval[] | undefined
  isLoading: boolean
  error: Error | null
  canApproveExpenses: boolean
  currentUser: ReturnType<typeof useAuthenticatedUser>
} {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.usePendingExpenseApprovals(
    authUser?.id || ''
  )

  const canApproveExpenses = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.costs.approveExpenses')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canApproveExpenses,
    currentUser: authUser,
  }
}

// ========================================
// REPORTING HOOKS
// ========================================

/**
 * Hook for reporting queries
 */
export function useMonthlyReport(year: number, month: number) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useMonthlyReport(
    authUser?.id || '',
    year,
    month
  )

  const canViewReports = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.reports.view')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewReports,
    currentUser: authUser,
  }
}

export function useCustomerReport(
  customerId: Id<'yourobcCustomers'>,
  startDate?: number,
  endDate?: number
) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useCustomerReport(
    authUser?.id || '',
    customerId,
    startDate,
    endDate
  )

  const canViewCustomerReports = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.reports.viewCustomer')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewCustomerReports,
    currentUser: authUser,
  }
}

export function useEmployeeReport(
  employeeId: Id<'yourobcEmployees'>,
  startDate: number,
  endDate: number
) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeReport(
    authUser?.id || '',
    employeeId,
    startDate,
    endDate
  )

  const canViewEmployeeReport = useMemo(() => {
    if (!authUser) return false
    // Can view own report or if admin/manager
    if (authUser.id === employeeId) return true
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.reports.viewEmployee')
    )
  }, [authUser, employeeId])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewEmployeeReport,
    currentUser: authUser,
  }
}

export function useOrderAnalysisReport(startDate: number, endDate: number) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useOrderAnalysisReport(
    authUser?.id || '',
    startDate,
    endDate
  )

  const canViewOrderAnalysis = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.role === 'manager' ||
      authUser.permissions.includes('statistics.reports.viewOrders')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewOrderAnalysis,
    currentUser: authUser,
  }
}

export function useExecutiveReport(year: number, month?: number) {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useExecutiveReport(
    authUser?.id || '',
    year,
    month
  )

  const canViewExecutiveReport = useMemo(() => {
    if (!authUser) return false
    return (
      authUser.role === 'admin' ||
      authUser.role === 'superadmin' ||
      authUser.permissions.includes('statistics.reports.viewExecutive')
    )
  }, [authUser])

  return {
    data,
    isLoading: isPending,
    error: error ?? null,
    canViewExecutiveReport,
    currentUser: authUser,
  }
}

/**
 * Hook to get list of customers for dropdown selection
 */
export function useCustomerList() {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useCustomerList(
    authUser?.id || ''
  )

  return {
    data: data || [],
    isLoading: isPending,
    error: error ?? null,
    currentUser: authUser,
  }
}

/**
 * Hook to get list of employees for dropdown selection
 */
export function useEmployeeList() {
  const authUser = useAuthenticatedUser()

  const { data, isPending, error } = statisticsService.useEmployeeList(
    authUser?.id || ''
  )

  return {
    data: data || [],
    isLoading: isPending,
    error: error ?? null,
    currentUser: authUser,
  }
}
