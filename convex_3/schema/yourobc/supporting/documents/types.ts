// convex/schema/yourobc/supporting/documents/types.ts
import { Infer } from 'convex/values';
import { documentsValidators } from './validators';

export type DocumentType = Infer<typeof documentsValidators.documentType>;
export type DocumentStatus = Infer<typeof documentsValidators.documentStatus>;
