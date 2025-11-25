// src/routes/_protected/yourobc/shipments/overdue.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ShipmentList } from '@/features/yourobc/shipments/components/ShipmentList'
import { useOverdueShipments } from '@/features/yourobc/shipments/hooks/useShipments'
import { authService } from '@/features/system/auth'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { Suspense } from 'react'
import { Card, Alert, AlertDescription, Button } from '@/components/ui'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/shipments/overdue')({
  loader: async ({ context }) => {
    try {
      const session = await authService.getSession()
      
      if (session?.data?.user?.id) {
        await context.queryClient.prefetchQuery(
          convexQuery(api.lib.yourobc.shipments.queries.getOverdueShipments, {
                        limit: 100
          })
        )
      }
      
      return {}
    } catch (error) {
      console.warn('Failed to prefetch overdue shipments data:', error)
      return {}
    }
  },
  component: OverdueShipmentsIndexPage,
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: 'Overdue Shipments - YourOBC',
      },
      {
        name: 'description',
        content: 'Manage overdue shipments requiring immediate attention',
      },
    ],
  }),
})

function OverdueShipmentsIndexPage() {
  const { shipments, isLoading, hasOverdue } = useOverdueShipments(100)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-red-900">🚨 Overdue Shipments</h1>
            <p className="text-red-700 mt-2">
              Shipments requiring immediate attention to meet customer commitments
            </p>
          </div>
          <Link to="/yourobc/shipments">
            <Button variant="outline">← Back to All Shipments</Button>
          </Link>
        </div>

        {/* Alert */}
        <Alert variant="warning">
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Priority Action Required:</strong> These shipments have exceeded their deadlines.
                Contact customers, update ETAs, and escalate as needed.
              </div>
              <div className="text-lg font-bold">
                {shipments.length} overdue shipment{shipments.length !== 1 ? 's' : ''}
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Overdue Shipments */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading overdue shipments...</div>
          </div>
        }>
          {hasOverdue ? (
            <ShipmentList
              filters={{ slaStatus: ['overdue'] }}
              showFilters={false}
              compact={false}
              viewMode="grid"
            />
          ) : (
            <Card>
              <div className="text-center py-12 p-6">
                <div className="text-green-500 text-lg mb-2">✅ No Overdue Shipments</div>
                <p className="text-gray-400">
                  Great work! All shipments are on track or completed.
                </p>
                <Link to="/yourobc/shipments" className="mt-4 inline-block">
                  <Button variant="primary">View All Shipments</Button>
                </Link>
              </div>
            </Card>
          )}
        </Suspense>
      </div>
    </div>
  )
}

