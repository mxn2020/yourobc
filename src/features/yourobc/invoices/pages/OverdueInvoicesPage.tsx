// src/features/yourobc/invoices/pages/OverdueInvoicesPage.tsx

import { FC, useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { useOverdueInvoices, useInvoices } from '../hooks/useInvoices'
import { InvoiceCard } from '../components/InvoiceCard'
import {
  Card,
  Button,
  Badge,
  Loading,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { CURRENCY_SYMBOLS } from '../types'
import type { InvoiceListItem } from '../types'

export const OverdueInvoicesPage: FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { auth } = useAuth()

  const [activeTab, setActiveTab] = useState<'all' | 'warning' | 'critical' | 'severe'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'daysOverdue' | 'amount' | 'dueDate'>('daysOverdue')

  const severityFilter = activeTab === 'all' ? undefined : activeTab

  const {
    invoices: overdueInvoices,
    total,
    isLoading,
    error,
    refetch,
  } = useOverdueInvoices(100, severityFilter as any)

  const { processPayment, isProcessingPayment } = useInvoices()

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let filtered = overdueInvoices

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((invoice) => {
        return (
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.description.toLowerCase().includes(searchLower) ||
          invoice.customer?.companyName?.toLowerCase().includes(searchLower) ||
          invoice.partner?.companyName?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Sort invoices
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'daysOverdue':
          return (b.overdueStatus?.daysOverdue || 0) - (a.overdueStatus?.daysOverdue || 0)
        case 'amount':
          return b.totalAmount.amount - a.totalAmount.amount
        case 'dueDate':
          return a.dueDate - b.dueDate
        default:
          return 0
      }
    })

    return filtered
  }, [overdueInvoices, searchTerm, sortBy])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const invoices = filteredInvoices

    return {
      total: invoices.length,
      totalAmount: invoices.reduce((sum, invoice) => sum + invoice.totalAmount.amount, 0),
      warningCount: invoices.filter((i) => i.overdueStatus?.severity === 'warning').length,
      criticalCount: invoices.filter((i) => i.overdueStatus?.severity === 'critical').length,
      severeCount: invoices.filter((i) => i.overdueStatus?.severity === 'severe').length,
      avgDaysOverdue: invoices.length > 0
        ? Math.round(invoices.reduce((sum, i) => sum + (i.overdueStatus?.daysOverdue || 0), 0) / invoices.length)
        : 0,
    }
  }, [filteredInvoices])

  const handleInvoiceClick = (invoice: InvoiceListItem) => {
    navigate({
      to: '/yourobc/invoices/$invoiceId',
      params: { invoiceId: invoice._id },
    })
  }

  const handleMarkPaid = async (invoice: InvoiceListItem) => {
    try {
      await processPayment(invoice._id, {
        paymentDate: Date.now(),
        paymentMethod: 'bank_transfer',
        paidAmount: invoice.totalAmount,
        paymentReference: 'Manual payment entry',
      })
      toast.success(`Invoice ${invoice.invoiceNumber} marked as paid`)
      refetch()
    } catch (error: any) {
      console.error('Payment processing error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
    }
  }

  const formatCurrency = (amount: number, currency = 'EUR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'warning': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      case 'severe': return 'text-red-800'
      default: return 'text-gray-600'
    }
  }

  if (isLoading && overdueInvoices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Error loading overdue invoices</div>
              <p className="text-gray-500 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} variant="primary" size="sm">
                Try again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overdue Invoices</h1>
            <p className="text-gray-600 mt-2">Manage and track overdue payments</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/{-$locale}/yourobc/invoices">
              <Button variant="secondary">📄 All Invoices</Button>
            </Link>
            <Button variant="primary" onClick={() => refetch()}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Overdue</div>
                <div className="text-2xl">⚠️</div>
              </div>
              <div className="text-2xl font-bold text-red-600">{summaryStats.total}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formatCurrency(summaryStats.totalAmount)} total
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Critical</div>
                <div className="text-2xl">🔴</div>
              </div>
              <div className="text-2xl font-bold text-red-600">{summaryStats.criticalCount}</div>
              <div className="text-sm text-gray-500 mt-1">0-30 days overdue</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Severe</div>
                <div className="text-2xl">🚨</div>
              </div>
              <div className="text-2xl font-bold text-red-800">{summaryStats.severeCount}</div>
              <div className="text-sm text-gray-500 mt-1">30+ days overdue</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Avg Days</div>
                <div className="text-2xl">📅</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.avgDaysOverdue}</div>
              <div className="text-sm text-gray-500 mt-1">days overdue</div>
            </div>
          </Card>
        </div>

        {/* Quick Action Alert */}
        {summaryStats.severeCount > 0 && (
          <Alert variant="warning">
            <AlertDescription>
              <div className="flex items-start gap-2">
                <div className="text-red-600 text-lg">🚨</div>
                <div>
                  <strong>Urgent Action Required:</strong>
                  <span className="ml-2">
                    You have {summaryStats.severeCount} severely overdue invoice{summaryStats.severeCount !== 1 ? 's' : ''} 
                    (30+ days). Consider immediate collection action or debt collection referral.
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="all">
                All ({summaryStats.total})
              </TabsTrigger>
              <TabsTrigger value="warning">
                Warning ({summaryStats.warningCount})
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critical ({summaryStats.criticalCount})
              </TabsTrigger>
              <TabsTrigger value="severe">
                Severe ({summaryStats.severeCount})
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search overdue invoices..."
                />

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daysOverdue">Days Overdue</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-end">
                  <span className="text-sm text-gray-600">
                    {filteredInvoices.length} of {total} invoices
                  </span>
                </div>
              </div>
            </div>
          </Tabs>
        </Card>

        {/* Invoices Display */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm 
                  ? 'No overdue invoices found matching your search'
                  : activeTab === 'all'
                  ? 'No overdue invoices! 🎉'
                  : `No ${activeTab} overdue invoices`}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : activeTab === 'all'
                  ? 'All invoices are current or paid.'
                  : 'All invoices in this category have been resolved.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="primary" size="sm">
                  Clear search
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredInvoices.map((invoice) => (
              <Card 
                key={invoice._id} 
                className={`relative ${
                  invoice.overdueStatus?.severity === 'severe' ? 'border-red-300 bg-red-50' :
                  invoice.overdueStatus?.severity === 'critical' ? 'border-orange-300 bg-orange-50' :
                  'border-yellow-300 bg-yellow-50'
                }`}
              >
                {/* Severity indicator */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                  invoice.overdueStatus?.severity === 'severe' ? 'bg-red-600' :
                  invoice.overdueStatus?.severity === 'critical' ? 'bg-orange-600' :
                  'bg-yellow-600'
                }`}></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge variant="danger" size="sm">
                          {invoice.overdueStatus?.daysOverdue}d overdue
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2 truncate">
                        {invoice.description}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {invoice.customer?.companyName || invoice.partner?.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleMarkPaid(invoice)}
                      disabled={isProcessingPayment}
                      className="flex-1"
                    >
                      💰 Mark Paid
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleInvoiceClick(invoice)}
                      className="flex-1"
                    >
                      📞 Collections
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="bg-red-50 border-red-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">
              🚨 Collection Action Guidelines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-red-800">
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Warning (Due Soon):</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Send friendly payment reminder</li>
                  <li>• Verify invoice was received</li>
                  <li>• Confirm payment method</li>
                  <li>• Offer payment assistance if needed</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-2">Critical (0-30 days):</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Phone call to discuss payment</li>
                  <li>• Email formal payment demand</li>
                  <li>• Negotiate payment plan if needed</li>
                  <li>• Document all communication</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-900 mb-2">Severe (30+ days):</h4>
                <ul className="space-y-1 text-red-700">
                  <li>• Send formal demand letter</li>
                  <li>• Consider legal notice</li>
                  <li>• Escalate to debt collection</li>
                  <li>• Review credit terms for future</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}