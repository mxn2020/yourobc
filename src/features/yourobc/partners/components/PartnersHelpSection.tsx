// src/features/yourobc/partners/components/PartnersHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const PartnersHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Partner Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Building Strong Partnerships:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Maintain accurate service coverage information</li>
              <li>• Track partner performance and reliability</li>
              <li>• Keep contact information up to date</li>
              <li>• Document service level agreements</li>
              <li>• Monitor quote response times</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Optimization:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Compare partner pricing regularly</li>
              <li>• Track selection and win rates</li>
              <li>• Review delivery performance metrics</li>
              <li>• Maintain backup partners per route</li>
              <li>• Foster communication and transparency</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
