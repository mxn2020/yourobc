// Schema exports for email/templates
import { emailTemplatesTable } from './tables';

export const systemEmailTemplatesSchemas = {
  emailTemplates: emailTemplatesTable,
} as const;
