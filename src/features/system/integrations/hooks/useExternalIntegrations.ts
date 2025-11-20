// src/features/system/integrations/hooks/useExternalIntegrations.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { ConnectExternalIntegrationParams, ExternalIntegration } from "../types";

/**
 * Hook to manage external integrations (Zapier, Make, n8n, etc.)
 *
 * @example
 * ```tsx
 * function ExternalIntegrationsPage() {
 *   const { integrations, isLoading, connectIntegration, disconnectIntegration } = useExternalIntegrations(userId);
 *
 *   const handleConnect = async () => {
 *     const integrationId = await connectIntegration({
 *       platform: "zapier",
 *       name: "My Zapier Integration",
 *       config: {
 *         webhookUrl: "https://hooks.zapier.com/hooks/catch/...",
 *       },
 *     });
 *     console.log("Connected integration:", integrationId);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleConnect}>Connect Zapier</button>
 *       {integrations.map(integration => (
 *         <div key={integration._id}>
 *           {integration.name} ({integration.provider})
 *           <button onClick={() => disconnectIntegration(integration._id)}>Disconnect</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useExternalIntegrations() {
  const integrations = useQuery(
    api.lib.system.integrations.queries.getExternalIntegrations,
    {}
  );

  const connectIntegrationMutation = useMutation(
    api.lib.system.integrations.mutations.createExternalIntegration
  );
  const disconnectIntegrationMutation = useMutation(
    api.lib.system.integrations.mutations.disconnectExternalIntegration
  );
  const syncIntegrationMutation = useMutation(
    api.lib.system.integrations.mutations.syncExternalIntegration
  );

  return useMemo(
    () => ({
      integrations: integrations || [],
      isLoading: integrations === undefined,

      /**
       * Connect a new external integration
       */
      connectIntegration: async (params: ConnectExternalIntegrationParams) => {
        return await connectIntegrationMutation({
          provider: params.provider,
          type: params.type,
          name: params.name,
          config: params.config,
        });
      },

      /**
       * Disconnect an external integration
       */
      disconnectIntegration: async (integrationId: Id<"externalIntegrations">) => {
        return await disconnectIntegrationMutation({ integrationId });
      },

      /**
       * Manually sync an external integration
       */
      syncIntegration: async (integrationId: Id<"externalIntegrations">, syncStatus: "success" | "failed" | "in_progress") => {
        return await syncIntegrationMutation({ integrationId, syncStatus });
      },
    }),
    [
      integrations,
      connectIntegrationMutation,
      disconnectIntegrationMutation,
      syncIntegrationMutation,
    ]
  );
}

/**
 * Hook to get a single external integration by ID
 */
export function useExternalIntegration(
  integrationId: Id<"externalIntegrations"> | undefined
) {
  const integration = useQuery(
    api.lib.system.integrations.queries.getExternalIntegration,
    integrationId ? { integrationId } : "skip"
  );

  return useMemo(
    () => ({
      integration: integration || null,
      isLoading: integration === undefined,
    }),
    [integration]
  );
}

/**
 * Hook to get active external integrations
 */
export function useActiveExternalIntegrations() {
  const { integrations, isLoading, ...rest } = useExternalIntegrations();

  const activeIntegrations = useMemo(() => {
    return integrations.filter((integration) => integration.status === "connected");
  }, [integrations]);

  return {
    integrations: activeIntegrations,
    isLoading,
    ...rest,
  };
}

/**
 * Hook to get external integrations by platform
 */
export function useExternalIntegrationsByPlatform(
  platform: "zapier" | "make" | "n8n" | "custom"
) {
  const { integrations, isLoading, ...rest } = useExternalIntegrations();

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => integration.provider === platform);
  }, [integrations, platform]);

  return {
    integrations: filteredIntegrations,
    isLoading,
    ...rest,
  };
}

/**
 * Hook to test an external integration
 */
export function useTestExternalIntegration() {
  const testMutation = useMutation(
    api.lib.system.integrations.mutations.testExternalIntegration
  );

  return useMemo(
    () => ({
      /**
       * Test an external integration
       */
      testIntegration: async (integrationId: Id<"externalIntegrations">) => {
        return await testMutation({ integrationId });
      },
    }),
    [testMutation]
  );
}

/**
 * Hook to get integration health status
 */
export function useIntegrationHealth(integrationId: Id<"externalIntegrations"> | undefined) {
  const health = useQuery(
    api.lib.system.integrations.queries.getIntegrationHealth,
    integrationId ? { integrationId } : "skip"
  );

  return useMemo(
    () => ({
      health: health || null,
      isLoading: health === undefined,
    }),
    [health]
  );
}
