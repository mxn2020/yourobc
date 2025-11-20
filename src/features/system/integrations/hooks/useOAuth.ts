// src/features/system/integrations/hooks/useOAuth.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import {
  CreateOAuthAppParams,
  UpdateOAuthAppParams,
  OAuthApp,
  OAuthToken,
} from "../types";

/**
 * Hook to manage OAuth apps
 *
 * @example
 * ```tsx
 * function OAuthAppsPage() {
 *   const { oauthApps, isLoading, createOAuthApp, updateOAuthApp, deleteOAuthApp } = useOAuthApps(userId);
 *
 *   const handleCreate = async () => {
 *     const result = await createOAuthApp({
 *       name: "My OAuth App",
 *       description: "OAuth app for third-party integration",
 *       redirectUris: ["https://example.com/callback"],
 *       scopes: ["profile:read", "data:read"],
 *     });
 *
 *     console.log("Client ID:", result.clientId);
 *     console.log("Client Secret:", result.clientSecret); // Save this! Won't be shown again
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create OAuth App</button>
 *       {oauthApps.map(app => (
 *         <div key={app._id}>
 *           {app.name}
 *           <button onClick={() => deleteOAuthApp(app._id)}>Delete</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useOAuthApps() {
  const oauthApps = useQuery(
    api.lib.system.integrations.queries.getOAuthApps,
    {}
  );

  const createOAuthAppMutation = useMutation(api.lib.system.integrations.mutations.createOAuthApp);
  const updateOAuthAppMutation = useMutation(api.lib.system.integrations.mutations.updateOAuthApp);
  const deleteOAuthAppMutation = useMutation(api.lib.system.integrations.mutations.deleteOAuthApp);

  return useMemo(
    () => ({
      oauthApps: oauthApps || [],
      isLoading: oauthApps === undefined,

      /**
       * Create a new OAuth app
       */
      createOAuthApp: async (params: CreateOAuthAppParams) => {
        return await createOAuthAppMutation({
          name: params.name,
          description: params.description,
          redirectUris: params.redirectUris,
          scopes: params.scopes,
          grantTypes: params.grantTypes || ["authorization_code", "refresh_token"],
          logoUrl: params.logoUrl,
          website: params.website,
          privacyPolicyUrl: params.privacyPolicyUrl,
          termsOfServiceUrl: params.termsOfServiceUrl,
        });
      },

      /**
       * Update an OAuth app
       */
      updateOAuthApp: async (params: UpdateOAuthAppParams) => {
        return await updateOAuthAppMutation({
          appId: params.appId,
          updates: {
            name: params.name,
            description: params.description,
            redirectUris: params.redirectUris,
            scopes: params.scopes,
            grantTypes: params.grantTypes,
            logoUrl: params.logoUrl,
            website: params.website,
            privacyPolicyUrl: params.privacyPolicyUrl,
            termsOfServiceUrl: params.termsOfServiceUrl,
            isActive: params.isActive,
          },
        });
      },

      /**
       * Delete an OAuth app
       */
      deleteOAuthApp: async (appId: Id<"oauthApps">) => {
        return await deleteOAuthAppMutation({ appId });
      },
    }),
    [oauthApps, createOAuthAppMutation, updateOAuthAppMutation, deleteOAuthAppMutation]
  );
}

/**
 * Hook to get a single OAuth app by ID
 */
export function useOAuthApp(appId: Id<"oauthApps"> | undefined) {
  const oauthApp = useQuery(
    api.lib.system.integrations.queries.getOAuthApp,
    appId ? { appId } : "skip"
  );

  return useMemo(
    () => ({
      oauthApp: oauthApp || null,
      isLoading: oauthApp === undefined,
    }),
    [oauthApp]
  );
}

/**
 * Hook to get OAuth app by client ID
 */
export function useOAuthAppByClientId(clientId: string | undefined) {
  const oauthApp = useQuery(
    api.lib.system.integrations.queries.getOAuthAppByClientId,
    clientId ? { clientId } : "skip"
  );

  return useMemo(
    () => ({
      oauthApp: oauthApp || null,
      isLoading: oauthApp === undefined,
    }),
    [oauthApp]
  );
}

/**
 * Hook to get OAuth tokens for an app
 */
export function useOAuthTokens(appId: Id<"oauthApps"> | undefined) {
  const tokens = useQuery(
    api.lib.system.integrations.queries.getOAuthTokens,
    appId ? { appId } : "skip"
  );

  return useMemo(
    () => ({
      tokens: tokens || [],
      isLoading: tokens === undefined,
    }),
    [tokens]
  );
}

/**
 * Hook to get active OAuth tokens
 */
export function useActiveOAuthTokens(appId: Id<"oauthApps"> | undefined) {
  const { tokens, isLoading } = useOAuthTokens(appId);

  const activeTokens = useMemo(() => {
    const now = Date.now();
    return tokens.filter((token) => !token.revokedAt && token.expiresAt > now);
  }, [tokens]);

  return {
    tokens: activeTokens,
    isLoading,
  };
}

/**
 * Hook to revoke an OAuth token
 */
export function useRevokeOAuthToken() {
  const revokeTokenMutation = useMutation(api.lib.system.integrations.mutations.revokeOAuthToken);

  return useMemo(
    () => ({
      /**
       * Revoke an OAuth token
       */
      revokeToken: async (tokenId: Id<"oauthTokens">) => {
        return await revokeTokenMutation({ tokenId });
      },
    }),
    [revokeTokenMutation]
  );
}

/**
 * Hook to rotate OAuth app client secret
 */
export function useRotateClientSecret() {
  const rotateMutation = useMutation(api.lib.system.integrations.mutations.rotateClientSecret);

  return useMemo(
    () => ({
      /**
       * Rotate client secret for an OAuth app
       */
      rotateClientSecret: async (appId: Id<"oauthApps">) => {
        return await rotateMutation({ appId });
      },
    }),
    [rotateMutation]
  );
}

/**
 * Hook to get OAuth app statistics
 */
export function useOAuthAppStats(appId: Id<"oauthApps"> | undefined) {
  const stats = useQuery(
    api.lib.system.integrations.queries.getOAuthAppStats,
    appId ? { appId } : "skip"
  );

  return useMemo(
    () => ({
      stats: stats || null,
      isLoading: stats === undefined,
    }),
    [stats]
  );
}

/**
 * Hook to manage OAuth authorization flow
 */
export function useOAuthAuthorization() {
  const createAuthorizationMutation = useMutation(
    api.lib.system.integrations.mutations.createOAuthAuthorization
  );
  const exchangeCodeMutation = useMutation(api.lib.system.integrations.mutations.exchangeAuthorizationCode);

  return useMemo(
    () => ({
      /**
       * Create an authorization code
       */
      createAuthorization: async (params: {
        appId: Id<"oauthApps">;
        scopes: string[];
        redirectUri: string;
        state?: string;
      }) => {
        return await createAuthorizationMutation({
          appId: params.appId,
          scopes: params.scopes,
          redirectUri: params.redirectUri,
          state: params.state,
        });
      },

      /**
       * Exchange authorization code for access token
       */
      exchangeCode: async (params: {
        code: string;
        appId: Id<"oauthApps">;
        redirectUri: string;
      }) => {
        return await exchangeCodeMutation({
          code: params.code,
          appId: params.appId,
          redirectUri: params.redirectUri,
        });
      },
    }),
    [createAuthorizationMutation, exchangeCodeMutation]
  );
}
