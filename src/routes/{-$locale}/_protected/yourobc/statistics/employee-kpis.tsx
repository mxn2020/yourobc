// src/routes/_protected/yourobc/statistics/employee-kpis.tsx

import { createFileRoute } from '@tanstack/react-router'
import { EmployeeKPIsPage } from '@/features/yourobc/statistics/pages/EmployeeKPIsPage'

export const Route = createFileRoute('/_protected/yourobc/statistics/employee-kpis')({
  component: EmployeeKPIsPage,
})
