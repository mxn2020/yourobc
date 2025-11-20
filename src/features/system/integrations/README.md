# Integrations Feature - Complete Guide

The **Integrations** feature provides a comprehensive API management system for your TanStack Start + Convex boilerplate, enabling:

- **API Key Management** - Generate, validate, and manage API keys with scopes and rate limits
- **Webhook System** - Create webhooks with automatic delivery, retries, and HMAC signatures
- **OAuth 2.0 Platform** - Build OAuth apps with authorization code and client credentials flows
- **External Integrations** - Connect to Zapier, Make, n8n, and custom platforms
- **Request Logging** - Track all API requests with comprehensive analytics
- **Usage Statistics** - Monitor API usage, success rates, and performance metrics

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [API Key Management](#api-key-management)
4. [Webhook Management](#webhook-management)
5. [OAuth 2.0](#oauth-20)
6. [External Integrations](#external-integrations)
7. [Request Logging](#request-logging)
8. [Configuration](#configuration)
9. [API Reference](#api-reference)

---

## 🚀 Quick Start

### 1. Wrap your app with IntegrationsProvider

```tsx
// src/routes/__root.tsx
import { IntegrationsProvider } from '@/features/boilerplate/integrations';

export const Route = createRootRoute({
  component: () => (
    <IntegrationsProvider>
      <App />
    </IntegrationsProvider>
  ),
});
```

### 2. Create an API Key

```tsx
import { useApiKeys } from '@/features/boilerplate/integrations';

function CreateApiKeyButton() {
  const { createApiKey } = useApiKeys(userId);

  const handleCreate = async () => {
    const result = await createApiKey({
      name: "Production API Key",
      scopes: ["users:read", "data:read"],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
    });

    console.log("API Key (save this!):", result.key);
    console.log("Key ID:", result.keyId);
  };

  return <button onClick={handleCreate}>Create API Key</button>;
}
```

### 3. Create a Webhook

```tsx
import { useWebhooks } from '@/features/boilerplate/integrations';

function CreateWebhookButton() {
  const { createWebhook } = useWebhooks(userId);

  const handleCreate = async () => {
    const webhookId = await createWebhook({
      url: "https://example.com/webhook",
      events: ["user.created", "payment.succeeded"],
      active: true,
    });

    console.log("Webhook created:", webhookId);
  };

  return <button onClick={handleCreate}>Create Webhook</button>;
}
```

---

## 🏗️ Architecture

The Integrations feature follows the **multi-provider architecture** pattern:

```
IntegrationsService (Facade)
       ↓
IntegrationProvider (Interface)
       ↓
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Internal   │    Zapier    │     Make     │     n8n      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Key Components:

- **IntegrationsService**: Singleton facade providing unified API
- **IntegrationProvider**: Interface that all providers implement
- **InternalIntegrationProvider**: Default provider using Convex backend
- **External Providers**: Optional providers for Zapier, Make, n8n

---

## 🔑 API Key Management

### Creating API Keys

```tsx
import { useApiKeys, API_SCOPES } from '@/features/boilerplate/integrations';

const { createApiKey } = useApiKeys(userId);

// Basic API key
const result = await createApiKey({
  name: "My API Key",
  scopes: [API_SCOPES.READ_USERS, API_SCOPES.READ_PAYMENTS],
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
});

// Advanced API key with IP whitelist and expiration
const advancedResult = await createApiKey({
  name: "Advanced API Key",
  scopes: [API_SCOPES.WRITE_USERS],
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 5000,
    requestsPerDay: 50000,
  },
  expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  allowedIps: ["192.168.1.1", "10.0.0.1"],
});
```

### Available Scopes

```tsx
API_SCOPES.READ_USERS      // "users:read"
API_SCOPES.READ_PAYMENTS   // "payments:read"
API_SCOPES.READ_PROJECTS   // "projects:read"
API_SCOPES.READ_ANALYTICS  // "analytics:read"
API_SCOPES.WRITE_USERS     // "users:write"
API_SCOPES.WRITE_PROJECTS  // "projects:write"
API_SCOPES.ADMIN           // "admin:*"
```

### Displaying API Keys

```tsx
import { ApiKeyCard, ApiKeyList } from '@/features/boilerplate/integrations';

function ApiKeysPage() {
  const { apiKeys, revokeApiKey } = useApiKeys(userId);

  return (
    <ApiKeyList
      apiKeys={apiKeys}
      onRevoke={revokeApiKey}
      onViewDetails={(keyId) => navigate(`/api-keys/${keyId}`)}
    />
  );
}
```

### Validating API Keys

```tsx
import { useValidateApiKey } from '@/features/boilerplate/integrations';

const { validateApiKey } = useValidateApiKey();

const isValid = await validateApiKey("sk_12345678_...");
```

---

## 🪝 Webhook Management

### Creating Webhooks

```tsx
import { useWebhooks, WEBHOOK_EVENTS } from '@/features/boilerplate/integrations';

const { createWebhook } = useWebhooks(userId);

// Basic webhook
const webhookId = await createWebhook({
  url: "https://example.com/webhook",
  events: [
    WEBHOOK_EVENTS.USER_CREATED,
    WEBHOOK_EVENTS.PAYMENT_SUCCEEDED,
  ],
  active: true,
});

// Webhook with HMAC signature
const secureWebhookId = await createWebhook({
  url: "https://example.com/secure-webhook",
  events: [WEBHOOK_EVENTS.PAYMENT_SUCCEEDED],
  secret: "your-webhook-secret", // Used for HMAC signing
  active: true,
});
```

### Available Events

```tsx
// User events
WEBHOOK_EVENTS.USER_CREATED
WEBHOOK_EVENTS.USER_UPDATED
WEBHOOK_EVENTS.USER_DELETED

// Payment events
WEBHOOK_EVENTS.PAYMENT_SUCCEEDED
WEBHOOK_EVENTS.PAYMENT_FAILED
WEBHOOK_EVENTS.SUBSCRIPTION_CREATED
WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED
WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED

// AI events
WEBHOOK_EVENTS.AI_REQUEST_COMPLETED
WEBHOOK_EVENTS.AI_REQUEST_FAILED

// Project events
WEBHOOK_EVENTS.PROJECT_CREATED
WEBHOOK_EVENTS.PROJECT_UPDATED
WEBHOOK_EVENTS.PROJECT_COMPLETED

// Custom events
WEBHOOK_EVENTS.CUSTOM // Matches "custom.*"
```

### Testing Webhooks

```tsx
const { testWebhook } = useWebhooks(userId);

const delivery = await testWebhook(webhookId);
console.log("Status:", delivery.status);
console.log("Response:", delivery.response);
```

### Viewing Webhook Deliveries

```tsx
import { useWebhookDeliveries } from '@/features/boilerplate/integrations';

const { deliveries, isLoading } = useWebhookDeliveries(webhookId, 100);

deliveries.forEach(delivery => {
  console.log(`${delivery.status}: ${delivery.response}`);
});
```

### Displaying Webhooks

```tsx
import { WebhookCard, WebhookList } from '@/features/boilerplate/integrations';

function WebhooksPage() {
  const { webhooks, testWebhook, deleteWebhook } = useWebhooks(userId);

  return (
    <WebhookList
      webhooks={webhooks}
      onTest={testWebhook}
      onDelete={deleteWebhook}
      onViewDetails={(webhookId) => navigate(`/webhooks/${webhookId}`)}
    />
  );
}
```

---

## 🔐 OAuth 2.0

### Creating OAuth Apps

```tsx
import { useOAuthApps, OAUTH_SCOPES } from '@/features/boilerplate/integrations';

const { createOAuthApp } = useOAuthApps(userId);

const result = await createOAuthApp({
  name: "My OAuth App",
  description: "Third-party integration",
  redirectUris: ["https://example.com/callback"],
  scopes: [
    OAUTH_SCOPES.PROFILE_READ,
    OAUTH_SCOPES.DATA_READ,
  ],
  websiteUrl: "https://example.com",
  privacyPolicyUrl: "https://example.com/privacy",
});

console.log("Client ID:", result.clientId);
console.log("Client Secret (save this!):", result.clientSecret);
```

### Authorization Flow

```tsx
import { useOAuthAuthorization } from '@/features/boilerplate/integrations';

const { createAuthorization, exchangeCode } = useOAuthAuthorization();

// Step 1: Create authorization code
const authCode = await createAuthorization({
  clientId: "your-client-id",
  redirectUri: "https://example.com/callback",
  scope: ["profile:read", "data:read"],
  state: "random-state-value",
});

// Step 2: Exchange code for access token
const tokens = await exchangeCode({
  code: authCode,
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  redirectUri: "https://example.com/callback",
});

console.log("Access Token:", tokens.accessToken);
console.log("Refresh Token:", tokens.refreshToken);
```

### Managing OAuth Tokens

```tsx
import { useOAuthTokens, useRevokeOAuthToken } from '@/features/boilerplate/integrations';

const { tokens } = useOAuthTokens(appId);
const { revokeToken } = useRevokeOAuthToken();

// Revoke a token
await revokeToken(tokenId);
```

---

## 🔌 External Integrations

### Connecting External Platforms

```tsx
import { useExternalIntegrations } from '@/features/boilerplate/integrations';

const { connectIntegration, disconnectIntegration } = useExternalIntegrations(userId);

// Connect to Zapier
const zapierIntegrationId = await connectIntegration({
  platform: "zapier",
  name: "Zapier Integration",
  config: {
    webhookUrl: "https://hooks.zapier.com/hooks/catch/...",
  },
});

// Connect to Make (Integromat)
const makeIntegrationId = await connectIntegration({
  platform: "make",
  name: "Make Integration",
  config: {
    webhookUrl: "https://hook.integromat.com/...",
  },
});

// Connect to n8n
const n8nIntegrationId = await connectIntegration({
  platform: "n8n",
  name: "n8n Integration",
  config: {
    webhookUrl: "https://your-n8n-instance.com/webhook/...",
  },
});

// Disconnect
await disconnectIntegration(zapierIntegrationId);
```

### Testing External Integrations

```tsx
import { useTestExternalIntegration } from '@/features/boilerplate/integrations';

const { testIntegration } = useTestExternalIntegration();

const result = await testIntegration(integrationId);
console.log("Test result:", result);
```

---

## 📊 Request Logging

### Viewing Request Logs

```tsx
import { useRequestLogs, useRecentRequestLogs, useFailedRequests } from '@/features/boilerplate/integrations';

// Get logs for specific API key
const { logs } = useRequestLogs({
  apiKeyId: selectedApiKeyId,
  startDate: Date.now() - 24 * 60 * 60 * 1000,
  endDate: Date.now(),
  limit: 100,
});

// Get recent logs (last 24 hours)
const { logs: recentLogs } = useRecentRequestLogs(100);

// Get only failed requests
const { logs: failedLogs } = useFailedRequests(50);
```

### Usage Statistics

```tsx
import { useUsageStats, useRecentUsageStats } from '@/features/boilerplate/integrations';

const { stats, isLoading } = useRecentUsageStats(userId);

if (!isLoading && stats) {
  console.log("Total Requests:", stats.totalRequests);
  console.log("Success Rate:",
    (stats.successfulRequests / stats.totalRequests * 100).toFixed(2) + "%"
  );
  console.log("Avg Response Time:", stats.averageResponseTime + "ms");
  console.log("Requests by endpoint:", stats.requestsByEndpoint);
  console.log("Requests by day:", stats.requestsByDay);
}
```

---

## ⚙️ Configuration

All configuration is in `/src/features/boilerplate/integrations/config/integrations-config.ts`:

```typescript
export const INTEGRATIONS_CONFIG = {
  // API Key configuration
  API_KEY: {
    PREFIX: "sk_",
    LENGTH: 32,
    DEFAULT_EXPIRY_DAYS: 365,
    MAX_KEYS_PER_USER: 10,
  },

  // Rate limiting defaults
  RATE_LIMIT: {
    DEFAULT_PER_MINUTE: 60,
    DEFAULT_PER_HOUR: 1000,
    DEFAULT_PER_DAY: 10000,
  },

  // Webhook configuration
  WEBHOOK: {
    MAX_WEBHOOKS_PER_USER: 20,
    TIMEOUT_MS: 30000,
    MAX_RETRIES: 5,
    INITIAL_RETRY_DELAY_MS: 1000,
    BACKOFF_MULTIPLIER: 2,
  },

  // OAuth configuration
  OAUTH: {
    MAX_APPS_PER_USER: 5,
    AUTHORIZATION_CODE_EXPIRY_SECONDS: 600,
    ACCESS_TOKEN_EXPIRY_SECONDS: 3600,
    REFRESH_TOKEN_EXPIRY_SECONDS: 2592000,
  },
};
```

---

## 📚 API Reference

### Hooks

#### useIntegrations()
Main context hook for accessing integrations features.

#### useApiKeys(userId)
Manage API keys for a user.

#### useWebhooks(userId)
Manage webhooks for a user.

#### useOAuthApps(userId)
Manage OAuth apps for a user.

#### useExternalIntegrations(userId)
Manage external integrations for a user.

#### useRequestLogs(params)
Query API request logs.

#### useUsageStats(userId, startDate, endDate)
Get usage statistics for a time period.

### Components

#### <ApiKeyCard />
Display an API key with actions.

#### <ApiKeyForm />
Form to create a new API key.

#### <WebhookCard />
Display a webhook with actions.

#### <WebhookForm />
Form to create/edit a webhook.

### Services

#### integrationsService
Singleton service providing all integration operations.

```tsx
import { integrationsService } from '@/features/boilerplate/integrations';

// Create API key
await integrationsService.createApiKey(params);

// Create webhook
await integrationsService.createWebhook(params);

// Get usage stats
await integrationsService.getUsageStats(userId, startDate, endDate);
```

---

## 🎯 Best Practices

1. **API Keys**
   - Always save the API key immediately after creation (it won't be shown again)
   - Use appropriate scopes (principle of least privilege)
   - Set rate limits based on your tier system
   - Consider IP whitelisting for sensitive operations

2. **Webhooks**
   - Always use HTTPS URLs in production
   - Use webhook secrets for HMAC verification
   - Handle webhook retries gracefully
   - Log and monitor webhook delivery failures

3. **OAuth**
   - Validate redirect URIs strictly
   - Store client secrets securely
   - Implement token refresh logic
   - Use appropriate OAuth scopes

4. **External Integrations**
   - Test integrations before enabling
   - Monitor integration health
   - Handle integration failures gracefully
   - Provide clear error messages

---

## 🔒 Security

The Integrations feature includes several security measures:

- **API Key Hashing**: Keys are hashed before storage
- **HMAC Signatures**: Webhooks can be signed with HMAC-SHA256
- **Rate Limiting**: Configurable limits per API key
- **IP Whitelisting**: Restrict API key usage to specific IPs
- **Scope-based Access Control**: Fine-grained permissions
- **OAuth 2.0**: Industry-standard authentication
- **HTTPS Enforcement**: Webhooks require HTTPS in production

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Configure rate limits appropriately for your tiers
- [ ] Set up webhook secret generation
- [ ] Enable HTTPS enforcement
- [ ] Configure IP whitelisting if needed
- [ ] Set up monitoring for failed webhooks
- [ ] Implement API key rotation policy
- [ ] Configure OAuth redirect URI validation
- [ ] Set up request logging retention policy
- [ ] Test external integrations
- [ ] Document your API for external users

---

## 📖 Additional Resources

- [Backend API Reference](/convex/lib/boilerplate/integrations/)
- [Database Schema](/convex/schema/boilerplate/integrations.ts)
- [Configuration Options](/src/features/boilerplate/integrations/config/)
- [Example Usage](/src/features/boilerplate/integrations/EXAMPLES.tsx)

---

*Integrations Feature - TanStack Start + Convex Boilerplate*
*Version 1.0.0 - Complete Implementation*
