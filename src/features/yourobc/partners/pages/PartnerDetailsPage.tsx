// src/features/yourobc/partners/pages/PartnerDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { usePartner, usePartners, usePartnerQuotes } from '../hooks/usePartners'
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
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS } from '../types'
import type { PartnerId } from '../types'

interface PartnerDetailsPageProps {
  partnerId: PartnerId
}

export const PartnerDetailsPage: FC<PartnerDetailsPageProps> = ({ partnerId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const { partner, partnerMetrics, partnerInsights, isLoading, error } = usePartner(partnerId)
  const { canEditPartners, canDeletePartners, deletePartner, togglePartnerStatus, isDeleting, isTogglingStatus } = usePartners()
  const {
    quotes,
    summary: quotesSummary,
    isLoading: isQuotesLoading,
  } = usePartnerQuotes(partnerId)

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!partner) return

    try {
      await deletePartner(partnerId)
      toast.success(`${partner.companyName} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/partners' })
    } catch (error: any) {
      console.error('Delete partner error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleToggleStatus = async () => {
    if (!partner) return

    try {
      await togglePartnerStatus(partnerId)
      const newStatus = partner.status === 'active' ? 'inactive' : 'active'
      toast.success(`${partner.companyName} has been marked as ${newStatus}`)
    } catch (error: any) {
      console.error('Toggle status error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      default: return 'secondary'
    }
  }

  const getServiceTypeColor = (serviceType: string) => {
    return SERVICE_TYPE_COLORS[serviceType as keyof typeof SERVICE_TYPE_COLORS] || '#6b7280'
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

  if (error || !partner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading partner' : 'Partner not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The partner you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/yourobc/partners" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Partners
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
          <Link to="/yourobc/partners" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Partners
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/yourobc/quotes/new" search={{ partnerId }}>
              <Button variant="primary">💼 Request Quote</Button>
            </Link>

            <Button
              variant={partner.status === 'active' ? 'warning' : 'success'}
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
            >
              {partner.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
            </Button>

            {canEditPartners && (
              <Button
                variant="secondary"
                onClick={() => navigate({ to: `/yourobc/partners/${partnerId}/edit` })}
              >
                ✏️ Edit
              </Button>
            )}

            {canDeletePartners && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Partner Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {partner.companyName}
                  </h1>

                  {partnerInsights?.isTopPerformer && (
                    <Badge variant="primary">🏆 Top Performer</Badge>
                  )}

                  {partnerInsights?.isNewPartner && (
                    <Badge variant="success">✨ New Partner</Badge>
                  )}
                </div>

                {partner.shortName && (
                  <div className="text-lg text-gray-600 mb-2">
                    {partner.shortName}
                  </div>
                )}

                <div className="text-gray-600 mb-4">
                  {partner.partnerCode ? `Partner Code: ${partner.partnerCode}` : 'No partner code'}
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium">
                      {partner.address.city}, {partner.address.country}
                    </span>
                  </div>

                  {partner.primaryContact.email && (
                    <a href={`mailto:${partner.primaryContact.email}`} className="text-blue-600 hover:text-blue-800">
                      📧 {partner.primaryContact.email}
                    </a>
                  )}

                  {partner.primaryContact.phone && (
                    <a href={`tel:${partner.primaryContact.phone}`} className="text-blue-600 hover:text-blue-800">
                      📞 {partner.primaryContact.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusVariant(partner.status)}>
                  {partner.status.toUpperCase()}
                </Badge>

                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: getServiceTypeColor(partner.serviceType),
                    color: 'white'
                  }}
                >
                  {SERVICE_TYPE_LABELS[partner.serviceType]}
                </Badge>

                {partnerInsights?.needsAttention && (
                  <Badge variant="warning">⚠️ Needs Attention</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Key Metrics */}
            {partnerMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {partnerMetrics.totalQuotes}
                  </div>
                  <div className="text-sm text-gray-600">Total Quotes</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {partnerMetrics.selectionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Selection Rate</div>
                  <div className="text-xs text-green-600 mt-1">
                    {partnerMetrics.selectedQuotes} selected
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {partnerMetrics.avgResponseTime}h
                  </div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(partnerMetrics.totalRevenue)}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
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
              <TabsTrigger value="coverage">🌍 Coverage</TabsTrigger>
              <TabsTrigger value='yourobcQuotes'>💼 Quotes</TabsTrigger>
              <TabsTrigger value="performance">📈 Performance</TabsTrigger>
              <TabsTrigger value="contact">📞 Contact</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Partner Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Company Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Company Name:</span>{' '}
                              {partner.companyName}
                            </div>
                            {partner.shortName && (
                              <div>
                                <span className="text-gray-500">Short Name:</span> {partner.shortName}
                              </div>
                            )}
                            {partner.partnerCode && (
                              <div>
                                <span className="text-gray-500">Partner Code:</span> {partner.partnerCode}
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Service Type:</span>{' '}
                              {SERVICE_TYPE_LABELS[partner.serviceType]}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Business Terms</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Payment Terms:</span>{' '}
                              {partner.paymentTerms === 0 ? 'Immediate' : `${partner.paymentTerms} days`}
                            </div>
                            <div>
                              <span className="text-gray-500">Preferred Currency:</span>{' '}
                              {partner.preferredCurrency}
                            </div>
                            {partner.quotingEmail && (
                              <div>
                                <span className="text-gray-500">Quoting Email:</span>{' '}
                                <a href={`mailto:${partner.quotingEmail}`} className="text-blue-600">
                                  {partner.quotingEmail}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                      <div className="text-sm text-gray-700">
                        {partner.address.street && (
                          <div>{partner.address.street}</div>
                        )}
                        <div>
                          {partner.address.city}
                          {partner.address.postalCode && `, ${partner.address.postalCode}`}
                        </div>
                        <div>{partner.address.country}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {partner.notes && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {partner.notes}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-50">
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                          <Link to="/yourobc/quotes/new" search={{ partnerId }} className="block w-full">
                            <Button variant="primary" className="w-full">
                              💼 Request Quote
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

                    {/* Performance Insights */}
                    {partnerInsights && (
                      <Alert variant="default">
                        <AlertDescription>
                          <h3 className="font-semibold text-blue-900 mb-3">Performance Insights</h3>
                          <div className="space-y-2 text-sm text-blue-800">
                            <div>Performance Score: {partnerInsights.performanceScore}/100</div>
                            <div>Responsiveness: {partnerInsights.responsiveness}</div>
                            {partnerInsights.daysSinceLastQuote !== null && (
                              <div>
                                Last Quote: {partnerInsights.daysSinceLastQuote} days ago
                              </div>
                            )}

                            {partnerInsights.needsAttention && (
                              <div className="text-orange-800 font-medium mt-2">
                                ⚠️ Partner needs attention - no recent activity
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="coverage">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Service Coverage</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Countries ({partner.serviceCoverage.countries.length})</h4>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                        {partner.serviceCoverage.countries.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {partner.serviceCoverage.countries.map((country) => (
                              <Badge key={country} variant="secondary" size="sm">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Global coverage</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Cities ({partner.serviceCoverage.cities.length})</h4>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                        {partner.serviceCoverage.cities.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {partner.serviceCoverage.cities.map((city) => (
                              <Badge key={city} variant="secondary" size="sm">
                                {city}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No specific cities</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Airports ({partner.serviceCoverage.airports.length})</h4>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-3">
                        {partner.serviceCoverage.airports.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {partner.serviceCoverage.airports.map((airport) => (
                              <Badge key={airport} variant="secondary" size="sm">
                                {airport}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No specific airports</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='yourobcQuotes'>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Quote History</h3>
                    <Button variant="primary" size="sm">
                      💼 Request New Quote
                    </Button>
                  </div>

                  {/* Quote Summary */}
                  {quotesSummary && (
                    <div className="grid grid-cols-4 gap-4">
                      <Card className="bg-gray-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {quotesSummary.totalQuotes}
                          </div>
                          <div className="text-sm text-gray-600">Total Quotes</div>
                        </div>
                      </Card>

                      <Card className="bg-green-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {quotesSummary.selectedQuotes}
                          </div>
                          <div className="text-sm text-gray-600">Selected</div>
                        </div>
                      </Card>

                      <Card className="bg-blue-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {((quotesSummary.selectedQuotes / quotesSummary.totalQuotes) * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Selection Rate</div>
                        </div>
                      </Card>

                      <Card className="bg-purple-50">
                        <div className="p-4">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(quotesSummary.avgQuoteValue || 0)}
                          </div>
                          <div className="text-sm text-gray-600">Avg Quote Value</div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Quote List */}
                  <div>
                    {isQuotesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loading size="md" />
                      </div>
                    ) : quotes.length > 0 ? (
                      <div className="space-y-3">
                        {quotes.filter((quote): quote is NonNullable<typeof quote> => quote !== null).map((quote) => {
                          const quotedPrice = quote.partnerQuote?.quotedPrice
                          const amount = quotedPrice?.amount ?? 0
                          const currency = quotedPrice?.currency ?? 'EUR'

                          return (
                            <Card key={quote.quoteId} className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    Quote #{quote.quoteNumber}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(quote.createdAt)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-600">
                                    {formatCurrency(amount, currency)}
                                  </div>
                                  <Badge
                                    variant={quote.status === 'accepted' ? 'success' :
                                            quote.status === 'rejected' ? 'danger' : 'secondary'}
                                    size="sm"
                                  >
                                    {quote.status}
                                  </Badge>
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No quotes yet</div>
                        <p className="text-gray-400 text-sm">Quote history will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>

                  {partnerMetrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Quote Performance</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Quotes:</span>
                              <span className="font-medium">{partnerMetrics.totalQuotes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Selected Quotes:</span>
                              <span className="font-medium">{partnerMetrics.selectedQuotes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Selection Rate:</span>
                              <span className="font-medium">{partnerMetrics.selectionRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Response Time:</span>
                              <span className="font-medium">{partnerMetrics.avgResponseTime}h</span>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card>
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Financial Performance</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Revenue:</span>
                              <span className="font-medium">{formatCurrency(partnerMetrics.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quote Accuracy:</span>
                              <span className="font-medium">{partnerMetrics.avgQuoteAccuracy.toFixed(1)}%</span>
                            </div>
                            {partnerMetrics.lastQuoteDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Quote:</span>
                                <span className="font-medium">{formatDate(partnerMetrics.lastQuoteDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">No performance data yet</div>
                      <p className="text-gray-400 text-sm">Performance metrics will appear after quotes are submitted</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Primary Contact</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-600 text-sm">Name:</span>
                            <div className="font-medium">{partner.primaryContact.name}</div>
                          </div>
                          
                          {partner.primaryContact.email && (
                            <div>
                              <span className="text-gray-600 text-sm">Email:</span>
                              <div>
                                <a 
                                  href={`mailto:${partner.primaryContact.email}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {partner.primaryContact.email}
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {partner.primaryContact.phone && (
                            <div>
                              <span className="text-gray-600 text-sm">Phone:</span>
                              <div>
                                <a 
                                  href={`tel:${partner.primaryContact.phone}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {partner.primaryContact.phone}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Additional Contacts</h4>
                        
                        {partner.quotingEmail && (
                          <div className="mb-4">
                            <span className="text-gray-600 text-sm">Quoting Email:</span>
                            <div>
                              <a 
                                href={`mailto:${partner.quotingEmail}`}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                {partner.quotingEmail}
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Additional contacts can be added by editing the partner
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Communication History */}
                  <Card>
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Recent Communication</h4>
                      <div className="text-center py-8 text-gray-500">
                        No communication history yet
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_partner"
          entityId={partnerId}
          title="Partner Notes & Comments"
          showInternalComments={true}
        />
        </Card>

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_partner"
          entityId={partnerId}
          title="Partner Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Partner?"
          entityName={partner?.companyName}
          description="This will permanently delete the partner record and all associated data including quotes and communication history. This action cannot be undone."
        />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Partners" title="Partner Wiki Helper" />
      </div>
    </div>
  )
}