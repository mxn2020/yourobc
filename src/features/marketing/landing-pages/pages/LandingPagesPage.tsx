// src/features/marketing/landing-pages/pages/LandingPagesPage.tsx

import { FC, useState } from 'react'
import { Button, Input, EmptyState } from '@/components/ui'
import { Plus, Search, FileText } from 'lucide-react'
import { PageCard } from '../components/PageCard'
import { PageForm } from '../components/PageForm'
import {
  usePages,
  usePageStats,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
} from '../hooks/usePages'
import type { LandingPage, CreatePageData } from '../types'
import { DeleteConfirmationModal } from '@/components/ui/Modals/DeleteConfirmationModal'

export const LandingPagesPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<LandingPage | undefined>()
  const [deletingPage, setDeletingPage] = useState<LandingPage | undefined>()

  const { data: pagesData } = usePages({ limit: 100 })
  const { data: stats } = usePageStats()
  const createPage = useCreatePage()
  const updatePage = useUpdatePage()
  const deletePage = useDeletePage()

  const filteredPages = pagesData?.pages?.filter(
    (page: LandingPage) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreatePage = async (data: CreatePageData) => {
    try {
      await createPage.mutateAsync({ data })
      setIsFormOpen(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleUpdatePage = async (data: CreatePageData) => {
    if (!editingPage) return
    try {
      await updatePage.mutateAsync({
        pageId: editingPage._id,
        updates: data,
      })
      setEditingPage(undefined)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleDeletePage = async () => {
    if (!deletingPage) return
    try {
      await deletePage.mutateAsync({ pageId: deletingPage._id })
      setDeletingPage(undefined)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handlePreview = (page: LandingPage) => {
    // TODO: Open preview in new window
    console.log('Preview page:', page)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-600" />
              Landing Page Builder
            </h1>
            <p className="text-gray-600 mt-2">
              Create conversion-optimized landing pages with drag-and-drop builder
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Page
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600">Total Pages</p>
            <p className="text-2xl font-bold">{stats.totalPages || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold">{stats.publishedPages || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold">{stats.totalViews || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-gray-600">Avg. Conversion</p>
            <p className="text-2xl font-bold">
              {stats.totalViews ? ((stats.totalConversions || 0) / stats.totalViews * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPages && filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPages.map((page: LandingPage) => (
            <PageCard
              key={page._id}
              page={page}
              onEdit={setEditingPage}
              onDelete={setDeletingPage}
              onPreview={handlePreview}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No pages found"
          description={
            searchTerm
              ? 'Try adjusting your search'
              : 'Create your first landing page to get started'
          }
          action={
            !searchTerm
              ? {
                  label: 'Create Page',
                  onClick: () => setIsFormOpen(true),
                  icon: Plus,
                }
              : undefined
          }
        />
      )}

      <PageForm
        page={editingPage}
        isOpen={isFormOpen || !!editingPage}
        onClose={() => {
          setIsFormOpen(false)
          setEditingPage(undefined)
        }}
        onSubmit={editingPage ? handleUpdatePage : handleCreatePage}
        isSubmitting={createPage.isPending || updatePage.isPending}
      />

      {deletingPage && (
        <DeleteConfirmationModal
          open={true}
          onOpenChange={(open) => !open && setDeletingPage(undefined)}
          onConfirm={handleDeletePage}
          title="Delete Landing Page"
          description={`Are you sure you want to delete "${deletingPage.title}"? This action cannot be undone.`}
          isLoading={deletePage.isPending}
        />
      )}
    </div>
  )
}
