// convex/schema/system/supporting/comments/types.ts
// Type extractions from validators for comments module

import { Infer } from 'convex/values';
import { commentValidators } from './validators';

// Extract types from validators
export type CommentType = Infer<typeof commentValidators.type>;
