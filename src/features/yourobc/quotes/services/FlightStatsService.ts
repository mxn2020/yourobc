// src/features/yourobc/quotes/services/FlightStatsService.ts

/**
 * FlightStats Service
 *
 * Service for fetching live flight information using FlightStats API
 * or alternative flight data providers.
 *
 * Note: For production use, you'll need to:
 * 1. Sign up for FlightStats API: https://www.flightstats.com/v2/api-next/overview
 * 2. Or use alternative APIs like Aviation Stack, AviationAPI, or Flight Aware
 * 3. Add API credentials to environment variables
 */

export interface FlightSearchParams {
  origin: string // IATA airport code (e.g., "FRA", "JFK")
  destination: string // IATA airport code
  date?: Date // Flight date (optional, defaults to today)
}

export interface FlightInfo {
  flightNumber: string
  airline: string
  airlineCode: string
  origin: {
    airport: string
    iata: string
    city: string
    country: string
  }
  destination: {
    airport: string
    iata: string
    city: string
    country: string
  }
  departure: {
    scheduled: Date
    estimated?: Date
    actual?: Date
    terminal?: string
    gate?: string
  }
  arrival: {
    scheduled: Date
    estimated?: Date
    actual?: Date
    terminal?: string
    gate?: string
  }
  status: 'Scheduled' | 'Active' | 'Landed' | 'Cancelled' | 'Diverted' | 'Unknown'
  aircraft?: {
    type: string
    registration?: string
  }
  duration?: number // in minutes
}

export interface FlightSearchResult {
  flights: FlightInfo[]
  searchParams: FlightSearchParams
  timestamp: Date
}

/**
 * Mock implementation of FlightStats service
 * Replace this with actual API integration when ready
 */
class FlightStatsService {
  private apiKey: string | undefined
  private apiUrl: string

  constructor() {
    // In production, these would come from environment variables
    this.apiKey = import.meta.env.VITE_FLIGHTSTATS_API_KEY
    this.apiUrl = import.meta.env.VITE_FLIGHTSTATS_API_URL || 'https://api.flightstats.com/flex'
  }

  /**
   * Search for flights between two airports
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    const { origin, destination, date = new Date() } = params

    // Validate IATA codes
    if (!this.isValidIATACode(origin) || !this.isValidIATACode(destination)) {
      throw new Error('Invalid IATA airport code. Please use 3-letter codes (e.g., FRA, JFK)')
    }

    try {
      // Call backend API route instead of FlightStats API directly
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          date: date.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Flight search API error: ${response.statusText}`)
      }

      const data = await response.json()

      // If API is not configured or returned mock flag, use mock data
      if (data.mock || !data.success || !data.flights || data.flights.length === 0) {
        console.warn('FlightStats API unavailable or returned no results, using mock data')
        return this.getMockFlightData(params)
      }

      // Parse dates in flight objects (they come as strings from JSON)
      const flights: FlightInfo[] = data.flights.map((flight: any) => ({
        ...flight,
        departure: {
          ...flight.departure,
          scheduled: new Date(flight.departure.scheduled),
          estimated: flight.departure.estimated ? new Date(flight.departure.estimated) : undefined,
          actual: flight.departure.actual ? new Date(flight.departure.actual) : undefined,
        },
        arrival: {
          ...flight.arrival,
          scheduled: new Date(flight.arrival.scheduled),
          estimated: flight.arrival.estimated ? new Date(flight.arrival.estimated) : undefined,
          actual: flight.arrival.actual ? new Date(flight.arrival.actual) : undefined,
        },
      }))

      return {
        flights,
        searchParams: params,
        timestamp: new Date(data.timestamp),
      }
    } catch (error) {
      console.error('Error fetching flight data:', error)
      // Fallback to mock data on error
      return this.getMockFlightData(params)
    }
  }

  /**
   * Get flight by flight number
   */
  async getFlightByNumber(flightNumber: string, date?: Date): Promise<FlightInfo | null> {
    try {
      const searchDate = date || new Date()

      // Build URL with query parameters
      const url = new URL('/api/flights/' + encodeURIComponent(flightNumber.toUpperCase()), window.location.origin)
      url.searchParams.set('date', searchDate.toISOString())

      // Call backend API route
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // If 404, flight not found
        if (response.status === 404) {
          return null
        }
        throw new Error(`Flight lookup API error: ${response.statusText}`)
      }

      const data = await response.json()

      // If API is not configured or returned mock flag, use mock data
      if (data.mock || !data.success) {
        console.warn('FlightStats API unavailable, using mock data')
        return this.getMockFlightByNumber(flightNumber)
      }

      if (!data.flight) {
        return null
      }

      // Parse dates in flight object (they come as strings from JSON)
      const flight: FlightInfo = {
        ...data.flight,
        departure: {
          ...data.flight.departure,
          scheduled: new Date(data.flight.departure.scheduled),
          estimated: data.flight.departure.estimated ? new Date(data.flight.departure.estimated) : undefined,
          actual: data.flight.departure.actual ? new Date(data.flight.departure.actual) : undefined,
        },
        arrival: {
          ...data.flight.arrival,
          scheduled: new Date(data.flight.arrival.scheduled),
          estimated: data.flight.arrival.estimated ? new Date(data.flight.arrival.estimated) : undefined,
          actual: data.flight.arrival.actual ? new Date(data.flight.arrival.actual) : undefined,
        },
      }

      return flight
    } catch (error) {
      console.error('Error fetching flight by number:', error)
      // Fallback to mock data on error
      return this.getMockFlightByNumber(flightNumber)
    }
  }

  /**
   * Validate IATA airport code format
   */
  private isValidIATACode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code.toUpperCase())
  }

  /**
   * Format date for API request (YYYY/MM/DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  /**
   * Parse FlightStats API response
   * Adjust this based on actual API response structure
   */
  private parseFlightStatsResponse(data: any, params: FlightSearchParams): FlightSearchResult {
    // This is a placeholder - adjust based on actual FlightStats response format
    const flights: FlightInfo[] = (data.scheduledFlights || []).map((flight: any) => ({
      flightNumber: flight.carrierFsCode + flight.flightNumber,
      airline: flight.carrierName || flight.carrierFsCode,
      airlineCode: flight.carrierFsCode,
      origin: {
        airport: flight.departureAirportName || params.origin,
        iata: params.origin,
        city: flight.departureCity || '',
        country: flight.departureCountry || '',
      },
      destination: {
        airport: flight.arrivalAirportName || params.destination,
        iata: params.destination,
        city: flight.arrivalCity || '',
        country: flight.arrivalCountry || '',
      },
      departure: {
        scheduled: new Date(flight.departureTime),
        terminal: flight.departureTerminal,
        gate: flight.departureGate,
      },
      arrival: {
        scheduled: new Date(flight.arrivalTime),
        terminal: flight.arrivalTerminal,
        gate: flight.arrivalGate,
      },
      status: this.mapFlightStatus(flight.status),
      aircraft: flight.fleetAircraftType ? {
        type: flight.fleetAircraftType,
      } : undefined,
    }))

    return {
      flights,
      searchParams: params,
      timestamp: new Date(),
    }
  }

  /**
   * Parse single flight info
   */
  private parseFlightInfo(data: any): FlightInfo | null {
    if (!data.flightStatuses || data.flightStatuses.length === 0) {
      return null
    }

    const flight = data.flightStatuses[0]
    return {
      flightNumber: flight.carrierFsCode + flight.flightNumber,
      airline: flight.carrierName || flight.carrierFsCode,
      airlineCode: flight.carrierFsCode,
      origin: {
        airport: flight.departureAirportFsCode,
        iata: flight.departureAirportFsCode,
        city: '',
        country: '',
      },
      destination: {
        airport: flight.arrivalAirportFsCode,
        iata: flight.arrivalAirportFsCode,
        city: '',
        country: '',
      },
      departure: {
        scheduled: new Date(flight.departureDate.dateUtc),
        actual: flight.operationalTimes?.actualGateDeparture?.dateUtc
          ? new Date(flight.operationalTimes.actualGateDeparture.dateUtc)
          : undefined,
        terminal: flight.airportResources?.departureTerminal,
        gate: flight.airportResources?.departureGate,
      },
      arrival: {
        scheduled: new Date(flight.arrivalDate.dateUtc),
        actual: flight.operationalTimes?.actualGateArrival?.dateUtc
          ? new Date(flight.operationalTimes.actualGateArrival.dateUtc)
          : undefined,
        terminal: flight.airportResources?.arrivalTerminal,
        gate: flight.airportResources?.arrivalGate,
      },
      status: this.mapFlightStatus(flight.status),
    }
  }

  /**
   * Map flight status from API
   */
  private mapFlightStatus(status: string): FlightInfo['status'] {
    const statusMap: Record<string, FlightInfo['status']> = {
      'S': 'Scheduled',
      'A': 'Active',
      'L': 'Landed',
      'C': 'Cancelled',
      'D': 'Diverted',
    }
    return statusMap[status] || 'Unknown'
  }

  /**
   * Generate mock flight data for development/testing
   */
  private getMockFlightData(params: FlightSearchParams): FlightSearchResult {
    const { origin, destination, date = new Date() } = params

    // Generate some realistic mock flights
    const airlines = [
      { code: 'LH', name: 'Lufthansa' },
      { code: 'BA', name: 'British Airways' },
      { code: 'AF', name: 'Air France' },
      { code: 'KL', name: 'KLM' },
      { code: 'DL', name: 'Delta' },
    ]

    const flights: FlightInfo[] = airlines.slice(0, 3).map((airline, index) => {
      const departureTime = new Date(date)
      departureTime.setHours(8 + (index * 4), 30 + (index * 15))

      const arrivalTime = new Date(departureTime)
      arrivalTime.setHours(arrivalTime.getHours() + 2 + index)

      return {
        flightNumber: `${airline.code}${1234 + index}`,
        airline: airline.name,
        airlineCode: airline.code,
        origin: {
          airport: `${origin} International Airport`,
          iata: origin,
          city: this.getCityFromIATA(origin),
          country: this.getCountryFromIATA(origin),
        },
        destination: {
          airport: `${destination} International Airport`,
          iata: destination,
          city: this.getCityFromIATA(destination),
          country: this.getCountryFromIATA(destination),
        },
        departure: {
          scheduled: departureTime,
          estimated: new Date(departureTime.getTime() + (index * 10 * 60000)), // Add some delay
          terminal: String.fromCharCode(65 + index), // A, B, C
          gate: `${String.fromCharCode(65 + index)}${12 + index}`,
        },
        arrival: {
          scheduled: arrivalTime,
          estimated: new Date(arrivalTime.getTime() + (index * 10 * 60000)),
          terminal: String.fromCharCode(66 + index),
          gate: `${String.fromCharCode(66 + index)}${23 + index}`,
        },
        status: index === 0 ? 'Scheduled' : index === 1 ? 'Active' : 'Scheduled',
        aircraft: {
          type: ['Boeing 737', 'Airbus A320', 'Boeing 787'][index],
        },
        duration: 120 + (index * 30),
      }
    })

    return {
      flights,
      searchParams: params,
      timestamp: new Date(),
    }
  }

  /**
   * Get mock flight by number
   */
  private getMockFlightByNumber(flightNumber: string): FlightInfo | null {
    const match = flightNumber.match(/^([A-Z]{2})(\d+)$/)
    if (!match) return null

    const [, airlineCode, number] = match
    const airlineName = {
      'LH': 'Lufthansa',
      'BA': 'British Airways',
      'AF': 'Air France'
    }[airlineCode] || airlineCode

    const now = new Date()
    const departure = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    const arrival = new Date(departure.getTime() + 2.5 * 60 * 60 * 1000) // 2.5 hours later

    return {
      flightNumber,
      airline: airlineName,
      airlineCode,
      origin: {
        airport: 'Frankfurt Airport',
        iata: 'FRA',
        city: 'Frankfurt',
        country: 'Germany',
      },
      destination: {
        airport: 'JFK International Airport',
        iata: 'JFK',
        city: 'New York',
        country: 'United States',
      },
      departure: {
        scheduled: departure,
        estimated: departure,
        terminal: 'A',
        gate: 'A12',
      },
      arrival: {
        scheduled: arrival,
        estimated: arrival,
        terminal: '4',
        gate: '23',
      },
      status: 'Scheduled',
      aircraft: {
        type: 'Boeing 747',
      },
      duration: 150,
    }
  }

  /**
   * Helper to get city name from IATA code (mock data)
   */
  private getCityFromIATA(iata: string): string {
    const cities: Record<string, string> = {
      'FRA': 'Frankfurt',
      'JFK': 'New York',
      'LHR': 'London',
      'CDG': 'Paris',
      'AMS': 'Amsterdam',
      'DXB': 'Dubai',
      'SIN': 'Singapore',
      'HKG': 'Hong Kong',
      'NRT': 'Tokyo',
      'LAX': 'Los Angeles',
    }
    return cities[iata] || iata
  }

  /**
   * Helper to get country name from IATA code (mock data)
   */
  private getCountryFromIATA(iata: string): string {
    const countries: Record<string, string> = {
      'FRA': 'Germany',
      'JFK': 'United States',
      'LHR': 'United Kingdom',
      'CDG': 'France',
      'AMS': 'Netherlands',
      'DXB': 'United Arab Emirates',
      'SIN': 'Singapore',
      'HKG': 'Hong Kong',
      'NRT': 'Japan',
      'LAX': 'United States',
    }
    return countries[iata] || ''
  }

  /**
   * Extract IATA code from city/airport string
   * Supports formats like "Frankfurt (FRA)", "FRA", "Frankfurt"
   */
  extractIATACode(location: string): string | null {
    // Try to match pattern like "City (CODE)"
    const match = location.match(/\(([A-Z]{3})\)/)
    if (match) {
      return match[1]
    }

    // Check if the string itself is a 3-letter code
    if (this.isValidIATACode(location)) {
      return location.toUpperCase()
    }

    return null
  }

  /**
   * Format flight info for display
   */
  formatFlightDisplay(flight: FlightInfo): string {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }

    return `${flight.flightNumber} - ${flight.airline}
${flight.origin.iata} → ${flight.destination.iata}
Departure: ${formatDate(flight.departure.scheduled)} ${formatTime(flight.departure.scheduled)}${flight.departure.terminal ? ` (Terminal ${flight.departure.terminal})` : ''}
Arrival: ${formatDate(flight.arrival.scheduled)} ${formatTime(flight.arrival.scheduled)}${flight.arrival.terminal ? ` (Terminal ${flight.arrival.terminal})` : ''}
Status: ${flight.status}${flight.aircraft ? `\nAircraft: ${flight.aircraft.type}` : ''}`
  }
}

// Export singleton instance
export const flightStatsService = new FlightStatsService()
