// convex/lib/yourobc/supporting/wiki_entries/utils.ts
// Validation + helpers for wiki entries module

import { WIKI_ENTRIES_CONSTANTS } from './constants';
import type { CreateWikiEntryData, UpdateWikiEntryData } from './types';

/**
 * Trim all string fields in wiki entry data
 * Generic typing ensures type safety without `any`
 */
export function trimWikiEntryData<
  T extends Partial<CreateWikiEntryData | UpdateWikiEntryData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.title === "string") {
    trimmed.title = trimmed.title.trim() as T["title"];
  }

  if (typeof trimmed.slug === "string") {
    trimmed.slug = trimmed.slug.trim() as T["slug"];
  }

  if (typeof trimmed.content === "string") {
    trimmed.content = trimmed.content.trim() as T["content"];
  }

  if (typeof trimmed.category === "string") {
    trimmed.category = trimmed.category.trim() as T["category"];
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);

    trimmed.tags = nextTags as T["tags"];
  }

  return trimmed;
}

/**
 * Validate wiki entry data
 * Returns array of error messages
 */
export function validateWikiEntryData(
  data: Partial<CreateWikiEntryData | UpdateWikiEntryData>
): string[] {
  const errors: string[] = [];

  // Validate title
  if (data.title !== undefined) {
    if (typeof data.title !== "string") {
      errors.push("Title must be a string");
    } else {
      const title = data.title.trim();
      if (!title) {
        errors.push("Wiki title is required");
      } else if (title.length > WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
        errors.push(
          `Wiki title cannot exceed ${WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
        );
      }
    }
  }

  // Validate slug
  if (data.slug !== undefined) {
    if (typeof data.slug !== "string") {
      errors.push("Slug must be a string");
    } else {
      const slug = data.slug.trim();
      if (!slug) {
        errors.push("Wiki slug is required");
      } else if (slug.length > WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
        errors.push(
          `Wiki slug cannot exceed ${WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`
        );
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        errors.push("Wiki slug must be lowercase with hyphens (kebab-case)");
      }
    }
  }

  // Validate content
  if (data.content !== undefined) {
    if (typeof data.content !== "string") {
      errors.push("Content must be a string");
    } else {
      const content = data.content.trim();
      if (!content) {
        errors.push("Wiki content is required");
      } else if (content.length > WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
        errors.push(
          `Wiki content cannot exceed ${WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`
        );
      }
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else {
      if (data.tags.length > WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push(
          `Cannot exceed ${WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TAGS} tags`
        );
      }

      const invalidTag = data.tags.find(
        (t) =>
          !t ||
          (typeof t === "string" && t.length > WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TAG_LENGTH)
      );
      if (invalidTag) {
        errors.push(
          `Tag cannot exceed ${WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TAG_LENGTH} characters`
        );
      }
    }
  }

  return errors;
}

/**
 * Generate URL-safe slug from title
 */
export function generateWikiSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple hyphens
    .slice(0, WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH);
}

/**
 * Build searchable text from entry data
 */
export function buildWikiSearchText(
  title: string,
  content: string,
  tags: string[] = []
): string {
  return [title, content, ...tags].join(" ").toLowerCase();
}

/**
 * Extract search terms from text
 */
export function extractWikiSearchTerms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 2);
}
