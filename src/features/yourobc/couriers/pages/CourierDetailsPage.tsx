// src/features/yourobc/couriers/pages/CourierDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCourier, useCouriers, useCourierCommissions } from '../hooks/useCouriers'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { useAuth } from '@/features/system/auth'
import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Loading,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommissionList } from '../components/CommissionList'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { shipmentsService } from '@/features/yourobc/shipments/services/ShipmentsService'
import { ShipmentCard } from '@/features/yourobc/shipments/components/ShipmentCard'
import { ShipmentsTable } from '@/features/yourobc/shipments/components/ShipmentsTable'
import { Grid3x3, List } from 'lucide-react'
import type { CourierId, CommissionId } from '../types'

interface CourierDetailsPageProps {
  courierId: CourierId
}

export const CourierDetailsPage: FC<CourierDetailsPageProps> = ({ courierId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const navigate = useNavigate()
  const toast = useToast()
  const { auth, user } = useAuth()

  const { courier, courierMetrics, courierInsights, isLoading, error } = useCourier(courierId)
  const { canEditCouriers, canDeleteCouriers, deleteCourier, isDeleting } = useCouriers()
  const {
    commissions,
    summary,
    isLoading: isCommissionsLoading,
    markCommissionPaid,
    isMarkingPaid,
  } = useCourierCommissions(courierId)

  // Fetch shipments for this courier
  const {
    data: courierShipments,
    isPending: isShipmentsLoading,
    error: shipmentsError,
  } = shipmentsService.useShipmentsByCourier(
    auth?.id!,
    courierId,
    100, // limit
    true // includeCompleted - show all shipments
  )

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!courier) return

    try {
      await deleteCourier(courierId)
      toast.success(`${courier.firstName} ${courier.lastName} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/couriers' })
    } catch (error: any) {
      console.error('Delete courier error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleMarkPaid = async (commissionId: CommissionId) => {
    try {
      await markCommissionPaid(commissionId)
      toast.success('Commission marked as paid')
    } catch (error: any) {
      console.error('Mark paid error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'busy':
        return 'warning'
      case 'offline':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !courier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading courier' : 'Courier not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The courier you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/yourobc/couriers" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Couriers
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/yourobc/couriers" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Couriers
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/yourobc/shipments/new" search={{ courierId }}>
              <Button variant="primary">📦 Assign Shipment</Button>
            </Link>

            {canEditCouriers && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/couriers/${courierId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeleteCouriers && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Courier Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {courier.firstName} {courier.middleName} {courier.lastName}
                  </h1>

                  {courierInsights?.isTopPerformer && (
                    <Badge variant="primary">⭐ Top Performer</Badge>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  Courier ID: {courier.courierNumber}
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">
                      {courier.currentLocation?.city
                        ? `${courier.currentLocation.city}, ${courier.currentLocation.country}`
                        : courier.currentLocation?.country || 'Unknown'}
                    </span>
                  </div>

                  {courier.email && (
                    <a href={`mailto:${courier.email}`} className="text-blue-600 hover:text-blue-800">
                      📧 {courier.email}
                    </a>
                  )}

                  {courier.phone && (
                    <a href={`tel:${courier.phone}`} className="text-blue-600 hover:text-blue-800">
                      📞 {courier.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {courier.status && (
                  <Badge variant={getStatusVariant(courier.status)}>
                    {courier.status.toUpperCase()}
                  </Badge>
                )}

                {courier.isOnline && <Badge variant="success">🟢 Online</Badge>}

                {!courier.isActive && <Badge variant="danger">⚠️ Inactive</Badge>}

                {courierInsights?.needsAttention && (
                  <Badge variant="warning">⚠️ Needs Attention</Badge>
                )}

                {courierInsights?.isNewCourier && <Badge variant="success">✨ New Courier</Badge>}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            {courierMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {courierMetrics.totalShipments}
                  </div>
                  <div className="text-sm text-gray-600">Total Shipments</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {courierMetrics.completedShipments}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-xs text-green-600 mt-1">
                    {courierMetrics.onTimeDeliveries} on-time
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {courierMetrics.averageRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    €{courierMetrics.totalCommissions.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Commissions</div>
                  <div className="text-xs text-orange-600 mt-1">
                    €{courierMetrics.pendingCommissions} pending
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">👁️ Overview</TabsTrigger>
              <TabsTrigger value='yourobcShipments'>📦 Shipments</TabsTrigger>
              <TabsTrigger value='yourobcCommissions'>💰 Commissions</TabsTrigger>
              <TabsTrigger value="time">⏰ Time Tracking</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Courier Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Courier Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Full Name:</span>{' '}
                              {courier.firstName} {courier.middleName} {courier.lastName}
                            </div>
                            <div>
                              <span className="text-gray-500">Courier ID:</span> {courier.courierNumber}
                            </div>
                            <div>
                              <span className="text-gray-500">Timezone:</span> {courier.timezone}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Skills & Capabilities</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Services:</span>{' '}
                              {courier.skills.availableServices.join(', ')}
                            </div>
                            {courier.skills.maxCarryWeight && (
                              <div>
                                <span className="text-gray-500">Max Weight:</span>{' '}
                                {courier.skills.maxCarryWeight}kg
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {courier.skills.languages.map((lang, index) => (
                            <Badge key={index} variant="secondary" size="sm">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      {courier.skills.certifications && courier.skills.certifications.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {courier.skills.certifications.map((cert, index) => (
                              <Badge key={index} variant="primary" size="sm">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Work Status */}
                    {courier.workStatus && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Status</h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {courier.workStatus.todayHours.toFixed(1)}h
                            </div>
                            <div className="text-xs text-gray-600">Today's Hours</div>
                          </div>

                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {courier.workStatus.isWorking ? '🟢' : '⭕'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {courier.workStatus.isWorking ? 'Working' : 'Not Working'}
                            </div>
                          </div>

                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">
                              {courier.workStatus.lastLogin 
                                ? formatDate(courier.workStatus.lastLogin).split(',')[0]
                                : 'Never'}
                            </div>
                            <div className="text-xs text-gray-600">Last Login</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {courier.workStatus?.lastLogin && (
                          <div className="text-sm text-gray-600">
                            Last Login: {formatDate(courier.workStatus.lastLogin)}
                          </div>
                        )}
                        {courier.workStatus?.lastLogout && (
                          <div className="text-sm text-gray-600">
                            Last Logout: {formatDate(courier.workStatus.lastLogout)}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Courier Since: {formatDate(courier.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link to="/yourobc/shipments/new" search={{ courierId }} className="block w-full">
                            <Button variant="primary" className="w-full">
                              📦 Assign Shipment
                            </Button>
                          </Link>

                          <Button variant="secondary" className="w-full">
                            📧 Send Message
                          </Button>

                          <Button variant="ghost" className="w-full">
                            📊 View Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Performance Insights */}
                    {courierInsights && (
                      <Alert variant="default">
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Performance Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Courier Age: {courierInsights.courierAge} days</div>
                            {courierInsights.daysSinceLastActivity !== null && (
                              <div>
                                Last Activity: {courierInsights.daysSinceLastActivity} days ago
                              </div>
                            )}
                            <div>
                              Rating: {courierInsights.rating.rating} ({courierInsights.rating.score}/100)
                            </div>

                            {courierInsights.needsAttention && (
                              <div className="text-orange-800 font-medium mt-2">
                                ⚠️ Courier needs attention - no activity for{' '}
                                {courierInsights.daysSinceLastActivity} days
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='yourobcShipments'>
                <div className="space-y-6">
                  {/* Header with View Toggle */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Courier Shipments</h3>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isShipmentsLoading && (
                    <div className="flex justify-center py-12">
                      <Loading size="lg" />
                    </div>
                  )}

                  {/* Error State */}
                  {shipmentsError && !isShipmentsLoading && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <div className="font-semibold mb-1">Failed to load shipments</div>
                        <div className="text-sm">
                          {shipmentsError.message || 'An error occurred while loading shipments.'}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Empty State */}
                  {!isShipmentsLoading && !shipmentsError && courierShipments && courierShipments.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipments Yet</h3>
                      <p className="text-gray-600 mb-4">
                        This courier hasn't been assigned any shipments yet.
                      </p>
                      <Link to="/yourobc/shipments/new" search={{ courierId }}>
                        <Button variant="primary">Assign First Shipment</Button>
                      </Link>
                    </div>
                  )}

                  {/* Shipments Display */}
                  {!isShipmentsLoading && !shipmentsError && courierShipments && courierShipments.length > 0 && (
                    <>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {courierShipments.map((shipment) => (
                            <ShipmentCard
                              key={shipment._id}
                              shipment={shipment}
                              showCustomer={true}
                              showCourier={false}
                            />
                          ))}
                        </div>
                      ) : (
                        <ShipmentsTable
                          shipments={courierShipments}
                          onRowClick={(shipment) =>
                            navigate({ to: `/yourobc/shipments/${shipment._id}` })
                          }
                        />
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='yourobcCommissions'>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Commission History</h3>
                    <Button variant="primary" size="sm">
                      + New Commission
                    </Button>
                  </div>

                  {/* Commission Summary */}
                  {summary && (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-gray-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-gray-900">
                            €{summary.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Earned</div>
                        </div>
                      </Card>

                      <Card className="bg-orange-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-orange-600">
                            €{summary.pendingCommissions.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Pending</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {summary.pendingCount} payment{summary.pendingCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-green-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            €{summary.paidCommissions.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Paid</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {summary.paidCount} payment{summary.paidCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Commission List */}
                  <CommissionList
                    commissions={commissions}
                    isLoading={isCommissionsLoading}
                    onMarkPaid={handleMarkPaid}
                    showCourier={false}
                    showShipment={true}
                    compact={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="time">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
                  <p className="text-gray-600">Time entries for this courier will be displayed here.</p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
                  <p className="text-gray-600">Courier activity history will be displayed here.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_courier"
          entityId={courierId}
          title="Courier Notes & Comments"
          showInternalComments={true}
        />

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_courier"
          entityId={courierId}
          title="Courier Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Courier?"
          entityName={`${courier?.firstName} ${courier?.lastName}`}
          description="This will permanently delete the courier record and all associated data including shipments and commissions. This action cannot be undone."
        />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Couriers" title="Courier Wiki Helper" />
      </div>
    </div>
  )
}