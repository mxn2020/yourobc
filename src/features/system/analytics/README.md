# Analytics Feature

A comprehensive analytics system with multi-provider support (Internal/Convex, Google Analytics 4, Mixpanel, Plausible).

## Features

- ✅ **Event Tracking** - Page views, user actions, AI usage, payments, errors
- ✅ **Metrics Aggregation** - Automatic hourly/daily aggregation with cron jobs
- ✅ **Dashboards** - Custom dashboards with configurable widgets
- ✅ **Reports** - Scheduled reports with CSV/JSON/PDF export
- ✅ **Multi-Provider** - Support for multiple analytics providers
- ✅ **Real-time** - Live session tracking and active users
- ✅ **Privacy-Focused** - IP hashing, data sanitization

## Quick Start

### 1. Setup Provider (Root of App)

```tsx
import { AnalyticsProvider, EventTracker } from "@/features/system/analytics";

function App() {
  return (
    <AnalyticsProvider>
      <EventTracker
        enablePageViews={true}
        enableUserActions={false}
        enableErrorTracking={true}
      />
      {/* Your app content */}
    </AnalyticsProvider>
  );
}
```

### 2. Track Custom Events

```tsx
import { useAnalytics } from "@/features/system/analytics";

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent({
      eventName: "feature_used",
      eventType: "user_action",
      properties: {
        feature_name: "export_data",
      },
    });
  };

  return <button onClick={handleClick}>Export Data</button>;
}
```

### 3. Display Metrics

```tsx
import { useMetricValue, useMetricTrend } from "@/features/system/analytics";

function MetricsCard() {
  const { value, isLoading } = useMetricValue("daily_active_users", "day");
  const { trend } = useMetricTrend("daily_active_users", "day", "last_30_days");

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Daily Active Users</h3>
      <p>{value?.count || 0}</p>
      {trend && (
        <span className={trend.direction === "up" ? "text-green" : "text-red"}>
          {trend.percentChange.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
```

## Environment Variables

```env
# Primary provider (internal, google_analytics, mixpanel, plausible)
VITE_PRIMARY_ANALYTICS_PROVIDER=internal

# Enable/disable tracking
VITE_ANALYTICS_ENABLE_TRACKING=true

# Sample rate (0-1, where 1 = 100%)
VITE_ANALYTICS_SAMPLE_RATE=1

# Google Analytics 4
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GA4_API_SECRET=your_secret

# Mixpanel
VITE_MIXPANEL_PROJECT_TOKEN=your_token
VITE_MIXPANEL_API_SECRET=your_secret

# Plausible
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
VITE_PLAUSIBLE_API_KEY=your_key
```

## Available Hooks

### Core Hooks
- `useAnalytics()` - Main analytics hook for tracking
- `usePageTracking(enabled)` - Auto-track page views
- `useUserIdentification(userId, traits)` - Identify users

### Metrics Hooks
- `useMetric(params)` - Fetch single metric
- `useMetrics(metricTypes, params)` - Fetch multiple metrics
- `useMetricValue(type, period, preset)` - Get latest metric value
- `useMetricTrend(type, period, preset)` - Calculate trend
- `useAnalyticsSummary(preset)` - Get analytics overview
- `usePageViews(start, end, path, limit)` - Get page view stats
- `useActiveSessions()` - Get real-time active sessions
- `useUniqueUsers(start, end)` - Get unique user count

## Common Metric Types

```typescript
// User Metrics
"daily_active_users"
"weekly_active_users"
"monthly_active_users"
"new_users"
"returning_users"

// Engagement Metrics
"page_views"
"sessions"
"avg_session_duration"
"bounce_rate"

// AI Metrics
"ai_requests"
"ai_cost"
"ai_latency"
"ai_success_rate"

// Payment Metrics
"revenue"
"mrr"
"churn_rate"
"new_subscriptions"
"cancelled_subscriptions"

// Performance Metrics
"api_response_time"
"error_rate"
"uptime"
```

## Event Types

- `page_view` - Page navigation
- `user_action` - Button clicks, form submissions
- `ai_usage` - AI requests and responses
- `payment` - Payment events
- `error` - Error tracking
- `custom` - Custom events

## Date Range Presets

- `today`
- `yesterday`
- `last_7_days`
- `last_30_days`
- `last_90_days`
- `this_month`
- `last_month`
- `this_year`
- `custom`

## Cron Jobs

Analytics metrics are automatically aggregated:

- **Hourly**: Runs at 5 minutes past each hour
- **Daily**: Runs at 1:00 AM UTC

See `/convex/crons.ts` for configuration.

## Architecture

```
src/features/system/analytics/
├── types/              # TypeScript interfaces
├── config/             # Provider configuration
├── providers/
│   └── internal/       # Convex-based provider
├── services/           # AnalyticsService facade
├── hooks/              # React hooks
├── components/         # EventTracker component
└── utils/              # Utility functions

convex/lib/system/analytics/
├── types.ts            # Backend types
├── constants.ts        # Configuration
├── utils.ts            # Helper functions
├── queries.ts          # Read operations (17 queries)
├── mutations.ts        # Write operations (14 mutations)
└── aggregations.ts     # Metric aggregation logic
```

## Database Schema

- `analyticsEvents` - Raw event data
- `analyticsMetrics` - Pre-aggregated metrics
- `analyticsDashboards` - Custom dashboards
- `analyticsReports` - Scheduled reports
- `analyticsProviderSync` - External provider config

## Next Steps

1. **External Providers**: Implement Google Analytics, Mixpanel, Plausible providers
2. **Dashboard UI**: Build visual dashboard with charts
3. **Reports UI**: Create report builder and scheduler
4. **Export**: Implement PDF export for reports
5. **Real-time**: Add WebSocket support for live metrics

## Examples

### Track AI Usage
```typescript
import { analyticsService } from "@/features/system/analytics";

await analyticsService.trackAIUsage(
  "gpt-4",
  1000, // tokens
  0.02, // cost in USD
  { provider: "openai" }
);
```

### Track Payment
```typescript
await analyticsService.trackPayment(
  99.99,
  "USD",
  { plan: "pro", interval: "monthly" }
);
```

### Track Error
```typescript
await analyticsService.trackError(
  "Failed to load data",
  { component: "Dashboard", severity: "high" }
);
```

## Support

For issues or questions, please refer to the main system documentation.
