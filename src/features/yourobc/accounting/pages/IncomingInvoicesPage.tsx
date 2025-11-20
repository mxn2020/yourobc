// src/features/yourobc/accounting/pages/IncomingInvoicesPage.tsx

import { FC, useState } from 'react'
import { useIncomingInvoices, useAccounting } from '../hooks/useAccounting'
import { ExpectedInvoicesList } from '../components/ExpectedInvoicesList'
import { MissingInvoiceAlert } from '../components/MissingInvoiceAlert'
import { Loading, Tabs, Card } from '@/components/ui'
import type { IncomingInvoiceTrackingId } from '../types'

export const IncomingInvoicesPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'expected' | 'missing' | 'all'>('all')

  const {
    expectedInvoices,
    missingInvoices,
    isLoading,
  } = useIncomingInvoices()

  const {
    sendInvoiceReminder,
    isSendingReminder,
  } = useAccounting()

  const handleSendReminder = async (trackingId: IncomingInvoiceTrackingId) => {
    await sendInvoiceReminder(trackingId)
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incoming Invoices</h1>
          <p className="text-gray-600 mt-2">
            Track and manage expected invoices from partners
          </p>
        </div>

        {/* Missing Invoices Alert */}
        {missingInvoices && missingInvoices.length > 0 && (
          <MissingInvoiceAlert
            missingInvoices={missingInvoices as any}
            onViewInvoice={(id) => console.log('View invoice:', id)}
          />
        )}

        {/* Main Content */}
        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="border-b">
              <div className="flex w-full justify-start p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
                >
                  All ({expectedInvoices?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('expected')}
                  className={`px-4 py-2 ${activeTab === 'expected' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
                >
                  Expected ({expectedInvoices?.filter(i => i.status === 'expected').length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('missing')}
                  className={`px-4 py-2 ${activeTab === 'missing' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
                >
                  Missing ({missingInvoices?.length || 0})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'all' && (
                <ExpectedInvoicesList
                  invoices={expectedInvoices as any}
                  onSendReminder={handleSendReminder}
                  showActions={true}
                />
              )}

              {activeTab === 'expected' && (
                <ExpectedInvoicesList
                  invoices={expectedInvoices?.filter(i => i.status === 'expected') as any}
                  onSendReminder={handleSendReminder}
                  showActions={true}
                />
              )}

              {activeTab === 'missing' && (
                <ExpectedInvoicesList
                  invoices={missingInvoices as any}
                  onSendReminder={handleSendReminder}
                  showActions={true}
                />
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
