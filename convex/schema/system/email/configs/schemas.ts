// Schema exports for email/configs
import { emailConfigsTable } from './tables';

export const systemEmailConfigsSchemas = {
  emailConfigs: emailConfigsTable,
} as const;
