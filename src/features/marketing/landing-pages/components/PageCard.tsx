// src/features/marketing/landing-pages/components/PageCard.tsx

import { FC } from 'react'
import { Card, Badge, Button } from '@/components/ui'
import { FileText, ExternalLink, Edit, Trash2, Eye, BarChart3 } from 'lucide-react'
import type { LandingPage } from '../types'

interface PageCardProps {
  page: LandingPage
  onEdit: (page: LandingPage) => void
  onDelete: (page: LandingPage) => void
  onPreview: (page: LandingPage) => void
}

export const PageCard: FC<PageCardProps> = ({
  page,
  onEdit,
  onDelete,
  onPreview,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'secondary'
      case 'scheduled':
        return 'warning'
      case 'archived':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const pageUrl = page.customDomain
    ? `${page.customDomain}/${page.slug}`
    : `${window.location.origin}/p/${page.slug}`

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">{page.title}</h3>
            <Badge variant={getStatusColor(page.status)}>{page.status}</Badge>
          </div>
          {page.description && (
            <p className="text-sm text-gray-600 mb-3">{page.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">URL Slug</p>
          <code className="text-sm bg-gray-100 px-3 py-2 rounded border block">
            /{page.slug}
          </code>
        </div>

        {page.status === 'published' && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Live URL</p>
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <span className="truncate">{pageUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500">Views:</span>{' '}
            <span className="font-semibold">{page.totalViews || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">Conversions:</span>{' '}
            <span className="font-semibold">{page.totalConversions || 0}</span>
          </div>
          {page.conversionRate !== undefined && (
            <div>
              <span className="text-gray-500">Rate:</span>{' '}
              <span className="font-semibold">
                {page.conversionRate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(page)}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(page)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(page)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
