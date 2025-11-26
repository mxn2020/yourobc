// convex/schema/marketing/link_shortener/types.ts
// Type extractions from validators for link_shortener module

import { Infer } from 'convex/values';
import { linkShortenerValidators } from './validators';

// Extract types from validators
export type LinkShortenerStatus = Infer<typeof linkShortenerValidators.status>;
export type LinkShortenerVisibility = Infer<typeof linkShortenerValidators.visibility>;
export type LinkShortenerDevice = Infer<typeof linkShortenerValidators.device>;
