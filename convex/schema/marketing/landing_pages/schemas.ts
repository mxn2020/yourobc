// convex/schema/marketing/landing_pages/schemas.ts
// Schema exports for landing_pages module

import { landingPagesTable, pageVariantsTable } from './landing_pages';

export const marketingLandingPagesSchemas = {
  marketingLandingPages: landingPagesTable,
  marketingPageVariants: pageVariantsTable,
};
