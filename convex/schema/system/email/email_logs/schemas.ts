// Schema exports for email/logs
import { emailLogsTable } from './tables';

export const systemEmailLogsSchemas = {
  emailLogs: emailLogsTable,
} as const;
