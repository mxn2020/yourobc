// src/features/yourobc/accounting/pages/StatementsPage.tsx

import { FC, useState } from 'react'
import { useStatements, useAccounting } from '../hooks/useAccounting'
import { StatementOfAccounts } from '../components/StatementOfAccounts'
import { AgingReportExport } from '../components/StatementExport'
import { Loading, Button, Card } from '@/components/ui'

export const StatementsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'statements' | 'aging'>('statements')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  const { agingReport, isLoading } = useStatements(selectedCustomerId)
  const { generateStatement, isGeneratingStatement } = useAccounting()

  const handleGenerateStatement = async () => {
    if (!selectedCustomerId) return

    const now = Date.now()
    const startDate = now - 30 * 24 * 60 * 60 * 1000 // Last 30 days
    const endDate = now

    await generateStatement({
      customerId: selectedCustomerId as any,
      startDate,
      endDate,
    })
  }

  const handleExportAging = async (format: 'pdf' | 'excel') => {
    // Implementation for exporting aging report
    console.log('Export aging report as', format)
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
            <h1 className="text-3xl font-bold text-gray-900">Statements</h1>
            <p className="text-gray-600 mt-2">
              Generate and manage customer statements
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleGenerateStatement}
            disabled={!selectedCustomerId || isGeneratingStatement}
          >
            {isGeneratingStatement ? 'Generating...' : 'Generate Statement'}
          </Button>
        </div>

        {/* Main Content */}
        <div>
          <div className="border-b mb-6">
            <div className="flex w-full justify-start p-1">
              <button
                onClick={() => setActiveTab('statements')}
                className={`px-4 py-2 ${activeTab === 'statements' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              >
                Customer Statements
              </button>
              <button
                onClick={() => setActiveTab('aging')}
                className={`px-4 py-2 ${activeTab === 'aging' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
              >
                Aging Report
              </button>
            </div>
          </div>

          {activeTab === 'statements' && (
            <Card className="p-6">
              {/* Customer selection and statements list */}
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-semibold mb-2">
                  Select a customer to view statements
                </div>
                <p className="text-sm">
                  Use the customer selector above to generate or view statements
                </p>
              </div>
            </Card>
          )}

          {activeTab === 'aging' && (
            <>
              {agingReport ? (
                <AgingReportExport
                  agingData={agingReport}
                  onExport={handleExportAging}
                />
              ) : (
                <Card className="p-6">
                  <div className="text-center py-12 text-gray-500">
                    <Loading size="md" />
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
