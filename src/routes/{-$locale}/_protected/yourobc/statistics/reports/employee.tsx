// src/routes/_protected/yourobc/statistics/reports/employee.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EmployeeReportPage } from '@/features/yourobc/statistics/pages/EmployeeReportPage'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/statistics/reports/employee')({
  component: EmployeeReportPage,
})
