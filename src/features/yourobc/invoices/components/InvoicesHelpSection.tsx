// src/features/yourobc/invoices/components/InvoicesHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const InvoicesHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Invoice Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Outgoing Invoices (Revenue):</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Send invoices promptly after delivery</li>
              <li>• Include clear payment terms and due dates</li>
              <li>• Track payment status and follow up on overdue</li>
              <li>• Use consistent invoice numbering</li>
              <li>• Include detailed line items and descriptions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Incoming Invoices (Expenses):</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Review and approve before processing payment</li>
              <li>• Match with purchase orders and delivery receipts</li>
              <li>• Process payments within agreed terms</li>
              <li>• Track vendor payment history</li>
              <li>• Maintain proper documentation for tax purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
