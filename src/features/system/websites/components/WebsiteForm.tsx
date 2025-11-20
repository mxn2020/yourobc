// src/features/system/websites/components/WebsiteForm.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CreateWebsiteData, UpdateWebsiteData } from '../types'
import { WEBSITE_VISIBILITY } from '../constants'
import { useTranslation } from '@/features/system/i18n'

interface WebsiteFormProps {
  initialData?: Partial<UpdateWebsiteData>
  onSubmit: (data: CreateWebsiteData | UpdateWebsiteData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function WebsiteForm({ initialData = {}, onSubmit, onCancel, isLoading }: WebsiteFormProps) {
  const { t } = useTranslation('websites')

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    domain: initialData.domain || '',
    subdomain: initialData.subdomain || '',
    visibility: initialData.visibility || WEBSITE_VISIBILITY.PRIVATE,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t('fields.name')} *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder={t('form.placeholders.name')}
        />
      </div>

      <div>
        <Label htmlFor="description">{t('fields.description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('form.placeholders.description')}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="subdomain">{t('fields.subdomain')}</Label>
        <Input
          id="subdomain"
          value={formData.subdomain}
          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
          placeholder={t('form.placeholders.subdomain')}
        />
      </div>

      <div>
        <Label htmlFor="domain">{t('fields.domain')}</Label>
        <Input
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          placeholder={t('form.placeholders.domain')}
        />
      </div>

      <div>
        <Label htmlFor="visibility">{t('fields.visibility')}</Label>
        <Select
          value={formData.visibility}
          onValueChange={(value) => setFormData({ ...formData, visibility: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={WEBSITE_VISIBILITY.PRIVATE}>{t('visibility.private')}</SelectItem>
            <SelectItem value={WEBSITE_VISIBILITY.TEAM}>{t('visibility.team')}</SelectItem>
            <SelectItem value={WEBSITE_VISIBILITY.PUBLIC}>{t('visibility.public')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('form.buttons.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('form.buttons.saving') : t('form.buttons.save')}
        </Button>
      </div>
    </form>
  )
}
