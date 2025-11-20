// src/features/boilerplate/integrations/hooks/useApiKeys.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { useAuth } from "@/features/boilerplate/auth/hooks/useAuth";
import { CreateApiKeyParams, ApiKey } from "../types";

/**
 * Hook to manage API keys
 *
 * @example
 * ```tsx
 * function ApiKeysPage() {
 *   const { apiKeys, isLoading, createApiKey, revokeApiKey } = useApiKeys();
 *
 *   const handleCreate = async () => {
 *     const result = await createApiKey({
 *       name: "Production API Key",
 *       scopes: ["users:read", "data:read"],
 *       rateLimit: {
 *         requestsPerMinute: 60,
 *         requestsPerHour: 1000,
 *         requestsPerDay: 10000,
 *       },
 *     });
 *
 *     console.log("New API key:", result.key); // Save this! Won't be shown again
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create API Key</button>
 *       {apiKeys.map(key => (
 *         <div key={key._id}>
 *           {key.name}
 *           <button onClick={() => revokeApiKey(key._id)}>Revoke</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useApiKeys() {
  const apiKeys = useQuery(
    api.lib.boilerplate.integrations.queries.getApiKeys,
    {}
  );

  const createApiKeyMutation = useMutation(api.lib.boilerplate.integrations.mutations.createApiKey);
  const revokeApiKeyMutation = useMutation(api.lib.boilerplate.integrations.mutations.revokeApiKey);

  return useMemo(
    () => ({
      apiKeys: apiKeys || [],
      isLoading: apiKeys === undefined,

      /**
       * Create a new API key
       */
      createApiKey: async (params: CreateApiKeyParams) => {
        return await createApiKeyMutation({
          name: params.name,
          description: params.description,
          scopes: params.scopes,
          rateLimit: params.rateLimit,
          expiresAt: params.expiresAt,
          allowedIps: params.allowedIps,
          metadata: params.metadata,
        });
      },

      /**
       * Revoke an API key
       */
      revokeApiKey: async (keyId: Id<"apiKeys">, reason?: string) => {
        return await revokeApiKeyMutation({
          keyId,
          reason,
        });
      },
    }),
    [apiKeys, createApiKeyMutation, revokeApiKeyMutation]
  );
}

/**
 * Hook to get a single API key by ID
 */
export function useApiKey(keyId: Id<"apiKeys"> | undefined) {
  const apiKey = useQuery(
    api.lib.boilerplate.integrations.queries.getApiKey,
    keyId ? { keyId } : "skip"
  );

  return useMemo(
    () => ({
      apiKey: apiKey || null,
      isLoading: apiKey === undefined,
    }),
    [apiKey]
  );
}

/**
 * Hook to validate an API key
 */
export function useValidateApiKey() {
  const validateMutation = useMutation(api.lib.boilerplate.integrations.mutations.validateApiKeyWithIncrement);

  return useMemo(
    () => ({
      /**
       * Validate an API key and increment usage
       * @param keyPrefix The prefix part of the API key
       * @param keyHash The hashed part of the API key
       */
      validateApiKey: async (keyPrefix: string, keyHash: string) => {
        return await validateMutation({ keyPrefix, keyHash });
      },
    }),
    [validateMutation]
  );
}

/**
 * Hook to get active (non-revoked) API keys
 */
export function useActiveApiKeys() {
  const { apiKeys, isLoading, ...rest } = useApiKeys();

  const activeKeys = useMemo(() => {
    return apiKeys.filter((key) => !key.revokedAt);
  }, [apiKeys]);

  return {
    apiKeys: activeKeys,
    isLoading,
    ...rest,
  };
}

/**
 * Hook to get API key usage statistics
 */
export function useApiKeyStats(keyId: Id<"apiKeys"> | undefined) {
  const stats = useQuery(
    api.lib.boilerplate.integrations.queries.getApiKeyStats,
    keyId ? { keyId } : "skip"
  );

  return useMemo(
    () => ({
      stats: stats || null,
      isLoading: stats === undefined,
    }),
    [stats]
  );
}
