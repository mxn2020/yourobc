// convex/schema/system/supporting/wiki/types.ts
// Type extractions from validators for wiki module

import { Infer } from 'convex/values';
import { wikiValidators } from './validators';

// Extract types from validators
export type WikiType = Infer<typeof wikiValidators.type>;
export type WikiStatus = Infer<typeof wikiValidators.status>;
export type WikiVisibility = Infer<typeof wikiValidators.visibility>;
