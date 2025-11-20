// src/features/yourobc/accounting/pages/AccountingDashboardPage.tsx

import { FC } from 'react'
import { useAccounting } from '../hooks/useAccounting'
import { AccountingDashboard } from '../components/AccountingDashboard'
import { Loading, Alert } from '@/components/ui'

export const AccountingDashboardPage: FC = () => {
  const { isLoading, config, isFeatureEnabled } = useAccounting()

  if (!isFeatureEnabled('dashboard.enabled')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="default">
          <div>
            The accounting dashboard is currently disabled. Please contact your administrator.
          </div>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return <AccountingDashboard />
}
