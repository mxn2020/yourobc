// src/features/boilerplate/supporting/wiki/services/WikiService.ts

import type { WikiEntry, CreateWikiEntryData } from '../types';
import { MAX_CONTENT_LENGTH } from '../../shared/constants';

export class WikiService {
  static validateWikiEntryData(data: Partial<CreateWikiEntryData>): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > MAX_CONTENT_LENGTH.SHORT_TEXT) {
      errors.push(`Title must be less than ${MAX_CONTENT_LENGTH.SHORT_TEXT} characters`);
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Content is required');
    } else if (data.content.length > MAX_CONTENT_LENGTH.VERY_LONG_TEXT) {
      errors.push(`Content must be less than ${MAX_CONTENT_LENGTH.VERY_LONG_TEXT} characters`);
    }

    if (!data.category || data.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (data.summary && data.summary.length > MAX_CONTENT_LENGTH.MEDIUM_TEXT) {
      errors.push(`Summary must be less than ${MAX_CONTENT_LENGTH.MEDIUM_TEXT} characters`);
    }

    return errors;
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static extractSearchableText(entry: WikiEntry): string {
    return `${entry.title} ${entry.summary || ''} ${entry.content} ${entry.tags?.join(' ') || ''}`.toLowerCase();
  }

  static getStatusBadgeVariant(status: WikiEntry['status']): 'primary' | 'secondary' | 'destructive' | 'outline' {
    const variants = {
      draft: 'secondary' as const,
      published: 'primary' as const,
      archived: 'outline' as const,
    };
    return variants[status];
  }

  static getVisibilityIcon(visibility: WikiEntry['visibility']): string {
    const icons = {
      public: '🌍',
      internal: '🏢',
      private: '🔒',
    };
    return icons[visibility];
  }

  static filterByCategory(entries: WikiEntry[], category: string): WikiEntry[] {
    return entries.filter((entry) => entry.category === category);
  }

  static filterByTags(entries: WikiEntry[], tags: string[]): WikiEntry[] {
    return entries.filter((entry) =>
      tags.some((tag) => entry.tags?.includes(tag))
    );
  }

  static filterByStatus(entries: WikiEntry[], status: WikiEntry['status']): WikiEntry[] {
    return entries.filter((entry) => entry.status === status);
  }

  static searchEntries(entries: WikiEntry[], query: string): WikiEntry[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return entries;

    return entries.filter((entry) =>
      entry.searchableContent?.includes(lowerQuery) ||
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.summary?.toLowerCase().includes(lowerQuery)
    );
  }

  static sortByTitle(entries: WikiEntry[], ascending = true): WikiEntry[] {
    return [...entries].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return ascending ? comparison : -comparison;
    });
  }

  static sortByDate(entries: WikiEntry[], ascending = false): WikiEntry[] {
    return [...entries].sort((a, b) => {
      const diff = a.createdAt - b.createdAt;
      return ascending ? diff : -diff;
    });
  }

  static sortByUpdated(entries: WikiEntry[], ascending = false): WikiEntry[] {
    return [...entries].sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;
      const diff = aTime - bTime;
      return ascending ? diff : -diff;
    });
  }

  static getEntriesStats(entries: WikiEntry[]): {
    total: number;
    draft: number;
    published: number;
    archived: number;
    byCategory: Record<string, number>;
    byVisibility: Record<string, number>;
  } {
    const stats = {
      total: entries.length,
      draft: 0,
      published: 0,
      archived: 0,
      byCategory: {} as Record<string, number>,
      byVisibility: {} as Record<string, number>,
    };

    entries.forEach((entry) => {
      if (entry.status === 'draft') stats.draft++;
      if (entry.status === 'published') stats.published++;
      if (entry.status === 'archived') stats.archived++;

      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
      stats.byVisibility[entry.visibility] = (stats.byVisibility[entry.visibility] || 0) + 1;
    });

    return stats;
  }

  static getCategoryTree(entries: WikiEntry[]): Record<string, number> {
    const categories: Record<string, number> = {};
    entries.forEach((entry) => {
      categories[entry.category] = (categories[entry.category] || 0) + 1;
    });
    return categories;
  }

  static getAllTags(entries: WikiEntry[]): string[] {
    const tagsSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }
}
