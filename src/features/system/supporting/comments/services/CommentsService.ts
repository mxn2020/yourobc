// src/features/boilerplate/supporting/comments/services/CommentsService.ts

import type { Id } from '@/convex/_generated/dataModel';
import type { Comment, CreateCommentData, UpdateCommentData, CommentThread } from '../types';
import { MAX_CONTENT_LENGTH, truncateText } from '../../shared/constants';

/**
 * CommentsService - Service layer for comment-related business logic
 */
export class CommentsService {
  /**
   * Validate comment data before submission
   */
  static validateCommentData(data: Partial<CreateCommentData>): string[] {
    const errors: string[] = [];

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Comment content is required');
    } else if (data.content.length > MAX_CONTENT_LENGTH.LONG_TEXT) {
      errors.push(`Comment content must be less than ${MAX_CONTENT_LENGTH.LONG_TEXT} characters`);
    }

    if (!data.entityType || data.entityType.trim().length === 0) {
      errors.push('Entity type is required');
    }

    if (!data.entityId || data.entityId.trim().length === 0) {
      errors.push('Entity ID is required');
    }

    return errors;
  }

  /**
   * Validate update data
   */
  static validateUpdateData(data: Partial<UpdateCommentData>): string[] {
    const errors: string[] = [];

    if (data.content !== undefined) {
      if (data.content.trim().length === 0) {
        errors.push('Comment content cannot be empty');
      } else if (data.content.length > MAX_CONTENT_LENGTH.LONG_TEXT) {
        errors.push(`Comment content must be less than ${MAX_CONTENT_LENGTH.LONG_TEXT} characters`);
      }
    }

    return errors;
  }

  /**
   * Format comment content for display
   */
  static formatCommentContent(content: string, maxLength?: number): string {
    const trimmed = content.trim();
    if (maxLength && trimmed.length > maxLength) {
      return truncateText(trimmed, maxLength);
    }
    return trimmed;
  }

  /**
   * Extract mentions from comment content
   * Looks for @username patterns
   */
  static extractMentions(content: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Build a comment tree from a flat list of comments
   */
  static buildCommentTree(comments: Comment[]): CommentThread[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: populate map and identify root comments
    comments.forEach((comment) => {
      commentMap.set(comment._id, comment);
      if (!comment.parentCommentId) {
        rootComments.push(comment);
      }
    });

    // Second pass: build threads
    return rootComments.map((rootComment) => {
      const replies = comments.filter((c) => c.parentCommentId === rootComment._id);
      return {
        comment: rootComment,
        replies,
        replyCount: replies.length,
      };
    });
  }

  /**
   * Flatten a comment tree into a flat list
   */
  static flattenCommentTree(threads: CommentThread[]): Comment[] {
    const flat: Comment[] = [];
    threads.forEach((thread) => {
      flat.push(thread.comment);
      flat.push(...thread.replies);
    });
    return flat;
  }

  /**
   * Get reply depth for a comment
   */
  static getCommentDepth(comment: Comment, allComments: Comment[]): number {
    let depth = 0;
    let currentComment = comment;

    while (currentComment.parentCommentId) {
      depth++;
      const parent = allComments.find((c) => c._id === currentComment.parentCommentId);
      if (!parent) break;
      currentComment = parent;
    }

    return depth;
  }

  /**
   * Check if a comment is editable by a user
   */
  static isCommentEditable(comment: Comment, userId: Id<"userProfiles">): boolean {
    // Only the creator can edit their own comments
    return comment.createdBy === userId;
  }

  /**
   * Check if a comment is deletable by a user
   */
  static isCommentDeletable(comment: Comment, userId: Id<"userProfiles">, isAdmin = false): boolean {
    // Admins can delete any comment, users can only delete their own
    return isAdmin || comment.createdBy === userId;
  }

  /**
   * Check if a user has already reacted to a comment
   */
  static hasUserReacted(comment: Comment, userId: Id<"userProfiles">, reaction?: string): boolean {
    if (!comment.reactions || comment.reactions.length === 0) return false;

    if (reaction) {
      return comment.reactions.some((r) => r.userId === userId && r.reaction === reaction);
    }

    return comment.reactions.some((r) => r.userId === userId);
  }

  /**
   * Get reaction count for a specific reaction type
   */
  static getReactionCount(comment: Comment, reaction: string): number {
    if (!comment.reactions || comment.reactions.length === 0) return 0;
    return comment.reactions.filter((r) => r.reaction === reaction).length;
  }

  /**
   * Get all unique reactions on a comment
   */
  static getUniqueReactions(comment: Comment): string[] {
    if (!comment.reactions || comment.reactions.length === 0) return [];
    return [...new Set(comment.reactions.map((r) => r.reaction))];
  }

  /**
   * Group reactions by type with counts
   */
  static groupReactions(comment: Comment): Array<{ reaction: string; count: number; users: string[] }> {
    if (!comment.reactions || comment.reactions.length === 0) return [];

    const grouped = new Map<string, string[]>();

    comment.reactions.forEach((r) => {
      if (!grouped.has(r.reaction)) {
        grouped.set(r.reaction, []);
      }
      grouped.get(r.reaction)!.push(r.userId);
    });

    return Array.from(grouped.entries()).map(([reaction, users]) => ({
      reaction,
      count: users.length,
      users,
    }));
  }

  /**
   * Sort comments by date
   */
  static sortCommentsByDate(comments: Comment[], ascending = false): Comment[] {
    return [...comments].sort((a, b) => {
      const diff = a.createdAt - b.createdAt;
      return ascending ? diff : -diff;
    });
  }

  /**
   * Filter comments by type
   */
  static filterCommentsByType(comments: Comment[], types: Array<Comment['type']>): Comment[] {
    return comments.filter((c) => c.type && types.includes(c.type));
  }

  /**
   * Filter internal/external comments
   */
  static filterCommentsByVisibility(comments: Comment[], isInternal: boolean): Comment[] {
    return comments.filter((c) => c.isInternal === isInternal);
  }

  /**
   * Search comments by content
   */
  static searchComments(comments: Comment[], query: string): Comment[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return comments;

    return comments.filter((c) => c.content.toLowerCase().includes(lowerQuery));
  }

  /**
   * Get comment statistics
   */
  static getCommentStats(comments: Comment[]): {
    total: number;
    byType: Record<string, number>;
    internal: number;
    external: number;
    withReplies: number;
    withReactions: number;
  } {
    const stats = {
      total: comments.length,
      byType: {} as Record<string, number>,
      internal: 0,
      external: 0,
      withReplies: 0,
      withReactions: 0,
    };

    comments.forEach((comment) => {
      // Count by type
      if (comment.type) {
        stats.byType[comment.type] = (stats.byType[comment.type] || 0) + 1;
      }

      // Count visibility
      if (comment.isInternal) {
        stats.internal++;
      } else {
        stats.external++;
      }

      // Count replies
      if (comment.replyCount && comment.replyCount > 0) {
        stats.withReplies++;
      }

      // Count reactions
      if (comment.reactions && comment.reactions.length > 0) {
        stats.withReactions++;
      }
    });

    return stats;
  }

  /**
   * Sanitize comment content (basic XSS protection)
   */
  static sanitizeContent(content: string): string {
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Convert URLs in content to clickable links
   */
  static linkifyContent(content: string): string {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return content.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  /**
   * Highlight mentions in content
   */
  static highlightMentions(content: string): string {
    const mentionPattern = /@(\w+)/g;
    return content.replace(mentionPattern, '<span class="mention">@$1</span>');
  }

  /**
   * Format content with sanitization, linkification, and mention highlighting
   */
  static formatContentForDisplay(content: string): string {
    const sanitized = this.sanitizeContent(content);
    const linkified = this.linkifyContent(sanitized);
    return this.highlightMentions(linkified);
  }
}
