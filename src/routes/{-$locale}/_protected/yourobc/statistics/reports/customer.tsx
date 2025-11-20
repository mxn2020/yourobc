// src/routes/_protected/yourobc/statistics/reports/customer.tsx

import { createFileRoute } from '@tanstack/react-router'
import { CustomerReportPage } from '@/features/yourobc/statistics/pages/CustomerReportPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/reports/customer')({
  component: CustomerReportPage,
})
