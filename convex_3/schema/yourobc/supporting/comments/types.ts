// convex/schema/yourobc/supporting/comments/types.ts
// Type extractions from validators for comments module

import { Infer } from 'convex/values';
import { commentsValidators } from './validators';

export type CommentType = Infer<typeof commentsValidators.commentType>;
