// convex/schema/marketing/schemas.ts
// Schema exports for all marketing modules

import { marketingLinkShortenerSchemas } from './link_shortener/schemas';
import { marketingLandingPagesSchemas } from './landing_pages/schemas';
import { marketingEmailSignaturesSchemas } from './email_signatures/schemas';
import { marketingSocialSchedulerSchemas } from './social_scheduler/schemas';
import { marketingNewslettersSchemas } from './newsletters/schemas';

/**
 * Marketing schemas for Convex database
 *
 * Includes modules:
 * - Link Shortener & Analytics
 * - Landing Page Builder
 * - Email Signature Generator
 * - Social Media Scheduler
 * - Newsletter Platform
 */
export const marketingSchemas = {
  ...marketingLinkShortenerSchemas,
  ...marketingLandingPagesSchemas,
  ...marketingEmailSignaturesSchemas,
  ...marketingSocialSchedulerSchemas,
  ...marketingNewslettersSchemas,
};

export default marketingSchemas;
