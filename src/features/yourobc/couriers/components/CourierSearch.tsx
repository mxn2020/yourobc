// src/features/yourobc/couriers/components/CourierSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading } from '@/components/ui'
import { useCourierSearch } from '../hooks/useCouriers'
import type { CourierListItem } from '../types'

interface CourierSearchProps {
  onSelect?: (courier: CourierListItem) => void
  placeholder?: string
  limit?: number
}

export const CourierSearch: FC<CourierSearchProps> = ({
  onSelect,
  placeholder = 'Search couriers...',
  limit = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useCourierSearch(searchTerm)

  const handleSelect = (courier: CourierListItem) => {
    onSelect?.(courier)
    setSearchTerm('')
    setShowResults(false)
  }

  return (
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
              {results.slice(0, limit).map((courier) => (
                <div
                  key={courier._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(courier)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {courier.firstName} {courier.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{courier.courierNumber}</div>
                    </div>
                    <Badge
                      variant={
                        courier.status === 'available'
                          ? 'success'
                          : courier.status === 'busy'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {courier.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No couriers found</div>
          )}
        </Card>
      )}
    </div>
  )
}

