// src/features/yourobc/shipments/components/ShipmentsFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'

interface ShipmentsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  serviceTypeFilter: string
  onServiceTypeChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
}

export const ShipmentsFilters: FC<ShipmentsFiltersProps> = ({
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
            placeholder="Search shipments by number, AWB, reference, description..."
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="document">Documentation</SelectItem>
              <SelectItem value="invoiced">Invoiced</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={serviceTypeFilter} onValueChange={onServiceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Service Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Service Types</SelectItem>
              <SelectItem value="OBC">🚶‍♂️ On Board Courier</SelectItem>
              <SelectItem value="NFO">✈️ Next Flight Out</SelectItem>
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
