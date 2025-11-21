// convex/schema/system/email/schemas.ts
// Consolidated schema exports for all email module components

import { emailConfigsTable } from './configs';
import { emailTemplatesTable } from './templates';
import { emailLogsTable } from './logs';

export const systemEmailSchemas = {
  emailConfigs: emailConfigsTable,
  emailTemplates: emailTemplatesTable,
  emailLogs: emailLogsTable,
};
