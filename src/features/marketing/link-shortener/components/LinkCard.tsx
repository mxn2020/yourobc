// src/features/marketing/link-shortener/components/LinkCard.tsx

import { FC, useState } from 'react'
import { Card, Badge, Button } from '@/components/ui'
import { Link2, Copy, ExternalLink, BarChart3, Edit, Trash2, Check } from 'lucide-react'
import type { MarketingLink } from '../types'

interface LinkCardProps {
  link: MarketingLink
  onEdit: (link: MarketingLink) => void
  onDelete: (link: MarketingLink) => void
  onViewAnalytics: (link: MarketingLink) => void
}

export const LinkCard: FC<LinkCardProps> = ({
  link,
  onEdit,
  onDelete,
  onViewAnalytics,
}) => {
  const [copied, setCopied] = useState(false)

  const shortUrl = link.customDomain
    ? `${link.customDomain}/${link.shortCode}`
    : `${window.location.origin}/s/${link.shortCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'paused':
        return 'warning'
      case 'expired':
        return 'destructive'
      case 'archived':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">{link.title}</h3>
            <Badge variant={getStatusColor(link.status)}>{link.status}</Badge>
          </div>
          {link.description && (
            <p className="text-sm text-gray-600 mb-3">{link.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Short URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border">
              {shortUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Original URL</p>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
          >
            <span className="truncate">{link.originalUrl}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Clicks:</span>{' '}
            <span className="font-semibold">{link.totalClicks || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Unique:</span>{' '}
            <span className="font-semibold">{link.uniqueClicks || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewAnalytics(link)}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(link)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(link)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
