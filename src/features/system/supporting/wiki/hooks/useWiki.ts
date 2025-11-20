// src/features/system/supporting/wiki/hooks/useWiki.ts

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export function useWikiEntries() {
  return useQuery(
    api.lib.system.supporting.wiki.queries.getWikiEntries,
    {}
  );
}

export function useWikiEntry(entryId?: Id<'wikiEntries'>) {
  return useQuery(
    api.lib.system.supporting.wiki.queries.getWikiEntry,
    entryId ? { entryId } : 'skip'
  );
}

export function useWikiEntryBySlug(slug?: string) {
  return useQuery(
    api.lib.system.supporting.wiki.queries.getWikiEntryBySlug,
    slug ? { slug } : 'skip'
  );
}

export function useWikiEntriesByCategory(category: string) {
  return useQuery(
    api.lib.system.supporting.wiki.queries.getWikiEntriesByCategory,
    category ? { category } : 'skip'
  );
}

export function useSearchWiki(searchQuery?: string) {
  return useQuery(
    api.lib.system.supporting.wiki.queries.searchWikiEntries,
    searchQuery ? { searchQuery } : 'skip'
  );
}

export function useWikiCategories() {
  return useQuery(
    api.lib.system.supporting.wiki.queries.getWikiCategories,
    {}
  );
}

export function useCreateWikiEntry() {
  return useMutation(api.lib.system.supporting.wiki.mutations.createWikiEntry);
}

export function useUpdateWikiEntry() {
  return useMutation(api.lib.system.supporting.wiki.mutations.updateWikiEntry);
}

export function usePublishWikiEntry() {
  return useMutation(api.lib.system.supporting.wiki.mutations.publishWikiEntry);
}

export function useArchiveWikiEntry() {
  return useMutation(api.lib.system.supporting.wiki.mutations.archiveWikiEntry);
}

export function useDeleteWikiEntry() {
  return useMutation(api.lib.system.supporting.wiki.mutations.deleteWikiEntry);
}
