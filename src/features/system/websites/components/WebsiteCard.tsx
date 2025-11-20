// src/features/system/websites/components/WebsiteCard.tsx

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Website } from '../types'
import { WEBSITE_STATUS } from '../constants'
import { useTranslation } from '@/features/system/i18n'

interface WebsiteCardProps {
  website: Website
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onPublish?: () => void
}

export function WebsiteCard({ website, onEdit, onDelete, onView, onPublish }: WebsiteCardProps) {
  const { t } = useTranslation('websites')

  const statusColors = {
    [WEBSITE_STATUS.DRAFT]: 'bg-gray-500',
    [WEBSITE_STATUS.PUBLISHED]: 'bg-green-500',
    [WEBSITE_STATUS.ARCHIVED]: 'bg-gray-400',
    [WEBSITE_STATUS.MAINTENANCE]: 'bg-yellow-500',
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{website.name}</CardTitle>
            {website.description && (
              <CardDescription className="mt-2">{website.description}</CardDescription>
            )}
          </div>
          <Badge className={statusColors[website.status]}>{t(`status.${website.status}`)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {website.domain && (
            <div>
              <span className="font-medium">{t('fields.domain')}:</span> {website.domain}
            </div>
          )}
          {website.subdomain && (
            <div>
              <span className="font-medium">{t('fields.subdomain')}:</span> {website.subdomain}
            </div>
          )}
          <div>
            <span className="font-medium">{t('fields.visibility')}:</span>{' '}
            <Badge variant="outline">{t(`visibility.${website.visibility}`)}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={onView}>
            {t('websites.view')}
          </Button>
        )}
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            {t('websites.edit')}
          </Button>
        )}
        {onPublish && website.status === WEBSITE_STATUS.DRAFT && (
          <Button variant="default" size="sm" onClick={onPublish}>
            {t('websites.publish')}
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete}>
            {t('websites.delete')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
