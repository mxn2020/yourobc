// src/features/system/integrations/hooks/useWebhooks.ts

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import {
  CreateWebhookParams,
  UpdateWebhookParams,
  Webhook,
  WebhookDelivery,
} from "../types";

/**
 * Hook to manage webhooks
 *
 * @example
 * ```tsx
 * function WebhooksPage() {
 *   const { webhooks, isLoading, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhooks(userId);
 *
 *   const handleCreate = async () => {
 *     const webhookId = await createWebhook({
 *       url: "https://example.com/webhook",
 *       events: ["user.created", "payment.succeeded"],
 *       isActive: true,
 *     });
 *     console.log("Webhook created:", webhookId);
 *   };
 *
 *   const handleTest = async (webhookId) => {
 *     const delivery = await testWebhook(webhookId);
 *     console.log("Test delivery:", delivery);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Create Webhook</button>
 *       {webhooks.map(webhook => (
 *         <div key={webhook._id}>
 *           {webhook.url}
 *           <button onClick={() => handleTest(webhook._id)}>Test</button>
 *           <button onClick={() => deleteWebhook(webhook._id)}>Delete</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebhooks() {
  const webhooks = useQuery(
    api.lib.system.integrations.queries.getWebhooks,
    {}
  );

  const createWebhookMutation = useMutation(api.lib.system.integrations.mutations.createWebhook);
  const updateWebhookMutation = useMutation(api.lib.system.integrations.mutations.updateWebhook);
  const deleteWebhookMutation = useMutation(api.lib.system.integrations.mutations.deleteWebhook);
  const testWebhookMutation = useMutation(api.lib.system.integrations.mutations.testWebhook);

  return useMemo(
    () => ({
      webhooks: webhooks || [],
      isLoading: webhooks === undefined,

      /**
       * Create a new webhook
       */
      createWebhook: async (params: CreateWebhookParams) => {
        return await createWebhookMutation({
          name: params.name,
          description: params.description,
          url: params.url,
          secret: params.secret,
          events: params.events,
          method: params.method,
          headers: params.headers,
          timeout: params.timeout,
          retryConfig: params.retryConfig,
          filters: params.filters,
          isActive: params.isActive,
          metadata: params.metadata,
        });
      },

      /**
       * Update a webhook
       */
      updateWebhook: async (params: UpdateWebhookParams) => {
        return await updateWebhookMutation({
          webhookId: params.webhookId,
          updates: {
            name: params.name,
            description: params.description,
            url: params.url,
            secret: params.secret,
            events: params.events,
            method: params.method,
            headers: params.headers,
            timeout: params.timeout,
            retryConfig: params.retryConfig,
            filters: params.filters,
            isActive: params.isActive,
            metadata: params.metadata,
          },
        });
      },

      /**
       * Delete a webhook
       */
      deleteWebhook: async (webhookId: Id<"webhooks">) => {
        return await deleteWebhookMutation({ webhookId });
      },

      /**
       * Test a webhook by sending a test payload
       */
      testWebhook: async (webhookId: Id<"webhooks">) => {
        return await testWebhookMutation({ webhookId });
      },
    }),
    [webhooks, createWebhookMutation, updateWebhookMutation, deleteWebhookMutation, testWebhookMutation]
  );
}

/**
 * Hook to get a single webhook by ID
 */
export function useWebhook(webhookId: Id<"webhooks"> | undefined) {
  const webhook = useQuery(
    api.lib.system.integrations.queries.getWebhook,
    webhookId ? { webhookId } : "skip"
  );

  return useMemo(
    () => ({
      webhook: webhook || null,
      isLoading: webhook === undefined,
    }),
    [webhook]
  );
}

/**
 * Hook to get webhook deliveries
 */
export function useWebhookDeliveries(
  webhookId: Id<"webhooks"> | undefined,
  limit?: number
) {
  const deliveries = useQuery(
    api.lib.system.integrations.queries.getWebhookDeliveries,
    webhookId ? { webhookId, limit } : "skip"
  );

  return useMemo(
    () => ({
      deliveries: deliveries || [],
      isLoading: deliveries === undefined,
    }),
    [deliveries]
  );
}

/**
 * Hook to get active webhooks
 */
export function useActiveWebhooks() {
  const { webhooks, isLoading, ...rest } = useWebhooks();

  const activeWebhooks = useMemo(() => {
    return webhooks.filter((webhook) => webhook.isActive);
  }, [webhooks]);

  return {
    webhooks: activeWebhooks,
    isLoading,
    ...rest,
  };
}

/**
 * Hook to get webhook statistics
 */
export function useWebhookStats(webhookId: Id<"webhooks"> | undefined) {
  const stats = useQuery(
    api.lib.system.integrations.queries.getWebhookStats,
    webhookId ? { webhookId } : "skip"
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
 * Hook to retry a failed webhook delivery
 */
export function useRetryWebhookDelivery() {
  const retryMutation = useMutation(api.lib.system.integrations.mutations.retryWebhookDelivery);

  return useMemo(
    () => ({
      /**
       * Retry a failed webhook delivery
       */
      retryDelivery: async (deliveryId: Id<"webhookDeliveries">) => {
        return await retryMutation({ deliveryId });
      },
    }),
    [retryMutation]
  );
}
