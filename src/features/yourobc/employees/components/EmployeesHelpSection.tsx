// src/features/yourobc/employees/components/EmployeesHelpSection.tsx

import { FC } from 'react'
import { Card } from '@/components/ui'

export const EmployeesHelpSection: FC = () => {
  return (
    <Card className="mt-8 bg-blue-50 border-blue-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Employee Management Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Team Management:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Keep employee contact information up to date</li>
              <li>• Assign clear roles and responsibilities</li>
              <li>• Track vacation and time-off requests</li>
              <li>• Monitor team workload and availability</li>
              <li>• Maintain proper department organization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Performance & Development:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Review employee performance metrics regularly</li>
              <li>• Track completed tasks and assignments</li>
              <li>• Identify training and development needs</li>
              <li>• Manage team hierarchies effectively</li>
              <li>• Foster communication and collaboration</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  )
}
