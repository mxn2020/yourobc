// src/features/yourobc/supporting/wiki/components/WikiEntryCard.tsx

import { FC, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import type { WikiEntryListItem } from '../types'
import { WIKI_TYPE_ICONS, WIKI_TYPE_LABELS, WIKI_STATUS_COLORS } from '../types'

interface WikiEntryCardProps {
  entry: WikiEntryListItem
  onView?: (entry: WikiEntryListItem) => void
  onEdit?: (entry: WikiEntryListItem) => void
  onPublish?: (entry: WikiEntryListItem) => void
  compact?: boolean
}

export const WikiEntryCard: FC<WikiEntryCardProps> = ({
  entry,
  onView,
  onEdit,
  onPublish,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleView = () => {
    if (onView) {
      onView(entry)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const contentPreview = entry.content.length > 150
    ? entry.content.substring(0, 150) + '...'
    : entry.content

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{WIKI_TYPE_ICONS[entry.type]}</span>
            <h3
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={handleView}
            >
              {entry.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              size="sm"
              className={WIKI_STATUS_COLORS[entry.status]}
            >
              {entry.status}
            </Badge>
            <span className="text-xs text-gray-500">{WIKI_TYPE_LABELS[entry.type]}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{entry.category}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{entry.timeAgo}</span>
            {entry.viewCount !== undefined && entry.viewCount > 0 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">👁 {entry.viewCount} views</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entry.canPublish && entry.status === 'draft' && onPublish && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPublish(entry)}
            >
              📤 Publish
            </Button>
          )}
          {entry.canEdit && onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(entry)}
            >
              ✏️ Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
          >
            {isExpanded ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {!compact && (
        <>
          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {entry.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Content Preview */}
          {isExpanded ? (
            <div className="mt-3 text-sm text-gray-700 prose max-w-none">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: entry.content.replace(/\n/g, '<br />') }}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-600 line-clamp-2">
              {contentPreview}
            </p>
          )}
        </>
      )}
    </div>
  )
}
