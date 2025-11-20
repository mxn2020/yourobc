// src/features/yourobc/partners/pages/PartnerCoveragePage.tsx

import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { usePartnerCoverage, usePartners } from '../hooks/usePartners'
import { PartnerSearch } from '../components/PartnerSearch'
import {
  Card,
  Badge,
  Button,
  Loading,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { SERVICE_TYPE_LABELS } from '../types'
import type { PartnerListItem } from '../types'

export const PartnerCoveragePage: FC = () => {
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'OBC' | 'NFO' | undefined>(undefined)
  const [selectedPartner, setSelectedPartner] = useState<PartnerListItem | null>(null)

  const { coverage, isLoading, error, refetch } = usePartnerCoverage(serviceTypeFilter)
  const { canCreatePartners } = usePartners()

  const handlePartnerSelect = (partner: PartnerListItem | null) => {
    setSelectedPartner(partner)
  }

  const clearPartnerSelection = () => {
    setSelectedPartner(null)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Error loading coverage data</div>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} variant="primary" size="sm">
                Try again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Coverage</h1>
            <p className="text-gray-600 mt-2">
              View and analyze partner service coverage across countries, cities, and airports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/yourobc/partners">
              <Button variant="secondary">👥 View Partners</Button>
            </Link>
            {canCreatePartners && (
              <Link to="/yourobc/partners/new">
                <Button variant="primary">+ New Partner</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        {coverage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Total Partners</div>
                  <div className="text-2xl">🤝</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {coverage.summary.totalPartners}
                </div>
                <div className="text-sm text-gray-500 mt-1">Active network partners</div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Countries</div>
                  <div className="text-2xl">🌍</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {coverage.summary.countriesCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">With partner coverage</div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Cities</div>
                  <div className="text-2xl">🏙️</div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {coverage.summary.citiesCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">Specific city coverage</div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600">Airports</div>
                  <div className="text-2xl">✈️</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {coverage.summary.airportsCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">Airport connections</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Service Type
                </label>
                <Select
                  value={serviceTypeFilter || ''}
                  onValueChange={(value) => 
                    setServiceTypeFilter(value as 'OBC' | 'NFO' | undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Service Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Service Types</SelectItem>
                    <SelectItem value="OBC">{SERVICE_TYPE_LABELS.OBC}</SelectItem>
                    <SelectItem value="NFO">{SERVICE_TYPE_LABELS.NFO}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Specific Partner
                </label>
                <PartnerSearch
                  onSelect={handlePartnerSelect}
                  placeholder="Search for specific partner..."
                  serviceType={serviceTypeFilter}
                />
              </div>
            </div>

            {(serviceTypeFilter || selectedPartner) && (
              <div className="mt-4 flex items-center gap-2">
                {serviceTypeFilter && (
                  <Badge variant="primary" className="cursor-pointer" onClick={() => setServiceTypeFilter(undefined)}>
                    {SERVICE_TYPE_LABELS[serviceTypeFilter]} ✕
                  </Badge>
                )}
                {selectedPartner && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={clearPartnerSelection}>
                    {selectedPartner.companyName} ✕
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Coverage Details */}
        {coverage && (
          <Card>
            <Tabs defaultValue="countries" className="w-full">
              <TabsList className="w-full justify-start border-b">
                <TabsTrigger value="countries">
                  🌍 Countries ({coverage.coverage.countries.length})
                </TabsTrigger>
                <TabsTrigger value="cities">
                  🏙️ Cities ({coverage.coverage.cities.length})
                </TabsTrigger>
                <TabsTrigger value="airports">
                  ✈️ Airports ({coverage.coverage.airports.length})
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="countries">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Country Coverage</h3>
                      <div className="text-sm text-gray-500">
                        {coverage.coverage.countries.length} countries with partner coverage
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coverage.coverage.countries.map((country) => (
                        <Card key={country.country} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{country.country}</h4>
                            <Badge variant="primary" size="sm">
                              {country.partnerCount} partner{country.partnerCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {country.partners.slice(0, 3).map((partner) => (
                              <div key={partner.id} className="text-sm text-gray-600">
                                • {partner.name}
                              </div>
                            ))}
                            {country.partners.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{country.partners.length - 3} more partners
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>

                    {coverage.coverage.countries.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No country coverage data available</div>
                        <p className="text-gray-400 text-sm">
                          Partners haven't specified country coverage yet
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cities">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">City Coverage</h3>
                      <div className="text-sm text-gray-500">
                        {coverage.coverage.cities.length} cities with specific partner coverage
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coverage.coverage.cities.map((city) => (
                        <Card key={city.city} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{city.city}</h4>
                            <Badge variant="success" size="sm">
                              {city.partnerCount} partner{city.partnerCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {city.partners.slice(0, 3).map((partner) => (
                              <div key={partner.id} className="text-sm text-gray-600">
                                • {partner.name}
                              </div>
                            ))}
                            {city.partners.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{city.partners.length - 3} more partners
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>

                    {coverage.coverage.cities.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No specific city coverage</div>
                        <p className="text-gray-400 text-sm">
                          Partners provide general country coverage without city specifics
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="airports">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Airport Coverage</h3>
                      <div className="text-sm text-gray-500">
                        {coverage.coverage.airports.length} airports with partner connections
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {coverage.coverage.airports.map((airport) => (
                        <Card key={airport.airport} className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                              {airport.airport}
                            </div>
                            <Badge variant="secondary" size="sm" className="mb-3">
                              {airport.partnerCount} partner{airport.partnerCount !== 1 ? 's' : ''}
                            </Badge>
                            
                            <div className="space-y-1">
                              {airport.partners.slice(0, 2).map((partner) => (
                                <div key={partner.id} className="text-xs text-gray-600">
                                  {partner.name}
                                </div>
                              ))}
                              {airport.partners.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{airport.partners.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {coverage.coverage.airports.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No specific airport coverage</div>
                        <p className="text-gray-400 text-sm">
                          Partners provide general coverage without airport specifics
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        )}

        {/* Coverage Gaps Alert */}
        <Alert variant="warning">
          <AlertDescription>
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div className="text-sm text-yellow-800">
                <strong>Coverage Analysis:</strong> Review coverage gaps and consider adding
                partners in underserved regions. Ensure critical routes have backup partner
                options for reliability. Contact business development to expand coverage in
                key markets.
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {canCreatePartners && (
            <Link to="/yourobc/partners/new">
              <button
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
                title="Add New Partner"
              >
                ➕
              </button>
            </Link>
          )}

          <button
            onClick={() => refetch()}
            className="w-12 h-12 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
            title="Refresh Coverage Data"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  )
}