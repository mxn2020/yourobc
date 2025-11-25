// Schema exports for email/configs
import { emailConfigsTable } from './tables';

export const systemEmailConfigsSchemas = {
  configs: emailConfigsTable,
} as const;
