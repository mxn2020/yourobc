// src/features/yourobc/supporting/exchange-rates/pages/ExchangeRatesPage.tsx

import { useState, useMemo } from 'react'
import { useAuth } from '@/features/system/auth'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { ExchangeRateForm } from '../components/ExchangeRateForm'
import { ExchangeRateList } from '../components/ExchangeRateList'
import { CurrencyConverter } from '../components/CurrencyConverter'
import { Card, Badge, Button } from '@/components/ui'
import { Plus, TrendingUp, Calculator } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import type { ExchangeRateFormData } from '../types'

export function ExchangeRatesPage() {
  const { auth, user } = useAuth()
  const toast = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showConverter, setShowConverter] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const {
    rates,
    ratesByCurrencyPair,
    isLoading,
    error,
    createExchangeRate,
    canManageRates,
    isCreating,
  } = useExchangeRates(50)

  const handleCreateRate = async (data: ExchangeRateFormData) => {
    try {
      await createExchangeRate(data)
      toast.success('Exchange rate created successfully')
      setShowCreateForm(false)
    } catch (error: any) {
      console.error('Create exchange rate error:', error)
      const { message } = parseConvexError(error)
      toast.error(message)
      throw error
    }
  }

  const stats = useMemo(() => {
    const total = rates.length
    const active = rates.filter(r => r.isActive).length
    const pairs = Object.keys(ratesByCurrencyPair).length

    return { total, active, pairs }
  }, [rates, ratesByCurrencyPair])

  if (!auth?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Please log in to view exchange rates</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              Exchange Rates
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage currency exchange rates
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={showConverter ? 'primary' : 'secondary'}
              onClick={() => setShowConverter(!showConverter)}
            >
              <Calculator className="w-4 h-4 mr-2" />
              {showConverter ? 'Hide' : 'Show'} Converter
            </Button>
            {canManageRates && (
              <Button
                variant="primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateForm ? 'Cancel' : 'New Rate'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Rates</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Rates</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pairs}</div>
            <div className="text-sm text-gray-600">Currency Pairs</div>
          </Card>
        </div>

        {/* Currency Converter */}
        {showConverter && (
          <CurrencyConverter showLiveRate={true} />
        )}

        {/* Create Form */}
        {showCreateForm && canManageRates && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Exchange Rate</h3>
            <ExchangeRateForm
              onSubmit={handleCreateRate}
              onCancel={() => setShowCreateForm(false)}
              submitLabel="Create Rate"
            />
          </Card>
        )}

        {/* Rates List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Rates</h2>
            {!canManageRates && (
              <Badge variant="secondary">View Only</Badge>
            )}
          </div>
          <ExchangeRateList
            rates={rates}
            isLoading={isLoading}
            error={error}
            emptyMessage="No exchange rates yet. Create one to get started!"
          />
        </div>
      </div>
    </div>
  )
}
