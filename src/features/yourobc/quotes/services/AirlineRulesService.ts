/**
 * Airline Rules Service
 * Manages airline-specific rules for baggage and courier calculations
 */

export interface AirlineRule {
  airlineCode: string
  airlineName: string
  maxBaggageWeight: number // per person in kg
  maxBaggagePieces: number // pieces per person
  maxPieceWeight: number // max weight per piece in kg
  excessBaggageFee: number // per kg in EUR
  handLuggage: {
    maxWeight: number
    maxPieces: number
  }
  specialRules?: string[]
}

export interface CourierCalculationResult {
  requiredCouriers: number
  totalWeight: number
  weightPerCourier: number[]
  excessBaggageFee: number
  airlineRule: AirlineRule
  breakdown: string[]
  costComparison?: {
    oneCourierCost: number
    multiCourierCost: number
    recommendation: string
  }
}

class AirlineRulesService {
  // Airline rules database (based on YOUROBC.md requirements)
  private airlineRules: Record<string, AirlineRule> = {
    'LH': { // Lufthansa
      airlineCode: 'LH',
      airlineName: 'Lufthansa',
      maxBaggageWeight: 32,
      maxBaggagePieces: 2,
      maxPieceWeight: 32,
      excessBaggageFee: 15,
      handLuggage: {
        maxWeight: 8,
        maxPieces: 1,
      },
      specialRules: ['Economy: 23kg per piece', 'Business: 32kg per piece'],
    },
    'BA': { // British Airways
      airlineCode: 'BA',
      airlineName: 'British Airways',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 20,
      handLuggage: {
        maxWeight: 10,
        maxPieces: 1,
      },
    },
    'AF': { // Air France
      airlineCode: 'AF',
      airlineName: 'Air France',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 18,
      handLuggage: {
        maxWeight: 12,
        maxPieces: 1,
      },
    },
    'KL': { // KLM
      airlineCode: 'KL',
      airlineName: 'KLM',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 18,
      handLuggage: {
        maxWeight: 12,
        maxPieces: 1,
      },
    },
    'DL': { // Delta
      airlineCode: 'DL',
      airlineName: 'Delta',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 25,
      handLuggage: {
        maxWeight: 10,
        maxPieces: 1,
      },
    },
    'AA': { // American Airlines
      airlineCode: 'AA',
      airlineName: 'American Airlines',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 25,
      handLuggage: {
        maxWeight: 10,
        maxPieces: 1,
      },
    },
    'UA': { // United Airlines
      airlineCode: 'UA',
      airlineName: 'United Airlines',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 25,
      handLuggage: {
        maxWeight: 10,
        maxPieces: 1,
      },
    },
    'TK': { // Turkish Airlines
      airlineCode: 'TK',
      airlineName: 'Turkish Airlines',
      maxBaggageWeight: 23,
      maxBaggagePieces: 2,
      maxPieceWeight: 23,
      excessBaggageFee: 15,
      handLuggage: {
        maxWeight: 8,
        maxPieces: 1,
      },
    },
    'EK': { // Emirates
      airlineCode: 'EK',
      airlineName: 'Emirates',
      maxBaggageWeight: 30,
      maxBaggagePieces: 2,
      maxPieceWeight: 32,
      excessBaggageFee: 20,
      handLuggage: {
        maxWeight: 7,
        maxPieces: 1,
      },
    },
  }

  /**
   * Get airline rule by code
   */
  getAirlineRule(airlineCode: string): AirlineRule | null {
    return this.airlineRules[airlineCode.toUpperCase()] || null
  }

  /**
   * Get all airline rules
   */
  getAllAirlineRules(): AirlineRule[] {
    return Object.values(this.airlineRules)
  }

  /**
   * Search airlines by name or code
   */
  searchAirlines(query: string): AirlineRule[] {
    const searchTerm = query.toLowerCase()
    return Object.values(this.airlineRules).filter(
      (rule) =>
        rule.airlineName.toLowerCase().includes(searchTerm) ||
        rule.airlineCode.toLowerCase().includes(searchTerm)
    )
  }

  /**
   * Calculate courier requirements based on weight and airline
   */
  calculateCourierRequirements(
    totalWeight: number,
    airlineCode: string,
    departureCountry?: string
  ): CourierCalculationResult {
    const airlineRule = this.getAirlineRule(airlineCode)

    if (!airlineRule) {
      throw new Error(`Airline rules not found for ${airlineCode}`)
    }

    const maxWeightPerCourier = airlineRule.maxBaggageWeight * airlineRule.maxBaggagePieces
    const requiredCouriers = Math.ceil(totalWeight / maxWeightPerCourier)

    // Distribute weight across couriers
    const weightPerCourier: number[] = []
    let remainingWeight = totalWeight

    for (let i = 0; i < requiredCouriers; i++) {
      const courierWeight = Math.min(remainingWeight, maxWeightPerCourier)
      weightPerCourier.push(Math.round(courierWeight * 100) / 100)
      remainingWeight -= courierWeight
    }

    // Calculate excess baggage fees
    let excessBaggageFee = 0
    for (const weight of weightPerCourier) {
      if (weight > maxWeightPerCourier) {
        excessBaggageFee += (weight - maxWeightPerCourier) * airlineRule.excessBaggageFee
      }
    }

    // Generate breakdown
    const breakdown: string[] = [
      `Total weight: ${totalWeight}kg`,
      `Airline: ${airlineRule.airlineName} (${airlineRule.airlineCode})`,
      `Max per courier: ${maxWeightPerCourier}kg (${airlineRule.maxBaggagePieces} pieces × ${airlineRule.maxBaggageWeight}kg)`,
      `Required couriers: ${requiredCouriers}`,
    ]

    weightPerCourier.forEach((weight, index) => {
      breakdown.push(`Courier ${index + 1}: ${weight}kg`)
    })

    if (excessBaggageFee > 0) {
      breakdown.push(`Excess baggage fee: €${excessBaggageFee.toFixed(2)}`)
    }

    return {
      requiredCouriers,
      totalWeight,
      weightPerCourier,
      excessBaggageFee: Math.round(excessBaggageFee * 100) / 100,
      airlineRule,
      breakdown,
    }
  }

  /**
   * Compare courier options (e.g., 1 courier + excess vs 2 couriers)
   */
  compareCourierOptions(
    totalWeight: number,
    airlineCode: string,
    courierCostEstimate: number = 800
  ): CourierCalculationResult {
    const airlineRule = this.getAirlineRule(airlineCode)
    if (!airlineRule) {
      throw new Error(`Airline rules not found for ${airlineCode}`)
    }

    const maxWeightPerCourier = airlineRule.maxBaggageWeight * airlineRule.maxBaggagePieces

    // Option 1: 1 courier with excess baggage
    const excessWeight = Math.max(0, totalWeight - maxWeightPerCourier)
    const option1ExcessFee = excessWeight * airlineRule.excessBaggageFee
    const option1TotalCost = courierCostEstimate + option1ExcessFee

    // Option 2: Multiple couriers
    const option2 = this.calculateCourierRequirements(totalWeight, airlineCode)
    const option2TotalCost = courierCostEstimate * option2.requiredCouriers + option2.excessBaggageFee

    // Determine recommendation
    let recommendation: string
    if (option1TotalCost < option2TotalCost) {
      recommendation = `Use 1 courier with excess baggage (€${option1TotalCost.toFixed(2)} vs €${option2TotalCost.toFixed(2)})`
    } else if (option1TotalCost > option2TotalCost) {
      recommendation = `Use ${option2.requiredCouriers} couriers (€${option2TotalCost.toFixed(2)} vs €${option1TotalCost.toFixed(2)})`
    } else {
      recommendation = `Both options cost the same (€${option1TotalCost.toFixed(2)})`
    }

    // Build comprehensive result
    const result = option2
    result.costComparison = {
      oneCourierCost: option1TotalCost,
      multiCourierCost: option2TotalCost,
      recommendation,
    }

    // Update breakdown with cost comparison
    result.breakdown.push('')
    result.breakdown.push('Cost Comparison:')
    result.breakdown.push(`Option 1 (1 courier): €${option1TotalCost.toFixed(2)}`)
    result.breakdown.push(
      `  - Courier cost: €${courierCostEstimate}` +
        (option1ExcessFee > 0 ? ` + excess fee: €${option1ExcessFee.toFixed(2)}` : '')
    )
    result.breakdown.push(`Option 2 (${option2.requiredCouriers} couriers): €${option2TotalCost.toFixed(2)}`)
    result.breakdown.push(
      `  - Courier cost: €${courierCostEstimate} × ${option2.requiredCouriers}` +
        (option2.excessBaggageFee > 0 ? ` + excess fee: €${option2.excessBaggageFee.toFixed(2)}` : '')
    )
    result.breakdown.push('')
    result.breakdown.push(`Recommendation: ${recommendation}`)

    return result
  }

  /**
   * Format courier calculation for display
   */
  formatCourierCalculation(result: CourierCalculationResult): string {
    return result.breakdown.join('\n')
  }

  /**
   * Get airline rule summary for display
   */
  getAirlineRuleSummary(airlineCode: string): string {
    const rule = this.getAirlineRule(airlineCode)
    if (!rule) {
      return `No rules found for airline ${airlineCode}`
    }

    return [
      `${rule.airlineName} (${rule.airlineCode})`,
      `Checked Baggage: ${rule.maxBaggagePieces} pieces × ${rule.maxBaggageWeight}kg`,
      `Max piece weight: ${rule.maxPieceWeight}kg`,
      `Hand luggage: ${rule.handLuggage.maxPieces} piece × ${rule.handLuggage.maxWeight}kg`,
      `Excess fee: €${rule.excessBaggageFee}/kg`,
      ...(rule.specialRules || []),
    ].join('\n')
  }

  /**
   * Check if weight can fit in single courier
   */
  canFitInSingleCourier(weight: number, airlineCode: string): boolean {
    const rule = this.getAirlineRule(airlineCode)
    if (!rule) return false

    const maxWeightPerCourier = rule.maxBaggageWeight * rule.maxBaggagePieces
    return weight <= maxWeightPerCourier
  }

  /**
   * Calculate optimal courier distribution
   * Returns the most cost-effective courier configuration
   */
  calculateOptimalDistribution(
    weight: number,
    airlineCode: string,
    courierCostPerPerson: number = 800
  ): CourierCalculationResult {
    const comparison = this.compareCourierOptions(weight, airlineCode, courierCostPerPerson)
    return comparison
  }
}

export const airlineRulesService = new AirlineRulesService()
