// convex/lib/system/blog/categories/utils.ts
// Validation functions and utility helpers for blog categories module

import { BLOG_CATEGORIES_CONSTANTS } from './constants';
import type { CreateBlogCategoryData, UpdateBlogCategoryData, BlogCategory, BlogCategoryTreeNode } from './types';

/**
 * Validate blog category data for creation/update
 */
export function validateBlogCategoryData(
  data: Partial<CreateBlogCategoryData | UpdateBlogCategoryData>
): string[] {
  const errors: string[] = [];

  // Validate title
  if (data.title !== undefined) {
    const trimmed = data.title.trim();

    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length < BLOG_CATEGORIES_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(
        `Title must be at least ${BLOG_CATEGORIES_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} characters`
      );
    } else if (trimmed.length > BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(
        `Title cannot exceed ${BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
      );
    } else if (!BLOG_CATEGORIES_CONSTANTS.VALIDATION.TITLE_PATTERN.test(trimmed)) {
      errors.push('Title contains invalid characters');
    }
  }

  // Validate slug
  if (data.slug !== undefined) {
    const trimmed = data.slug.trim();

    if (!trimmed) {
      errors.push('Slug is required');
    } else if (trimmed.length > BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
      errors.push(
        `Slug cannot exceed ${BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`
      );
    } else if (!BLOG_CATEGORIES_CONSTANTS.VALIDATION.SLUG_PATTERN.test(trimmed)) {
      errors.push('Slug must be lowercase alphanumeric with hyphens only');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description cannot exceed ${BLOG_CATEGORIES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  return errors;
}

/**
 * Format blog category display title
 */
export function formatBlogCategoryDisplayTitle(category: {
  title: string;
  status?: string;
}): string {
  const statusBadge = category.status ? ` [${category.status.toUpperCase()}]` : '';
  return `${category.title}${statusBadge}`;
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if blog category is editable
 */
export function isBlogCategoryEditable(category: {
  status: string;
  deletedAt?: number;
}): boolean {
  if (category.deletedAt) return false;
  return category.status !== 'archived';
}

/**
 * Build category tree from flat list
 */
export function buildCategoryTree(
  categories: BlogCategory[],
  parentId: string | null = null,
  level: number = 0
): BlogCategoryTreeNode[] {
  const children = categories.filter((cat) =>
    parentId === null ? !cat.parentId : cat.parentId === parentId
  );

  return children.map((cat) => ({
    ...cat,
    children: buildCategoryTree(categories, cat._id, level + 1),
    level,
  }));
}

/**
 * Get all descendant category IDs
 */
export function getDescendantCategoryIds(
  categories: BlogCategory[],
  categoryId: string
): string[] {
  const descendants: string[] = [];
  const children = categories.filter((cat) => cat.parentId === categoryId);

  for (const child of children) {
    descendants.push(child._id);
    descendants.push(...getDescendantCategoryIds(categories, child._id));
  }

  return descendants;
}

/**
 * Get category depth
 */
export function calculateCategoryDepth(
  categories: BlogCategory[],
  categoryId: string
): number {
  const category = categories.find((cat) => cat._id === categoryId);
  if (!category || !category.parentId) return 0;

  return 1 + calculateCategoryDepth(categories, category.parentId);
}

/**
 * Build category path (e.g., "parent/child/grandchild")
 */
export function buildCategoryPath(
  categories: BlogCategory[],
  categoryId: string
): string {
  const category = categories.find((cat) => cat._id === categoryId);
  if (!category) return '';

  if (!category.parentId) {
    return category.slug;
  }

  const parentPath = buildCategoryPath(categories, category.parentId);
  return `${parentPath}/${category.slug}`;
}

/**
 * Check for circular parent reference
 */
export function hasCircularParentReference(
  categories: BlogCategory[],
  categoryId: string,
  newParentId: string
): boolean {
  if (categoryId === newParentId) return true;

  const descendants = getDescendantCategoryIds(categories, categoryId);
  return descendants.includes(newParentId);
}
