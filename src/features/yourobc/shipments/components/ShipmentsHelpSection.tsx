// src/features/yourobc/shipments/components/ShipmentsHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const ShipmentsHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Shipment Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Status Management:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Update status promptly as shipments progress</li>
              <li>• Add notes and location info for visibility</li>
              <li>• Monitor SLA deadlines to prevent overdue status</li>
              <li>• Confirm proof of delivery for completed shipments</li>
              <li>• Process documentation quickly after delivery</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Best Practices:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Assign couriers based on skills and availability</li>
              <li>• Keep customer references accurate and updated</li>
              <li>• Monitor flight details for NFO shipments</li>
              <li>• Track actual costs vs. agreed pricing</li>
              <li>• Use priority levels to manage urgent deliveries</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
