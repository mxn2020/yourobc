// src/features/yourobc/quotes/services/CourierSuggestionService.ts

/**
 * Courier Suggestion Service
 *
 * Provides intelligent courier suggestions based on:
 * - Departure airport/city
 * - Departure country
 * - Service type (OBC only)
 * - Courier availability and skills
 */

export interface CourierSuggestion {
  id: string
  courierNumber: string
  name: string
  phone?: string
  email?: string
  location: {
    country: string
    countryCode: string
    city?: string
  }
  skills: {
    languages: string[]
    maxCarryWeight?: number
    availableServices: ('OBC' | 'NFO')[]
    certifications?: string[]
  }
  status: 'available' | 'busy' | 'offline'
  matchScore: number // 0-100, how well the courier matches the requirements
  matchReasons: string[]
  distanceFromOrigin?: number // in km, if calculable
}

export interface CourierSuggestionParams {
  originCity: string
  originCountry: string
  originCountryCode: string
  serviceType: 'OBC' | 'NFO'
  weight?: number
  deadline?: Date
  requiredLanguages?: string[]
}

/**
 * Airport to City mapping
 * Maps common airport codes to their cities for better courier matching
 */
const AIRPORT_CITY_MAP: Record<string, string> = {
  'FRA': 'Frankfurt',
  'MUC': 'Munich',
  'TXL': 'Berlin',
  'DUS': 'Düsseldorf',
  'HAM': 'Hamburg',
  'JFK': 'New York',
  'LAX': 'Los Angeles',
  'ORD': 'Chicago',
  'LHR': 'London',
  'LGW': 'London',
  'CDG': 'Paris',
  'ORY': 'Paris',
  'AMS': 'Amsterdam',
  'DXB': 'Dubai',
  'SIN': 'Singapore',
  'HKG': 'Hong Kong',
  'NRT': 'Tokyo',
  'HND': 'Tokyo',
  'PEK': 'Beijing',
  'PVG': 'Shanghai',
}

/**
 * Extract city name from airport code or location string
 */
function extractCityFromLocation(location: string): string {
  // Check if it's an airport code in parentheses like "Frankfurt (FRA)"
  const airportMatch = location.match(/\(([A-Z]{3})\)/)
  if (airportMatch) {
    const airportCode = airportMatch[1]
    return AIRPORT_CITY_MAP[airportCode] || location.replace(/\s*\([A-Z]{3}\)\s*/, '').trim()
  }

  // Check if the string itself is an airport code
  const upperLocation = location.toUpperCase()
  if (AIRPORT_CITY_MAP[upperLocation]) {
    return AIRPORT_CITY_MAP[upperLocation]
  }

  // Return as-is if no airport code found
  return location.trim()
}

/**
 * Calculate match score between courier and requirements
 */
function calculateMatchScore(
  courier: any,
  params: CourierSuggestionParams
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Country match (highest priority) - 40 points
  if (courier.currentLocation?.countryCode === params.originCountryCode) {
    score += 40
    reasons.push(`Based in ${params.originCountry}`)
  } else if (courier.currentLocation?.country === params.originCountry) {
    score += 35
    reasons.push(`Based in ${params.originCountry}`)
  }

  // City match - 30 points
  const courierCity = courier.currentLocation?.city?.toLowerCase()
  const originCity = extractCityFromLocation(params.originCity).toLowerCase()

  if (courierCity && courierCity === originCity) {
    score += 30
    reasons.push(`Located in ${params.originCity}`)
  } else if (courierCity && originCity.includes(courierCity)) {
    score += 20
    reasons.push(`Near ${params.originCity}`)
  }

  // Service type match - 15 points
  if (courier.skills?.availableServices?.includes(params.serviceType)) {
    score += 15
    reasons.push(`Experienced in ${params.serviceType} service`)
  }

  // Availability status - 10 points
  if (courier.status === 'available') {
    score += 10
    reasons.push('Currently available')
  } else if (courier.status === 'busy') {
    reasons.push('Currently busy')
  } else if (courier.status === 'offline') {
    score -= 10
    reasons.push('Currently offline')
  }

  // Weight capacity - 10 points
  if (params.weight && courier.skills?.maxCarryWeight) {
    if (courier.skills.maxCarryWeight >= params.weight) {
      score += 10
      reasons.push(`Can carry up to ${courier.skills.maxCarryWeight}kg`)
    } else {
      score -= 5
      reasons.push(`Max capacity: ${courier.skills.maxCarryWeight}kg (below required ${params.weight}kg)`)
    }
  }

  // Language skills - 5 points
  if (params.requiredLanguages && params.requiredLanguages.length > 0 && courier.skills?.languages) {
    const matchingLanguages = params.requiredLanguages.filter(lang =>
      courier.skills.languages.some((courierLang: string) =>
        courierLang.toLowerCase() === lang.toLowerCase()
      )
    )
    if (matchingLanguages.length > 0) {
      score += 5
      reasons.push(`Speaks ${matchingLanguages.join(', ')}`)
    }
  }

  // Certifications bonus - 5 points
  if (courier.skills?.certifications && courier.skills.certifications.length > 0) {
    score += 5
    reasons.push(`Certified: ${courier.skills.certifications.join(', ')}`)
  }

  // Active status bonus - 5 points
  if (courier.isActive && courier.isOnline) {
    score += 5
    reasons.push('Online now')
  }

  return { score: Math.min(100, Math.max(0, score)), reasons }
}

/**
 * Filter and sort couriers based on match criteria
 */
export function suggestCouriers(
  allCouriers: any[],
  params: CourierSuggestionParams
): CourierSuggestion[] {
  // Only suggest for OBC service type
  if (params.serviceType !== 'OBC') {
    return []
  }

  const suggestions: CourierSuggestion[] = []

  for (const courier of allCouriers) {
    // Skip inactive couriers
    if (!courier.isActive) {
      continue
    }

    // Calculate match score
    const { score, reasons } = calculateMatchScore(courier, params)

    // Only include couriers with at least some match (score > 20)
    if (score < 20) {
      continue
    }

    suggestions.push({
      id: courier._id,
      courierNumber: courier.courierNumber,
      name: `${courier.firstName} ${courier.lastName}`.trim(),
      phone: courier.phone,
      email: courier.email,
      location: courier.currentLocation || {
        country: 'Unknown',
        countryCode: '',
      },
      skills: courier.skills || {
        languages: [],
        availableServices: [],
      },
      status: courier.status || 'offline',
      matchScore: score,
      matchReasons: reasons,
    })
  }

  // Sort by match score (highest first)
  suggestions.sort((a, b) => b.matchScore - a.matchScore)

  return suggestions
}

/**
 * Get top courier suggestions (limit to top N)
 */
export function getTopCourierSuggestions(
  allCouriers: any[],
  params: CourierSuggestionParams,
  limit: number = 5
): CourierSuggestion[] {
  const allSuggestions = suggestCouriers(allCouriers, params)
  return allSuggestions.slice(0, limit)
}

/**
 * Format courier suggestion for display
 */
export function formatCourierSuggestion(suggestion: CourierSuggestion): string {
  const parts = [
    `${suggestion.name} (${suggestion.courierNumber})`,
    `📍 ${suggestion.location.city || suggestion.location.country}`,
    `⭐ Match: ${suggestion.matchScore}%`,
    `${suggestion.status === 'available' ? '✅' : suggestion.status === 'busy' ? '🟡' : '⚫'} ${suggestion.status}`,
  ]

  if (suggestion.phone) {
    parts.push(`📞 ${suggestion.phone}`)
  }

  if (suggestion.matchReasons.length > 0) {
    parts.push(`\nReasons: ${suggestion.matchReasons.join(', ')}`)
  }

  return parts.join(' | ')
}

/**
 * Group courier suggestions by location
 */
export function groupCouriersByLocation(suggestions: CourierSuggestion[]): Map<string, CourierSuggestion[]> {
  const grouped = new Map<string, CourierSuggestion[]>()

  for (const suggestion of suggestions) {
    const location = suggestion.location.city || suggestion.location.country
    if (!grouped.has(location)) {
      grouped.set(location, [])
    }
    grouped.get(location)!.push(suggestion)
  }

  return grouped
}

/**
 * Get courier suggestions summary
 */
export function getCourierSuggestionsSummary(suggestions: CourierSuggestion[]): {
  total: number
  available: number
  busy: number
  offline: number
  averageMatchScore: number
  topMatch: CourierSuggestion | null
  byLocation: Map<string, number>
} {
  const summary = {
    total: suggestions.length,
    available: suggestions.filter(s => s.status === 'available').length,
    busy: suggestions.filter(s => s.status === 'busy').length,
    offline: suggestions.filter(s => s.status === 'offline').length,
    averageMatchScore: suggestions.length > 0
      ? suggestions.reduce((sum, s) => sum + s.matchScore, 0) / suggestions.length
      : 0,
    topMatch: suggestions.length > 0 ? suggestions[0] : null,
    byLocation: new Map<string, number>(),
  }

  // Count by location
  for (const suggestion of suggestions) {
    const location = suggestion.location.city || suggestion.location.country
    summary.byLocation.set(location, (summary.byLocation.get(location) || 0) + 1)
  }

  return summary
}
