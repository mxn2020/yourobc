// convex/lib/yourobc/customers/margins/utils.ts

import type { Doc } from '../../../../_generated/dataModel'

type MarginRule = Doc<'yourobcCustomerMargins'>

/**
 * Apply dual margin logic: whichever is higher wins
 * Percentage OR minimum EUR amount
 */
export function applyDualMarginLogic(
  revenue: number,
  marginPercentage: number,
  minimumMarginEUR: number
): { marginAmount: number; appliedMethod: 'percentage' | 'minimum'; percentage: number } {
  const percentageMargin = (revenue * marginPercentage) / 100
  const minimumMargin = minimumMarginEUR

  if (percentageMargin >= minimumMargin) {
    return {
      marginAmount: percentageMargin,
      appliedMethod: 'percentage',
      percentage: marginPercentage,
    }
  } else {
    return {
      marginAmount: minimumMargin,
      appliedMethod: 'minimum',
      percentage: (minimumMargin / revenue) * 100,
    }
  }
}

/**
 * Find applicable service-specific margin
 */
export function findServiceMargin(
  rule: MarginRule,
  serviceType: string
): { marginPercentage: number; minimumMarginEUR: number } | null {
  if (!rule.serviceMargins || rule.serviceMargins.length === 0) {
    return null
  }

  const serviceMargin = rule.serviceMargins.find(
    (sm) => sm.serviceType === serviceType
  )

  if (!serviceMargin) {
    return null
  }

  return {
    marginPercentage: serviceMargin.marginPercentage,
    minimumMarginEUR: serviceMargin.minimumMarginEUR,
  }
}

/**
 * Find applicable route-specific margin
 */
export function findRouteMargin(
  rule: MarginRule,
  origin: string,
  destination: string
): { marginPercentage: number; minimumMarginEUR: number } | null {
  if (!rule.routeMargins || rule.routeMargins.length === 0) {
    return null
  }

  // Try exact match first
  let routeMargin = rule.routeMargins.find(
    (rm) =>
      rm.origin.toLowerCase() === origin.toLowerCase() &&
      rm.destination.toLowerCase() === destination.toLowerCase()
  )

  // Try partial match (city name without ZIP)
  if (!routeMargin) {
    const originCity = origin.split(' ')[0] // Get first word (city)
    const destCity = destination.split(' ')[0]

    routeMargin = rule.routeMargins.find((rm) => {
      const rmOriginCity = rm.origin.split(' ')[0]
      const rmDestCity = rm.destination.split(' ')[0]
      return (
        rmOriginCity.toLowerCase() === originCity.toLowerCase() &&
        rmDestCity.toLowerCase() === destCity.toLowerCase()
      )
    })
  }

  if (!routeMargin) {
    return null
  }

  return {
    marginPercentage: routeMargin.marginPercentage,
    minimumMarginEUR: routeMargin.minimumMarginEUR,
  }
}

/**
 * Find applicable volume tier based on shipment count
 */
export function findVolumeTier(
  rule: MarginRule,
  monthlyShipmentCount: number
): { marginPercentage: number; minimumMarginEUR: number } | null {
  if (!rule.volumeTiers || rule.volumeTiers.length === 0) {
    return null
  }

  // Sort tiers by minShipmentsPerMonth ascending
  const sortedTiers = [...rule.volumeTiers].sort(
    (a, b) => a.minShipmentsPerMonth - b.minShipmentsPerMonth
  )

  // Find the applicable tier
  for (const tier of sortedTiers) {
    if (monthlyShipmentCount >= tier.minShipmentsPerMonth) {
      if (
        tier.maxShipmentsPerMonth === undefined ||
        monthlyShipmentCount <= tier.maxShipmentsPerMonth
      ) {
        return {
          marginPercentage: tier.marginPercentage,
          minimumMarginEUR: tier.minimumMarginEUR,
        }
      }
    }
  }

  return null
}

/**
 * Calculate margin for a customer with all logic applied
 * Priority: Route > Service > Volume Tier > Default
 */
export function calculateCustomerMargin(
  rule: MarginRule,
  revenue: number,
  options: {
    serviceType?: string
    origin?: string
    destination?: string
    monthlyShipmentCount?: number
  }
): {
  marginAmount: number
  marginPercentage: number
  appliedRule: 'route' | 'service' | 'volume_tier' | 'default'
  appliedMethod: 'percentage' | 'minimum'
  details: {
    configuredPercentage: number
    configuredMinimumEUR: number
    percentageMargin: number
    minimumMargin: number
  }
} {
  let marginPercentage = rule.defaultMarginPercentage
  let minimumMarginEUR = rule.defaultMinimumMarginEUR
  let appliedRule: 'route' | 'service' | 'volume_tier' | 'default' = 'default'

  // Check route-specific margin (highest priority)
  if (options.origin && options.destination) {
    const routeMargin = findRouteMargin(rule, options.origin, options.destination)
    if (routeMargin) {
      marginPercentage = routeMargin.marginPercentage
      minimumMarginEUR = routeMargin.minimumMarginEUR
      appliedRule = 'route'
    }
  }

  // Check service-specific margin (if no route margin)
  if (appliedRule === 'default' && options.serviceType) {
    const serviceMargin = findServiceMargin(rule, options.serviceType)
    if (serviceMargin) {
      marginPercentage = serviceMargin.marginPercentage
      minimumMarginEUR = serviceMargin.minimumMarginEUR
      appliedRule = 'service'
    }
  }

  // Check volume tier (if no route or service margin)
  if (appliedRule === 'default' && options.monthlyShipmentCount !== undefined) {
    const volumeTier = findVolumeTier(rule, options.monthlyShipmentCount)
    if (volumeTier) {
      marginPercentage = volumeTier.marginPercentage
      minimumMarginEUR = volumeTier.minimumMarginEUR
      appliedRule = 'volume_tier'
    }
  }

  // Apply dual margin logic
  const result = applyDualMarginLogic(revenue, marginPercentage, minimumMarginEUR)

  return {
    marginAmount: result.marginAmount,
    marginPercentage: result.percentage,
    appliedRule,
    appliedMethod: result.appliedMethod,
    details: {
      configuredPercentage: marginPercentage,
      configuredMinimumEUR: minimumMarginEUR,
      percentageMargin: (revenue * marginPercentage) / 100,
      minimumMargin: minimumMarginEUR,
    },
  }
}

/**
 * Validate margin rule configuration
 */
export function validateMarginRule(rule: Partial<MarginRule>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check default margins
  if (
    rule.defaultMarginPercentage === undefined ||
    rule.defaultMarginPercentage < 0
  ) {
    errors.push('Default margin percentage must be a positive number')
  }

  if (
    rule.defaultMinimumMarginEUR === undefined ||
    rule.defaultMinimumMarginEUR < 0
  ) {
    errors.push('Default minimum margin EUR must be a positive number')
  }

  // Validate service margins
  if (rule.serviceMargins) {
    rule.serviceMargins.forEach((sm, index) => {
      if (sm.marginPercentage < 0) {
        errors.push(
          `Service margin ${index + 1} percentage must be positive`
        )
      }
      if (sm.minimumMarginEUR < 0) {
        errors.push(
          `Service margin ${index + 1} minimum EUR must be positive`
        )
      }
    })
  }

  // Validate route margins
  if (rule.routeMargins) {
    rule.routeMargins.forEach((rm, index) => {
      if (!rm.origin || !rm.destination) {
        errors.push(
          `Route margin ${index + 1} must have origin and destination`
        )
      }
      if (rm.marginPercentage < 0) {
        errors.push(`Route margin ${index + 1} percentage must be positive`)
      }
      if (rm.minimumMarginEUR < 0) {
        errors.push(`Route margin ${index + 1} minimum EUR must be positive`)
      }
    })
  }

  // Validate volume tiers
  if (rule.volumeTiers) {
    // Check for overlaps
    const sortedTiers = [...rule.volumeTiers].sort(
      (a, b) => a.minShipmentsPerMonth - b.minShipmentsPerMonth
    )

    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const current = sortedTiers[i]
      const next = sortedTiers[i + 1]

      if (
        current.maxShipmentsPerMonth &&
        current.maxShipmentsPerMonth >= next.minShipmentsPerMonth
      ) {
        errors.push(`Volume tier ${i + 1} overlaps with tier ${i + 2}`)
      }

      if (current.marginPercentage < 0) {
        errors.push(`Volume tier ${i + 1} percentage must be positive`)
      }
      if (current.minimumMarginEUR < 0) {
        errors.push(`Volume tier ${i + 1} minimum EUR must be positive`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Calculate cost from revenue and margin
 */
export function calculateCostFromMargin(
  revenue: number,
  marginAmount: number
): number {
  return Math.max(0, revenue - marginAmount)
}

/**
 * Calculate revenue needed to achieve target margin
 */
export function calculateRevenueForTargetMargin(
  cost: number,
  marginPercentage: number,
  minimumMarginEUR: number
): number {
  // Revenue from percentage: revenue = cost / (1 - marginPercentage/100)
  const revenueFromPercentage = cost / (1 - marginPercentage / 100)

  // Revenue from minimum: revenue = cost + minimumMarginEUR
  const revenueFromMinimum = cost + minimumMarginEUR

  // Return whichever is higher to ensure margin requirement is met
  return Math.max(revenueFromPercentage, revenueFromMinimum)
}

/**
 * Get margin suggestion based on industry standards
 */
export function suggestMargin(serviceType: string): {
  percentageSuggestion: number
  minimumEURSuggestion: number
  reasoning: string
} {
  const suggestions: Record<
    string,
    { percentage: number; minimum: number; reasoning: string }
  > = {
    standard: {
      percentage: 15,
      minimum: 30,
      reasoning:
        'Standard service typically has 15% margin or €30 minimum',
    },
    express: {
      percentage: 20,
      minimum: 50,
      reasoning: 'Express service justifies 20% margin or €50 minimum',
    },
    overnight: {
      percentage: 25,
      minimum: 75,
      reasoning:
        'Overnight delivery requires premium 25% margin or €75 minimum',
    },
    international: {
      percentage: 18,
      minimum: 60,
      reasoning:
        'International shipments typically have 18% margin or €60 minimum',
    },
    freight: {
      percentage: 12,
      minimum: 100,
      reasoning:
        'Freight services have lower percentage (12%) but higher minimum (€100)',
    },
  }

  const suggestion = suggestions[serviceType]
  if (suggestion) {
    return {
      percentageSuggestion: suggestion.percentage,
      minimumEURSuggestion: suggestion.minimum,
      reasoning: suggestion.reasoning,
    }
  }

  return {
    percentageSuggestion: 15,
    minimumEURSuggestion: 50,
    reasoning: 'Default margin suggestion',
  }
}
