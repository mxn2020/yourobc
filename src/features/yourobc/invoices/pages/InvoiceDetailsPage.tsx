// src/features/yourobc/invoices/pages/InvoiceDetailsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useInvoice, useInvoices } from '../hooks/useInvoices'
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { DeleteConfirmationModal } from '@/components/ui/Modals'
import { CommentsSection } from '@/features/yourobc/supporting/comments'
import { RemindersSection } from '@/features/yourobc/supporting/followup-reminders'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki'
import { CurrencyDisplay, CurrencyConverter } from '@/features/yourobc/supporting/exchange-rates'
import { 
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  COLLECTION_METHOD_LABELS,
  CURRENCY_SYMBOLS,
} from '../types'
import type { InvoiceId } from '../types'

interface InvoiceDetailsPageProps {
  invoiceId: InvoiceId
}

export const InvoiceDetailsPage: FC<InvoiceDetailsPageProps> = ({ invoiceId }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const { invoice, invoiceInsights, isLoading, error } = useInvoice(invoiceId)
  const { 
    canEditInvoices, 
    canDeleteInvoices, 
    canProcessPayments,
    deleteInvoice, 
    updateInvoiceStatus,
    processPayment,
    isDeleting,
    isProcessingPayment,
  } = useInvoices()

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!invoice) return

    try {
      await deleteInvoice(invoiceId)
      toast.success(`Invoice ${invoice.invoiceNumber} has been deleted successfully`)
      setDeleteModalOpen(false)
      navigate({ to: '/yourobc/invoices' })
    } catch (error: any) {
      console.error('Delete invoice error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleStatusChange = async (status: 'sent' | 'cancelled') => {
    if (!invoice) return

    try {
      await updateInvoiceStatus(invoiceId, status)
      toast.success(`Invoice status updated to ${status}`)
    } catch (error: any) {
      console.error('Status update error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const handleMarkPaid = async () => {
    if (!invoice) return

    try {
      await processPayment(invoiceId, {
        paymentDate: Date.now(),
        paymentMethod: 'bank_transfer',
        paidAmount: invoice.totalAmount,
        paymentReference: 'Manual payment entry',
      })
      toast.success('Invoice marked as paid')
    } catch (error: any) {
      console.error('Payment processing error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'sent': return 'primary'
      case 'paid': return 'success'
      case 'overdue': return 'danger'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'incoming': return 'info'
      case 'outgoing': return 'primary'
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

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">
                {error ? 'Error loading invoice' : 'Invoice not found'}
              </div>
              <p className="text-gray-500 mb-4">
                {error?.message || 'The invoice you are looking for does not exist or has been deleted.'}
              </p>
              <Link to="/{-$locale}/yourobc/invoices" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to Invoices
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
          <Link to="/{-$locale}/yourobc/invoices" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Invoices
          </Link>

          <div className="flex items-center gap-3">
            {invoice.status === 'draft' && canEditInvoices && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange('sent')}
                >
                  📧 Send Invoice
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => navigate({ to: `/yourobc/invoices/${invoiceId}/edit` })}
                >
                  ✏️ Edit
                </Button>
              </>
            )}

            {(invoice.status === 'sent' || invoice.status === 'overdue') && canProcessPayments && (
              <Button
                variant="success"
                onClick={handleMarkPaid}
                disabled={isProcessingPayment}
              >
                💰 Mark Paid
              </Button>
            )}

            {invoice.status !== 'paid' && canEditInvoices && (
              <Button
                variant="warning"
                onClick={() => handleStatusChange('cancelled')}
              >
                ❌ Cancel
              </Button>
            )}

            {canDeleteInvoices && invoice.status === 'draft' && (
              <Button variant="danger" onClick={handleDeleteClick} disabled={isDeleting}>
                🗑️ Delete
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {invoice.invoiceNumber}
                  </h1>

                  <Badge variant={getTypeVariant(invoice.type)}>
                    {INVOICE_TYPE_LABELS[invoice.type]}
                  </Badge>

                  {invoice.externalInvoiceNumber && (
                    <Badge variant="secondary">
                      Ext: {invoice.externalInvoiceNumber}
                    </Badge>
                  )}
                </div>

                <div className="text-gray-600 mb-4">
                  {invoice.description}
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-gray-500">Issue Date:</span>
                    <span className="ml-2 font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>

                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <span className={`ml-2 font-medium ${
                      invoice.overdueStatus?.isOverdue ? 'text-red-600' : 
                      invoice.overdueStatus?.severity === 'warning' ? 'text-orange-600' : 
                      'text-gray-900'
                    }`}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>

                  {invoice.paymentTerms && (
                    <div>
                      <span className="text-gray-500">Payment Terms:</span>
                      <span className="ml-2 font-medium">{invoice.paymentTerms} days</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant={getStatusVariant(invoice.status)} size="lg">
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>

                {invoice.overdueStatus?.isOverdue && (
                  <Badge variant="danger" size="sm">
                    {invoice.overdueStatus.daysOverdue}d overdue
                  </Badge>
                )}

                {invoice.overdueStatus?.severity === 'warning' && !invoice.overdueStatus.isOverdue && (
                  <Badge variant="warning" size="sm">
                    Due Soon
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Amount Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoice.subtotal.amount, invoice.subtotal.currency)}
                </div>
                <div className="text-sm text-gray-600">Subtotal</div>
              </div>

              {invoice.taxAmount && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(invoice.taxAmount.amount, invoice.taxAmount.currency)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}
                  </div>
                </div>
              )}

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-900">
                  {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                </div>
                <div className="text-sm text-blue-700">Total Amount</div>
              </div>
            </div>

            {/* Payment Information */}
            {invoice.status === 'paid' && invoice.paymentDate && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">✅ Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
                  <div>
                    <span className="text-green-600">Payment Date:</span>
                    <div className="font-medium">{formatDate(invoice.paymentDate)}</div>
                  </div>
                  {invoice.paidAmount && (
                    <div>
                      <span className="text-green-600">Paid Amount:</span>
                      <div className="font-medium">
                        {formatCurrency(invoice.paidAmount.amount, invoice.paidAmount.currency)}
                      </div>
                    </div>
                  )}
                  {invoice.paymentMethod && (
                    <div>
                      <span className="text-green-600">Payment Method:</span>
                      <div className="font-medium">
                        {PAYMENT_METHOD_LABELS[invoice.paymentMethod]}
                      </div>
                    </div>
                  )}
                  {invoice.paymentReference && (
                    <div className="md:col-span-3">
                      <span className="text-green-600">Reference:</span>
                      <div className="font-medium">{invoice.paymentReference}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert for overdue or needs attention */}
        {invoiceInsights?.needsAttention && (
          <Alert variant="warning">
            <AlertDescription>
              <div className="flex items-start gap-2">
                <div className="text-orange-600 text-lg">⚠️</div>
                <div>
                  <strong>Attention Required:</strong>
                  {invoice.overdueStatus?.isOverdue ? (
                    <span className="ml-2">
                      This invoice is {invoice.overdueStatus.daysOverdue} days overdue. 
                      Consider following up with the customer or adding a collection attempt.
                    </span>
                  ) : (
                    <span className="ml-2">
                      This invoice is due soon. Consider sending a payment reminder.
                    </span>
                  )}
                  {invoiceInsights.nextAction && (
                    <div className="mt-2 text-sm">
                      <strong>Suggested Action:</strong> {invoiceInsights.nextAction}
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="overview">📋 Overview</TabsTrigger>
              <TabsTrigger value="line-items">📝 Line Items</TabsTrigger>
              <TabsTrigger value="payments">💰 Payments</TabsTrigger>
              <TabsTrigger value="collections">📞 Collections</TabsTrigger>
              <TabsTrigger value="history">📈 History</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Customer/Partner Information */}
                    {(invoice.customer || invoice.partner) && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {invoice.customer ? 'Customer' : 'Partner'} Information
                        </h3>
                        
                        {invoice.customer && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Company:</span>
                              <span className="ml-2 font-medium">{invoice.customer.companyName}</span>
                            </div>
                            {invoice.customer.shortName && (
                              <div>
                                <span className="text-gray-500">Short Name:</span>
                                <span className="ml-2">{invoice.customer.shortName}</span>
                              </div>
                            )}
                            {invoice.customer.primaryContact && (
                              <>
                                <div>
                                  <span className="text-gray-500">Contact:</span>
                                  <span className="ml-2">{invoice.customer.primaryContact.name}</span>
                                </div>
                                {invoice.customer.primaryContact.email && (
                                  <div>
                                    <span className="text-gray-500">Email:</span>
                                    <a 
                                      href={`mailto:${invoice.customer.primaryContact.email}`}
                                      className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                      {invoice.customer.primaryContact.email}
                                    </a>
                                  </div>
                                )}
                                {invoice.customer.primaryContact.phone && (
                                  <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <a 
                                      href={`tel:${invoice.customer.primaryContact.phone}`}
                                      className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                      {invoice.customer.primaryContact.phone}
                                    </a>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {invoice.partner && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Company:</span>
                              <span className="ml-2 font-medium">{invoice.partner.companyName}</span>
                            </div>
                            {invoice.partner.shortName && (
                              <div>
                                <span className="text-gray-500">Short Name:</span>
                                <span className="ml-2">{invoice.partner.shortName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Billing Address */}
                    {invoice.billingAddress && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
                        <div className="text-sm text-gray-700">
                          {invoice.billingAddress.street && (
                            <div>{invoice.billingAddress.street}</div>
                          )}
                          <div>
                            {invoice.billingAddress.city}
                            {invoice.billingAddress.postalCode && `, ${invoice.billingAddress.postalCode}`}
                          </div>
                          <div>{invoice.billingAddress.country}</div>
                        </div>
                      </div>
                    )}

                    {/* Shipment Information */}
                    {invoice.shipment && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Shipment</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Shipment Number:</span>
                            <Link
                              to="/yourobc/shipments/$shipmentId"
                              params={{ shipmentId: invoice.shipment._id }}
                              className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {invoice.shipment.shipmentNumber}
                            </Link>
                          </div>
                          {invoice.shipment.description && (
                            <div>
                              <span className="text-gray-500">Description:</span>
                              <span className="ml-2">{invoice.shipment.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Invoice Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2">{INVOICE_TYPE_LABELS[invoice.type]}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className="ml-2">{INVOICE_STATUS_LABELS[invoice.status]}</span>
                        </div>
                        {invoice.purchaseOrderNumber && (
                          <div>
                            <span className="text-gray-500">PO Number:</span>
                            <span className="ml-2 font-medium">{invoice.purchaseOrderNumber}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Currency:</span>
                          <span className="ml-2">{invoice.totalAmount.currency}</span>
                        </div>
                        {invoice.paymentTerms && (
                          <div>
                            <span className="text-gray-500">Payment Terms:</span>
                            <span className="ml-2">{invoice.paymentTerms} days</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {invoice.notes}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-2">{formatDate(invoice.createdAt)}</span>
                          </div>
                        </div>
                        
                        {invoice.sentAt && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <span className="text-gray-500">Sent:</span>
                              <span className="ml-2">{formatDate(invoice.sentAt)}</span>
                            </div>
                          </div>
                        )}
                        
                        {invoice.paymentDate && (
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <div>
                              <span className="text-gray-500">Paid:</span>
                              <span className="ml-2">{formatDate(invoice.paymentDate)}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div>
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="ml-2">{formatDate(invoice.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="line-items">
                <div className="space-y-6">
                  {/* Currency Converter */}
                  {invoice.totalAmount && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h3>
                      <CurrencyConverter
                        initialAmount={invoice.totalAmount.amount}
                        initialFromCurrency={invoice.totalAmount.currency}
                        initialToCurrency={invoice.totalAmount.currency === 'EUR' ? 'USD' : 'EUR'}
                        showLiveRate={true}
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Line Items</h3>

                    {invoice.lineItems && invoice.lineItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitPrice.amount, item.unitPrice.currency)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.totalPrice.amount, item.totalPrice.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {/* Totals */}
                        <TableRow className="border-t-2">
                          <TableCell colSpan={3} className="text-right font-medium">
                            Subtotal:
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(invoice.subtotal.amount, invoice.subtotal.currency)}
                          </TableCell>
                        </TableRow>
                        
                        {invoice.taxAmount && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right">
                              Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}:
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(invoice.taxAmount.amount, invoice.taxAmount.currency)}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        <TableRow className="border-t-2">
                          <TableCell colSpan={3} className="text-right font-bold text-lg">
                            Total:
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No line items found
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  
                  {invoice.status === 'paid' ? (
                    <Card className="bg-green-50 border-green-200">
                      <div className="p-4">
                        <h4 className="font-semibold text-green-900 mb-3">✅ Payment Received</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-green-600">Payment Date:</span>
                            <div className="font-medium text-green-900">
                              {invoice.paymentDate ? formatDate(invoice.paymentDate) : 'Not specified'}
                            </div>
                          </div>
                          
                          {invoice.paidAmount && (
                            <div>
                              <span className="text-green-600">Amount Paid:</span>
                              <div className="font-medium text-green-900">
                                {formatCurrency(invoice.paidAmount.amount, invoice.paidAmount.currency)}
                              </div>
                            </div>
                          )}
                          
                          {invoice.paymentMethod && (
                            <div>
                              <span className="text-green-600">Payment Method:</span>
                              <div className="font-medium text-green-900">
                                {PAYMENT_METHOD_LABELS[invoice.paymentMethod]}
                              </div>
                            </div>
                          )}
                          
                          {invoice.paymentReference && (
                            <div>
                              <span className="text-green-600">Reference:</span>
                              <div className="font-medium text-green-900">
                                {invoice.paymentReference}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        {invoice.status === 'draft' ? 'Invoice not yet sent' : 'Payment pending'}
                      </div>
                      
                      {canProcessPayments && (invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button
                          variant="success"
                          onClick={handleMarkPaid}
                          disabled={isProcessingPayment}
                        >
                          💰 Record Payment
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="collections">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Attempts</h3>
                  
                  {invoice.collectionAttemptsWithUsers && invoice.collectionAttemptsWithUsers.length > 0 ? (
                    <div className="space-y-4">
                      {invoice.collectionAttemptsWithUsers.map((attempt, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="secondary" size="sm">
                                {COLLECTION_METHOD_LABELS[attempt.method]}
                              </Badge>
                              <span className="ml-2 text-sm text-gray-600">
                                {formatDate(attempt.date)}
                              </span>
                            </div>
                            {attempt.createdByUser && (
                              <div className="text-sm text-gray-500">
                                by {attempt.createdByUser.name}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-700">
                            <strong>Result:</strong> {attempt.result}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">No collection attempts recorded</div>
                      
                      {invoice.overdueStatus?.isOverdue && (
                        <div className="text-sm text-orange-600">
                          This invoice is overdue. Consider adding a collection attempt.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {invoiceInsights?.nextAction && invoice.status !== 'paid' && (
                    <Alert variant="default" className="mt-4">
                      <AlertDescription>
                        <strong>Suggested next action:</strong> {invoiceInsights.nextAction}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice History & Audit Trail</h3>

                  {/* Timeline of events */}
                  <div className="space-y-4">
                    {/* Invoice Created */}
                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full -ml-[1.6rem]"></div>
                        <h4 className="font-semibold text-gray-900">Invoice Created</h4>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(invoice.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Type: {INVOICE_TYPE_LABELS[invoice.type]} •
                        Initial status: {INVOICE_STATUS_LABELS['draft']}
                      </div>
                    </div>

                    {/* Invoice Sent */}
                    {invoice.sentAt && (
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Invoice Sent</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(invoice.sentAt)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Status changed to: {INVOICE_STATUS_LABELS['sent']}
                        </div>
                      </div>
                    )}

                    {/* Collection Attempts */}
                    {invoice.collectionAttemptsWithUsers && invoice.collectionAttemptsWithUsers.length > 0 && (
                      <>
                        {invoice.collectionAttemptsWithUsers.map((attempt, index) => (
                          <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-orange-500 rounded-full -ml-[1.6rem]"></div>
                              <h4 className="font-semibold text-gray-900">Collection Attempt</h4>
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(attempt.date)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Method: {COLLECTION_METHOD_LABELS[attempt.method]} •
                              Result: {attempt.result}
                              {attempt.createdByUser && (
                                <> • By {attempt.createdByUser.name}</>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Payment Received */}
                    {invoice.status === 'paid' && invoice.paymentDate && (
                      <div className="border-l-4 border-green-600 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-green-600 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">💰 Payment Received</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(invoice.paymentDate)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Amount: {invoice.paidAmount && formatCurrency(invoice.paidAmount.amount, invoice.paidAmount.currency)} •
                          Method: {invoice.paymentMethod && PAYMENT_METHOD_LABELS[invoice.paymentMethod]}
                          {invoice.paymentReference && (
                            <div className="mt-1">Reference: {invoice.paymentReference}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Invoice Cancelled */}
                    {invoice.status === 'cancelled' && (
                      <div className="border-l-4 border-gray-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 bg-gray-500 rounded-full -ml-[1.6rem]"></div>
                          <h4 className="font-semibold text-gray-900">Invoice Cancelled</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          Status changed to: {INVOICE_STATUS_LABELS['cancelled']}
                        </div>
                      </div>
                    )}

                    {/* Current Status */}
                    <div className={`border-l-4 ${
                      invoice.status === 'paid' ? 'border-green-600' :
                      invoice.status === 'overdue' ? 'border-red-600' :
                      invoice.status === 'sent' ? 'border-blue-600' :
                      'border-gray-400'
                    } pl-4 py-2`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full -ml-[1.6rem] ${
                          invoice.status === 'paid' ? 'bg-green-600' :
                          invoice.status === 'overdue' ? 'bg-red-600' :
                          invoice.status === 'sent' ? 'bg-blue-600' :
                          'bg-gray-400'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900">Current Status</h4>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Badge variant={getStatusVariant(invoice.status)} size="sm">
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </Badge>
                        {invoice.overdueStatus?.isOverdue && (
                          <Badge variant="danger" size="sm" className="ml-2">
                            {invoice.overdueStatus.daysOverdue} days overdue
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Last updated: {formatDate(invoice.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <Card className="bg-gray-50 mt-6">
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">📊 Invoice Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Days Since Creation</div>
                          <div className="font-semibold">
                            {Math.floor((Date.now() - invoice.createdAt) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>

                        {invoice.sentAt && (
                          <div>
                            <div className="text-gray-500">Days Since Sent</div>
                            <div className="font-semibold">
                              {Math.floor((Date.now() - invoice.sentAt) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        )}

                        {invoice.status === 'paid' && invoice.paymentDate && invoice.sentAt && (
                          <div>
                            <div className="text-gray-500">Days to Payment</div>
                            <div className="font-semibold">
                              {Math.floor((invoice.paymentDate - invoice.sentAt) / (1000 * 60 * 60 * 24))} days
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-gray-500">Collection Attempts</div>
                          <div className="font-semibold">
                            {invoice.collectionAttemptsWithUsers?.length || 0}
                          </div>
                        </div>

                        {invoice.paymentTerms && (
                          <div>
                            <div className="text-gray-500">Payment Terms</div>
                            <div className="font-semibold">{invoice.paymentTerms} days</div>
                          </div>
                        )}

                        {invoice.overdueStatus?.isOverdue && (
                          <div>
                            <div className="text-gray-500">Days Overdue</div>
                            <div className="font-semibold text-red-600">
                              {invoice.overdueStatus.daysOverdue}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Related Information */}
                  <Card className="bg-blue-50 border-blue-200 mt-6">
                    <div className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">🔗 Related Information</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>
                          For payment details, see the <strong>Payments</strong> tab.
                        </div>
                        <div>
                          For collection attempts, see the <strong>Collections</strong> tab.
                        </div>
                        <div>
                          For line items breakdown, see the <strong>Line Items</strong> tab.
                        </div>
                        {invoice.shipment && (
                          <div className="mt-2">
                            Related to{' '}
                            <Link
                              to="/yourobc/shipments/$shipmentId"
                              params={{ shipmentId: invoice.shipment._id }}
                              className="text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                              Shipment {invoice.shipment.shipmentNumber}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Insights */}
                  {invoiceInsights && (
                    <Alert variant={invoiceInsights.needsAttention ? 'warning' : 'default'}>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-semibold">
                            {invoiceInsights.needsAttention ? '⚠️ Action Required' : 'ℹ️ Insights'}
                          </div>
                          {invoiceInsights.nextAction && (
                            <div className="text-sm">
                              <strong>Suggested next action:</strong> {invoiceInsights.nextAction}
                            </div>
                          )}
                          {invoice.overdueStatus?.isOverdue && (
                            <div className="text-sm text-red-600">
                              This invoice is significantly overdue. Consider escalating collection efforts.
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

        {/* Comments Section */}
        <CommentsSection
          entityType="yourobc_invoice"
          entityId={invoiceId}
          title="Invoice Notes & Comments"
          showInternalComments={true}
        />
        </Card>

        {/* Reminders Section */}
        <RemindersSection
          entityType="yourobc_invoice"
          entityId={invoiceId}
          title="Invoice Reminders"
          status="pending"
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          title="Delete Invoice?"
          entityName={invoice?.invoiceNumber}
          description="This will permanently delete the invoice and all associated data. This action cannot be undone."
        />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Invoices" title="Invoice Wiki Helper" />
      </div>
    </div>
  )
}