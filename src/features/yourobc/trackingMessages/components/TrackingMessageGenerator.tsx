// src/features/yourobc/trackingMessages/components/TrackingMessageGenerator.tsx

import { FC, useState, useMemo } from 'react'
import { Button, Badge } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'
import { useTrackingMessageForServiceAndStatus } from '../hooks/useTrackingMessages'
import type { TrackingMessageVariables } from '../types'
import { useToast } from '@/features/system/notifications'
import type { ShipmentStatus, ScheduledTime } from '@/convex/schema/yourobc/base'
import { formatInLocalTime } from '@/lib/timezone-utils'

interface TrackingMessageGeneratorProps {
  shipmentId: Id<'yourobcShipments'>
  serviceType: 'OBC' | 'NFO'
  status: ShipmentStatus
  language?: 'en' | 'de'
  shipmentData: {
    shipmentNumber: string
    customerName: string
    customerCompany?: string
    origin: string
    destination: string
    awbNumber?: string
    hawbNumber?: string
    mawbNumber?: string
    courierName?: string
    courierPhone?: string
    partnerName?: string
    partnerContact?: string
    pickupTime?: ScheduledTime
    deliveryTime?: ScheduledTime
    estimatedArrival?: ScheduledTime
    flightNumber?: string
    notes?: string
  }
}

export const TrackingMessageGenerator: FC<TrackingMessageGeneratorProps> = ({
  serviceType,
  status,
  language = 'en',
  shipmentData,
}) => {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const { message: template, isLoading, error } = useTrackingMessageForServiceAndStatus(serviceType, status, language)

  // Format timestamps - uses ScheduledTime with proper timezone handling
  const formatDateTime = (scheduledTime: ScheduledTime | undefined): string => {
    const locale = language === 'de' ? 'de-DE' : 'en-US'
    return formatInLocalTime(scheduledTime, locale)
  }

  // Build variables object
  const variables: TrackingMessageVariables = useMemo(
    () => ({
      shipmentNumber: shipmentData.shipmentNumber,
      customerName: shipmentData.customerName,
      customerCompany: shipmentData.customerCompany || shipmentData.customerName,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      awbNumber: shipmentData.awbNumber,
      hawbNumber: shipmentData.hawbNumber,
      mawbNumber: shipmentData.mawbNumber,
      courierName: shipmentData.courierName,
      courierPhone: shipmentData.courierPhone,
      partnerName: shipmentData.partnerName,
      partnerContact: shipmentData.partnerContact,
      pickupTime: formatDateTime(shipmentData.pickupTime),
      deliveryTime: formatDateTime(shipmentData.deliveryTime),
      estimatedArrival: formatDateTime(shipmentData.estimatedArrival),
      flightNumber: shipmentData.flightNumber,
      status: status,
      notes: shipmentData.notes,
      trackingUrl: `https://track.example.com/${shipmentData.shipmentNumber}`,
      currentDate: new Date().toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US'),
      currentTime: new Date().toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }),
    [shipmentData, status, language]
  )

  // Parse template
  const generatedMessage = useMemo(() => {
    if (!template) return null

    let subject = template.subject || ''
    let body = template.template

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g')
      subject = subject.replace(placeholder, value || '-')
      body = body.replace(placeholder, value || '-')
    })

    return { subject, body }
  }, [template, variables])

  const handleCopy = async (text: string, type: 'subject' | 'body' | 'full') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${type === 'subject' ? 'Subject' : type === 'body' ? 'Message' : 'Full message'} copied to clipboard!`)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  if (!template) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">
          No tracking message template found for {serviceType} - {status} ({language})
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Create a template in the tracking messages settings.
        </div>
      </div>
    )
  }

  if (!generatedMessage) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse text-sm text-gray-500">Generating message...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">📧 Tracking Message</h3>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {serviceType}
          </Badge>
          <Badge variant="secondary" size="sm">
            {language.toUpperCase()}
          </Badge>
          {template.category && (
            <Badge variant="outline" size="sm">
              {template.category}
            </Badge>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Subject:</label>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCopy(generatedMessage.subject, 'subject')}
          >
            {copied ? '✓ Copied' : '📋 Copy Subject'}
          </Button>
        </div>
        <div className="p-3 bg-white border border-gray-300 rounded-lg">
          <div className="text-sm font-medium text-gray-900">{generatedMessage.subject}</div>
        </div>
      </div>

      {/* Message Body */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Message:</label>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleCopy(generatedMessage.body, 'body')}
          >
            {copied ? '✓ Copied' : '📋 Copy Message'}
          </Button>
        </div>
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
            {generatedMessage.body}
          </pre>
        </div>
      </div>

      {/* Copy Full Message */}
      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="primary"
          onClick={() =>
            handleCopy(
              `Subject: ${generatedMessage.subject}\n\n${generatedMessage.body}`,
              'full'
            )
          }
        >
          📧 Copy Full Message
        </Button>
      </div>

      {/* Variables Used */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700">
          Variables used ({template.variables.length})
        </summary>
        <div className="mt-2 p-2 bg-gray-50 rounded space-y-1">
          {template.variables.map((varName: string) => (
            <div key={varName} className="flex items-center justify-between">
              <span className="font-mono">{`{${varName}}`}</span>
              <span className="text-gray-600">
                {variables[varName as keyof TrackingMessageVariables] || '-'}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

/**
 * Compact version for inline display
 */
export const TrackingMessageGeneratorCompact: FC<TrackingMessageGeneratorProps> = (props) => {
  const template = useTrackingMessageForServiceAndStatus(
    props.serviceType,
    props.status,
    props.language
  )

  if (!template) return null

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        // Open modal or expand inline
      }}
    >
      📧 Generate Tracking Message
    </Button>
  )
}
