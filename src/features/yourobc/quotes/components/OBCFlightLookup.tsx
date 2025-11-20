// src/features/yourobc/quotes/components/OBCFlightLookup.tsx

import { FC, useState } from 'react'
import { Button, Card, Input, Label, Loading, Alert, AlertDescription } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import { flightStatsService, type FlightInfo, type FlightSearchParams } from '../services/FlightStatsService'

interface OBCFlightLookupProps {
  originCity: string
  destinationCity: string
  onSelectFlight?: (flight: FlightInfo) => void
}

export const OBCFlightLookup: FC<OBCFlightLookupProps> = ({
  originCity,
  destinationCity,
  onSelectFlight,
}) => {
  const toast = useToast()
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    origin: '',
    destination: '',
    date: new Date(),
  })
  const [searchResults, setSearchResults] = useState<FlightInfo[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightInfo | null>(null)
  const [flightNumberSearch, setFlightNumberSearch] = useState('')

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination) {
      toast.error('Please enter origin and destination airport codes')
      return
    }

    setIsSearching(true)
    try {
      const result = await flightStatsService.searchFlights(searchParams)
      setSearchResults(result.flights)

      if (result.flights.length === 0) {
        toast.info('No flights found for this route')
      } else {
        toast.success(`Found ${result.flights.length} flight(s)`)
      }
    } catch (error: any) {
      console.error('Flight search error:', error)
      toast.error(error.message || 'Failed to search flights')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchByFlightNumber = async () => {
    if (!flightNumberSearch.trim()) {
      toast.error('Please enter a flight number')
      return
    }

    setIsSearching(true)
    try {
      const flight = await flightStatsService.getFlightByNumber(flightNumberSearch.trim())

      if (flight) {
        setSearchResults([flight])
        toast.success('Flight found')
      } else {
        setSearchResults([])
        toast.info('Flight not found')
      }
    } catch (error: any) {
      console.error('Flight lookup error:', error)
      toast.error(error.message || 'Failed to lookup flight')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFlight = (flight: FlightInfo) => {
    setSelectedFlight(flight)
    onSelectFlight?.(flight)
    toast.success(`Selected flight ${flight.flightNumber}`)
  }

  const extractIATAFromCity = (city: string): string => {
    const extracted = flightStatsService.extractIATACode(city)
    return extracted || city.substring(0, 3).toUpperCase()
  }

  // Auto-populate origin and destination from props
  useState(() => {
    if (originCity && !searchParams.origin) {
      setSearchParams(prev => ({
        ...prev,
        origin: extractIATAFromCity(originCity),
      }))
    }
    if (destinationCity && !searchParams.destination) {
      setSearchParams(prev => ({
        ...prev,
        destination: extractIATAFromCity(destinationCity),
      }))
    }
  })

  const formatFlightTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getStatusBadgeColor = (status: FlightInfo['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800'
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Landed': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      case 'Diverted': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Search by Route */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ✈️ Search Flights by Route
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label required>Origin Airport (IATA)</Label>
              <Input
                value={searchParams.origin}
                onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value.toUpperCase() }))}
                placeholder="e.g., FRA"
                maxLength={3}
              />
              <p className="text-xs text-gray-500 mt-1">3-letter airport code</p>
            </div>

            <div>
              <Label required>Destination Airport (IATA)</Label>
              <Input
                value={searchParams.destination}
                onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value.toUpperCase() }))}
                placeholder="e.g., JFK"
                maxLength={3}
              />
              <p className="text-xs text-gray-500 mt-1">3-letter airport code</p>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={searchParams.date?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, date: new Date(e.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="primary"
              onClick={handleSearch}
              disabled={isSearching || !searchParams.origin || !searchParams.destination}
            >
              {isSearching ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Searching...
                </>
              ) : (
                <>🔍 Search Flights</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Search by Flight Number */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔢 Search by Flight Number
          </h3>

          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                value={flightNumberSearch}
                onChange={(e) => setFlightNumberSearch(e.target.value.toUpperCase())}
                placeholder="e.g., LH401, BA123"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSearchByFlightNumber}
              disabled={isSearching || !flightNumberSearch.trim()}
            >
              {isSearching ? 'Searching...' : 'Lookup'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Flight Results ({searchResults.length})
            </h3>

            <div className="space-y-3">
              {searchResults.map((flight, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedFlight === flight
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Flight Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          {flight.flightNumber}
                        </h4>
                        <span className="text-gray-600">
                          {flight.airline}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(flight.status)}`}>
                          {flight.status}
                        </span>
                      </div>

                      {/* Flight Route */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Departure</div>
                          <div className="font-medium">
                            {flight.origin.iata} - {flight.origin.city}
                          </div>
                          <div className="text-sm text-gray-700">
                            {formatFlightTime(flight.departure.scheduled)}
                          </div>
                          {flight.departure.terminal && (
                            <div className="text-xs text-gray-500">
                              Terminal {flight.departure.terminal}
                              {flight.departure.gate && `, Gate ${flight.departure.gate}`}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">Arrival</div>
                          <div className="font-medium">
                            {flight.destination.iata} - {flight.destination.city}
                          </div>
                          <div className="text-sm text-gray-700">
                            {formatFlightTime(flight.arrival.scheduled)}
                          </div>
                          {flight.arrival.terminal && (
                            <div className="text-xs text-gray-500">
                              Terminal {flight.arrival.terminal}
                              {flight.arrival.gate && `, Gate ${flight.arrival.gate}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      {flight.aircraft && (
                        <div className="text-sm text-gray-600">
                          Aircraft: {flight.aircraft.type}
                          {flight.duration && ` • Duration: ${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m`}
                        </div>
                      )}
                    </div>

                    {/* Select Button */}
                    <div className="ml-4">
                      <Button
                        variant={selectedFlight === flight ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleSelectFlight(flight)}
                      >
                        {selectedFlight === flight ? '✓ Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* No Results Message */}
      {!isSearching && searchResults.length === 0 && searchParams.origin && searchParams.destination && (
        <Alert variant="default">
          <AlertDescription>
            <div className="flex items-center gap-2">
              <span>ℹ️</span>
              <span>
                No flights found. Try different airport codes or check the date. Using mock data for development.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* API Info */}
      <Alert variant="default">
        <AlertDescription>
          <div className="text-sm">
            <strong>ℹ️ Flight Data:</strong> This feature uses FlightStats API for live flight information.
            Configure your API key in environment variables for production use. Currently showing mock/demo data.
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
