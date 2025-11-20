// src/features/yourobc/tasks/components/DetailedDashboardView.tsx

import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { TasksTable } from './TasksTable'
import { QuotesTable } from '../../quotes/components/QuotesTable'
import { ShipmentsTable } from '../../shipments/components/ShipmentsTable'
import type { TaskListItem } from '../types'
import type { QuoteListItem } from '../../quotes/types'
import type { ShipmentListItem } from '../../shipments/types'

interface DetailedDashboardViewProps {
  tasks: TaskListItem[]
  quotes: QuoteListItem[]
  shipments: ShipmentListItem[]
  isLoading?: boolean
}

export const DetailedDashboardView: FC<DetailedDashboardViewProps> = ({
  tasks,
  quotes,
  shipments,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState('tasks')
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
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <TabsList className="border-none bg-transparent">
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
            >
              <span className="flex items-center gap-2">
                Tasks
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {tasks.length}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="quotes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
            >
              <span className="flex items-center gap-2">
                Quotes
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {quotes.length}
                </span>
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="shipments"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
            >
              <span className="flex items-center gap-2">
                Shipments
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {shipments.length}
                </span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tasks" className="p-6 mt-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete view of all tasks with detailed information
            </p>
          </div>
          <TasksTable
            tasks={tasks}
            onRowClick={handleTaskClick}
            compact={false}
          />
        </TabsContent>

        <TabsContent value="quotes" className="p-6 mt-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Quotes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete view of all quotes with detailed information
            </p>
          </div>
          <QuotesTable
            quotes={quotes}
            onRowClick={handleQuoteClick}
          />
        </TabsContent>

        <TabsContent value="shipments" className="p-6 mt-0">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Shipments</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete view of all shipments with detailed information
            </p>
          </div>
          <ShipmentsTable
            shipments={shipments}
            onRowClick={handleShipmentClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
