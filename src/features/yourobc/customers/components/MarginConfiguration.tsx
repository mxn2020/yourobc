// src/features/yourobc/customers/components/MarginConfiguration.tsx

import { FC, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from '@/features/system/notifications'
import {
  Card,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
} from '@/components/ui'
import { Plus, Trash2, Save, Calculator } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'
import type { MarginServiceType } from '@/convex/schema/yourobc/base'

interface MarginConfigurationProps {
  customerId: Id<'yourobcCustomers'>
}

const SERVICE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'overnight', label: 'Overnight' },
  { value: 'international', label: 'International' },
  { value: 'freight', label: 'Freight' },
  { value: 'other', label: 'Other' },
]

export const MarginConfiguration: FC<MarginConfigurationProps> = ({ customerId }) => {
  const toast = useToast()

  // Fetch existing margin configuration
  const marginConfig = useQuery(api.lib.yourobc.customers.margins.index.getCustomerMargins, {
    customerId,
  })

  const createMarginRule = useMutation(api.lib.yourobc.customers.margins.index.createMarginRule)
  const updateMarginRule = useMutation(api.lib.yourobc.customers.margins.index.updateMarginRule)

  const [defaultMarginPercentage, setDefaultMarginPercentage] = useState(
    marginConfig?.defaultMarginPercentage ?? 15
  )
  const [defaultMinimumMarginEUR, setDefaultMinimumMarginEUR] = useState(
    marginConfig?.defaultMinimumMarginEUR ?? 50
  )
  const [serviceMargins, setServiceMargins] = useState<
    Array<{
      serviceType: MarginServiceType
      marginPercentage: number
      minimumMarginEUR: number
      description?: string
    }>
  >(marginConfig?.serviceMargins || [])

  const [routeMargins, setRouteMargins] = useState<
    Array<{
      origin: string
      destination: string
      marginPercentage: number
      minimumMarginEUR: number
      description?: string
    }>
  >(marginConfig?.routeMargins || [])

  const [volumeTiers, setVolumeTiers] = useState<
    Array<{
      minShipmentsPerMonth: number
      maxShipmentsPerMonth?: number
      marginPercentage: number
      minimumMarginEUR: number
      description?: string
    }>
  >(marginConfig?.volumeTiers || [])

  const [notes, setNotes] = useState(marginConfig?.notes || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (marginConfig) {
        // Update existing
        await updateMarginRule({
          marginRuleId: marginConfig._id,
          defaultMarginPercentage,
          defaultMinimumMarginEUR,
          serviceMargins: serviceMargins.length > 0 ? serviceMargins : undefined,
          routeMargins: routeMargins.length > 0 ? routeMargins : undefined,
          volumeTiers: volumeTiers.length > 0 ? volumeTiers : undefined,
          notes,
        })
        toast.success('Margin configuration updated successfully')
      } else {
        // Create new
        await createMarginRule({
          customerId,
          defaultMarginPercentage,
          defaultMinimumMarginEUR,
          serviceMargins: serviceMargins.length > 0 ? serviceMargins : undefined,
          routeMargins: routeMargins.length > 0 ? routeMargins : undefined,
          volumeTiers: volumeTiers.length > 0 ? volumeTiers : undefined,
          notes,
        })
        toast.success('Margin configuration created successfully')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save margin configuration'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Service Margins
  const addServiceMargin = () => {
    setServiceMargins([
      ...serviceMargins,
      {
        serviceType: 'standard',
        marginPercentage: 15,
        minimumMarginEUR: 50,
      },
    ])
  }

  const removeServiceMargin = (index: number) => {
    setServiceMargins(serviceMargins.filter((_, i) => i !== index))
  }

  const updateServiceMargin = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...serviceMargins]
    updated[index] = { ...updated[index], [field]: value }
    setServiceMargins(updated)
  }

  // Route Margins
  const addRouteMargin = () => {
    setRouteMargins([
      ...routeMargins,
      {
        origin: '',
        destination: '',
        marginPercentage: 15,
        minimumMarginEUR: 50,
      },
    ])
  }

  const removeRouteMargin = (index: number) => {
    setRouteMargins(routeMargins.filter((_, i) => i !== index))
  }

  const updateRouteMargin = (index: number, field: string, value: string | number) => {
    const updated = [...routeMargins]
    updated[index] = { ...updated[index], [field]: value }
    setRouteMargins(updated)
  }

  // Volume Tiers
  const addVolumeTier = () => {
    setVolumeTiers([
      ...volumeTiers,
      {
        minShipmentsPerMonth: 0,
        marginPercentage: 15,
        minimumMarginEUR: 50,
      },
    ])
  }

  const removeVolumeTier = (index: number) => {
    setVolumeTiers(volumeTiers.filter((_, i) => i !== index))
  }

  const updateVolumeTier = (index: number, field: string, value: string | number) => {
    const updated = [...volumeTiers]
    updated[index] = { ...updated[index], [field]: value }
    setVolumeTiers(updated)
  }

  return (
    <div className="space-y-6">
      {/* Default Margin Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Default Margin Settings</h3>
        <p className="text-sm text-gray-600 mb-4">
          These margins apply to all services unless overridden by specific rules below.
          The system uses whichever is higher: percentage-based margin or minimum EUR amount.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="defaultPercentage">Margin Percentage (%)</Label>
            <Input
              id="defaultPercentage"
              type="number"
              min="0"
              step="0.1"
              value={defaultMarginPercentage}
              onChange={(e) => setDefaultMarginPercentage(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="defaultMinimum">Minimum Margin (EUR)</Label>
            <Input
              id="defaultMinimum"
              type="number"
              min="0"
              step="0.01"
              value={defaultMinimumMarginEUR}
              onChange={(e) => setDefaultMinimumMarginEUR(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Example:</strong> For a €200 shipment with {defaultMarginPercentage}% or
            minimum €{defaultMinimumMarginEUR}:
            <br />
            Percentage margin: €{((200 * defaultMarginPercentage) / 100).toFixed(2)}
            <br />
            Minimum margin: €{defaultMinimumMarginEUR.toFixed(2)}
            <br />
            <strong>Applied margin: €{Math.max((200 * defaultMarginPercentage) / 100, defaultMinimumMarginEUR).toFixed(2)}</strong>
          </p>
        </div>
      </Card>

      {/* Service-Specific Margins */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Service-Specific Margins</h3>
          <Button onClick={addServiceMargin} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Override default margins for specific service types (e.g., higher margins for
          express/overnight).
        </p>

        <div className="space-y-3">
          {serviceMargins.map((margin, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded"
            >
              <div>
                <Label>Service Type</Label>
                <Select
                  value={margin.serviceType}
                  onValueChange={(value) => updateServiceMargin(index, 'serviceType', value)}
                >
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
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={margin.marginPercentage}
                  onChange={(e) =>
                    updateServiceMargin(index, 'marginPercentage', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Minimum (EUR)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={margin.minimumMarginEUR}
                  onChange={(e) =>
                    updateServiceMargin(index, 'minimumMarginEUR', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={margin.description || ''}
                  onChange={(e) => updateServiceMargin(index, 'description', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeServiceMargin(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {serviceMargins.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No service-specific margins configured. Click "Add Service" to create one.
            </p>
          )}
        </div>
      </Card>

      {/* Route-Specific Margins */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Route-Specific Margins</h3>
          <Button onClick={addRouteMargin} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Set custom margins for specific routes (origin to destination pairs). These
          override service-specific margins.
        </p>

        <div className="space-y-3">
          {routeMargins.map((margin, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded"
            >
              <div>
                <Label>Origin</Label>
                <Input
                  value={margin.origin}
                  onChange={(e) => updateRouteMargin(index, 'origin', e.target.value)}
                  placeholder="e.g., Berlin"
                />
              </div>

              <div>
                <Label>Destination</Label>
                <Input
                  value={margin.destination}
                  onChange={(e) => updateRouteMargin(index, 'destination', e.target.value)}
                  placeholder="e.g., Munich"
                />
              </div>

              <div>
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={margin.marginPercentage}
                  onChange={(e) =>
                    updateRouteMargin(index, 'marginPercentage', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Minimum (EUR)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={margin.minimumMarginEUR}
                  onChange={(e) =>
                    updateRouteMargin(index, 'minimumMarginEUR', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={margin.description || ''}
                  onChange={(e) => updateRouteMargin(index, 'description', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => removeRouteMargin(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {routeMargins.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No route-specific margins configured. Click "Add Route" to create one.
            </p>
          )}
        </div>
      </Card>

      {/* Volume Tiers */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Volume-Based Margin Tiers</h3>
          <Button onClick={addVolumeTier} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Adjust margins based on monthly shipment volume. Higher volume typically means
          lower margins.
        </p>

        <div className="space-y-3">
          {volumeTiers.map((tier, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded"
            >
              <div>
                <Label>Min Shipments/Month</Label>
                <Input
                  type="number"
                  min="0"
                  value={tier.minShipmentsPerMonth}
                  onChange={(e) =>
                    updateVolumeTier(index, 'minShipmentsPerMonth', parseInt(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Max Shipments/Month</Label>
                <Input
                  type="number"
                  min="0"
                  value={tier.maxShipmentsPerMonth || ''}
                  onChange={(e) =>
                    updateVolumeTier(
                      index,
                      'maxShipmentsPerMonth',
                      e.target.value ? parseInt(e.target.value) : ''
                    )
                  }
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={tier.marginPercentage}
                  onChange={(e) =>
                    updateVolumeTier(index, 'marginPercentage', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Minimum (EUR)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tier.minimumMarginEUR}
                  onChange={(e) =>
                    updateVolumeTier(index, 'minimumMarginEUR', parseFloat(e.target.value))
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={tier.description || ''}
                  onChange={(e) => updateVolumeTier(index, 'description', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => removeVolumeTier(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          {volumeTiers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No volume tiers configured. Click "Add Tier" to create one.
            </p>
          )}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about this margin configuration..."
          rows={4}
        />
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Margin Configuration'}
        </Button>
      </div>
    </div>
  )
}
