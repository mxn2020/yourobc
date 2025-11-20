// src/features/yourobc/couriers/components/CouriersHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const CouriersHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Courier Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Managing Your Courier Network:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Keep courier contact information current</li>
              <li>• Track language capabilities and service types</li>
              <li>• Monitor courier availability status</li>
              <li>• Maintain travel document information</li>
              <li>• Track commission structures accurately</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Optimization & Performance:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Match couriers to shipments by location</li>
              <li>• Balance workload across courier network</li>
              <li>• Track on-time delivery performance</li>
              <li>• Monitor courier feedback and ratings</li>
              <li>• Plan for peak period courier needs</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
