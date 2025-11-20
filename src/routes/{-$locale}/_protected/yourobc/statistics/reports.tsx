// src/routes/_protected/yourobc/statistics/reports.tsx

import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '@/features/yourobc/statistics/pages/ReportsPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/reports')({
  component: ReportsPage,
})
