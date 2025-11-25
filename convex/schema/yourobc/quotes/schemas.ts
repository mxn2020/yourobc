// convex/schema/yourobc/quotes/schemas.ts
// Schema exports for quotes module

import { v } from 'convex/values';
import { quotesTable } from './tables';

export const quoteIdSchema = v.id('yourobcQuotes')

export const yourobcQuotesSchemas = {
  yourobcQuotes: quotesTable,
};
