// src/features/system/integrations/EXAMPLES.tsx

/**
 * Integrations Feature - Usage Examples
 *
 * This file contains practical examples of how to use the Integrations feature
 * in your TanStack Start + Convex system.
 */

import { Id } from "@/convex/_generated/dataModel";
import {
  useApiKeys,
  useWebhooks,
  useOAuthApps,
  useExternalIntegrations,
  useRequestLogs,
  useUsageStats,
  API_SCOPES,
  WEBHOOK_EVENTS,
  OAUTH_SCOPES,
  ApiKeyForm,
  ApiKeyList,
  WebhookForm,
  WebhookList,
} from "@/features/system/integrations";

// ============================================================================
// Example 1: Basic API Key Management
// ============================================================================

export function Example1_BasicApiKeyManagement() {
  const userId = "user123" as Id<"userProfiles">; // Example user ID
  const { apiKeys, createApiKey, revokeApiKey, isLoading } = useApiKeys();

  const handleCreateApiKey = async () => {
    const result = await createApiKey({
      name: "Production API Key",
      scopes: [API_SCOPES.READ_USERS, API_SCOPES.READ_PAYMENTS],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
    });

    alert(`API Key created! Save this key: ${result.key}`);
  };

  return (
    <div>
      <h2>API Keys</h2>
      <button onClick={handleCreateApiKey}>Create API Key</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ApiKeyList apiKeys={apiKeys} onRevoke={(keyId) => revokeApiKey(keyId).then(() => {})} />
      )}
    </div>
  );
}

// ============================================================================
// Example 2: API Key with Advanced Options
// ============================================================================

export function Example2_AdvancedApiKey() {
  const userId = "user123" as Id<"userProfiles">;
  const { createApiKey } = useApiKeys();

  const handleCreateAdvancedKey = async () => {
    const result = await createApiKey({
      name: "Enterprise API Key",
      scopes: [API_SCOPES.ADMIN], // Full admin access
      rateLimit: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000,
      },
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      allowedIps: ["192.168.1.1", "10.0.0.1"], // IP whitelist
      metadata: {
        department: "Engineering",
        project: "Mobile App",
      },
    });

    console.log("API Key ID:", result.keyId);
    console.log("API Key:", result.key);
  };

  return <button onClick={handleCreateAdvancedKey}>Create Enterprise Key</button>;
}

// ============================================================================
// Example 3: Webhook Management
// ============================================================================

export function Example3_WebhookManagement() {
  const userId = "user123" as Id<"userProfiles">;
  const { webhooks, createWebhook, testWebhook, deleteWebhook, isLoading } =
    useWebhooks();

  const handleCreateWebhook = async () => {
    const webhookId = await createWebhook({
      name: "Example Webhook",
      url: "https://example.com/webhook",
      events: [WEBHOOK_EVENTS.USER_CREATED, WEBHOOK_EVENTS.PAYMENT_SUCCEEDED],
      secret: "your-webhook-secret",
      isActive: true,
    });

    alert(`Webhook created: ${webhookId}`);
  };

  const handleTestWebhook = async (webhookId: Id<"webhooks">) => {
    const delivery = await testWebhook(webhookId);
    alert(`Test result: ${delivery.message}`);
  };

  return (
    <div>
      <h2>Webhooks</h2>
      <button onClick={handleCreateWebhook}>Create Webhook</button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <WebhookList
          webhooks={webhooks}
          onTest={testWebhook}
          onDelete={(webhookId) => deleteWebhook(webhookId).then(() => {})}
        />
      )}
    </div>
  );
}

// ============================================================================
// Example 4: OAuth App Creation
// ============================================================================

export function Example4_OAuthApp() {
  const userId = "user123" as Id<"userProfiles">;
  const { createOAuthApp } = useOAuthApps();

  const handleCreateOAuthApp = async () => {
    const result = await createOAuthApp({
      name: "My OAuth App",
      description: "Third-party integration for data access",
      redirectUris: [
        "https://example.com/callback",
        "http://localhost:3000/callback", // For development
      ],
      scopes: [OAUTH_SCOPES.PROFILE_READ, OAUTH_SCOPES.DATA_READ],
      website: "https://example.com",
      privacyPolicyUrl: "https://example.com/privacy",
      termsOfServiceUrl: "https://example.com/terms",
    });

    console.log("OAuth App Created!");
    console.log("Client ID:", result.clientId);
    console.log("Client Secret (save this!):", result.clientSecret);
  };

  return <button onClick={handleCreateOAuthApp}>Create OAuth App</button>;
}

// ============================================================================
// Example 5: External Integration with Zapier
// ============================================================================

export function Example5_ZapierIntegration() {
  const userId = "user123" as Id<"userProfiles">;
  const { connectIntegration, disconnectIntegration } =
    useExternalIntegrations();

  const handleConnectZapier = async () => {
    const integrationId = await connectIntegration({
      provider: "zapier",
      name: "Zapier Integration",
      type: "automation",
      config: {
        webhookUrl: "https://hooks.zapier.com/hooks/catch/12345/abcdef/",
        events: ["user.created", "payment.succeeded"],
      },
      metadata: {
        zapName: "New User Notification",
      },
    });

    alert(`Zapier integration connected: ${integrationId}`);
  };

  return <button onClick={handleConnectZapier}>Connect Zapier</button>;
}

// ============================================================================
// Example 6: Viewing Request Logs
// ============================================================================

export function Example6_RequestLogs() {
  const { logs, isLoading } = useRequestLogs({
    startDate: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
    endDate: Date.now(),
    limit: 100,
  });

  if (isLoading) return <p>Loading logs...</p>;

  return (
    <div>
      <h2>Recent API Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Method</th>
            <th>Path</th>
            <th>Status</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.method}</td>
              <td>{log.path}</td>
              <td>{log.statusCode}</td>
              <td>{log.responseTime}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Example 7: Usage Statistics Dashboard
// ============================================================================

export function Example7_UsageStatistics() {
  const { stats, isLoading } = useUsageStats(
    Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
    Date.now()
  );

  if (isLoading) return <p>Loading statistics...</p>;
  if (!stats) return <p>No data available</p>;

  const successRate =
    stats.totalRequests > 0
      ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)
      : "0";

  return (
    <div>
      <h2>Usage Statistics (Last 30 Days)</h2>
      <div>
        <p>Total Requests: {stats.totalRequests.toLocaleString()}</p>
        <p>Successful: {stats.successfulRequests.toLocaleString()}</p>
        <p>Failed: {stats.failedRequests.toLocaleString()}</p>
        <p>Success Rate: {successRate}%</p>
        <p>Avg Response Time: {stats.averageResponseTime.toFixed(2)}ms</p>
      </div>

      <h3>Requests by Path</h3>
      <ul>
        {Object.entries(stats.requestsByPath).map(([path, count]: [string, number]) => (
          <li key={path}>
            {path}: {count}
          </li>
        ))}
      </ul>

      {/* TODO: Backend query needs to return topApiKeys
      <h3>Top API Keys</h3>
      <ul>
        {stats.topApiKeys && stats.topApiKeys.map((key: any) => (
          <li key={key.keyId}>
            {key.keyName}: {key.requestCount.toLocaleString()} requests
          </li>
        ))}
      </ul>
      */}
    </div>
  );
}

// ============================================================================
// Example 8: API Key Creation Form
// ============================================================================

export function Example8_ApiKeyCreationForm() {
  const userId = "user123" as Id<"userProfiles">;
  const { createApiKey } = useApiKeys();

  return (
    <div>
      <h2>Create New API Key</h2>
      <ApiKeyForm
        onSubmit={createApiKey}
        onCancel={() => console.log("Cancelled")}
      />
    </div>
  );
}

// ============================================================================
// Example 9: Webhook Creation Form
// ============================================================================

export function Example9_WebhookCreationForm() {
  const userId = "user123" as Id<"userProfiles">;
  const { createWebhook } = useWebhooks();

  return (
    <div>
      <h2>Create New Webhook</h2>
      <WebhookForm
        onSubmit={createWebhook}
        onCancel={() => console.log("Cancelled")}
      />
    </div>
  );
}

// ============================================================================
// Example 10: Failed Requests Monitoring
// ============================================================================

export function Example10_FailedRequestsMonitoring() {
  const { logs, isLoading } = useRequestLogs({
    startDate: Date.now() - 24 * 60 * 60 * 1000,
    endDate: Date.now(),
    limit: 200,
  });

  const failedRequests = logs.filter((log) => log.statusCode >= 400);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Failed Requests (Last 24 Hours)</h2>
      <p>Total Failed: {failedRequests.length}</p>
      {failedRequests.length > 0 ? (
        <ul>
          {failedRequests.map((log) => (
            <li key={log._id} style={{ color: log.statusCode >= 500 ? "red" : "orange" }}>
              {new Date(log.timestamp).toLocaleTimeString()} - {log.method} {log.path} -{" "}
              {log.statusCode} ({log.responseTime}ms)
              {log.error && <span> - {log.error.message}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No failed requests!</p>
      )}
    </div>
  );
}

// ============================================================================
// Example 11: Real-time Integration Health Monitoring
// ============================================================================

export function Example11_IntegrationHealthMonitoring() {
  const userId = "user123" as Id<"userProfiles">;
  const { integrations } = useExternalIntegrations();

  return (
    <div>
      <h2>Integration Health</h2>
      {integrations.map((integration) => (
        <div key={integration._id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <h3>{integration.name}</h3>
          <p>Platform: {integration.provider}</p>
          <p>
            Status:{" "}
            <span
              style={{
                color:
                  integration.status === "connected"
                    ? "green"
                    : integration.status === "error"
                    ? "red"
                    : "gray",
              }}
            >
              {integration.status}
            </span>
          </p>
          {integration.lastSyncedAt && (
            <p>Last Synced: {new Date(integration.lastSyncedAt).toLocaleString()}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 12: Using IntegrationsService Directly
// ============================================================================

export async function Example12_UsingServiceDirectly() {
  const { integrationsService } = await import("@/features/system/integrations");

  // Create a read-only API key (convenience method)
  const result = await integrationsService.createReadOnlyApiKey("Read-Only Key");
  console.log("Read-only key created:", result.key);

  // Create a webhook for specific events (convenience method)
  const webhookId = await integrationsService.createWebhookForEvents(
    "https://example.com/webhook",
    ["user.created", "payment.succeeded"],
    "webhook-secret"
  );
  console.log("Webhook created:", webhookId);

  // Get recent request logs (convenience method)
  const recentLogs = await integrationsService.getRecentRequestLogs(100);
  console.log("Recent logs:", recentLogs);

  // Get failed requests (convenience method)
  const failedRequests = await integrationsService.getFailedRequests(50);
  console.log("Failed requests:", failedRequests);
}

// ============================================================================
// Example 13: Multi-Provider Setup
// ============================================================================

export function Example13_MultiProviderSetup() {
  // You can specify the provider type when wrapping your app
  return (
    <div>
      {/* Default internal provider (Convex) */}
      {/* <IntegrationsProvider>
        <App />
      </IntegrationsProvider> */}

      {/* Or use Zapier provider */}
      {/* <IntegrationsProvider providerType="zapier">
        <App />
      </IntegrationsProvider> */}

      {/* Or use Make provider */}
      {/* <IntegrationsProvider providerType="make">
        <App />
      </IntegrationsProvider> */}

      {/* Or use n8n provider */}
      {/* <IntegrationsProvider providerType="n8n">
        <App />
      </IntegrationsProvider> */}
    </div>
  );
}

// ============================================================================
// Example 14: Custom Rate Limits by Tier
// ============================================================================

export function Example14_TierBasedRateLimits() {
  const userId = "user123" as Id<"userProfiles">;
  const { createApiKey } = useApiKeys();

  const createKeyForTier = async (tier: "free" | "pro" | "enterprise") => {
    const rateLimits = {
      free: {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
      },
      pro: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
      enterprise: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000,
        requestsPerDay: 100000,
      },
    };

    const result = await createApiKey({
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} API Key`,
      scopes: [API_SCOPES.READ_USERS, API_SCOPES.READ_PAYMENTS],
      rateLimit: rateLimits[tier],
    });

    alert(`${tier} tier key created: ${result.key}`);
  };

  return (
    <div>
      <button onClick={() => createKeyForTier("free")}>Create Free Tier Key</button>
      <button onClick={() => createKeyForTier("pro")}>Create Pro Tier Key</button>
      <button onClick={() => createKeyForTier("enterprise")}>
        Create Enterprise Tier Key
      </button>
    </div>
  );
}

// ============================================================================
// Example 15: Complete Integrations Dashboard
// ============================================================================

export function Example15_CompleteIntegrationsDashboard() {
  const userId = "user123" as Id<"userProfiles">;
  const { apiKeys } = useApiKeys();
  const { webhooks } = useWebhooks();
  const { oauthApps } = useOAuthApps();
  const { integrations } = useExternalIntegrations();
  const { stats } = useUsageStats(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
    Date.now()
  );

  return (
    <div>
      <h1>Integrations Dashboard</h1>

      <section>
        <h2>Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <div style={{ padding: "1rem", background: "#f0f0f0" }}>
            <h3>API Keys</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{apiKeys.length}</p>
          </div>
          <div style={{ padding: "1rem", background: "#f0f0f0" }}>
            <h3>Webhooks</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{webhooks.length}</p>
          </div>
          <div style={{ padding: "1rem", background: "#f0f0f0" }}>
            <h3>OAuth Apps</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{oauthApps.length}</p>
          </div>
          <div style={{ padding: "1rem", background: "#f0f0f0" }}>
            <h3>Integrations</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{integrations.length}</p>
          </div>
        </div>
      </section>

      {stats && (
        <section style={{ marginTop: "2rem" }}>
          <h2>Usage (Last 30 Days)</h2>
          <p>Total Requests: {stats.totalRequests.toLocaleString()}</p>
          <p>
            Success Rate:{" "}
            {((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%
          </p>
          <p>Avg Response Time: {stats.averageResponseTime.toFixed(2)}ms</p>
        </section>
      )}
    </div>
  );
}
