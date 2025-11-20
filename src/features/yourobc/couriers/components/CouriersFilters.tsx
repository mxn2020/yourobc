// src/features/yourobc/couriers/components/CouriersFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'

interface CouriersFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  serviceTypeFilter: string
  onServiceTypeChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
}

export const CouriersFilters: FC<CouriersFiltersProps> = ({
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
            placeholder="Search couriers by name, ID, or location..."
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
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
