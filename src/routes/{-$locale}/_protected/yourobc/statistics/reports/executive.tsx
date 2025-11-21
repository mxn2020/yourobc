// src/routes/_protected/yourobc/statistics/reports/executive.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ExecutiveReportPage } from '@/features/yourobc/statistics/pages/ExecutiveReportPage'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/statistics/reports/executive')({
  component: ExecutiveReportPage,
})
