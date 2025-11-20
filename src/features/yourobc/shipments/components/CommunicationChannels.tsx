// src/features/yourobc/shipments/components/CommunicationChannels.tsx

import { FC } from 'react'
import { Card, Badge } from '@/components/ui'
import { Mail, MessageCircle, Phone } from 'lucide-react'
import type { ShipmentCommunication, CommunicationChannel } from '@/convex/lib/yourobc/shipments/types'

interface CommunicationChannelsProps {
  communication?: ShipmentCommunication
  compact?: boolean
}

export const CommunicationChannels: FC<CommunicationChannelsProps> = ({
  communication,
  compact = false,
}) => {
  if (!communication) {
    return compact ? (
      <span className="text-xs text-muted-foreground">-</span>
    ) : (
      <div className="text-sm text-muted-foreground">No communication channels set</div>
    )
  }

  const getChannelIcon = (type: CommunicationChannel['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3" />
      case 'phone':
        return <Phone className="h-3 w-3" />
      default:
        return null
    }
  }

  const renderChannel = (channel: CommunicationChannel, index: number) => (
    <div key={index} className="flex items-center gap-2">
      {getChannelIcon(channel.type)}
      <span className="text-sm">{channel.label || channel.identifier}</span>
      <Badge variant="outline" size="sm" className="text-xs">
        {channel.type}
      </Badge>
    </div>
  )

  if (compact) {
    const allChannels = [
      ...communication.customerChannels,
      ...(communication.partnerChannels || []),
      ...(communication.courierChannels || []),
    ]

    return (
      <div className="flex flex-wrap gap-1">
        {allChannels.slice(0, 3).map((channel, idx) => (
          <Badge key={idx} variant="secondary" size="sm" className="text-xs flex items-center gap-1">
            {getChannelIcon(channel.type)} {channel.type}
          </Badge>
        ))}
        {allChannels.length > 3 && (
          <Badge variant="secondary" size="sm">
            +{allChannels.length - 3}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <h4 className="font-semibold text-gray-900">Communication Channels</h4>

        {communication.customerChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Customer:</div>
            <div className="space-y-2">
              {communication.customerChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}

        {communication.partnerChannels && communication.partnerChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Partner:</div>
            <div className="space-y-2">
              {communication.partnerChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}

        {communication.courierChannels && communication.courierChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Courier:</div>
            <div className="space-y-2">
              {communication.courierChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}

        {communication.pickupChannels && communication.pickupChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Pickup Service:</div>
            <div className="space-y-2">
              {communication.pickupChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}

        {communication.deliveryChannels && communication.deliveryChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Delivery Service:</div>
            <div className="space-y-2">
              {communication.deliveryChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}

        {communication.customsChannels && communication.customsChannels.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Customs Broker:</div>
            <div className="space-y-2">
              {communication.customsChannels.map((channel, idx) => renderChannel(channel, idx))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
