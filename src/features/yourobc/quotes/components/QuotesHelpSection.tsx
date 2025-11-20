// src/features/yourobc/quotes/components/QuotesHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const QuotesHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Quote Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Creating Effective Quotes:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Include all relevant costs and fees upfront</li>
              <li>• Set realistic delivery timeframes</li>
              <li>• Specify service level clearly (OBC/NFO)</li>
              <li>• Document special handling requirements</li>
              <li>• Set appropriate validity periods</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Improving Conversion:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Follow up on sent quotes promptly</li>
              <li>• Track acceptance and rejection reasons</li>
              <li>• Analyze pricing competitiveness</li>
              <li>• Convert accepted quotes to shipments quickly</li>
              <li>• Review expired quotes for opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
