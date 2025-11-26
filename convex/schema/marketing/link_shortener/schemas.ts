// convex/schema/marketing/link_shortener/schemas.ts
// Schema exports for link_shortener module

import { linksTable, linkClicksTable } from './link_shortener';

export const marketingLinkShortenerSchemas = {
  marketingLinks: linksTable,
  marketingLinkClicks: linkClicksTable,
};
