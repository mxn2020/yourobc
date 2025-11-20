// src/features/yourobc/partners/components/PartnersFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'

interface PartnersFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  serviceTypeFilter: string
  onServiceTypeChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
}

export const PartnersFilters: FC<PartnersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  serviceTypeFilter,
  onServiceTypeChange,
  onClearFilters,
  showClearButton,
}) => {
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search partners by company name or code..."
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={serviceTypeFilter} onValueChange={onServiceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Service Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Service Types</SelectItem>
              <SelectItem value="OBC">🚶‍♂️ OBC</SelectItem>
              <SelectItem value="NFO">✈️ NFO</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>

          {showClearButton && (
            <Button variant="ghost" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
