// src/features/yourobc/shipments/components/CompletionPopup.tsx

import { FC, useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Alert,
  AlertDescription,
  Checkbox,
  Label,
} from '@/components/ui'
import { useAuthenticatedUser } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import type { Shipment } from '@/convex/lib/yourobc/shipments/types'

interface CompletionPopupProps {
  shipment: Shipment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const CompletionPopup: FC<CompletionPopupProps> = ({
  shipment,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const authUser = useAuthenticatedUser()
  const toast = useToast()
  const completeMutation = useMutation(api.lib.yourobc.shipments.mutations.completeShipment)

  const [confirmations, setConfirmations] = useState({
    extraCostsRecorded: false,
    documentsComplete: false,
    cwtValidated: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset confirmations when popup opens
  useEffect(() => {
    if (open) {
      setConfirmations({
        extraCostsRecorded: false,
        documentsComplete: false,
        cwtValidated: false,
      })
    }
  }, [open])

  const handleComplete = async () => {
    if (!authUser) return

    setIsSubmitting(true)
    try {
      const result = await completeMutation({
        authUserId: authUser.id,
        shipmentId: shipment._id,
        confirmations,
      })

      toast.success('Shipment completed successfully!')

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => toast.warning(warning))
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete shipment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const allConfirmed = shipment.serviceType === 'NFO'
    ? confirmations.extraCostsRecorded &&
      confirmations.documentsComplete &&
      confirmations.cwtValidated
    : confirmations.extraCostsRecorded &&
      confirmations.documentsComplete

  // Check missing fields
  const missingFields: string[] = []
  if (!shipment.customerReference) {
    missingFields.push('Kundenreferenz (Customer Reference)')
  }
  if (!shipment.documentStatus?.pod || shipment.documentStatus.pod !== 'complete') {
    missingFields.push('POD (Proof of Delivery)')
  }
  if (shipment.serviceType === 'NFO') {
    if (!shipment.documentStatus?.hawb || shipment.documentStatus.hawb !== 'complete') {
      missingFields.push('HAWB Number')
    }
    if (!shipment.documentStatus?.mawb || shipment.documentStatus.mawb !== 'complete') {
      missingFields.push('MAWB Number')
    }
  }

  const canComplete = missingFields.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shipment Abschluss - {shipment.shipmentNumber}</DialogTitle>
          <DialogDescription>
            Bitte bestätigen Sie, dass alle erforderlichen Felder ausgefüllt sind
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Missing Fields Warning */}
          {!canComplete && (
            <Alert variant="warning">
              <AlertDescription>
                <strong>Fehlende Pflichtfelder:</strong>
                <ul className="list-disc list-inside mt-2">
                  {missingFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Required Information Display */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Kundenreferenz:</span>
              <span className={shipment.customerReference ? 'text-green-600' : 'text-red-600'}>
                {shipment.customerReference || 'FEHLT'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">POD Status:</span>
              <span className={shipment.documentStatus?.pod === 'complete' ? 'text-green-600' : 'text-red-600'}>
                {shipment.documentStatus?.pod === 'complete' ? 'Vollständig' : 'FEHLT'}
              </span>
            </div>

            {shipment.serviceType === 'NFO' && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">HAWB:</span>
                  <span className={shipment.documentStatus?.hawb === 'complete' ? 'text-green-600' : 'text-red-600'}>
                    {shipment.documentStatus?.hawb === 'complete' ? 'Vollständig' : 'FEHLT'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">MAWB:</span>
                  <span className={shipment.documentStatus?.mawb === 'complete' ? 'text-green-600' : 'text-red-600'}>
                    {shipment.documentStatus?.mawb === 'complete' ? 'Vollständig' : 'FEHLT'}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between">
              <span className="font-medium">AWB Status:</span>
              <span className={shipment.documentStatus?.awb === 'complete' ? 'text-green-600' : 'text-yellow-600'}>
                {shipment.documentStatus?.awb === 'complete' ? 'Vollständig' : 'Ausstehend'}
              </span>
            </div>
          </div>

          {/* Confirmation Checkboxes */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="extraCosts"
                checked={confirmations.extraCostsRecorded}
                onChange={(checked: boolean) =>
                  setConfirmations((prev) => ({ ...prev, extraCostsRecorded: checked }))
                }
              />
              <div className="flex flex-col">
                <Label htmlFor="extraCosts" className="font-medium cursor-pointer">
                  Alle Extrakosten erfasst
                </Label>
                <span className="text-sm text-gray-500">
                  Zoll, Übergepäck, Wartezeiten, etc. wurden dokumentiert
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="documents"
                checked={confirmations.documentsComplete}
                onChange={(checked: boolean) =>
                  setConfirmations((prev) => ({ ...prev, documentsComplete: checked }))
                }
              />
              <div className="flex flex-col">
                <Label htmlFor="documents" className="font-medium cursor-pointer">
                  Alle Dokumente vollständig
                </Label>
                <span className="text-sm text-gray-500">
                  AWB, POD{shipment.serviceType === 'NFO' ? ', HAWB, MAWB' : ''} sind vorhanden
                </span>
              </div>
            </div>

            {shipment.serviceType === 'NFO' && (
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="cwt"
                  checked={confirmations.cwtValidated}
                  onChange={(checked: boolean) =>
                    setConfirmations((prev) => ({ ...prev, cwtValidated: checked }))
                  }
                />
                <div className="flex flex-col">
                  <Label htmlFor="cwt" className="font-medium cursor-pointer">
                    CWT Pre-Alert validiert
                  </Label>
                  <span className="text-sm text-gray-500">
                    Chargeable Weight im Pre-Alert entspricht der Kalkulation
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nach Abschluss:</strong> Das Accounting wird benachrichtigt und kann die Rechnung erstellen.
              Der Auftrag wird als "Document" markiert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!allConfirmed || !canComplete || isSubmitting}
          >
            {isSubmitting ? 'Wird verarbeitet...' : 'Auftrag abschließen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
