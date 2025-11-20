// src/features/yourobc/mobile/components/MobileFilters.tsx

import { FC, useState } from 'react'
import { Badge } from '@/components/ui'

export type QuickFilter =
  | 'all'
  | 'my_orders'
  | 'sla_urgent'
  | 'today_due'
  | 'awaiting_pod'
  | 'in_transit'
  | 'customs'

interface MobileFiltersProps {
  activeFilter: QuickFilter
  onFilterChange: (filter: QuickFilter) => void
  counts?: {
    all?: number
    my_orders?: number
    sla_urgent?: number
    today_due?: number
    awaiting_pod?: number
    in_transit?: number
    customs?: number
  }
}

export const MobileFilters: FC<MobileFiltersProps> = ({ activeFilter, onFilterChange, counts }) => {
  const filters: Array<{
    id: QuickFilter
    label: string
    icon: string
    color: 'primary' | 'warning' | 'danger' | 'success' | 'secondary'
  }> = [
    { id: 'all', label: 'All', icon: '📋', color: 'secondary' },
    { id: 'my_orders', label: 'My Orders', icon: '👤', color: 'primary' },
    { id: 'sla_urgent', label: 'SLA < 2h', icon: '⚠️', color: 'danger' },
    { id: 'today_due', label: 'Today', icon: '📅', color: 'warning' },
    { id: 'awaiting_pod', label: 'POD', icon: '📄', color: 'warning' },
    { id: 'in_transit', label: 'Transit', icon: '✈️', color: 'primary' },
    { id: 'customs', label: 'Customs', icon: '🛃', color: 'secondary' },
  ]

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Horizontal scroll for chips */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 p-4 min-w-max">
          {filters.map((filter) => {
            const count = counts?.[filter.id]
            const isActive = activeFilter === filter.id

            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    isActive
                      ? filter.color === 'danger'
                        ? 'bg-red-500 text-white shadow-md'
                        : filter.color === 'warning'
                          ? 'bg-yellow-500 text-white shadow-md'
                          : filter.color === 'success'
                            ? 'bg-green-500 text-white shadow-md'
                            : filter.color === 'primary'
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive ? 'bg-white/20' : 'bg-gray-200'}
                  `}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile Search Bar Component
 */
interface MobileSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export const MobileSearchBar: FC<MobileSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search shipments...',
  onClear,
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            block w-full pl-10 pr-10 py-3
            border border-gray-300 rounded-lg
            text-base
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          "
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => {
              onChange('')
              onClear?.()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Mobile Sort Dropdown
 */
interface MobileSortDropdownProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export const MobileSortDropdown: FC<MobileSortDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
        <span>Sort</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-3 text-left text-sm
                  ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                  first:rounded-t-lg last:rounded-b-lg
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Mobile Filter Bar with Search and Sort
 */
interface MobileFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  sortValue: string
  onSortChange: (value: string) => void
  sortOptions: Array<{ value: string; label: string }>
  showSearch?: boolean
  showSort?: boolean
}

export const MobileFilterBar: FC<MobileFilterBarProps> = ({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  sortOptions,
  showSearch = true,
  showSort = true,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="p-4 space-y-3">
        {/* Search */}
        {showSearch && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="
                block w-full pl-10 pr-10 py-3
                border border-gray-300 rounded-lg
                text-base
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              placeholder="Search..."
            />
          </div>
        )}

        {/* Sort */}
        {showSort && <MobileSortDropdown value={sortValue} onChange={onSortChange} options={sortOptions} />}
      </div>
    </div>
  )
}
