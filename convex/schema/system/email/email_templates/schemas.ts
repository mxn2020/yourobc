// Schema exports for email/templates
import { emailTemplatesTable } from './tables';

export const systemEmailTemplatesSchemas = {
  templates: emailTemplatesTable,
} as const;
