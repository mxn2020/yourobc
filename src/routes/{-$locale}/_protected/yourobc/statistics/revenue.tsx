// src/routes/_protected/yourobc/statistics/revenue.tsx

import { createFileRoute } from '@tanstack/react-router'
import { RevenueAnalysisPage } from '@/features/yourobc/statistics/pages/RevenueAnalysisPage'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/statistics/revenue')({
  component: RevenueAnalysisPage,
})
