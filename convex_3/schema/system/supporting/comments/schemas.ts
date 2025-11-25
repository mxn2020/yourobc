// Schema exports for supporting/comments
import { commentsTable } from './comments';

export const supportingCommentsSchemas = {
  comments: commentsTable,
} as const;
