// convex/lib/system/blog/media/utils.ts
import { BLOG_MEDIA_CONSTANTS } from './constants';
import type { CreateBlogMediaData, UpdateBlogMediaData } from './types';

export function validateBlogMediaData(data: Partial<CreateBlogMediaData | UpdateBlogMediaData>): string[] {
  const errors: string[] = [];
  if (data.title !== undefined && (!data.title.trim() || data.title.trim().length > BLOG_MEDIA_CONSTANTS.LIMITS.MAX_TITLE_LENGTH)) {
    errors.push('Invalid title');
  }
  if (data.alt !== undefined && data.alt.trim() && data.alt.trim().length > BLOG_MEDIA_CONSTANTS.LIMITS.MAX_ALT_LENGTH) {
    errors.push('Alt text too long');
  }
  if (data.caption !== undefined && data.caption.trim() && data.caption.trim().length > BLOG_MEDIA_CONSTANTS.LIMITS.MAX_CAPTION_LENGTH) {
    errors.push('Caption too long');
  }
  if ('size' in data && data.size !== undefined && data.size > BLOG_MEDIA_CONSTANTS.LIMITS.MAX_FILE_SIZE) {
    errors.push('File size too large');
  }
  if ('mimeType' in data && data.mimeType !== undefined && !BLOG_MEDIA_CONSTANTS.ALLOWED_MIME_TYPES.includes(data.mimeType)) {
    errors.push('Invalid file type');
  }
  if (data.tags !== undefined && data.tags.length > BLOG_MEDIA_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push('Too many tags');
  }
  return errors;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return size.toFixed(2) + ' ' + units[unitIndex];
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}
