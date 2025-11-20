// src/features/yourobc/quotes/components/OBCCourierSuggestions.tsx

import { FC, useState, useEffect } from 'react'
import { Button, Card, Badge, Loading, Alert, AlertDescription } from '@/components/ui'
import { useToast } from '@/features/system/notifications'
import {
  suggestCouriers,
  getCourierSuggestionsSummary,
  formatCourierSuggestion,
  type CourierSuggestion,
  type CourierSuggestionParams,
} from '../services/CourierSuggestionService'
import type { Id } from '@/convex/_generated/dataModel'

interface OBCCourierSuggestionsProps {
  originCity: string
  originCountry: string
  originCountryCode: string
  weight?: number
  deadline?: number
  allCouriers: any[] // Array of courier data from Convex
  onSelectCourier?: (courierId: Id<'yourobcCouriers'>) => void
  selectedCourierId?: Id<'yourobcCouriers'>
}

export const OBCCourierSuggestions: FC<OBCCourierSuggestionsProps> = ({
  originCity,
  originCountry,
  originCountryCode,
  weight,
  deadline,
  allCouriers,
  onSelectCourier,
  selectedCourierId,
}) => {
  const toast = useToast()
  const [suggestions, setSuggestions] = useState<CourierSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (allCouriers && allCouriers.length > 0) {
      generateSuggestions()
    }
  }, [allCouriers, originCity, originCountry, originCountryCode, weight])

  const generateSuggestions = () => {
    setIsLoading(true)
    try {
      const params: CourierSuggestionParams = {
        originCity,
        originCountry,
        originCountryCode,
        serviceType: 'OBC',
        weight,
        deadline: deadline ? new Date(deadline) : undefined,
      }

      const courierSuggestions = suggestCouriers(allCouriers, params)
      setSuggestions(courierSuggestions)

      if (courierSuggestions.length === 0) {
        toast.info('No courier suggestions available for this route')
      }
    } catch (error: any) {
      console.error('Error generating courier suggestions:', error)
      toast.error('Failed to generate courier suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCourier = (suggestion: CourierSuggestion) => {
    onSelectCourier?.(suggestion.id as Id<'yourobcCouriers'>)
    toast.success(`Selected courier: ${suggestion.name}`)
  }

  const summary = getCourierSuggestionsSummary(suggestions)
  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 5)

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">✓ Available</Badge>
      case 'busy':
        return <Badge variant="warning">⏱ Busy</Badge>
      case 'offline':
        return <Badge variant="secondary">⚫ Offline</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 flex justify-center">
          <Loading size="lg" />
        </div>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Alert variant="default">
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              No couriers found for {originCity}, {originCountry}. You can still manually assign a courier.
            </span>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🎯 Courier Suggestions Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Total Matched</div>
              <div className="text-2xl font-bold text-blue-900">{summary.total}</div>
            </div>

            <div>
              <div className="text-green-600 font-medium">Available</div>
              <div className="text-2xl font-bold text-green-700">{summary.available}</div>
            </div>

            <div>
              <div className="text-yellow-600 font-medium">Busy</div>
              <div className="text-2xl font-bold text-yellow-700">{summary.busy}</div>
            </div>

            <div>
              <div className="text-gray-600 font-medium">Avg Match</div>
              <div className="text-2xl font-bold text-gray-700">
                {summary.averageMatchScore.toFixed(0)}%
              </div>
            </div>
          </div>

          {summary.topMatch && (
            <div className="mt-4 p-3 bg-white rounded border border-blue-300">
              <div className="text-xs font-medium text-blue-700 mb-1">🏆 TOP MATCH</div>
              <div className="font-semibold text-blue-900">
                {summary.topMatch.name} ({summary.topMatch.matchScore}% match)
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {summary.topMatch.matchReasons.slice(0, 2).join(' • ')}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Suggestions List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recommended Couriers
            </h3>
            {suggestions.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All (${suggestions.length})`}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {displayedSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedCourierId === suggestion.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      {index === 0 && (
                        <span className="text-xl" title="Top recommendation">
                          🏆
                        </span>
                      )}
                      <h4 className="font-bold text-gray-900">
                        {suggestion.name}
                      </h4>
                      <span className="text-sm text-gray-600">
                        #{suggestion.courierNumber}
                      </span>
                      {getStatusBadge(suggestion.status)}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                      <span>📍</span>
                      <span>
                        {suggestion.location.city
                          ? `${suggestion.location.city}, ${suggestion.location.country}`
                          : suggestion.location.country
                        }
                      </span>
                    </div>

                    {/* Match Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">Match Score:</span>
                      <span className={`px-2 py-1 rounded text-sm font-bold ${getMatchScoreColor(suggestion.matchScore)}`}>
                        {suggestion.matchScore}%
                      </span>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Why recommended:</div>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex gap-4 text-xs text-gray-600">
                      {suggestion.phone && (
                        <div className="flex items-center gap-1">
                          <span>📞</span>
                          <span>{suggestion.phone}</span>
                        </div>
                      )}
                      {suggestion.email && (
                        <div className="flex items-center gap-1">
                          <span>✉️</span>
                          <span>{suggestion.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {suggestion.skills.languages.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Languages:</span>{' '}
                        {suggestion.skills.languages.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <div className="ml-4">
                    <Button
                      variant={selectedCourierId === suggestion.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleSelectCourier(suggestion)}
                    >
                      {selectedCourierId === suggestion.id ? '✓ Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Info */}
      <Alert variant="default">
        <AlertDescription>
          <div className="text-sm">
            <strong>💡 Courier Selection:</strong> Suggestions are based on location, availability,
            skills, and service experience. Higher match scores indicate better fit for your shipment.
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
