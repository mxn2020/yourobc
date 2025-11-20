// src/features/yourobc/shipments/components/DocumentStatusIndicator.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { DocumentStatus } from '../types'

interface DocumentStatusIndicatorProps {
  documentStatus?: DocumentStatus
  serviceType: 'OBC' | 'NFO'
  compact?: boolean
}

type DocStatus = 'missing' | 'pending' | 'complete'

const getStatusColor = (status: DocStatus): 'danger' | 'warning' | 'success' => {
  switch (status) {
    case 'missing':
      return 'danger'
    case 'pending':
      return 'warning'
    case 'complete':
      return 'success'
  }
}

const getStatusIcon = (status: DocStatus): string => {
  switch (status) {
    case 'missing':
      return '🔴'
    case 'pending':
      return '🟡'
    case 'complete':
      return '🟢'
  }
}

const getStatusLabel = (status: DocStatus): string => {
  switch (status) {
    case 'missing':
      return 'Missing'
    case 'pending':
      return 'Pending'
    case 'complete':
      return 'Complete'
  }
}

interface DocumentItemProps {
  label: string
  status: DocStatus
  compact: boolean
}

const DocumentItem: FC<DocumentItemProps> = ({ label, status, compact }) => {
  const icon = getStatusIcon(status)
  const statusLabel = getStatusLabel(status)
  const color = getStatusColor(status)

  if (compact) {
    return (
      <div className="flex items-center gap-1" title={`${label}: ${statusLabel}`}>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span>{icon}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Badge variant={color} className="text-xs">
        {icon} {statusLabel}
      </Badge>
    </div>
  )
}

export const DocumentStatusIndicator: FC<DocumentStatusIndicatorProps> = ({
  documentStatus,
  serviceType,
  compact = false,
}) => {
  // Default all documents to missing if not provided
  const docs: DocumentStatus = documentStatus || {
    awb: 'missing',
    hawb: 'missing',
    mawb: 'missing',
    pod: 'missing',
  }

  const items = []

  // AWB is required for both OBC and NFO
  items.push({ label: 'AWB', status: docs.awb })

  // HAWB and MAWB only for NFO
  if (serviceType === 'NFO') {
    items.push({ label: 'HAWB', status: docs.hawb || 'missing' })
    items.push({ label: 'MAWB', status: docs.mawb || 'missing' })
  }

  // POD is required for both
  items.push({ label: 'PoD', status: docs.pod })

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((item) => (
          <DocumentItem
            key={item.label}
            label={item.label}
            status={item.status}
            compact={true}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Document Status</h4>
        {docs.lastUpdated && (
          <span className="text-xs text-muted-foreground">
            Updated {new Date(docs.lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <DocumentItem
            key={item.label}
            label={item.label}
            status={item.status}
            compact={false}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Compact version for table cells
 */
export const DocumentStatusIndicatorCompact: FC<DocumentStatusIndicatorProps> = (props) => {
  return <DocumentStatusIndicator {...props} compact={true} />
}

/**
 * Calculate overall document completion percentage
 */
export function getDocumentCompletionPercentage(
  documentStatus: DocumentStatus | undefined,
  serviceType: 'OBC' | 'NFO'
): number {
  if (!documentStatus) return 0

  const requiredDocs = serviceType === 'OBC' ? 2 : 4 // AWB + POD for OBC, AWB + HAWB + MAWB + POD for NFO
  let completedDocs = 0

  if (documentStatus.awb === 'complete') completedDocs++
  if (documentStatus.pod === 'complete') completedDocs++

  if (serviceType === 'NFO') {
    if (documentStatus.hawb === 'complete') completedDocs++
    if (documentStatus.mawb === 'complete') completedDocs++
  }

  return Math.round((completedDocs / requiredDocs) * 100)
}

/**
 * Check if all required documents are complete
 */
export function areAllDocumentsComplete(
  documentStatus: DocumentStatus | undefined,
  serviceType: 'OBC' | 'NFO'
): boolean {
  if (!documentStatus) return false

  const awbComplete = documentStatus.awb === 'complete'
  const podComplete = documentStatus.pod === 'complete'

  if (serviceType === 'OBC') {
    return awbComplete && podComplete
  }

  const hawbComplete = documentStatus.hawb === 'complete'
  const mawbComplete = documentStatus.mawb === 'complete'

  return awbComplete && hawbComplete && mawbComplete && podComplete
}

/**
 * Get document status summary text
 */
export function getDocumentStatusSummary(
  documentStatus: DocumentStatus | undefined,
  serviceType: 'OBC' | 'NFO'
): string {
  const percentage = getDocumentCompletionPercentage(documentStatus, serviceType)

  if (percentage === 0) return 'No documents'
  if (percentage === 100) return 'All complete'
  return `${percentage}% complete`
}

/**
 * Get missing documents list
 */
export function getMissingDocuments(
  documentStatus: DocumentStatus | undefined,
  serviceType: 'OBC' | 'NFO'
): string[] {
  if (!documentStatus) return serviceType === 'OBC' ? ['AWB', 'PoD'] : ['AWB', 'HAWB', 'MAWB', 'PoD']

  const missing: string[] = []

  if (documentStatus.awb !== 'complete') missing.push('AWB')
  if (serviceType === 'NFO' && documentStatus.hawb !== 'complete') missing.push('HAWB')
  if (serviceType === 'NFO' && documentStatus.mawb !== 'complete') missing.push('MAWB')
  if (documentStatus.pod !== 'complete') missing.push('PoD')

  return missing
}
