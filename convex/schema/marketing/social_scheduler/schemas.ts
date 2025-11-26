// convex/schema/marketing/social_scheduler/schemas.ts
// Schema exports for social_scheduler module

import { socialAccountsTable, socialPostsTable, contentCalendarTable } from './social_scheduler';

export const marketingSocialSchedulerSchemas = {
  marketingSocialAccounts: socialAccountsTable,
  marketingSocialPosts: socialPostsTable,
  marketingContentCalendar: contentCalendarTable,
};
