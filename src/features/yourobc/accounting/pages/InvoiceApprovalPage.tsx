// src/features/yourobc/accounting/pages/InvoiceApprovalPage.tsx

import { FC, useState } from 'react'
import { useIncomingInvoices, useAccounting } from '../hooks/useAccounting'
import { InvoiceApprovalQueue } from '../components/InvoiceApprovalQueue'
import { Loading, Badge, Card } from '@/components/ui'
import type { IncomingInvoiceTrackingId } from '../types'

export const InvoiceApprovalPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')

  const { pendingApprovals, approvedInvoices, isLoading } = useIncomingInvoices()

  const {
    approveInvoice,
    rejectInvoice,
    markInvoicePaid,
    isApprovingInvoice,
    isRejectingInvoice,
    isMarkingPaid,
  } = useAccounting()

  const handleApprove = async (trackingId: IncomingInvoiceTrackingId, notes?: string) => {
    await approveInvoice(trackingId, notes)
  }

  const handleReject = async (trackingId: IncomingInvoiceTrackingId, reason: string) => {
    await rejectInvoice(trackingId, reason)
  }

  const handleMarkPaid = async (trackingId: IncomingInvoiceTrackingId, paymentRef?: string) => {
    await markInvoicePaid(trackingId, undefined, paymentRef)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Approval</h1>
            <p className="text-gray-600 mt-2">
              Review and approve incoming invoices from partners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">
              {pendingApprovals?.length || 0} pending
            </Badge>
            <Badge variant="success" size="sm">
              {approvedInvoices?.length || 0} approved
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <div className="border-b">
            <div className="flex w-full justify-start p-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              >
                Pending Approval ({pendingApprovals?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              >
                Approved ({approvedInvoices?.length || 0})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <InvoiceApprovalQueue
                invoices={pendingApprovals as any}
                view="pending"
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
              />
            )}

            {activeTab === 'approved' && (
              <InvoiceApprovalQueue
                invoices={approvedInvoices as any}
                view="approved"
                onMarkPaid={handleMarkPaid}
                showActions={true}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
