// src/features/yourobc/customers/components/DunningConfiguration.tsx

import { FC, useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/generated/api'
import { useToast } from '@/features/system/notifications'
import {
  Card,
  Button,
  Input,
  Label,
  Checkbox,
  Textarea,
} from '@/components/ui'
import { Save, AlertTriangle, DollarSign, Ban } from 'lucide-react'
import type { Id } from '@/convex/_generated/dataModel'

interface DunningConfigurationProps {
  customerId: Id<'yourobcCustomers'>
}

export const DunningConfiguration: FC<DunningConfigurationProps> = ({ customerId }) => {
  const toast = useToast()

  // Fetch existing config
  const existingConfig = useQuery(api.lib.yourobc.customers.dunning.index.getDunningConfig, {
    customerId,
  })

  const createConfig = useMutation(api.lib.yourobc.customers.dunning.index.createDunningConfig)
  const updateConfig = useMutation(api.lib.yourobc.customers.dunning.index.updateDunningConfig)

  // Level 1
  const [level1DaysOverdue, setLevel1DaysOverdue] = useState(7)
  const [level1FeeEUR, setLevel1FeeEUR] = useState(5)
  const [level1AutoSend, setLevel1AutoSend] = useState(true)

  // Level 2
  const [level2DaysOverdue, setLevel2DaysOverdue] = useState(14)
  const [level2FeeEUR, setLevel2FeeEUR] = useState(10)
  const [level2AutoSend, setLevel2AutoSend] = useState(true)

  // Level 3
  const [level3DaysOverdue, setLevel3DaysOverdue] = useState(21)
  const [level3FeeEUR, setLevel3FeeEUR] = useState(15)
  const [level3AutoSend, setLevel3AutoSend] = useState(true)
  const [level3SuspendService, setLevel3SuspendService] = useState(true)

  // General settings
  const [allowServiceWhenOverdue, setAllowServiceWhenOverdue] = useState(false)
  const [autoReactivateOnPayment, setAutoReactivateOnPayment] = useState(true)
  const [skipDunningProcess, setSkipDunningProcess] = useState(false)
  const [requirePrepayment, setRequirePrepayment] = useState(false)
  const [customPaymentTermsDays, setCustomPaymentTermsDays] = useState<number | undefined>(undefined)
  const [dunningContactEmail, setDunningContactEmail] = useState('')
  const [dunningContactName, setDunningContactName] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  // Load existing config
  useEffect(() => {
    if (existingConfig) {
      setLevel1DaysOverdue(existingConfig.level1DaysOverdue)
      setLevel1FeeEUR(existingConfig.level1FeeEUR)
      setLevel1AutoSend(existingConfig.level1AutoSend)

      setLevel2DaysOverdue(existingConfig.level2DaysOverdue)
      setLevel2FeeEUR(existingConfig.level2FeeEUR)
      setLevel2AutoSend(existingConfig.level2AutoSend)

      setLevel3DaysOverdue(existingConfig.level3DaysOverdue)
      setLevel3FeeEUR(existingConfig.level3FeeEUR)
      setLevel3AutoSend(existingConfig.level3AutoSend)
      setLevel3SuspendService(existingConfig.level3SuspendService)

      setAllowServiceWhenOverdue(existingConfig.allowServiceWhenOverdue)
      setAutoReactivateOnPayment(existingConfig.autoReactivateOnPayment)
      setSkipDunningProcess(existingConfig.skipDunningProcess)
      setRequirePrepayment(existingConfig.requirePrepayment || false)
      setCustomPaymentTermsDays(existingConfig.customPaymentTermsDays)
      setDunningContactEmail(existingConfig.dunningContactEmail || '')
      setDunningContactName(existingConfig.dunningContactName || '')
    }
  }, [existingConfig])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (existingConfig) {
        // Update
        await updateConfig({
          configId: existingConfig._id,
          level1DaysOverdue,
          level1FeeEUR,
          level1AutoSend,
          level2DaysOverdue,
          level2FeeEUR,
          level2AutoSend,
          level3DaysOverdue,
          level3FeeEUR,
          level3AutoSend,
          level3SuspendService,
          allowServiceWhenOverdue,
          autoReactivateOnPayment,
          skipDunningProcess,
          requirePrepayment,
          customPaymentTermsDays,
          dunningContactEmail: dunningContactEmail || undefined,
          dunningContactName: dunningContactName || undefined,
        })
        toast.success('Dunning configuration updated')
      } else {
        // Create
        await createConfig({
          customerId,
          level1DaysOverdue,
          level1FeeEUR,
          level1AutoSend,
          level2DaysOverdue,
          level2FeeEUR,
          level2AutoSend,
          level3DaysOverdue,
          level3FeeEUR,
          level3AutoSend,
          level3SuspendService,
          allowServiceWhenOverdue,
          autoReactivateOnPayment,
          skipDunningProcess,
          requirePrepayment,
          customPaymentTermsDays,
          dunningContactEmail: dunningContactEmail || undefined,
          dunningContactName: dunningContactName || undefined,
        })
        toast.success('Dunning configuration created')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning for VIP/Skip Dunning */}
      {skipDunningProcess && (
        <Card className="p-4 border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900">Dunning Process Disabled</p>
              <p className="text-sm text-yellow-700">
                This customer is exempt from the dunning process. No automatic reminders or
                fees will be applied.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="skipDunning"
              checked={skipDunningProcess}
              onChange={(checked: boolean) => setSkipDunningProcess(checked)}
            />
            <div>
              <Label htmlFor="skipDunning" className="font-medium">
                Skip Dunning Process (VIP Customer)
              </Label>
              <p className="text-sm text-gray-600">
                Completely disable dunning for this customer
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="requirePrepayment"
              checked={requirePrepayment}
              onChange={(checked: boolean) => setRequirePrepayment(checked)}
            />
            <div>
              <Label htmlFor="requirePrepayment" className="font-medium">
                Require Prepayment
              </Label>
              <p className="text-sm text-gray-600">
                Require payment before providing service
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="allowServiceWhenOverdue"
              checked={allowServiceWhenOverdue}
              onChange={(checked: boolean) => setAllowServiceWhenOverdue(checked)}
            />
            <div>
              <Label htmlFor="allowServiceWhenOverdue" className="font-medium">
                Allow Service When Overdue
              </Label>
              <p className="text-sm text-gray-600">
                Continue providing service even with overdue invoices
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="autoReactivate"
              checked={autoReactivateOnPayment}
              onChange={(checked: boolean) => setAutoReactivateOnPayment(checked)}
            />
            <div>
              <Label htmlFor="autoReactivate" className="font-medium">
                Auto-Reactivate on Payment
              </Label>
              <p className="text-sm text-gray-600">
                Automatically reactivate service when all invoices are paid
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="customPaymentTerms">Custom Payment Terms (days)</Label>
            <Input
              id="customPaymentTerms"
              type="number"
              min="0"
              value={customPaymentTermsDays || ''}
              onChange={(e) =>
                setCustomPaymentTermsDays(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="Leave empty for default"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dunningEmail">Dunning Contact Email</Label>
              <Input
                id="dunningEmail"
                type="email"
                value={dunningContactEmail}
                onChange={(e) => setDunningContactEmail(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="dunningName">Dunning Contact Name</Label>
              <Input
                id="dunningName"
                value={dunningContactName}
                onChange={(e) => setDunningContactName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Dunning Levels */}
      {!skipDunningProcess && (
        <>
          {/* Level 1 */}
          <Card className="p-6 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Level 1: First Reminder</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level1Days">Days Overdue</Label>
                <Input
                  id="level1Days"
                  type="number"
                  min="0"
                  value={level1DaysOverdue}
                  onChange={(e) => setLevel1DaysOverdue(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="level1Fee">Dunning Fee (EUR)</Label>
                <Input
                  id="level1Fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={level1FeeEUR}
                  onChange={(e) => setLevel1FeeEUR(parseFloat(e.target.value))}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="level1Auto"
                    checked={level1AutoSend}
                    onChange={(checked: boolean) => setLevel1AutoSend(checked)}
                  />
                  <Label htmlFor="level1Auto">Auto-send</Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Level 2 */}
          <Card className="p-6 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 p-2 rounded">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold">Level 2: Second Reminder</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level2Days">Days Overdue</Label>
                <Input
                  id="level2Days"
                  type="number"
                  min="0"
                  value={level2DaysOverdue}
                  onChange={(e) => setLevel2DaysOverdue(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="level2Fee">Dunning Fee (EUR)</Label>
                <Input
                  id="level2Fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={level2FeeEUR}
                  onChange={(e) => setLevel2FeeEUR(parseFloat(e.target.value))}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="level2Auto"
                    checked={level2AutoSend}
                    onChange={(checked: boolean) => setLevel2AutoSend(checked)}
                  />
                  <Label htmlFor="level2Auto">Auto-send</Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Level 3 */}
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">
                Level 3: Final Warning
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="level3Days">Days Overdue</Label>
                <Input
                  id="level3Days"
                  type="number"
                  min="0"
                  value={level3DaysOverdue}
                  onChange={(e) => setLevel3DaysOverdue(parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="level3Fee">Dunning Fee (EUR)</Label>
                <Input
                  id="level3Fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={level3FeeEUR}
                  onChange={(e) => setLevel3FeeEUR(parseFloat(e.target.value))}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="level3Auto"
                    checked={level3AutoSend}
                    onChange={(checked: boolean) => setLevel3AutoSend(checked)}
                  />
                  <Label htmlFor="level3Auto">Auto-send</Label>
                </div>
              </div>

              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="level3Suspend"
                    checked={level3SuspendService}
                    onChange={(checked: boolean) => setLevel3SuspendService(checked)}
                  />
                  <Label htmlFor="level3Suspend" className="text-red-900">
                    Suspend Service
                  </Label>
                </div>
              </div>
            </div>

            {level3SuspendService && (
              <div className="mt-3 p-3 bg-white border border-red-300 rounded">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> When dunning level 3 is triggered, the customer's
                  service will be automatically suspended. They will not be able to place new
                  orders until all overdue invoices are paid.
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Dunning Configuration'}
        </Button>
      </div>
    </div>
  )
}
