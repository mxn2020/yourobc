// src/features/boilerplate/integrations/hooks/useIntegrations.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { useConvex } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  IntegrationsContextValue,
  IntegrationProvider,
  CreateApiKeyParams,
  CreateWebhookParams,
  CreateOAuthAppParams,
} from "../types";
import { integrationsService } from "../services/IntegrationsService";

/**
 * Integrations context
 */
const IntegrationsContext = createContext<IntegrationsContextValue | null>(null);

/**
 * Integrations Provider Props
 */
interface IntegrationsProviderProps {
  children: ReactNode;
  providerType?: "internal" | "zapier" | "make" | "n8n";
}

/**
 * Integrations Provider Component
 *
 * Wrap your app with this provider to enable integrations features:
 *
 * @example
 * ```tsx
 * import { IntegrationsProvider } from '@/features/boilerplate/integrations';
 *
 * function App() {
 *   return (
 *     <IntegrationsProvider>
 *       <YourApp />
 *     </IntegrationsProvider>
 *   );
 * }
 * ```
 */
export function IntegrationsProvider({
  children,
  providerType = "internal",
}: IntegrationsProviderProps) {
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const [isInitialized, setIsInitialized] = useState(false);
  const [provider, setProvider] = useState<IntegrationProvider | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    integrationsService
      .initialize(providerType, convex)
      .then(() => {
        setIsInitialized(true);
        setProvider(integrationsService.getProvider());
      })
      .catch((error) => {
        console.error("Failed to initialize integrations service:", error);
      });
  }, [isAuthenticated, providerType, convex]);

  const value: IntegrationsContextValue = {
    provider,
    isInitialized,

    // API Keys
    createApiKey: async (params: CreateApiKeyParams) => {
      return await integrationsService.createApiKey(params);
    },
    getApiKeys: async () => {
      // This will be handled by useApiKeys hook with user ID
      throw new Error("Use useApiKeys hook instead");
    },
    revokeApiKey: async (keyId: Id<"apiKeys">, revokedBy: Id<"userProfiles">) => {
      return await integrationsService.revokeApiKey(keyId, revokedBy);
    },

    // Webhooks
    createWebhook: async (params: CreateWebhookParams) => {
      return await integrationsService.createWebhook(params);
    },
    getWebhooks: async () => {
      // This will be handled by useWebhooks hook with user ID
      throw new Error("Use useWebhooks hook instead");
    },
    testWebhook: async (webhookId: Id<"webhooks">) => {
      return await integrationsService.testWebhook(webhookId);
    },
    deleteWebhook: async (webhookId: Id<"webhooks">, userId: Id<"userProfiles">) => {
      return await integrationsService.deleteWebhook(webhookId, userId);
    },

    // OAuth
    createOAuthApp: async (params: CreateOAuthAppParams) => {
      return await integrationsService.createOAuthApp(params);
    },
    getOAuthApps: async () => {
      // This will be handled by useOAuth hook with user ID
      throw new Error("Use useOAuth hook instead");
    },
  };

  return (
    <IntegrationsContext.Provider value={value}>
      {children}
    </IntegrationsContext.Provider>
  );
}

/**
 * Hook to access integrations context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isInitialized, createApiKey } = useIntegrations();
 *
 *   if (!isInitialized) {
 *     return <div>Loading integrations...</div>;
 *   }
 *
 *   return (
 *     <button onClick={() => createApiKey({ name: "My Key", scopes: ["read"], rateLimit: {...} })}>
 *       Create API Key
 *     </button>
 *   );
 * }
 * ```
 */
export function useIntegrations(): IntegrationsContextValue {
  const context = useContext(IntegrationsContext);

  if (!context) {
    throw new Error("useIntegrations must be used within an IntegrationsProvider");
  }

  return context;
}
