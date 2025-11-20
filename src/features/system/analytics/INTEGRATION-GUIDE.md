# Analytics Integration Guide

## Step-by-Step Integration

### 1. Wrap Your App with AnalyticsProvider

In your app root (usually `src/routes/__root.tsx` or `src/App.tsx`):

```tsx
import { AnalyticsProvider, EventTracker } from "@/features/boilerplate/analytics";

export function App() {
  return (
    <AnalyticsProvider>
      <EventTracker
        enablePageViews={true}
        enableUserActions={false}
        enableErrorTracking={true}
      />
      {/* Your existing app structure */}
      <YourRouterOrContent />
    </AnalyticsProvider>
  );
}
```

### 2. Track Custom Events in Your Components

```tsx
import { useAnalytics } from "@/features/boilerplate/analytics";

function MyFeature() {
  const { trackEvent } = useAnalytics();

  const handleExport = async () => {
    // Track the event
    await trackEvent({
      eventName: "data_exported",
      eventType: "user_action",
      properties: {
        export_format: "csv",
        record_count: 150,
      },
    });

    // Your export logic...
  };

  return <button onClick={handleExport}>Export Data</button>;
}
```

### 3. Display Analytics on Dashboard

```tsx
import { MetricCard } from "@/features/boilerplate/analytics";

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="metrics-grid">
        <MetricCard
          metricType="daily_active_users"
          label="Daily Active Users"
          showTrend={true}
        />

        <MetricCard
          metricType="page_views"
          label="Page Views (Last 30 Days)"
          showTrend={true}
        />

        <MetricCard
          metricType="ai_requests"
          label="AI Requests"
          showTrend={true}
        />
      </div>
    </div>
  );
}
```

### 4. Track AI Usage (If Using AI Features)

```tsx
import { analyticsService } from "@/features/boilerplate/analytics";

async function callAI(prompt: string) {
  const startTime = Date.now();

  // Make AI request...
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const latency = Date.now() - startTime;
  const tokens = response.usage?.total_tokens || 0;
  const cost = calculateCost(tokens);

  // Track AI usage
  await analyticsService.trackAIUsage(
    "gpt-4",
    tokens,
    cost,
    { latency, prompt_length: prompt.length }
  );

  return response;
}
```

### 5. Track Payments (If Using Payment Features)

```tsx
import { analyticsService } from "@/features/boilerplate/analytics";

async function handlePaymentSuccess(payment: Payment) {
  // Track payment
  await analyticsService.trackPayment(
    payment.amount,
    payment.currency,
    {
      plan: payment.plan,
      interval: payment.interval,
      customer_id: payment.customerId,
    }
  );
}
```

### 6. Identify Users on Login

```tsx
import { useUserIdentification } from "@/features/boilerplate/analytics";

function MyApp() {
  const { user } = useAuth();

  // Automatically identify user
  useUserIdentification(user?._id, {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    plan: user?.subscriptionPlan,
  });

  return <YourApp />;
}
```

### 7. Create a Dedicated Analytics Page

```tsx
import { AnalyticsOverview } from "@/features/boilerplate/analytics/pages";

// In your routes file
export const Route = createFileRoute("/_protected/analytics")({
  component: AnalyticsOverview,
});
```

## Environment Variables

Add these to your `.env` file:

```env
# Analytics Configuration
VITE_PRIMARY_ANALYTICS_PROVIDER=internal
VITE_ANALYTICS_ENABLE_TRACKING=true
VITE_ANALYTICS_SAMPLE_RATE=1

# Optional: External Providers
# VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
# VITE_MIXPANEL_PROJECT_TOKEN=your_token
# VITE_PLAUSIBLE_DOMAIN=yourdomain.com
```

## Available Hooks

### useAnalytics()
Main hook for tracking events.

```tsx
const { trackEvent, trackPageView, identifyUser } = useAnalytics();
```

### useMetric(params)
Fetch a specific metric.

```tsx
const { data, isLoading } = useMetric({
  metricType: "daily_active_users",
  period: "day",
  startDate: thirtyDaysAgo,
  endDate: now,
});
```

### useMetricValue(type, period, preset)
Get the latest value for a metric.

```tsx
const { value, isLoading } = useMetricValue("page_views", "day", "last_7_days");
// value.count, value.sum, value.average
```

### useMetricTrend(type, period, preset)
Calculate trend for a metric.

```tsx
const { trend, isLoading } = useMetricTrend("daily_active_users", "day", "last_30_days");
// trend.percentChange, trend.direction ("up" | "down" | "flat")
```

### useAnalyticsSummary(preset)
Get overall analytics summary.

```tsx
const { data, isLoading } = useAnalyticsSummary("last_30_days");
// data.totalEvents, data.uniqueUsers, data.pageViews, etc.
```

### useActiveSessions()
Get real-time active sessions count.

```tsx
const { count, isLoading } = useActiveSessions();
```

## Common Patterns

### Track Button Click
```tsx
<button onClick={() => trackEvent({
  eventName: "button_clicked",
  eventType: "user_action",
  properties: { button_id: "export_btn" }
})}>
  Export
</button>
```

### Track Form Submit
```tsx
<form onSubmit={(e) => {
  e.preventDefault();
  trackEvent({
    eventName: "form_submitted",
    eventType: "user_action",
    properties: { form_name: "contact" }
  });
  handleSubmit();
}}>
  {/* form fields */}
</form>
```

### Track Feature Usage
```tsx
const openModal = () => {
  trackEvent({
    eventName: "modal_opened",
    eventType: "user_action",
    properties: { modal_type: "settings" }
  });
  setShowModal(true);
};
```

## Cron Jobs (Automatic)

Analytics metrics are automatically aggregated:

- **Hourly**: Runs at 5 minutes past each hour
- **Daily**: Runs at 1:00 AM UTC

No manual intervention needed!

## Troubleshooting

### Events not showing up?
1. Check that `VITE_ANALYTICS_ENABLE_TRACKING=true`
2. Verify AnalyticsProvider wraps your app
3. Check browser console for errors

### Metrics showing 0?
1. Wait for next cron job (max 1 hour for hourly metrics)
2. Track some events first
3. Check date range matches when events were tracked

### Performance concerns?
1. Reduce sample rate: `VITE_ANALYTICS_SAMPLE_RATE=0.5` (track 50%)
2. Disable auto page tracking if not needed
3. Consider using external provider for high-traffic sites

## Best Practices

1. **Track Meaningful Events**: Focus on business-critical actions
2. **Use Consistent Naming**: `feature_action` (e.g., `export_started`, `export_completed`)
3. **Add Context**: Include relevant properties for filtering
4. **Respect Privacy**: Don't track PII in event properties
5. **Monitor Performance**: Check analytics overhead in production

## Next Steps

- Build custom dashboards with specific metrics
- Set up scheduled reports
- Integrate with external providers (GA4, Mixpanel)
- Create visualizations with chart libraries
- Export data for deeper analysis
