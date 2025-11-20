// src/features/yourobc/couriers/components/CourierCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import type { CourierCardProps } from '../types'

export const CourierCard: FC<CourierCardProps> = ({
  courier,
  onClick,
  showWorkStatus = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  const getRatingVariant = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'success'
      case 'good': return 'primary'
      case 'average': return 'warning'
      case 'poor': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'busy': return 'warning'
      case 'offline': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(courier) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {courier.displayName || `${courier.firstName} ${courier.lastName}`}
              </h3>

              {courier.isHighPerformer && (
                <Badge variant="primary" size="sm">
                  ⭐ Top Performer
                </Badge>
              )}

              {courier.rating && (
                <Badge variant={getRatingVariant(courier.rating.rating)} size="sm">
                  {courier.rating.rating.toUpperCase()}
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-1">
              ID: {courier.courierNumber}
            </div>

            <div className="text-sm text-gray-600">
              📍 {courier.formattedLocation || 'Unknown location'}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(courier.status)} size="sm">
              {courier.status.toUpperCase()}
            </Badge>

            {courier.isOnline && (
              <Badge variant="success" size="sm">
                🟢 Online
              </Badge>
            )}

            {!courier.isActive && (
              <Badge variant="danger" size="sm">
                ⚠️ Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact Info */}
        <div className="mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            {courier.email && (
              <a
                href={`mailto:${courier.email}`}
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                📧 {courier.email}
              </a>
            )}

            {courier.phone && (
              <a
                href={`tel:${courier.phone}`}
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                📞 {courier.phone}
              </a>
            )}
          </div>
        </div>

        {/* Skills & Services */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 mb-2">
            {courier.skills.availableServices.map((service, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {service}
              </Badge>
            ))}
          </div>

          <div className="text-xs text-gray-500">
            Languages: {courier.skills.languages.slice(0, 3).join(', ')}
            {courier.skills.languages.length > 3 && ` +${courier.skills.languages.length - 3} more`}
          </div>

          {courier.skills.maxCarryWeight && (
            <div className="text-xs text-gray-500">
              Max weight: {courier.skills.maxCarryWeight}kg
            </div>
          )}
        </div>

        {/* Work Status */}
        {showWorkStatus && courier.workStatus && (
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-xs font-medium text-gray-900 mb-2">
              {courier.workStatus.isWorking ? '🟢 Currently Working' : '⭕ Not Working'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <div className="font-medium">Today's Hours</div>
                <div>{formatHours(courier.workStatus.todayHours)}</div>
              </div>

              <div>
                <div className="font-medium">Last Activity</div>
                <div>
                  {courier.workStatus.lastLogin
                    ? formatDate(courier.workStatus.lastLogin)
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Joined: {formatDate(courier.createdAt)}</span>
            <span>Updated: {formatDate(courier.updatedAt)}</span>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Link
                to="/yourobc/shipments/new"
                search={{ courierId: courier._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  📦 Assign
                </Button>
              </Link>

              <Link
                to="/yourobc/couriers/$courierId"
                params={{ courierId: courier._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>{courier.timezone}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}