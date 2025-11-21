// src/routes/_protected/yourobc/statistics/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { StatisticsDashboardPage } from '@/features/yourobc/statistics/pages/StatisticsDashboardPage'

export const Route = createFileRoute('/{-$locale}/_protected/yourobc/statistics/')({
  component: StatisticsDashboardPage,
})
