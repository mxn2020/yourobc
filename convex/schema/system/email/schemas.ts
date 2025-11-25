// convex/schema/system/email/schemas.ts
// Consolidated schema exports for all email module components
// Now sourced from module-specific folders to match template structure

import { systemEmailConfigsSchemas } from './configs/schemas';
import { systemEmailTemplatesSchemas } from './email_templates/schemas';
import { systemEmailLogsSchemas } from './email_logs/schemas';

export const systemEmailSchemas = {
  ...systemEmailConfigsSchemas,
  ...systemEmailTemplatesSchemas,
  ...systemEmailLogsSchemas,
};
