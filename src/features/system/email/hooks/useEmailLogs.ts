// src/features/email/hooks/useEmailLogs.ts

import { useConvexQuery } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { EmailProvider, EmailStatus } from '../types';
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to get email logs with filters
 */
export function useEmailLogs(filters?: {
  limit?: number;
  status?: EmailStatus;
  context?: string;
  provider?: EmailProvider;
}) {
  return useConvexQuery(api.lib.boilerplate.email.queries.getEmailLogs, filters || {});
}

/**
 * Hook to get email log by message ID
 */
export function useEmailLogByMessageId(messageId: string) {
  return useConvexQuery(api.lib.boilerplate.email.queries.getEmailLogByMessageId, { messageId });
}

/**
 * Hook to get email log by ID
 */
export function useEmailLogById(logId: Id<"emailLogs">) {
  return useConvexQuery(api.lib.boilerplate.email.queries.getEmailLogById, { logId });
}

/**
 * Hook to get email statistics
 */
export function useEmailStats(days = 30) {
  return useConvexQuery(api.lib.boilerplate.email.queries.getEmailStats, { days });
}
