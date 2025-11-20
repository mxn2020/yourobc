// src/routes/_protected/yourobc/statistics/top-customers.tsx

import { createFileRoute } from '@tanstack/react-router'
import { TopCustomersPage } from '@/features/yourobc/statistics/pages/TopCustomersPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/top-customers')({
  component: TopCustomersPage,
})
