// src/features/audit-logs/components/AuditLogFilters.tsx
import React from 'react'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { Label } from '@/components/ui'
import { Search, Filter, X, Calendar } from 'lucide-react'
import type { AuditLogFilters, AuditAction, AuditEntityType } from '../types/audit-logs.types'

interface AuditLogFiltersComponentProps {
  filters: AuditLogFilters
  onFiltersChange: (filters: Partial<AuditLogFilters>) => void
  onReset: () => void
  loading?: boolean
}

export function AuditLogFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
  loading = false
}: AuditLogFiltersComponentProps) {
  
  const actionOptions = [
    { value: '', label: 'All Actions' },
    { value: 'user.created', label: 'User Created' },
    { value: 'user.updated', label: 'User Updated' },
    { value: 'user.deleted', label: 'User Deleted' },
    { value: 'user.role_changed', label: 'Role Changed' },
    { value: 'user.banned', label: 'User Banned' },
    { value: 'project.created', label: 'Project Created' },
    { value: 'settings.updated', label: 'Settings Updated' },
    { value: 'security.login_failed', label: 'Login Failed' },
  ]

  const entityTypeOptions = [
    { value: '', label: 'All Entity Types' },
    { value: 'user', label: 'User' },
    { value: 'userProfile', label: 'User Profile' },
    { value: 'project', label: 'Project' },
    { value: 'settings', label: 'Settings' },
    { value: 'system', label: 'System' },
  ]

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const timestamp = value ? new Date(value).getTime() : undefined
    onFiltersChange({ dateFrom: timestamp })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const timestamp = value ? new Date(value + 'T23:59:59').getTime() : undefined
    onFiltersChange({ dateTo: timestamp })
  }

  const formatDateForInput = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp).toISOString().split('T')[0]
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof AuditLogFilters]
    return value !== undefined && value !== ''
  })

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search audit logs..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Filter */}
            <div>
              <Label htmlFor="user-filter">
                User
              </Label>
              <Input
                id="user-filter"
                placeholder="Filter by user name..."
                value={filters.userName || ''}
                onChange={(e) => onFiltersChange({ userName: e.target.value })}
              />
            </div>

            {/* Action Filter */}
            <div>
              <Label htmlFor="action-filter">
                Action
              </Label>
              <SimpleSelect
                id="action-filter"
                value={Array.isArray(filters.action) ? filters.action[0] : filters.action || ''}
                onChange={(e) => onFiltersChange({ action: e.target.value as AuditAction || undefined })}
                options={actionOptions}
                disabled={loading}
              />
            </div>

            {/* Entity Type Filter */}
            <div>
              <Label htmlFor="entity-type-filter">
                Entity Type
              </Label>
              <SimpleSelect
                id="entity-type-filter"
                value={Array.isArray(filters.entityType) ? filters.entityType[0] : filters.entityType || ''}
                onChange={(e) => onFiltersChange({ entityType: e.target.value as AuditEntityType || undefined })}
                options={entityTypeOptions}
                disabled={loading}
              />
            </div>

            {/* Entity ID Filter */}
            <div>
              <Label htmlFor="entity-id-filter">
                Entity ID
              </Label>
              <Input
                id="entity-id-filter"
                placeholder="Filter by entity ID..."
                value={filters.entityId || ''}
                onChange={(e) => onFiltersChange({ entityId: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-from-filter">
                From Date
              </Label>
              <Input
                id="date-from-filter"
                type="date"
                value={formatDateForInput(filters.dateFrom)}
                onChange={handleDateFromChange}
              />
            </div>
            <div>
              <Label htmlFor="date-to-filter">
                To Date
              </Label>
              <Input
                id="date-to-filter"
                type="date"
                value={formatDateForInput(filters.dateTo)}
                onChange={handleDateToChange}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {hasActiveFilters ? 'Filters active' : 'No filters applied'}
              </span>
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

