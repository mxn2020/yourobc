// src/features/marketing/link-shortener/pages/LinkShortenerPage.tsx

import { FC, useState } from 'react'
import { Button, Input, EmptyState, Loading, ErrorState } from '@/components/ui'
import { Plus, Search, Link2 } from 'lucide-react'
import { LinkStats } from '../components/LinkStats'
import { LinkCard } from '../components/LinkCard'
import { LinkForm } from '../components/LinkForm'
import {
  useLinks,
  useLinkStats,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
} from '../hooks/useLinks'
import type { MarketingLink, CreateLinkData } from '../types'
import { DeleteConfirmationModal } from '@/components/ui/Modals/DeleteConfirmationModal'

export const LinkShortenerPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<MarketingLink | undefined>()
  const [deletingLink, setDeletingLink] = useState<MarketingLink | undefined>()

  // Data hooks
  const { data: linksData } = useLinks({ limit: 100 })
  const { data: stats } = useLinkStats()

  // Mutation hooks
  const createLink = useCreateLink()
  const updateLink = useUpdateLink()
  const deleteLink = useDeleteLink()

  // Filter links based on search
  const filteredLinks = linksData?.items?.filter(
    (link: MarketingLink) =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateLink = async (data: CreateLinkData) => {
    try {
      await createLink.mutateAsync({ data })
      setIsFormOpen(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleUpdateLink = async (data: CreateLinkData) => {
    if (!editingLink) return

    try {
      await updateLink.mutateAsync({
        linkId: editingLink._id,
        updates: data,
      })
      setEditingLink(undefined)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleDeleteLink = async () => {
    if (!deletingLink) return

    try {
      await deleteLink.mutateAsync({
        linkId: deletingLink._id,
      })
      setDeletingLink(undefined)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleViewAnalytics = (link: MarketingLink) => {
    // TODO: Navigate to analytics page
    console.log('View analytics for:', link)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Link2 className="h-8 w-8 text-blue-600" />
              Link Shortener & Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Create and track short links with detailed analytics
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Link
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-8">
          <LinkStats
            totalLinks={stats.totalLinks || 0}
            activeLinks={stats.activeLinks || 0}
            totalClicks={stats.totalClicks || 0}
            avgClicksPerLink={stats.avgClicksPerLink || 0}
          />
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Links Grid */}
      {filteredLinks && filteredLinks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLinks.map((link: MarketingLink) => (
            <LinkCard
              key={link._id}
              link={link}
              onEdit={setEditingLink}
              onDelete={setDeletingLink}
              onViewAnalytics={handleViewAnalytics}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Link2}
          title="No links found"
          description={
            searchTerm
              ? 'Try adjusting your search'
              : 'Create your first short link to get started'
          }
          action={
            !searchTerm ? (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Link
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Create/Edit Form */}
      <LinkForm
        link={editingLink}
        isOpen={isFormOpen || !!editingLink}
        onClose={() => {
          setIsFormOpen(false)
          setEditingLink(undefined)
        }}
        onSubmit={editingLink ? handleUpdateLink : handleCreateLink}
        isSubmitting={createLink.isPending || updateLink.isPending}
      />

      {/* Delete Confirmation */}
      {deletingLink && (
        <DeleteConfirmationModal
          isOpen={true}
          onClose={() => setDeletingLink(undefined)}
          onConfirm={handleDeleteLink}
          title="Delete Link"
          description={`Are you sure you want to delete "${deletingLink.title}"? This action cannot be undone.`}
          isDeleting={deleteLink.isPending}
        />
      )}
    </div>
  )
}
