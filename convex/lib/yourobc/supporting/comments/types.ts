// convex/lib/yourobc/supporting/comments/types.ts
// convex/yourobc/supporting/comments/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type Comment = Doc<'yourobcComments'>;
export type CommentId = Id<'yourobcComments'>;

export type Mentions = {
    userId: string;
    userName: string;
}

export interface CreateCommentData {
  entityType: Comment['entityType'];
  entityId: string;
  content: string;
  type?: Comment['type'];
  isInternal?: boolean;
  mentions?: Mentions[]
  parentCommentId?: CommentId;
}

