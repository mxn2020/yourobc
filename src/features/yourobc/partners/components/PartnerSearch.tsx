// src/features/yourobc/partners/components/PartnerSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading, Button } from '@/components/ui'
import { usePartnerSearch } from '../hooks/usePartners'
import { SERVICE_TYPE_LABELS } from '../types'
import type { PartnerListItem } from '../types'

interface PartnerSearchProps {
  onSelect?: (partner: PartnerListItem | null) => void
  placeholder?: string
  limit?: number
  serviceType?: 'OBC' | 'NFO' | 'both'
  selectedPartner?: PartnerListItem | null
  showSelectedPartner?: boolean
}

export const PartnerSearch: FC<PartnerSearchProps> = ({
  onSelect,
  placeholder = 'Search partners...',
  limit = 10,
  serviceType,
  selectedPartner = null,
  showSelectedPartner = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = usePartnerSearch(searchTerm, serviceType)

  const handleSelect = (partner: PartnerListItem) => {
    onSelect?.(partner)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleRemove = () => {
    onSelect?.(null)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-2">
      {/* Show selected partner if available */}
      {showSelectedPartner && selectedPartner && (
        <Card className="bg-green-50 border-green-200">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  ✓ {selectedPartner.companyName}
                </div>
                {selectedPartner.shortName && selectedPartner.shortName !== selectedPartner.companyName && (
                  <div className="text-sm text-gray-600">{selectedPartner.shortName}</div>
                )}
                <div className="text-sm text-gray-600">
                  {selectedPartner.primaryContact.name}
                  {selectedPartner.primaryContact.email && (
                    <span className="ml-2">• {selectedPartner.primaryContact.email}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" size="sm">
                    {SERVICE_TYPE_LABELS[selectedPartner.serviceType]}
                  </Badge>
                  <Badge variant={getStatusVariant(selectedPartner.status)} size="sm">
                    {selectedPartner.status}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                ✕ Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Show search input when no partner is selected or showSelectedPartner is false */}
      {(!showSelectedPartner || !selectedPartner) && (
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder={placeholder}
          />

          {showResults && searchTerm.length >= 2 && (
        <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loading size="sm" />
            </div>
          ) : hasResults ? (
            <div className="divide-y">
              {results.slice(0, limit).map((partner) => (
                <div
                  key={partner._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(partner)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {partner.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partner.partnerCode && `Code: ${partner.partnerCode} • `}
                        {partner.address.city}, {partner.address.country}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={getStatusVariant(partner.status)}
                        size="sm"
                      >
                        {partner.status}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {SERVICE_TYPE_LABELS[partner.serviceType]}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div>Contact: {partner.primaryContact.name}</div>
                    {partner.primaryContact.email && (
                      <div>📧 {partner.primaryContact.email}</div>
                    )}
                  </div>

                  {/* Coverage summary */}
                  <div className="text-xs text-gray-500 mt-2">
                    Coverage: {partner.serviceCoverage.countries.length} countries
                    {partner.serviceCoverage.cities.length > 0 && 
                      `, ${partner.serviceCoverage.cities.length} cities`}
                    {partner.serviceCoverage.airports.length > 0 && 
                      `, ${partner.serviceCoverage.airports.length} airports`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No partners found</div>
          )}
        </Card>
      )}
        </div>
      )}
    </div>
  )
}