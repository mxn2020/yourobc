// src/routes/_protected/yourobc/statistics/reports/monthly.tsx

import { createFileRoute } from '@tanstack/react-router'
import { MonthlyReportPage } from '@/features/yourobc/statistics/pages/MonthlyReportPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/reports/monthly')({
  component: MonthlyReportPage,
})
