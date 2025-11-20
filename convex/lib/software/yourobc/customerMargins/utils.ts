// convex/lib/software/yourobc/customerMargins/utils.ts
/**
 * Customer Margins Utility Functions
 *
 * Helper functions for margin calculations, analytics, dunning, and contact management.
 *
 * @module convex/lib/software/yourobc/customerMargins/utils
 */

import type {
  CustomerMargins,
  ServiceMargin,
  RouteMargin,
  VolumeTier,
  MarginCalculation,
  MarginCalculationInput,
  CustomerRiskAssessment,
  ServiceSuspensionCheck,
} from './types'
import {
  DEFAULT_MARGIN_PERCENTAGE,
  DEFAULT_MINIMUM_MARGIN_EUR,
  PAYMENT_THRESHOLDS,
  RISK_LEVELS,
  CONTACT_ALERT_THRESHOLD_DAYS,
  TIME_PERIODS,
} from './constants'

// ============================================================================
// Margin Calculation Utilities
// ============================================================================

/**
 * Calculate margin using dual system (higher of percentage or minimum)
 */
export function calculateDualMargin(
  cost: number,
  marginPercentage: number,
  minimumMarginEUR: number
): MarginCalculation {
  const calculatedMarginFromPercentage = cost * (marginPercentage / 100)
  const calculatedMarginFromMinimum = minimumMarginEUR

  const finalMargin = Math.max(calculatedMarginFromPercentage, calculatedMarginFromMinimum)
  const appliedRule = finalMargin === calculatedMarginFromPercentage ? 'percentage' : 'minimum'
  const finalPrice = cost + finalMargin

  return {
    cost,
    marginPercentage,
    minimumMarginEUR,
    calculatedMarginFromPercentage,
    calculatedMarginFromMinimum,
    finalMargin,
    finalPrice,
    appliedRule,
    ruleSource: 'default', // Will be updated by caller
  }
}

/**
 * Find best matching route margin
 */
export function findRouteMargin(
  routeMargins: RouteMargin[] | undefined,
  origin: string,
  destination: string
): RouteMargin | null {
  if (!routeMargins || routeMargins.length === 0) return null

  // Exact match
  const exactMatch = routeMargins.find(
    (rm) => rm.origin.toLowerCase() === origin.toLowerCase() &&
           rm.destination.toLowerCase() === destination.toLowerCase()
  )
  if (exactMatch) return exactMatch

  // Partial match on origin or destination
  const partialMatch = routeMargins.find(
    (rm) => rm.origin.toLowerCase().includes(origin.toLowerCase()) ||
           rm.destination.toLowerCase().includes(destination.toLowerCase())
  )
  return partialMatch || null
}

/**
 * Find service margin by service type
 */
export function findServiceMargin(
  serviceMargins: ServiceMargin[] | undefined,
  serviceType: string
): ServiceMargin | null {
  if (!serviceMargins || serviceMargins.length === 0) return null

  return serviceMargins.find(
    (sm) => sm.serviceType.toLowerCase() === serviceType.toLowerCase()
  ) || null
}

/**
 * Find applicable volume tier based on monthly shipment volume
 */
export function findVolumeTier(
  volumeTiers: VolumeTier[] | undefined,
  monthlyVolume: number
): VolumeTier | null {
  if (!volumeTiers || volumeTiers.length === 0) return null

  // Sort tiers by minimum volume (descending) to find highest applicable tier
  const sortedTiers = [...volumeTiers].sort(
    (a, b) => b.minShipmentsPerMonth - a.minShipmentsPerMonth
  )

  for (const tier of sortedTiers) {
    if (monthlyVolume >= tier.minShipmentsPerMonth) {
      if (!tier.maxShipmentsPerMonth || monthlyVolume <= tier.maxShipmentsPerMonth) {
        return tier
      }
    }
  }

  return null
}

/**
 * Calculate margin with priority: route > service > volume > default
 */
export function calculateMarginWithPriority(
  marginConfig: CustomerMargins,
  input: MarginCalculationInput
): MarginCalculation {
  let calculation: MarginCalculation

  // Priority 1: Route-specific margin
  if (input.origin && input.destination) {
    const routeMargin = findRouteMargin(marginConfig.routeMargins, input.origin, input.destination)
    if (routeMargin) {
      calculation = calculateDualMargin(
        input.cost,
        routeMargin.marginPercentage,
        routeMargin.minimumMarginEUR
      )
      calculation.ruleSource = 'route'
      return calculation
    }
  }

  // Priority 2: Service-specific margin
  if (input.serviceType) {
    const serviceMargin = findServiceMargin(marginConfig.serviceMargins, input.serviceType)
    if (serviceMargin) {
      calculation = calculateDualMargin(
        input.cost,
        serviceMargin.marginPercentage,
        serviceMargin.minimumMarginEUR
      )
      calculation.ruleSource = 'service'
      return calculation
    }
  }

  // Priority 3: Volume tier margin
  if (input.monthlyVolume) {
    const volumeTier = findVolumeTier(marginConfig.volumeTiers, input.monthlyVolume)
    if (volumeTier) {
      calculation = calculateDualMargin(
        input.cost,
        volumeTier.marginPercentage,
        volumeTier.minimumMarginEUR
      )
      calculation.ruleSource = 'volume'
      return calculation
    }
  }

  // Priority 4: Default margin
  calculation = calculateDualMargin(
    input.cost,
    marginConfig.defaultMarginPercentage,
    marginConfig.defaultMinimumMarginEUR
  )
  calculation.ruleSource = 'default'
  return calculation
}

// ============================================================================
// Analytics Utilities
// ============================================================================

/**
 * Calculate customer risk score based on analytics
 */
export function calculateRiskScore(analytics: {
  averagePaymentDays: number
  totalOutstanding: number
  overdueInvoiceCount: number
  dunningLevel3Count: number
  daysSinceLastContact?: number
  complaintCount: number
  totalRevenue: number
}): CustomerRiskAssessment {
  let riskScore = 0
  const factors = {
    paymentBehavior: 0,
    overdueAmount: 0,
    dunningLevel: 0,
    contactFrequency: 0,
    complaintRate: 0,
  }

  // Payment behavior (0-30 points)
  if (analytics.averagePaymentDays > PAYMENT_THRESHOLDS.CRITICAL_PAYMENT_DAYS) {
    factors.paymentBehavior = 30
  } else if (analytics.averagePaymentDays > PAYMENT_THRESHOLDS.LATE_PAYMENT_DAYS) {
    factors.paymentBehavior = 20
  } else if (analytics.averagePaymentDays > PAYMENT_THRESHOLDS.ACCEPTABLE_PAYMENT_DAYS) {
    factors.paymentBehavior = 10
  }

  // Overdue amount (0-25 points)
  if (analytics.totalOutstanding > 10000) {
    factors.overdueAmount = 25
  } else if (analytics.totalOutstanding > 5000) {
    factors.overdueAmount = 15
  } else if (analytics.totalOutstanding > 1000) {
    factors.overdueAmount = 5
  }

  // Dunning level (0-25 points)
  factors.dunningLevel = Math.min(analytics.dunningLevel3Count * 10, 25)

  // Contact frequency (0-10 points)
  if (analytics.daysSinceLastContact && analytics.daysSinceLastContact > CONTACT_ALERT_THRESHOLD_DAYS * 2) {
    factors.contactFrequency = 10
  } else if (analytics.daysSinceLastContact && analytics.daysSinceLastContact > CONTACT_ALERT_THRESHOLD_DAYS) {
    factors.contactFrequency = 5
  }

  // Complaint rate (0-10 points)
  const complaintRate = analytics.totalRevenue > 0
    ? (analytics.complaintCount / analytics.totalRevenue) * 10000
    : 0
  if (complaintRate > 5) {
    factors.complaintRate = 10
  } else if (complaintRate > 2) {
    factors.complaintRate = 5
  }

  riskScore = Object.values(factors).reduce((sum, val) => sum + val, 0)

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (riskScore >= 70) {
    riskLevel = 'critical'
  } else if (riskScore >= 45) {
    riskLevel = 'high'
  } else if (riskScore >= 25) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (factors.paymentBehavior > 15) {
    recommendations.push('Review payment terms and consider requiring prepayment')
  }
  if (factors.overdueAmount > 15) {
    recommendations.push('Escalate dunning process and consider service suspension')
  }
  if (factors.dunningLevel > 10) {
    recommendations.push('Consider legal action or debt collection')
  }
  if (factors.contactFrequency > 5) {
    recommendations.push('Schedule immediate customer contact to maintain relationship')
  }
  if (factors.complaintRate > 5) {
    recommendations.push('Investigate service quality issues and improve customer satisfaction')
  }

  return {
    customerId: '' as any, // Will be set by caller
    riskLevel,
    riskScore,
    factors,
    recommendations,
    calculatedAt: Date.now(),
  }
}

/**
 * Calculate days since last contact
 */
export function calculateDaysSinceLastContact(lastContactDate?: number): number | undefined {
  if (!lastContactDate) return undefined
  return Math.floor((Date.now() - lastContactDate) / TIME_PERIODS.ONE_DAY)
}

/**
 * Check if customer needs follow-up alert
 */
export function needsFollowUpAlert(daysSinceLastContact?: number): boolean {
  if (!daysSinceLastContact) return true // No contact ever = needs alert
  return daysSinceLastContact > CONTACT_ALERT_THRESHOLD_DAYS
}

// ============================================================================
// Dunning Utilities
// ============================================================================

/**
 * Determine current dunning level based on days overdue
 */
export function determineDunningLevel(daysOverdue: number, config: {
  level1DaysOverdue: number
  level2DaysOverdue: number
  level3DaysOverdue: number
}): 0 | 1 | 2 | 3 {
  if (daysOverdue >= config.level3DaysOverdue) return 3
  if (daysOverdue >= config.level2DaysOverdue) return 2
  if (daysOverdue >= config.level1DaysOverdue) return 1
  return 0
}

/**
 * Calculate days overdue from invoice due date
 */
export function calculateDaysOverdue(dueDate: number): number {
  const now = Date.now()
  if (now <= dueDate) return 0
  return Math.floor((now - dueDate) / TIME_PERIODS.ONE_DAY)
}

/**
 * Check if service should be suspended
 */
export function checkServiceSuspension(
  dunningConfig: {
    allowServiceWhenOverdue: boolean
    serviceSuspended?: boolean
    requirePrepayment: boolean
  },
  daysOverdue: number,
  totalOverdue: number
): ServiceSuspensionCheck {
  // Already suspended
  if (dunningConfig.serviceSuspended) {
    return {
      isSuspended: true,
      canCreateOrders: false,
      suspensionReason: 'Service suspended due to payment issues',
      requiresPrepayment: dunningConfig.requirePrepayment,
      outstandingAmount: totalOverdue,
    }
  }

  // Prepayment required
  if (dunningConfig.requirePrepayment) {
    return {
      isSuspended: false,
      canCreateOrders: true,
      requiresPrepayment: true,
    }
  }

  // Not allowed when overdue
  if (!dunningConfig.allowServiceWhenOverdue && daysOverdue > 0) {
    return {
      isSuspended: false,
      canCreateOrders: false,
      suspensionReason: 'New orders not allowed while invoices are overdue',
      requiresPrepayment: false,
      outstandingAmount: totalOverdue,
    }
  }

  return {
    isSuspended: false,
    canCreateOrders: true,
    requiresPrepayment: false,
  }
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Calculate next review date based on review frequency
 */
export function calculateNextReviewDate(reviewFrequencyDays: number): number {
  return Date.now() + (reviewFrequencyDays * TIME_PERIODS.ONE_DAY)
}

/**
 * Check if margin configuration needs review
 */
export function needsReview(nextReviewDate?: number): boolean {
  if (!nextReviewDate) return false
  return Date.now() >= nextReviewDate
}

/**
 * Format period string (YYYY or YYYY-MM)
 */
export function formatPeriod(year: number, month?: number): string {
  if (month) {
    return `${year}-${String(month).padStart(2, '0')}`
  }
  return String(year)
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate margin percentage
 */
export function validateMarginPercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100
}

/**
 * Validate minimum margin
 */
export function validateMinimumMargin(minimum: number): boolean {
  return minimum >= 0
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: number, endDate: number): boolean {
  return startDate <= endDate
}

// ============================================================================
// Export All Utilities
// ============================================================================

export default {
  calculateDualMargin,
  findRouteMargin,
  findServiceMargin,
  findVolumeTier,
  calculateMarginWithPriority,
  calculateRiskScore,
  calculateDaysSinceLastContact,
  needsFollowUpAlert,
  determineDunningLevel,
  calculateDaysOverdue,
  checkServiceSuspension,
  calculateNextReviewDate,
  needsReview,
  formatPeriod,
  validateMarginPercentage,
  validateMinimumMargin,
  validateDateRange,
}
