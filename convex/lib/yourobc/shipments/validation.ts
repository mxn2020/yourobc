// convex/lib/yourobc/shipments/validation.ts

import type { Doc } from '../../../_generated/dataModel'

export interface AbschlussValidationResult {
  canComplete: boolean
  missingFields: string[]
  warnings: string[]
}

/**
 * Validate shipment before allowing 'Abschluss' (completion)
 * Based on YOUROBC.md requirements (lines 663-667, 513-516)
 */
export function validateShipmentAbschluss(
  shipment: Doc<'yourobcShipments'>
): AbschlussValidationResult {
  const missingFields: string[] = []
  const warnings: string[] = []

  // Common requirements for all shipments
  if (!shipment.customerReference) {
    missingFields.push('Kundenreferenz (Customer Reference)')
  }

  // Document status checks
  if (!shipment.documentStatus?.pod || shipment.documentStatus.pod !== 'complete') {
    missingFields.push('POD (Proof of Delivery)')
  }

  // Service-specific validation
  if (shipment.serviceType === 'NFO') {
    // NFO-specific requirements
    if (!shipment.documentStatus?.hawb || shipment.documentStatus.hawb !== 'complete') {
      missingFields.push('HAWB Number')
    }

    if (!shipment.documentStatus?.mawb || shipment.documentStatus.mawb !== 'complete') {
      missingFields.push('MAWB Number')
    }

    // CWT validation warning (if routing data exists)
    if (shipment.routing?.cwt && shipment.routing?.preAlertCwt) {
      if (Math.abs(shipment.routing.cwt - shipment.routing.preAlertCwt) > 0.1) {
        warnings.push(
          `CWT Abweichung: Kalkulation ${shipment.routing.cwt} vs. Pre-Alert ${shipment.routing.preAlertCwt}`
        )
      }
    }
  }

  if (shipment.serviceType === 'OBC') {
    // OBC-specific cost validation
    if (!shipment.actualCosts?.amount) {
      warnings.push('Actual costs not recorded')
    }
  }

  // Check for extra costs
  const hasExtraCosts = shipment.actualCosts && shipment.agreedPrice
    ? shipment.actualCosts.amount > shipment.agreedPrice.amount
    : false

  if (hasExtraCosts) {
    warnings.push('Extra costs detected - ensure customs, excess baggage, etc. are documented')
  }

  return {
    canComplete: missingFields.length === 0,
    missingFields,
    warnings,
  }
}

/**
 * Validate if offer should be closed
 * Must provide reasoning after X hours
 */
export function validateOfferClosing(
  createdAt: number,
  hoursThreshold: number = 48
): {
  requiresReason: boolean
  hoursOpen: number
} {
  const hoursOpen = (Date.now() - createdAt) / (1000 * 60 * 60)

  return {
    requiresReason: hoursOpen >= hoursThreshold,
    hoursOpen: Math.round(hoursOpen),
  }
}
