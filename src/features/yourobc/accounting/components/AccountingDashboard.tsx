// src/components/Dashboard/AccountingDashboard.tsx

import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import { Card, Button } from '@/components/ui'
import { ArrowUpRight, ArrowDownRight, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export function AccountingDashboard() {
  // Get dashboard metrics
  const dashboardMetrics = useQuery(api.lib.yourobc.accounting.dashboard.index.getDashboardMetrics, { authUserId: 'user' })
  const receivablesOverview = useQuery(api.lib.yourobc.accounting.dashboard.index.getReceivablesOverview, { authUserId: 'user' })
  const payablesOverview = useQuery(api.lib.yourobc.accounting.dashboard.index.getPayablesOverview, { authUserId: 'user' })
  const cashFlowForecast = useQuery(api.lib.yourobc.accounting.dashboard.index.getCashFlowForecast, { authUserId: 'user', days: 90 })
  const dunningStatus = useQuery(api.lib.yourobc.accounting.dashboard.index.getDunningStatusOverview, { authUserId: 'user' })
  const expectedPayments = useQuery(api.lib.yourobc.accounting.dashboard.index.getExpectedPaymentsTimeline, { authUserId: 'user', days: 30 })
  const incomingAlerts = useQuery(api.lib.yourobc.accounting.dashboard.index.getIncomingInvoiceAlerts, { authUserId: 'user' })

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of receivables, payables, and cash flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Refresh Data</Button>
        </div>
      </div>

      {/* Alerts Section */}
      {incomingAlerts && (
        <div className="grid gap-4 md:grid-cols-3">
          {incomingAlerts.missing.count > 0 && (
            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">Missing Invoices</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    {incomingAlerts.missing.count} invoices expected but not received
                  </p>
                </div>
              </div>
            </Card>
          )}

          {incomingAlerts.pendingApproval.count > 0 && (
            <Card className="p-4 border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Pending Approval</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {incomingAlerts.pendingApproval.count} invoices waiting for approval
                  </p>
                </div>
              </div>
            </Card>
          )}

          {incomingAlerts.disputed.count > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Disputed Invoices</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {incomingAlerts.disputed.count} invoices in dispute
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Receivables */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Receivables</p>
              <h2 className="text-3xl font-bold mt-2">
                {receivablesOverview ? formatCurrency(receivablesOverview.totalReceivables) : '...'}
              </h2>
              {receivablesOverview && receivablesOverview.overdue > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {formatCurrency(receivablesOverview.overdue)} overdue
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Payables */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payables</p>
              <h2 className="text-3xl font-bold mt-2">
                {payablesOverview ? formatCurrency(payablesOverview.totalPayables) : '...'}
              </h2>
              {payablesOverview && payablesOverview.overdue > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {formatCurrency(payablesOverview.overdue)} overdue
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Net Cash Flow */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Cash Flow (90d)</p>
              <h2 className="text-3xl font-bold mt-2">
                {cashFlowForecast ? formatCurrency(cashFlowForecast.summary.netCashFlow) : '...'}
              </h2>
              {cashFlowForecast && (
                <p className="text-sm text-muted-foreground mt-1">
                  {cashFlowForecast.summary.netCashFlow > 0 ? 'Positive' : 'Negative'} forecast
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              cashFlowForecast && cashFlowForecast.summary.netCashFlow > 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {cashFlowForecast && cashFlowForecast.summary.netCashFlow > 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </Card>

        {/* Dunning Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Collection</p>
              <h2 className="text-3xl font-bold mt-2">
                {dunningStatus ? dunningStatus.activelyDunned : '...'}
              </h2>
              {dunningStatus && (
                <p className="text-sm text-orange-600 mt-1">
                  {formatCurrency(dunningStatus.totalOutstanding)} outstanding
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Receivables Age Analysis */}
      {receivablesOverview && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receivables Age Analysis</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Current (0-30 days)</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(receivablesOverview.ageAnalysis.current)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">30-60 days</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">
                {formatCurrency(receivablesOverview.ageAnalysis.days30to60)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">60-90 days</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">
                {formatCurrency(receivablesOverview.ageAnalysis.days60to90)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">90+ days</p>
              <p className="text-2xl font-bold mt-2 text-red-600">
                {formatCurrency(receivablesOverview.ageAnalysis.over90days)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Expected Payments Timeline */}
      {expectedPayments && expectedPayments.timeline.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Expected Payments (Next 30 Days)</h3>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(expectedPayments.totalExpected)}
            </p>
          </div>
          <div className="space-y-3">
            {expectedPayments.timeline.slice(0, 5).map((payment: any) => (
              <div
                key={payment._id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{payment.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Invoice {payment.invoiceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(
                      payment.totalAmount.amount,
                      payment.totalAmount.currency
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDate(payment.dueDate)} ({payment.daysUntilDue}d)
                  </p>
                </div>
              </div>
            ))}
          </div>
          {expectedPayments.timeline.length > 5 && (
            <Button variant="outline" className="w-full mt-4">
              View All {expectedPayments.timeline.length} Expected Payments
            </Button>
          )}
        </Card>
      )}

      {/* Cash Flow Forecast Chart */}
      {cashFlowForecast && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">90-Day Cash Flow Forecast</h3>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Expected Inflow</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(cashFlowForecast.summary.totalInflow)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <p className="text-sm text-muted-foreground">Expected Outflow</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(cashFlowForecast.summary.totalOutflow)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">Net Position</p>
              </div>
              <p className={`text-2xl font-bold ${
                cashFlowForecast.summary.netCashFlow > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(cashFlowForecast.summary.netCashFlow)}
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Forecast based on {cashFlowForecast.forecast.length} expected transactions
          </div>
        </Card>
      )}

      {/* Dunning Overview */}
      {dunningStatus && dunningStatus.activelyDunned > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Dunning Cases</h3>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Stage 1 (First Reminder)</p>
              <p className="text-2xl font-bold mt-2">{dunningStatus.byStage.stage1}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Stage 2 (Second Reminder)</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">
                {dunningStatus.byStage.stage2}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Stage 3+ (Final Notice)</p>
              <p className="text-2xl font-bold mt-2 text-red-600">
                {dunningStatus.byStage.stage3}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {dunningStatus.detailedList.slice(0, 3).map((invoice: any) => (
              <div
                key={invoice._id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{invoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Invoice {invoice.invoiceNumber} · {invoice.collectionAttempts} attempts
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {formatCurrency(
                      invoice.totalAmount.amount,
                      invoice.totalAmount.currency
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {dunningStatus.detailedList.length > 3 && (
            <Button variant="outline" className="w-full mt-4">
              View All {dunningStatus.detailedList.length} Dunning Cases
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
