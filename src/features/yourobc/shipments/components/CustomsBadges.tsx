// src/features/yourobc/shipments/components/CustomsBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { CustomsInfo } from '@/convex/lib/yourobc/shipments/types'

interface CustomsBadgesProps {
  customsInfo?: CustomsInfo
  compact?: boolean
}

export const CustomsBadges: FC<CustomsBadgesProps> = ({ customsInfo, compact = false }) => {
  if (!customsInfo) return null

  const { hasExport, hasImport, hasTransit } = customsInfo

  // If no customs activities, show a simple badge
  if (!hasExport && !hasImport && !hasTransit) {
    return compact ? null : (
      <Badge variant="secondary" className="text-xs">
        No Customs
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {hasExport && (
        <Badge
          variant="warning"
          className="text-xs font-medium"
          title={customsInfo.exportDetails || 'Export customs required'}
        >
          {compact ? 'EXP' : '📤 Export'}
        </Badge>
      )}

      {hasImport && (
        <Badge
          variant="primary"
          className="text-xs font-medium"
          title={customsInfo.importDetails || 'Import customs required'}
        >
          {compact ? 'IMP' : '📥 Import'}
        </Badge>
      )}

      {hasTransit && (
        <Badge
          variant="secondary"
          className="text-xs font-medium"
          title={customsInfo.transitDetails || 'Transit customs required'}
        >
          {compact ? 'TRA' : '🔄 Transit'}
        </Badge>
      )}
    </div>
  )
}

/**
 * Compact version for table cells
 */
export const CustomsBadgesCompact: FC<CustomsBadgesProps> = (props) => {
  return <CustomsBadges {...props} compact={true} />
}

/**
 * Helper to determine if any customs activity exists
 */
export function hasAnyCustoms(customsInfo?: CustomsInfo): boolean {
  if (!customsInfo) return false
  return customsInfo.hasExport || customsInfo.hasImport || customsInfo.hasTransit
}

/**
 * Get customs summary text
 */
export function getCustomsSummary(customsInfo?: CustomsInfo): string {
  if (!customsInfo) return 'No customs'

  const activities: string[] = []
  if (customsInfo.hasExport) activities.push('Export')
  if (customsInfo.hasImport) activities.push('Import')
  if (customsInfo.hasTransit) activities.push('Transit')

  if (activities.length === 0) return 'No customs'
  if (activities.length === 1) return activities[0]
  if (activities.length === 2) return activities.join(' + ')
  return `${activities[0]} + ${activities.length - 1} more`
}
