// src/features/yourobc/invoices/components/InvoicesFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'
import { INVOICE_STATUS_LABELS, INVOICE_TYPE_LABELS } from '../types'

interface InvoicesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
}

export const InvoicesFilters: FC<InvoicesFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
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
            placeholder="Search invoices by number, customer, partner..."
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.entries(INVOICE_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="outgoing">{INVOICE_TYPE_LABELS.outgoing}</SelectItem>
              <SelectItem value="incoming">{INVOICE_TYPE_LABELS.incoming}</SelectItem>
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
