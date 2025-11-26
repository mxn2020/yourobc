// convex/schema/marketing/newsletters/schemas.ts
// Schema exports for newsletters module

import { newslettersTable, newsletterCampaignsTable, newsletterSubscribersTable, newsletterTemplatesTable } from './newsletters';

export const marketingNewslettersSchemas = {
  marketingNewsletters: newslettersTable,
  marketingNewsletterCampaigns: newsletterCampaignsTable,
  marketingNewsletterSubscribers: newsletterSubscribersTable,
  marketingNewsletterTemplates: newsletterTemplatesTable,
};
