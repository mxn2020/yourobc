// src/features/yourobc/tasks/components/CombinedDashboardView.tsx

import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TasksTable } from './TasksTable'
import { QuotesTable } from '../../quotes/components/QuotesTable'
import { ShipmentsTable } from '../../shipments/components/ShipmentsTable'
import { Card } from '@/components/ui'
import type { TaskListItem } from '../types'
import type { QuoteListItem } from '../../quotes/types'
import type { ShipmentListItem } from '../../shipments/types'

interface CombinedDashboardViewProps {
  tasks: TaskListItem[]
  quotes: QuoteListItem[]
  shipments: ShipmentListItem[]
  isLoading?: boolean
}

export const CombinedDashboardView: FC<CombinedDashboardViewProps> = ({
  tasks,
  quotes,
  shipments,
  isLoading,
}) => {
  const navigate = useNavigate()

  const handleTaskClick = (task: TaskListItem) => {
    // Navigate to task or shipment details
    if (task.shipmentId) {
      navigate({
        to: '/yourobc/shipments/$shipmentId',
        params: { shipmentId: task.shipmentId },
      })
    }
  }

  const handleQuoteClick = (quote: QuoteListItem) => {
    navigate({
      to: '/yourobc/quotes/$quoteId',
      params: { quoteId: quote._id },
    })
  }

  const handleShipmentClick = (shipment: ShipmentListItem) => {
    navigate({
      to: '/yourobc/shipments/$shipmentId',
      params: { shipmentId: shipment._id },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Shipments Table - Full Width on Top */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Shipments</h2>
            <span className="text-sm text-gray-500">
              {shipments.length} total
            </span>
          </div>
          <ShipmentsTable
            shipments={shipments.slice(0, 10)}
            onRowClick={handleShipmentClick}
          />
          {shipments.length > 10 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate({ to: '/yourobc/shipments' })}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all {shipments.length} shipments →
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Tasks and Quotes - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Column (Left) */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <span className="text-sm text-gray-500">
                {tasks.length} total
              </span>
            </div>
            <TasksTable
              tasks={tasks.slice(0, 10)}
              onRowClick={handleTaskClick}
              compact={true}
            />
            {tasks.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate({ to: '/yourobc/tasks/dashboard' })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {tasks.length} tasks →
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Quotes Column (Right) */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Quotes</h2>
              <span className="text-sm text-gray-500">
                {quotes.length} total
              </span>
            </div>
            <QuotesTable
              quotes={quotes.slice(0, 10)}
              onRowClick={handleQuoteClick}
            />
            {quotes.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate({ to: '/yourobc/quotes' })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {quotes.length} quotes →
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
