// src/features/email/hooks/useEmailTemplates.ts

import { useMutation } from '@tanstack/react-query';
import { useConvexMutation, useConvexQuery } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from '@/features/system/auth';
import type { EmailTemplateData } from '../types';

/**
 * Hook to get all email templates
 */
export function useEmailTemplates(category?: string, activeOnly = false) {
  return useConvexQuery(api.lib.system.email.queries.getAllTemplates, {
    category,
    activeOnly,
  });
}

/**
 * Hook to get template by slug
 */
export function useEmailTemplateBySlug(slug: string) {
  return useConvexQuery(api.lib.system.email.queries.getTemplateBySlug, { slug });
}

/**
 * Hook to get template by ID
 */
export function useEmailTemplateById(templateId: Id<"emailTemplates">) {
  return useConvexQuery(api.lib.system.email.queries.getTemplateById, { templateId });
}

/**
 * Hook to search templates
 */
export function useSearchEmailTemplates(searchTerm: string) {
  return useConvexQuery(api.lib.system.email.queries.searchTemplates, { searchTerm });
}

/**
 * Hook to save email template
 */
export function useSaveEmailTemplate() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.system.email.mutations.saveEmailTemplate);

  return useMutation({
    mutationFn: async (templateData: Omit<EmailTemplateData, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      return mutation(templateData);
    },
  });
}

/**
 * Hook to delete email template
 */
export function useDeleteEmailTemplate() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.system.email.mutations.deleteEmailTemplate);

  return useMutation({
    mutationFn: async ({ templateId }: { templateId: Id<"emailTemplates"> }) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      return mutation({ templateId });
    },
  });
}
