// src/routes/_protected/yourobc/statistics/operating-costs.tsx

import { createFileRoute } from '@tanstack/react-router'
import { OperatingCostsPage } from '@/features/yourobc/statistics/pages/OperatingCostsPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/operating-costs')({
  component: OperatingCostsPage,
})
