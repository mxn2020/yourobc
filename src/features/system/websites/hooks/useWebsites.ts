// src/features/boilerplate/websites/hooks/useWebsites.ts

import { websitesService } from '../services/WebsitesService'
import type { WebsitesListOptions, CreateWebsiteData, UpdateWebsiteData, WebsiteId } from '../types'

export function useWebsites(options?: WebsitesListOptions) {
  const websitesQuery = websitesService.useWebsites(options)
  const createWebsiteMutation = websitesService.useCreateWebsite()
  const updateWebsiteMutation = websitesService.useUpdateWebsite()
  const publishWebsiteMutation = websitesService.usePublishWebsite()
  const deleteWebsiteMutation = websitesService.useDeleteWebsite()

  const createWebsite = async (data: CreateWebsiteData) => {
    return createWebsiteMutation(data)
  }

  const updateWebsite = async (websiteId: WebsiteId, data: UpdateWebsiteData) => {
    return updateWebsiteMutation({ websiteId, data })
  }

  const publishWebsite = async (websiteId: WebsiteId) => {
    return publishWebsiteMutation({ websiteId })
  }

  const deleteWebsite = async (websiteId: WebsiteId) => {
    return deleteWebsiteMutation({ websiteId })
  }

  return {
    // Data
    websites: websitesQuery?.websites || [],
    total: websitesQuery?.total || 0,
    hasMore: websitesQuery?.hasMore || false,

    // Actions
    createWebsite,
    updateWebsite,
    publishWebsite,
    deleteWebsite,

    // State
    isLoading: !websitesQuery,
    isCreating: createWebsiteMutation.isPending,
    isUpdating: updateWebsiteMutation.isPending,
    isPublishing: publishWebsiteMutation.isPending,
    isDeleting: deleteWebsiteMutation.isPending,

    // Mutations
    mutations: {
      createWebsite: createWebsiteMutation,
      updateWebsite: updateWebsiteMutation,
      publishWebsite: publishWebsiteMutation,
      deleteWebsite: deleteWebsiteMutation,
    },
  }
}

export function useWebsite(websiteId: WebsiteId) {
  const websiteQuery = websitesService.useWebsite(websiteId)
  const updateWebsiteMutation = websitesService.useUpdateWebsite()
  const publishWebsiteMutation = websitesService.usePublishWebsite()
  const deleteWebsiteMutation = websitesService.useDeleteWebsite()

  const updateWebsite = async (data: UpdateWebsiteData) => {
    return updateWebsiteMutation({ websiteId, data })
  }

  const publishWebsite = async () => {
    return publishWebsiteMutation({ websiteId })
  }

  const deleteWebsite = async () => {
    return deleteWebsiteMutation({ websiteId })
  }

  return {
    website: websiteQuery,
    updateWebsite,
    publishWebsite,
    deleteWebsite,
    isLoading: !websiteQuery,
    isUpdating: updateWebsiteMutation.isPending,
    isPublishing: publishWebsiteMutation.isPending,
    isDeleting: deleteWebsiteMutation.isPending,
  }
}
