// src/features/yourobc/customers/components/CustomersHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const CustomersHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Customer Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Building Strong Relationships:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Keep contact information current and verified</li>
              <li>• Track customer preferences and requirements</li>
              <li>• Set appropriate payment terms and margins</li>
              <li>• Use tags to categorize customers effectively</li>
              <li>• Monitor customer activity and engagement</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Business Intelligence:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Review customer performance metrics regularly</li>
              <li>• Identify high-value and at-risk customers</li>
              <li>• Track quote acceptance rates by customer</li>
              <li>• Analyze payment patterns and terms</li>
              <li>• Use customer insights for strategic decisions</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
