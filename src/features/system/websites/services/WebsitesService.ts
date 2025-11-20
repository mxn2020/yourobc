// src/features/boilerplate/websites/services/WebsitesService.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import type { WebsiteId, WebsitesListOptions, PagesListOptions } from '../types'

class WebsitesService {
  // Query options for SSR cache hits
  getWebsitesQueryOptions(options?: WebsitesListOptions) {
    return queryOptions({
      queryKey: ['websites', 'list', options],
      queryFn: () => ({ websites: [], total: 0, hasMore: false }),
    })
  }

  getWebsiteQueryOptions(websiteId: WebsiteId) {
    return queryOptions({
      queryKey: ['websites', 'detail', websiteId],
      queryFn: () => null,
    })
  }

  getWebsitePagesQueryOptions(websiteId: WebsiteId, options?: PagesListOptions) {
    return queryOptions({
      queryKey: ['websites', websiteId, 'pages', options],
      queryFn: () => ({ pages: [], total: 0, hasMore: false }),
    })
  }

  // Hooks for data fetching
  useWebsites(options?: WebsitesListOptions) {
    return useQuery(api.lib.boilerplate.websites.queries.getWebsites, { options })
  }

  useWebsite(websiteId: WebsiteId) {
    return useQuery(api.lib.boilerplate.websites.queries.getWebsite, { websiteId })
  }

  useWebsitePages(websiteId: WebsiteId, options?: PagesListOptions) {
    return useQuery(api.lib.boilerplate.websites.queries.getWebsitePages, {
      websiteId,
      options,
    })
  }

  usePageWithSections(pageId: string) {
    return useQuery(api.lib.boilerplate.websites.queries.getPageWithSections, {
      pageId: pageId as any,
    })
  }

  useWebsiteSections(websiteId: WebsiteId, type?: string) {
    return useQuery(api.lib.boilerplate.websites.queries.getWebsiteSections, {
      websiteId,
      type,
    })
  }

  useThemes(includeSystem = true, includePublic = true) {
    return useQuery(api.lib.boilerplate.websites.queries.getThemes, {
      includeSystem,
      includePublic,
    })
  }

  useTemplates(category?: string, includeSystem = true, includePublic = true) {
    return useQuery(api.lib.boilerplate.websites.queries.getTemplates, {
      category,
      includeSystem,
      includePublic,
    })
  }

  useWebsiteStats(targetUserId?: string) {
    return useQuery(api.lib.boilerplate.websites.queries.getWebsiteStats, {
      targetUserId: targetUserId as any,
    })
  }

  // Hooks for mutations
  useCreateWebsite() {
    return useMutation(api.lib.boilerplate.websites.mutations.createWebsite)
  }

  useUpdateWebsite() {
    return useMutation(api.lib.boilerplate.websites.mutations.updateWebsite)
  }

  usePublishWebsite() {
    return useMutation(api.lib.boilerplate.websites.mutations.publishWebsite)
  }

  useDeleteWebsite() {
    return useMutation(api.lib.boilerplate.websites.mutations.deleteWebsite)
  }

  useCreatePage() {
    return useMutation(api.lib.boilerplate.websites.mutations.createPage)
  }

  useUpdatePage() {
    return useMutation(api.lib.boilerplate.websites.mutations.updatePage)
  }

  usePublishPage() {
    return useMutation(api.lib.boilerplate.websites.mutations.publishPage)
  }

  useDeletePage() {
    return useMutation(api.lib.boilerplate.websites.mutations.deletePage)
  }

  useCreateSection() {
    return useMutation(api.lib.boilerplate.websites.mutations.createSection)
  }

  useUpdateSection() {
    return useMutation(api.lib.boilerplate.websites.mutations.updateSection)
  }

  useDeleteSection() {
    return useMutation(api.lib.boilerplate.websites.mutations.deleteSection)
  }

  useAddCollaborator() {
    return useMutation(api.lib.boilerplate.websites.mutations.addCollaborator)
  }

  useRemoveCollaborator() {
    return useMutation(api.lib.boilerplate.websites.mutations.removeCollaborator)
  }
}

export const websitesService = new WebsitesService()
