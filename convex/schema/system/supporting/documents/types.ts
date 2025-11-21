// convex/schema/system/supporting/documents/types.ts
// Type extractions from validators for documents module

import { Infer } from 'convex/values';
import { documentValidators } from './validators';

// Extract types from validators
export type DocumentType = Infer<typeof documentValidators.type>;
export type DocumentStatus = Infer<typeof documentValidators.status>;
