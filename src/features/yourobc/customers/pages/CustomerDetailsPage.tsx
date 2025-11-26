// src/features/yourobc/customers/pages/CustomerDetailsPage.tsx

import { FC, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useCustomer, useCustomers, useCustomerTags } from '../hooks/useCustomers'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
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
  Input,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { InquirySourceDisplay } from '@/features/yourobc/supporting/inquiry-sources'
import { QuoteList } from '@/features/yourobc/quotes/components/QuoteList'
import { ShipmentList } from '@/features/yourobc/shipments/components/ShipmentList'
import { InvoiceList } from '@/features/yourobc/invoices/components/InvoiceList'
import { CustomerAnalyticsDashboard } from '../components/CustomerAnalyticsDashboard'
import { ContactHistory } from '../components/ContactHistory'
import { MarginCalculator } from '../components/MarginCalculator'
import { DunningConfiguration } from '../components/DunningConfiguration'
import { CURRENCY_SYMBOLS } from '../types'
import type { CustomerId } from '../types'

interface CustomerDetailsPageProps {
  customerId: CustomerId
}

export const CustomerDetailsPage: FC<CustomerDetailsPageProps> = ({ customerId }) => {
  // Performance tracking (dev mode only)
  const mountTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (import.meta.env.DEV) {
      mountTimeRef.current = performance.now()

      const logInteractive = () => {
        if (mountTimeRef.current) {
          const duration = performance.now() - mountTimeRef.current
          console.log(`CustomerDetailsPage: Became interactive in ${duration.toFixed(2)}ms`)
        }
      }

      const timeoutId = setTimeout(logInteractive, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [])

  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [newTag, setNewTag] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const { customer, customerMetrics, customerInsights, activity } = useCustomer(customerId)
  const { canEditCustomers, canDeleteCustomers, deleteCustomer, isDeleting } = useCustomers()
  const { allTags, addTag, removeTag, isAddingTag, isRemovingTag } = useCustomerTags(customerId, customer?.companyName)

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!customer) return

    try {
      await deleteCustomer(customerId)
      toast.success(`${customer.companyName} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/{-$locale}/yourobc/customers' })
    } catch (error: any) {
      console.error('Delete customer error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      await addTag(newTag.trim())
      setNewTag('')
      toast.success('Tag added successfully')
    } catch (error: any) {
      console.error('Add tag error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(tag)
      toast.success('Tag removed successfully')
    } catch (error: any) {
      console.error('Remove tag error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || ''}${amount.toLocaleString()}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'blacklisted': return 'danger'
      default: return 'secondary'
    }
  }

  const getRiskVariant = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'danger'
      default: return 'secondary'
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

  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading customer' : 'Customer not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The customer you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/{-$locale}/yourobc/customers" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Customers
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
          <Link to="/{-$locale}/yourobc/customers" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Customers
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/{-$locale}/yourobc/quotes/new" search={{ customerId }}>
              <Button variant="primary">📄 New Quote</Button>
            </Link>

            {canEditCustomers && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/customers/${customerId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeleteCustomers && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Customer Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {customer.companyName}
                  </h1>

                  {customerInsights?.isTopCustomer && (
                    <Badge variant="primary">⭐ Top Customer</Badge>
                  )}
                </div>

                {customer.shortName && customer.shortName !== customer.companyName && (
                  <div className="text-gray-600 mb-4">
                    Also known as: {customer.shortName}
                  </div>
                )}

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Primary Contact:</span>
                    <span className="ml-2 font-medium">{customer.primaryContact.name}</span>
                  </div>

                  {customer.primaryContact.email && (
                    <a href={`mailto:${customer.primaryContact.email}`} className="text-blue-600 hover:text-blue-800">
                      📧 {customer.primaryContact.email}
                    </a>
                  )}

                  {customer.primaryContact.phone && (
                    <a href={`tel:${customer.primaryContact.phone}`} className="text-blue-600 hover:text-blue-800">
                      📞 {customer.primaryContact.phone}
                    </a>
                  )}

                  {customer.website && (
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      🌐 Website
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusVariant(customer.status)}>
                  {customer.status.toUpperCase()}
                </Badge>

                {customerInsights?.riskLevel && (
                  <Badge variant={getRiskVariant(customerInsights.riskLevel)}>
                    {customerInsights.riskLevel.toUpperCase()} RISK
                  </Badge>
                )}

                {customerInsights?.needsAttention && (
                  <Badge variant="warning">⚠️ Needs Attention</Badge>
                )}

                {customerInsights?.isNewCustomer && (
                  <Badge variant="success">✨ New Customer</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            {customerMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(customerMetrics.totalRevenue, customer.defaultCurrency)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {customerMetrics.totalQuotes}
                  </div>
                  <div className="text-sm text-gray-600">Total Quotes</div>
                  <div className="text-xs text-green-600 mt-1">
                    {customerMetrics.acceptedQuotes} accepted
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {customerMetrics.totalQuotes > 0 
                      ? Math.round((customerMetrics.acceptedQuotes / customerMetrics.totalQuotes) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Accept Rate</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(customerMetrics.averageOrderValue, customer.defaultCurrency)}
                  </div>
                  <div className="text-sm text-gray-600">Avg Order Value</div>
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
              <TabsTrigger value="contacts">👥 Contacts</TabsTrigger>
              <TabsTrigger value='yourobcQuotes'>📄 Quotes</TabsTrigger>
              <TabsTrigger value='yourobcShipments'>📦 Shipments</TabsTrigger>
              <TabsTrigger value='yourobcInvoices'>💰 Invoices</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
              <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
              <TabsTrigger value="contactHistory">📞 Contact History</TabsTrigger>
              <TabsTrigger value="pricing">💵 Pricing & Margins</TabsTrigger>
              <TabsTrigger value="payment">💳 Payment Management</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Company Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Company Name:</span> {customer.companyName}
                            </div>
                            {customer.shortName && (
                              <div>
                                <span className="text-gray-500">Short Name:</span> {customer.shortName}
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Currency:</span> {customer.defaultCurrency}
                            </div>
                            <div>
                              <span className="text-gray-500">Payment Terms:</span> Net {customer.paymentTerms} days
                            </div>
                            <div>
                              <span className="text-gray-500">Payment Method:</span> {customer.paymentMethod.replace('_', ' ')}
                            </div>
                            <div>
                              <span className="text-gray-500">Margin:</span> {customer.margin}%
                            </div>
                            {customer.inquirySourceId && (
                              <div>
                                <InquirySourceDisplay sourceId={customer.inquirySourceId} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
                          <div className="text-sm text-gray-600">
                            {customer.billingAddress.street && (
                              <div>{customer.billingAddress.street}</div>
                            )}
                            <div>
                              {customer.billingAddress.city}
                              {customer.billingAddress.postalCode && `, ${customer.billingAddress.postalCode}`}
                            </div>
                            <div>{customer.billingAddress.country}</div>
                          </div>

                          {customer.shippingAddress && (
                            <>
                              <h4 className="font-medium text-gray-900 mt-4 mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-600">
                                {customer.shippingAddress.street && (
                                  <div>{customer.shippingAddress.street}</div>
                                )}
                                <div>
                                  {customer.shippingAddress.city}
                                  {customer.shippingAddress.postalCode && `, ${customer.shippingAddress.postalCode}`}
                                </div>
                                <div>{customer.shippingAddress.country}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags Management */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {customer.tags && customer.tags.length > 0 ? (
                            customer.tags.map((tag, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                <span>{tag}</span>
                                <button
                                  onClick={() => handleRemoveTag(tag)}
                                  disabled={isRemovingTag}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No tags added</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add new tag..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag()
                              }
                            }}
                          />
                          <Button
                            onClick={handleAddTag}
                            disabled={!newTag.trim() || isAddingTag}
                            size="sm"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customer.notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                              {customer.notes}
                            </div>
                          </div>
                        )}

                        {customer.internalNotes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Internal Notes</h4>
                            <div className="p-3 bg-yellow-50 rounded-lg text-sm text-gray-700">
                              {customer.internalNotes}
                            </div>
                          </div>
                        )}
                      </div>

                      {!customer.notes && !customer.internalNotes && (
                        <p className="text-gray-500 text-sm">No notes available</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link to="/{-$locale}/yourobc/quotes/new" search={{ customerId }} className="block w-full">
                            <Button variant="primary" className="w-full">
                              📄 Create Quote
                            </Button>
                          </Link>

                          <Button variant="secondary" className="w-full">
                            📧 Send Email
                          </Button>

                          <Button variant="ghost" className="w-full">
                            📊 View Report
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Service Status */}
                    {customer.serviceSuspended && (
                      <Alert variant="warning">
                        <AlertDescription>
                          <h3 className="font-semibold text-orange-900 mb-3">⚠️ Service Suspended</h3>
                          <div className="space-y-2 text-sm text-orange-800">
                            {customer.serviceSuspendedDate && (
                              <div>
                                <span className="font-medium">Suspended:</span>{' '}
                                {formatDate(customer.serviceSuspendedDate)}
                              </div>
                            )}
                            {customer.serviceSuspendedReason && (
                              <div>
                                <span className="font-medium">Reason:</span>{' '}
                                {customer.serviceSuspendedReason}
                              </div>
                            )}
                            {customer.serviceReactivatedDate && (
                              <div>
                                <span className="font-medium">Reactivated:</span>{' '}
                                {formatDate(customer.serviceReactivatedDate)}
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Customer Insights */}
                    {customerInsights && (
                      <Alert variant="default">
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Customer Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Customer Score: {customerInsights.score}/100</div>
                            <div>Risk Level: {customerInsights.riskLevel}</div>
                            <div>Customer Age: {customerInsights.customerAge} days</div>
                            {customerInsights.daysSinceLastOrder !== null && (
                              <div>Last Order: {customerInsights.daysSinceLastOrder} days ago</div>
                            )}
                            <div>Potential Value: {formatCurrency(customerInsights.potentialValue, customer.defaultCurrency)}</div>

                            {customerInsights.needsAttention && (
                              <div className="text-orange-800 font-medium mt-2">
                                ⚠️ Customer needs attention - no orders for{' '}
                                {customerInsights.daysSinceLastOrder} days
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Recent Activity Summary */}
                    {customer.recentActivity && (
                      <Card className="bg-blue-50">
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quotes:</span>
                              <span className="font-medium">{customer.recentActivity.quotes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipments:</span>
                              <span className="font-medium">{customer.recentActivity.shipments}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Outstanding Invoices:</span>
                              <span className="font-medium">{customer.recentActivity.outstandingInvoices}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span>Outstanding Amount:</span>
                              <span className="font-bold text-red-600">
                                {formatCurrency(customer.recentActivity.outstandingAmount, customer.defaultCurrency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">All Contacts</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Contact */}
                    <Card className="bg-blue-50">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-900">Primary Contact</h4>
                          <Badge variant="primary" size="sm">Primary</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="font-medium">{customer.primaryContact.name}</div>
                          {customer.primaryContact.email && (
                            <div>
                              <a href={`mailto:${customer.primaryContact.email}`} className="text-blue-600 hover:text-blue-800">
                                📧 {customer.primaryContact.email}
                              </a>
                            </div>
                          )}
                          {customer.primaryContact.phone && (
                            <div>
                              <a href={`tel:${customer.primaryContact.phone}`} className="text-blue-600 hover:text-blue-800">
                                📞 {customer.primaryContact.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Additional Contacts */}
                    {customer.additionalContacts && customer.additionalContacts.length > 0 && (
                      customer.additionalContacts.map((contact, index) => (
                        <Card key={index}>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="font-semibold text-gray-900">Additional Contact {index + 1}</h4>
                              <Badge variant="secondary" size="sm">Secondary</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="font-medium">{contact.name}</div>
                              {contact.email && (
                                <div>
                                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                                    📧 {contact.email}
                                  </a>
                                </div>
                              )}
                              {contact.phone && (
                                <div>
                                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                                    📞 {contact.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>

                  {(!customer.additionalContacts || customer.additionalContacts.length === 0) && (
                    <p className="text-gray-500 text-center py-8">
                      No additional contacts on file
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='yourobcQuotes'>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Quotes</h3>
                  <QuoteList
                    filters={{ customerId: [customerId] }}
                    showFilters={false}
                    showCustomer={false}
                    compact={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value='yourobcShipments'>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Shipments</h3>
                  <ShipmentList
                    filters={{ customerId: [customerId] }}
                    showFilters={false}
                    showCustomer={false}
                    compact={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value='yourobcInvoices'>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Invoices</h3>
                  <InvoiceList
                    filters={{ customerId }}
                    showFilters={false}
                    compact={true}
                  />
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
                  {activity?.activities && activity.activities.length > 0 ? (
                    <div className="space-y-4">
                      {activity.activities.map((activityItem, index) => (
                        <Card key={index}>
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {activityItem.type === 'quote' && '📄 Quote'}
                                  {activityItem.type === 'shipment' && '📦 Shipment'}
                                  {activityItem.type === 'invoice' && '💰 Invoice'}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Activity details would go here
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(activityItem.createdAt)}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No activity history available.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
                  <CustomerAnalyticsDashboard customerId={customerId} />
                </div>
              </TabsContent>

              <TabsContent value="contactHistory">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact History</h3>
                  <ContactHistory customerId={customerId} />
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Margins</h3>
                  <MarginCalculator customerId={customerId} />
                </div>
              </TabsContent>

              <TabsContent value="payment">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Management</h3>
                  <DunningConfiguration customerId={customerId} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_customer"
          entityId={customerId}
          title="Customer Notes & Comments"
          showInternalComments={true}
        />

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_customer"
          entityId={customerId}
          title="Customer Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Customer?"
          entityName={customer?.companyName}
          description="This will permanently delete the customer record and all associated data including quotes, shipments, and invoices. This action cannot be undone."
        />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Customers" title="Customer Wiki Helper" />
      </div>
    </div>
  )
}