// src/features/yourobc/customers/components/MarginCalculator.tsx

import { FC, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface MarginCalculatorProps {
  customerId: Id<'yourobcCustomers'>
}

const SERVICE_TYPES = [
  { value: '', label: 'None (use default)' },
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'overnight', label: 'Overnight' },
  { value: 'international', label: 'International' },
  { value: 'freight', label: 'Freight' },
  { value: 'other', label: 'Other' },
]

// Type guard to check if preview is a success response
type MarginPreviewSuccess = {
  revenue: number
  cost: number
  marginAmount: number
  marginPercentage: number
  appliedRule: string
  appliedMethod: 'percentage' | 'minimum'
  details: {
    configuredPercentage: number
    configuredMinimumEUR: number
    percentageMargin: number
    minimumMargin: number
  }
}

type MarginPreviewError = {
  error: string
  marginAmount: number
  marginPercentage: number
}

function isSuccessPreview(
  preview: MarginPreviewSuccess | MarginPreviewError | undefined
): preview is MarginPreviewSuccess {
  return preview !== undefined && !('error' in preview)
}

export const MarginCalculator: FC<MarginCalculatorProps> = ({ customerId }) => {
  const [revenue, setRevenue] = useState(200)
  const [serviceType, setServiceType] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [monthlyShipmentCount, setMonthlyShipmentCount] = useState<number | undefined>(undefined)

  // Fetch margin preview
  const preview = useQuery(
    api.lib.yourobc.customers.margins.index.calculateMarginPreview,
    revenue > 0
      ? {
          customerId,
          revenue,
          serviceType: serviceType || undefined,
          origin: origin || undefined,
          destination: destination || undefined,
          monthlyShipmentCount,
        }
      : 'skip'
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  const getRuleLabel = (rule: string) => {
    switch (rule) {
      case 'route':
        return 'Route-Specific Margin'
      case 'service':
        return 'Service-Specific Margin'
      case 'volume_tier':
        return 'Volume Tier Margin'
      case 'default':
        return 'Default Margin'
      default:
        return 'Unknown'
    }
  }

  const getMethodLabel = (method: string) => {
    return method === 'percentage' ? 'Percentage-Based' : 'Minimum EUR'
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Margin Calculator</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Preview how margins will be calculated for different scenarios based on your
          configuration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="revenue">Revenue (EUR)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              step="0.01"
              value={revenue}
              onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="origin">Origin (optional)</Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g., Berlin"
            />
          </div>

          <div>
            <Label htmlFor="destination">Destination (optional)</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Munich"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="monthlyShipments">Monthly Shipment Count (optional)</Label>
            <Input
              id="monthlyShipments"
              type="number"
              min="0"
              value={monthlyShipmentCount || ''}
              onChange={(e) =>
                setMonthlyShipmentCount(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Enter for volume tier calculation"
            />
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {isSuccessPreview(preview) && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Calculation Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(preview.revenue)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Margin</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(preview.marginAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatPercentage(preview.marginPercentage)} of revenue
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(preview.cost)}
              </p>
            </div>
          </div>

          {/* Rule Details */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Applied Rules</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Rule Type:</span>
                <span className="ml-2 font-medium text-blue-700">
                  {getRuleLabel(preview.appliedRule)}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Calculation Method:</span>
                <span className="ml-2 font-medium text-blue-700">
                  {getMethodLabel(preview.appliedMethod)}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Configured Percentage:</span>
                <span className="ml-2 font-medium">
                  {formatPercentage(preview.details.configuredPercentage)}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Configured Minimum:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(preview.details.configuredMinimumEUR)}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Percentage Margin:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(preview.details.percentageMargin)}
                </span>
              </div>

              <div>
                <span className="text-gray-600">Minimum Margin:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(preview.details.minimumMargin)}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Winner:</strong> {getMethodLabel(preview.appliedMethod)} (
                {formatCurrency(preview.marginAmount)}) was applied because it's higher than{' '}
                {preview.appliedMethod === 'percentage'
                  ? formatCurrency(preview.details.minimumMargin)
                  : formatCurrency(preview.details.percentageMargin)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {preview && 'error' in preview && preview.error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">
                Cannot Calculate Margin
              </h4>
              <p className="text-sm text-red-700">{preview.error}</p>
              <p className="text-sm text-red-600 mt-2">
                Please configure a margin rule for this customer first.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
