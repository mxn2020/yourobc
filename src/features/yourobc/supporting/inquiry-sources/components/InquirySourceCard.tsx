// src/features/yourobc/supporting/inquiry-sources/components/InquirySourceCard.tsx

import React, { useState } from 'react'
import { Edit2, Power, Check, X } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { InquirySourceForm } from './InquirySourceForm'
import type { InquirySource, InquirySourceFormData, InquirySourceId } from '../types'
import { INQUIRY_SOURCE_TYPE_LABELS, INQUIRY_SOURCE_TYPE_COLORS, INQUIRY_SOURCE_TYPE_ICONS } from '../types'

export interface InquirySourceCardProps {
  source: InquirySource
  onUpdate: (sourceId: InquirySourceId, data: Partial<InquirySourceFormData> & { isActive?: boolean }) => Promise<void>
  canEdit?: boolean
  className?: string
}

export function InquirySourceCard({
  source,
  onUpdate,
  canEdit = false,
  className = '',
}: InquirySourceCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const handleUpdate = async (data: InquirySourceFormData) => {
    await onUpdate(source._id, data)
    setIsEditing(false)
  }

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true)
    try {
      await onUpdate(source._id, { isActive: !source.isActive })
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isEditing) {
    return (
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Inquiry Source</h3>
        <InquirySourceForm
          initialData={{
            name: source.name,
            code: source.code,
            type: source.type,
            description: source.description,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Save Changes"
        />
      </Card>
    )
  }

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{INQUIRY_SOURCE_TYPE_ICONS[source.type]}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
              {source.code && (
                <p className="text-sm text-gray-500 font-mono">{source.code}</p>
              )}
            </div>
          </div>

          {/* Type Badge */}
          <div className="mb-3">
            <Badge className={INQUIRY_SOURCE_TYPE_COLORS[source.type]}>
              {INQUIRY_SOURCE_TYPE_LABELS[source.type]}
            </Badge>
          </div>

          {/* Description */}
          {source.description && (
            <p className="text-sm text-gray-600 mb-3">{source.description}</p>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={source.isActive ? 'success' : 'secondary'}>
              {source.isActive ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created: {formatDate(source.createdAt)}</div>
            {source.updatedAt && source.updatedAt !== source.createdAt && (
              <div>Updated: {formatDate(source.updatedAt)}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex flex-col gap-2 ml-4">
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              variant={source.isActive ? 'warning' : 'success'}
              size="sm"
            >
              <Power className="w-4 h-4 mr-1" />
              {isTogglingStatus
                ? 'Updating...'
                : source.isActive
                ? 'Deactivate'
                : 'Activate'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
