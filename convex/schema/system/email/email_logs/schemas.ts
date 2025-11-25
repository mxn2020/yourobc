// Schema exports for email/logs
import { emailLogsTable } from './tables';

export const systemEmailLogsSchemas = {
  logs: emailLogsTable,
} as const;
