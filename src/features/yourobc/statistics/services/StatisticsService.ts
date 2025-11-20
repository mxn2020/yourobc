// src/features/yourobc/statistics/services/StatisticsService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  RankBy,
  SortBy,
  EmployeeCost,
  OfficeCost,
  MiscExpense,
} from '../types'

export class StatisticsService {
  // ========================================
  // REVENUE ANALYSIS QUERY HOOKS
  // ========================================

  useRevenueAnalysis(
    authUserId: string,
    startDate: number,
    endDate: number,
    employeeId?: Id<'yourobcEmployees'>,
    customerId?: Id<'yourobcCustomers'>
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.revenue.queries.getRevenueAnalysis, {
        startDate,
        endDate,
        employeeId,
        customerId,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useMonthlyRevenue(authUserId: string, year: number, employeeId?: Id<'yourobcEmployees'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.revenue.queries.getMonthlyRevenue, {
        year,
        employeeId,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!year,
    })
  }

  useTopCustomersByRevenue(
    authUserId: string,
    startDate: number,
    endDate: number,
    options?: {
      limit?: number
      sortBy?: SortBy
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.revenue.queries.getTopCustomersByRevenue, {
        startDate,
        endDate,
        limit: options?.limit,
        sortBy: options?.sortBy,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useYearOverYearComparison(
    authUserId: string,
    currentYear: number,
    employeeId?: Id<'yourobcEmployees'>
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.revenue.queries.getYearOverYearComparison, {
        currentYear,
        employeeId,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!currentYear,
    })
  }

  useRealProfit(authUserId: string, startDate: number, endDate: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.revenue.queries.getRealProfit, {
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  // ========================================
  // EMPLOYEE KPI QUERY HOOKS
  // ========================================

  useEmployeeKPIs(
    authUserId: string,
    employeeId: Id<'yourobcEmployees'>,
    startDate: number,
    endDate: number
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.employee_kpis.queries.getEmployeeKPIs, {
        employeeId,
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!employeeId && !!startDate && !!endDate,
    })
  }

  useAllEmployeeKPIs(authUserId: string, startDate: number, endDate: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.employee_kpis.queries.getAllEmployeeKPIs, {
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useEmployeeRanking(
    authUserId: string,
    startDate: number,
    endDate: number,
    rankBy?: RankBy
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.employee_kpis.queries.getEmployeeRanking, {
        startDate,
        endDate,
        rankBy,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useQuotePerformanceAnalysis(
    authUserId: string,
    startDate: number,
    endDate: number,
    employeeId?: Id<'yourobcEmployees'>
  ) {
    return useQuery({
      ...convexQuery(
        api.lib.yourobc.statistics.employee_kpis.queries.getQuotePerformanceAnalysis,
        {
          startDate,
          endDate,
          employeeId,
        }
      ),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useEmployeeKPITrend(authUserId: string, employeeId: Id<'yourobcEmployees'>, year: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.employee_kpis.queries.getEmployeeKPITrend, {
        employeeId,
        year,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!employeeId && !!year,
    })
  }

  // ========================================
  // OPERATING COSTS QUERY HOOKS
  // ========================================

  useOperatingCostsSummary(authUserId: string, startDate: number, endDate: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.operating_costs.queries.getOperatingCostsSummary, {
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useEmployeeCosts(
    authUserId: string,
    employeeId?: Id<'yourobcEmployees'>,
    department?: string
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.operating_costs.queries.getEmployeeCosts, {
        employeeId,
        department,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useOfficeCosts(
    authUserId: string,
    category?: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.operating_costs.queries.getOfficeCosts, {
        category,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useMiscExpenses(
    authUserId: string,
    category?:
      | 'trade_show'
      | 'marketing'
      | 'tools'
      | 'software'
      | 'travel'
      | 'entertainment'
      | 'other',
    approved?: boolean,
    employeeId?: Id<'yourobcEmployees'>
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.operating_costs.queries.getMiscExpenses, {
        category,
        approved,
        employeeId,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  usePendingExpenseApprovals(authUserId: string) {
    return useQuery({
      ...convexQuery(
        api.lib.yourobc.statistics.operating_costs.queries.getPendingExpenseApprovals,
        {}
      ),
      staleTime: 60000, // 1 minute - more frequent for approvals
      enabled: !!authUserId,
    })
  }

  // ========================================
  // REPORTING QUERY HOOKS
  // ========================================

  useMonthlyReport(authUserId: string, year: number, month: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getMonthlyReport, {
        year,
        month,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!year && !!month && month >= 1 && month <= 12,
    })
  }

  useCustomerReport(
    authUserId: string,
    customerId: Id<'yourobcCustomers'>,
    startDate?: number,
    endDate?: number
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getCustomerReport, {
        customerId,
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!customerId,
    })
  }

  useEmployeeReport(
    authUserId: string,
    employeeId: Id<'yourobcEmployees'>,
    startDate: number,
    endDate: number
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getEmployeeReport, {
        employeeId,
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!employeeId && !!startDate && !!endDate,
    })
  }

  useOrderAnalysisReport(authUserId: string, startDate: number, endDate: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getOrderAnalysisReport, {
        startDate,
        endDate,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!startDate && !!endDate,
    })
  }

  useExecutiveReport(authUserId: string, year: number, month?: number) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getExecutiveReport, {
        year,
        month,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId && !!year,
    })
  }

  useCustomerList(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getCustomerList, {}),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useEmployeeList(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.statistics.reporting.queries.getEmployeeList, {}),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  // ========================================
  // KPI MANAGEMENT MUTATION HOOKS
  // ========================================

  useSetEmployeeTargets() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.employee_kpis.mutations.setEmployeeTargets)
    })
  }

  useSetTeamTargets() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.employee_kpis.mutations.setTeamTargets)
    })
  }

  useDeleteKPITarget() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.employee_kpis.mutations.deleteKPITarget)
    })
  }


  useCacheEmployeeKPIs() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.employee_kpis.mutations.cacheEmployeeKPIs)
    })
  }


  // ========================================
  // EMPLOYEE COSTS MUTATION HOOKS
  // ========================================

  useCreateEmployeeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.createEmployeeCost)
    })
  }

  useUpdateEmployeeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.updateEmployeeCost)
    })
  }

  useDeleteEmployeeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.deleteEmployeeCost)
    })
  }

  // ========================================
  // OFFICE COSTS MUTATION HOOKS
  // ========================================

  useCreateOfficeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.createOfficeCost)
    })
  }

  useUpdateOfficeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.updateOfficeCost)
    })
  }

  useDeleteOfficeCost() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.deleteOfficeCost)
    })
  }

  // ========================================
  // MISC EXPENSES MUTATION HOOKS
  // ========================================

  useCreateMiscExpense() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.createMiscExpense)
    })
  }

  useApproveMiscExpense() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.approveMiscExpense)
    })
  }

  useUpdateMiscExpense() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.updateMiscExpense)
    })
  }

  useDeleteMiscExpense() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.statistics.operating_costs.mutations.deleteMiscExpense)
    })
  }

  // ========================================
  // MUTATION ACTION METHODS
  // ========================================

  async setEmployeeTargets(
    mutation: ReturnType<typeof this.useSetEmployeeTargets>,
    authUserId: string,
    data: {
      employeeId: Id<'yourobcEmployees'>
      year: number
      month?: number
      quarter?: number
      revenueTarget?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      marginTarget?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      quoteCountTarget?: number
      orderCountTarget?: number
      conversionRateTarget?: number
      averageMarginTarget?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async setTeamTargets(
    mutation: ReturnType<typeof this.useSetTeamTargets>,
    authUserId: string,
    data: {
      teamName: string
      year: number
      month?: number
      quarter?: number
      revenueTarget?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      marginTarget?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      quoteCountTarget?: number
      orderCountTarget?: number
      conversionRateTarget?: number
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async deleteKPITarget(
    mutation: ReturnType<typeof this.useDeleteKPITarget>,
    authUserId: string,
    targetId: Id<'yourobcKpiTargets'>
  ) {
    return await mutation.mutateAsync({ authUserId, targetId })
  }

  async createEmployeeCost(
    mutation: ReturnType<typeof this.useCreateEmployeeCost>,
    authUserId: string,
    data: {
      employeeId?: Id<'yourobcEmployees'>
      employeeName?: string
      position: string
      department?: string
      monthlySalary: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      benefits?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      bonuses?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      otherCosts?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      startDate: number
      endDate?: number
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async updateEmployeeCost(
    mutation: ReturnType<typeof this.useUpdateEmployeeCost>,
    authUserId: string,
    costId: Id<'yourobcEmployeeCosts'>,
    data: {
      monthlySalary?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      benefits?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      bonuses?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      otherCosts?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      endDate?: number
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, costId, ...data })
  }

  async deleteEmployeeCost(
    mutation: ReturnType<typeof this.useDeleteEmployeeCost>,
    authUserId: string,
    costId: Id<'yourobcEmployeeCosts'>
  ) {
    return await mutation.mutateAsync({ authUserId, costId })
  }

  async createOfficeCost(
    mutation: ReturnType<typeof this.useCreateOfficeCost>,
    authUserId: string,
    data: {
      category: 'rent' | 'utilities' | 'insurance' | 'maintenance' | 'supplies' | 'technology' | 'other'
      description: string
      amount: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
      date: number
      endDate?: number
      vendor?: string
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async updateOfficeCost(
    mutation: ReturnType<typeof this.useUpdateOfficeCost>,
    authUserId: string,
    costId: Id<'yourobcOfficeCosts'>,
    data: {
      description?: string
      amount?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      endDate?: number
      vendor?: string
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, costId, ...data })
  }

  async deleteOfficeCost(
    mutation: ReturnType<typeof this.useDeleteOfficeCost>,
    authUserId: string,
    costId: Id<'yourobcOfficeCosts'>
  ) {
    return await mutation.mutateAsync({ authUserId, costId })
  }

  async createMiscExpense(
    mutation: ReturnType<typeof this.useCreateMiscExpense>,
    authUserId: string,
    data: {
      category: 'trade_show' | 'marketing' | 'tools' | 'software' | 'travel' | 'entertainment' | 'other'
      description: string
      amount: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      date: number
      relatedEmployeeId?: Id<'yourobcEmployees'>
      relatedProjectId?: Id<'projects'>
      vendor?: string
      receiptUrl?: string
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, ...data })
  }

  async approveMiscExpense(
    mutation: ReturnType<typeof this.useApproveMiscExpense>,
    authUserId: string,
    expenseId: Id<'yourobcMiscExpenses'>,
    approved: boolean,
    notes?: string
  ) {
    return await mutation.mutateAsync({ authUserId, expenseId, approved, notes })
  }

  async updateMiscExpense(
    mutation: ReturnType<typeof this.useUpdateMiscExpense>,
    authUserId: string,
    expenseId: Id<'yourobcMiscExpenses'>,
    data: {
      description?: string
      amount?: { amount: number; currency: 'EUR' | 'USD'; exchangeRate?: number }
      vendor?: string
      receiptUrl?: string
      notes?: string
    }
  ) {
    return await mutation.mutateAsync({ authUserId, expenseId, ...data })
  }

  async deleteMiscExpense(
    mutation: ReturnType<typeof this.useDeleteMiscExpense>,
    authUserId: string,
    expenseId: Id<'yourobcMiscExpenses'>
  ) {
    return await mutation.mutateAsync({ authUserId, expenseId })
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  validateEmployeeCostData(data: Partial<EmployeeCost>): string[] {
    const errors: string[] = []

    if (data.employeeId !== undefined && !data.employeeId) {
      errors.push('Employee is required')
    }

    if (data.monthlySalary !== undefined) {
      if (data.monthlySalary.amount < 0) {
        errors.push('Monthly salary cannot be negative')
      }
      if (data.monthlySalary.amount > 1000000) {
        errors.push('Monthly salary seems unreasonably high')
      }
    }

    if (data.benefits !== undefined && data.benefits.amount < 0) {
      errors.push('Benefits amount cannot be negative')
    }

    if (data.otherCosts !== undefined && data.otherCosts.amount < 0) {
      errors.push('Other costs cannot be negative')
    }

    return errors
  }

  validateOfficeCostData(data: Partial<OfficeCost>): string[] {
    const errors: string[] = []

    if (data.description !== undefined) {
      const trimmedDesc = data.description.trim()
      if (trimmedDesc.length === 0) {
        errors.push('Description is required')
      }
      if (trimmedDesc.length < 3) {
        errors.push('Description must be at least 3 characters')
      }
    }

    if (data.amount !== undefined) {
      if (data.amount.amount <= 0) {
        errors.push('Amount must be greater than zero')
      }
      if (data.amount.amount > 10000000) {
        errors.push('Amount seems unreasonably high')
      }
    }

    if (data.category !== undefined) {
      const validCategories = ['rent', 'utilities', 'insurance', 'maintenance', 'supplies', 'technology', 'other']
      if (!validCategories.includes(data.category)) {
        errors.push('Invalid office cost category')
      }
    }

    return errors
  }

  validateMiscExpenseData(data: Partial<MiscExpense>): string[] {
    const errors: string[] = []

    if (data.description !== undefined) {
      const trimmedDesc = data.description.trim()
      if (trimmedDesc.length === 0) {
        errors.push('Description is required')
      }
      if (trimmedDesc.length < 3) {
        errors.push('Description must be at least 3 characters')
      }
    }

    if (data.amount !== undefined) {
      if (data.amount.amount <= 0) {
        errors.push('Amount must be greater than zero')
      }
    }

    if (data.category !== undefined) {
      const validCategories = ['trade_show', 'marketing', 'tools', 'software', 'travel', 'entertainment', 'other']
      if (!validCategories.includes(data.category)) {
        errors.push('Invalid expense category')
      }
    }

    if (data.date !== undefined) {
      const now = Date.now()
      const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
      if (data.date > now) {
        errors.push('Expense date cannot be in the future')
      }
      if (data.date < oneYearAgo) {
        errors.push('Expense date cannot be more than one year ago')
      }
    }

    return errors
  }

  validateKPITargetData(data: {
    revenueTarget?: { amount: number; currency: string }
    marginTarget?: { amount: number; currency: string }
    quoteCountTarget?: number
    orderCountTarget?: number
    conversionRateTarget?: number
  }): string[] {
    const errors: string[] = []

    if (data.revenueTarget) {
      if (data.revenueTarget.amount <= 0) {
        errors.push('Revenue target must be greater than zero')
      }
      if (!['EUR', 'USD'].includes(data.revenueTarget.currency)) {
        errors.push('Revenue target currency must be EUR or USD')
      }
    }

    if (data.marginTarget) {
      if (data.marginTarget.amount <= 0) {
        errors.push('Margin target must be greater than zero')
      }
      if (!['EUR', 'USD'].includes(data.marginTarget.currency)) {
        errors.push('Margin target currency must be EUR or USD')
      }
    }

    if (data.quoteCountTarget !== undefined && data.quoteCountTarget < 0) {
      errors.push('Quote count target cannot be negative')
    }

    if (data.orderCountTarget !== undefined && data.orderCountTarget < 0) {
      errors.push('Order count target cannot be negative')
    }

    if (data.conversionRateTarget !== undefined) {
      if (data.conversionRateTarget < 0 || data.conversionRateTarget > 100) {
        errors.push('Conversion rate target must be between 0 and 100')
      }
    }

    return errors
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Calculate margin percentage
   */
  calculateMarginPercentage(revenue: number, cost: number): number {
    if (revenue === 0) return 0
    return ((revenue - cost) / revenue) * 100
  }

  /**
   * Check if user can view revenue data
   */
  canViewRevenue(user: { role: string; permissions?: string[] }): boolean {
    return user.role === 'admin' || user.permissions?.includes('statistics.revenue.view') || false
  }

  /**
   * Check if user can view employee KPIs
   */
  canViewEmployeeKPIs(
    user: { role: string; userId: string; permissions?: string[] },
    targetEmployeeId?: string
  ): boolean {
    if (user.role === 'admin' || user.role === 'manager') return true
    if (user.permissions?.includes('statistics.kpis.view_all')) return true
    if (targetEmployeeId && user.userId === targetEmployeeId) return true
    return false
  }

  /**
   * Check if user can manage operating costs
   */
  canManageOperatingCosts(user: { role: string; permissions?: string[] }): boolean {
    return (
      user.role === 'admin' || user.permissions?.includes('statistics.operating_costs.manage') || false
    )
  }

  /**
   * Get financial quarter from date
   */
  getFinancialQuarter(date: Date | number): number {
    const d = typeof date === 'number' ? new Date(date) : date
    const month = d.getMonth() + 1
    return Math.ceil(month / 3)
  }

  /**
   * Format report period
   */
  formatReportPeriod(startDate: number, endDate: number): string {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    return `${formatter.format(start)} - ${formatter.format(end)}`
  }

  /**
   * Calculate growth percentage
   */
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
  }

  /**
   * Get color based on target achievement percentage
   */
  getAchievementColor(percentage: number): string {
    if (percentage >= 100) return '#10b981' // green
    if (percentage >= 80) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  /**
   * Check if KPI target is achieved
   */
  isTargetAchieved(actual: number, target: number): boolean {
    return actual >= target
  }

  /**
   * Calculate total employee cost
   */
  calculateTotalEmployeeCost(cost: EmployeeCost): number {
    return cost.monthlySalary.amount + (cost.benefits?.amount || 0) + (cost.otherCosts?.amount || 0)
  }

  /**
   * Format compact number (1000 -> 1K, 1000000 -> 1M)
   */
  formatCompactNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  /**
   * Get month name from month number (1-12)
   */
  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month - 1] || ''
  }

  /**
   * Get date range for current month
   */
  getCurrentMonthDateRange(): { startDate: number; endDate: number } {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime()
    return { startDate, endDate }
  }

  /**
   * Get date range for current year
   */
  getCurrentYearDateRange(): { startDate: number; endDate: number } {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), 0, 1).getTime()
    const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999).getTime()
    return { startDate, endDate }
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService()
