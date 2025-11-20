// src/routes/_protected/yourobc/statistics/reports/order.tsx

import { createFileRoute } from '@tanstack/react-router'
import { OrderAnalysisReportPage } from '@/features/yourobc/statistics/pages/OrderAnalysisReportPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/reports/order')({
  component: OrderAnalysisReportPage,
})
