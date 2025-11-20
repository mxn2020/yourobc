// src/features/email/hooks/useEmailConfig.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { useConvexMutation, useConvexQuery } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from '@/features/boilerplate/auth';
import type { ProviderConfig, EmailProvider } from '../types';
import { validateProviderConfig } from '../utils';

/**
 * Hook to get the active email configuration
 */
export function useActiveEmailConfig() {
  return useConvexQuery(api.lib.boilerplate.email.queries.getActiveConfig, {});
}

/**
 * Hook to get all email configurations
 */
export function useAllEmailConfigs() {
  return useConvexQuery(api.lib.boilerplate.email.queries.getAllConfigs, {});
}

/**
 * Hook to get configuration by provider
 */
export function useEmailConfigByProvider(provider: EmailProvider) {
  return useConvexQuery(api.lib.boilerplate.email.queries.getConfigByProvider, { provider });
}

/**
 * Hook to save email configuration
 */
export function useSaveEmailConfig() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.boilerplate.email.mutations.saveEmailConfig);

  return useMutation({
    mutationFn: async ({
      provider,
      config,
      setAsActive = false,
    }: {
      provider: EmailProvider;
      config: Omit<ProviderConfig, 'provider'>;
      setAsActive?: boolean;
    }) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      // Validate config before saving
      const validation = validateProviderConfig({
        provider,
        ...config,
      } as ProviderConfig);

      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      return mutation({
        provider,
        config,
        setAsActive,
      });
    },
  });
}

/**
 * Hook to set active configuration
 */
export function useSetActiveConfig() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.boilerplate.email.mutations.setActiveConfig);

  return useMutation({
    mutationFn: async ({ configId }: { configId: Id<"emailConfigs"> }) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      return mutation({ configId });
    },
  });
}

/**
 * Hook to delete email configuration
 */
export function useDeleteEmailConfig() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.boilerplate.email.mutations.deleteEmailConfig);

  return useMutation({
    mutationFn: async ({ configId }: { configId: Id<"emailConfigs"> }) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      return mutation({ configId });
    },
  });
}

/**
 * Hook to update test status
 */
export function useUpdateTestStatus() {
  const { auth } = useAuth();
  const mutation = useConvexMutation(api.lib.boilerplate.email.mutations.updateTestStatus);

  return useMutation({
    mutationFn: async ({
      configId,
      success,
      error,
    }: {
      configId: Id<"emailConfigs">;
      success: boolean;
      error?: string;
    }) => {
      if (!auth?.id) {
        throw new Error('Authentication required');
      }

      return mutation({ configId, success, error });
    },
  });
}

/**
 * Hook to test email configuration
 */
export function useTestEmailConfig() {
  const updateTestStatus = useUpdateTestStatus();

  return useMutation({
    mutationFn: async ({
      config,
      testEmail,
      configId,
    }: {
      config: ProviderConfig;
      testEmail: string;
      configId?: Id<"emailConfigs">;
    }) => {
      // Import EmailService dynamically to avoid circular dependencies
      const { emailService } = await import('../services/EmailService');

      const result = await emailService.testConnection(config, testEmail);

      // Update test status in database if configId is provided
      if (configId) {
        await updateTestStatus.mutateAsync({
          configId,
          success: result.success,
          error: result.error,
        });
      }

      return result;
    },
  });
}
