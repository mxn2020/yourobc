// src/features/boilerplate/websites/pages/WebsitesPage.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWebsites } from '../hooks/useWebsites'
import { WebsiteCard } from '../components/WebsiteCard'
import { WebsiteForm } from '../components/WebsiteForm'
import type { CreateWebsiteData, Website } from '../types'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from '@/features/boilerplate/i18n'

export function WebsitesPage() {
  const { t } = useTranslation('websites')
  const navigate = useNavigate()
  const { websites, createWebsite, publishWebsite, deleteWebsite, isLoading, isCreating } = useWebsites()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateWebsite = async (data: CreateWebsiteData) => {
    try {
      await createWebsite(data)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create website:', error)
    }
  }

  const handlePublish = async (websiteId: string) => {
    try {
      await publishWebsite(websiteId as any)
    } catch (error) {
      console.error('Failed to publish website:', error)
    }
  }

  const handleDelete = async (websiteId: string) => {
    if (confirm(t('messages.deleteConfirm'))) {
      try {
        await deleteWebsite(websiteId as any)
      } catch (error) {
        console.error('Failed to delete website:', error)
      }
    }
  }

  if (isLoading) {
    return <div className="p-8">{t('websites.loading')}</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('websites.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('websites.description')}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>{t('websites.create')}</Button>
      </div>

      {websites.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">{t('websites.empty')}</h2>
          <p className="text-muted-foreground mb-4">{t('websites.emptyDescription')}</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>{t('websites.create')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website: Website) => (
            <WebsiteCard
              key={website._id}
              website={website}
              onView={() => navigate({ to: `/websites/${website._id}` })}
              onEdit={() => navigate({ to: `/websites/${website._id}/edit` })}
              onPublish={() => handlePublish(website._id)}
              onDelete={() => handleDelete(website._id)}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('websites.create')}</DialogTitle>
            <DialogDescription>{t('websites.createDescription')}</DialogDescription>
          </DialogHeader>
          <WebsiteForm
            onSubmit={handleCreateWebsite}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
