// convex/schema/boilerplate/ai/ai_logs/types.ts
// Type extractions from validators for ai_logs module

import { Infer } from 'convex/values';
import { aiLogsValidators } from './validators';

export type AIRequestType = Infer<typeof aiLogsValidators.requestType>;
export type AILogParameters = Infer<typeof aiLogsValidators.parameters>;
export type AIUsage = Infer<typeof aiLogsValidators.usage>;
export type AIToolCall = Infer<typeof aiLogsValidators.toolCall>;
export type AIFile = Infer<typeof aiLogsValidators.file>;
export type AICache = Infer<typeof aiLogsValidators.cache>;
export type AILogExtendedMetadata = Infer<typeof aiLogsValidators.extendedMetadata>;
