// src/features/boilerplate/analytics/EXAMPLES.tsx

import { useState } from "react";
import { useAnalytics, useMetricValue, useMetricTrend, useAnalyticsSummary } from "./hooks";
import { useActiveSessions } from "./hooks/useMetrics";
import { MetricCard } from "./components";
import { analyticsService } from "./services/AnalyticsService";
import { useAuth } from "@/features/boilerplate/auth/hooks/useAuth";

// Mock useNavigate for examples (replace with actual router hook in your app)
const useNavigate = () => (path: string) => window.location.href = path;

// Stub component for examples
const SearchComponent = ({ onSearch }: { onSearch: (query: string, results: number) => void }) => (
  <input
    type="search"
    placeholder="Search..."
    onChange={(e) => onSearch(e.target.value, 0)}
  />
);

/**
 * EXAMPLE 1: Basic Event Tracking
 */
function Example1_BasicTracking() {
  const { trackEvent } = useAnalytics();

  const handleClick = () => {
    trackEvent({
      eventName: "feature_used",
      eventType: "user_action",
    });
  };

  return <button onClick={handleClick}>Export Data</button>;
}

/**
 * EXAMPLE 2: Display Metrics
 */
function Example2_DisplayMetrics() {
  return (
    <div className="metrics-dashboard">
      <MetricCard
        metricType="daily_active_users"
        label="Daily Active Users"
        showTrend={true}
      />

      <MetricCard
        metricType="page_views"
        label="Page Views"
        showTrend={true}
      />

      <MetricCard
        metricType="ai_requests"
        label="AI Requests"
        formatValue={(value) => `${value.toLocaleString()} requests`}
      />
    </div>
  );
}

/**
 * EXAMPLE 3: Custom Metric Display
 */
function Example3_CustomMetric() {
  const { value, isLoading } = useMetricValue("revenue", "day", "this_month");
  const { trend } = useMetricTrend("revenue", "day", "this_month");

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="revenue-card">
      <h3>Revenue This Month</h3>
      <p className="value">${value?.sum?.toFixed(2) || 0}</p>
      {trend && (
        <p className={`trend ${trend.direction}`}>
          {trend.percentChange > 0 ? "+" : ""}
          {trend.percentChange.toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}

/**
 * EXAMPLE 4: Analytics Summary
 */
function Example4_AnalyticsSummary() {
  const { data: summary, isLoading } = useAnalyticsSummary("last_30_days");

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="analytics-summary">
      <h2>Last 30 Days Summary</h2>
      <div className="stats">
        <div>Total Events: {summary?.totalEvents}</div>
        <div>Unique Users: {summary?.uniqueUsers}</div>
        <div>Page Views: {summary?.pageViews}</div>
        <div>Sessions: {summary?.activeSessions}</div>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 5: Track AI Usage
 */
async function Example5_TrackAIUsage() {
  // After making a successful AI request
  await analyticsService.trackAIUsage(
    undefined, // errorCode (undefined for success)
    undefined, // errorMessage (undefined for success)
    {
      modelId: "gpt-4",
      modelName: "GPT-4",
      provider: "openai",
      promptTokens: 750,
      completionTokens: 500,
      totalTokens: 1250,
      cost: 0.025,
      latency: 1234,
      requestType: "chat_completion", // camelCase
    }
  );

  // Example with error
  await analyticsService.trackAIUsage(
    "rate_limit_exceeded",
    "API rate limit exceeded",
    {
      modelId: "gpt-4",
      modelName: "GPT-4",
      provider: "openai",
      promptTokens: 750,
      completionTokens: 0,
      totalTokens: 750,
      cost: 0,
      latency: 234,
    }
  );
}

/**
 * EXAMPLE 6: Track Payment
 */
async function Example6_TrackPayment() {
  // After successful payment
  await analyticsService.trackPayment(
    99.99,           // amount
    "USD",           // currency
    "txn_123456",    // transactionId
    "stripe",        // paymentMethod
    "completed",     // status
    {
      subscriptionId: "sub_123",
      planName: "pro",
      interval: "monthly",
      customerId: "cus_123", // camelCase
    }
  );

  // Example with failed payment
  await analyticsService.trackPayment(
    99.99,
    "USD",
    "txn_123457",
    "stripe",
    "failed",
    {
      errorCode: "card_declined",
      errorMessage: "Insufficient funds",
    }
  );
}

/**
 * EXAMPLE 7: Track Form Submission
 */
function Example7_TrackFormSubmission() {
  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await trackEvent({
      eventName: "form_submitted",
      eventType: "user_action",
      properties: {
        eventType: "user_action", // Required discriminator
        action: "submit",          // Required field
        formName: "contact",       // camelCase
        formId: "contact-form",
        category: "engagement",
        label: "Contact form submission",
      },
    });

    // Handle form submission...
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}

/**
 * EXAMPLE 8: Track Error
 */
function Example8_TrackError() {
  const { trackEvent } = useAnalytics();

  const handleError = (error: Error) => {
    trackEvent({
      eventName: "error_occurred",
      eventType: "error",
      properties: {
        eventType: "error",           // Required discriminator
        errorType: "runtime_error",   // Required field
        errorMessage: error.message,  // camelCase, required
        errorStack: error.stack,      // camelCase
        componentName: "UserDashboard",
        severity: "high",             // Required field
      },
    });
  };

  // Alternative: Use convenience method
  const handleErrorAlt = (error: Error) => {
    analyticsService.trackError(error.message, {
      errorType: "runtime_error",
      errorStack: error.stack,
      componentName: "UserDashboard",
      severity: "high",
    });
  };

  return <div>Component with error tracking</div>;
}

/**
 * EXAMPLE 9: Track Feature Usage with Value
 */
function Example9_TrackWithValue() {
  const { trackEvent } = useAnalytics();

  const handlePurchase = (amount: number) => {
    trackEvent({
      eventName: "purchase_completed",
      eventType: "payment",
      value: amount,
      currency: "USD",
      properties: {
        eventType: "payment",               // Required discriminator
        transactionId: "txn_" + Date.now(), // Required
        amount: amount,                     // Required
        currency: "USD",                    // Required
        paymentMethod: "stripe",            // Required
        status: "completed",                // Required
        productId: "prod_123",              // camelCase
        quantity: 1,
      },
    });
  };

  return <button onClick={() => handlePurchase(29.99)}>Buy Now</button>;
}

/**
 * EXAMPLE 10: Multiple Metrics at Once
 */
function Example10_MultipleMetrics() {
  const dau = useMetricValue("daily_active_users", "day");
  const pageViews = useMetricValue("page_views", "day");
  const aiRequests = useMetricValue("ai_requests", "day");

  return (
    <div className="metrics-grid">
      <div>DAU: {dau.value?.count || 0}</div>
      <div>Page Views: {pageViews.value?.count || 0}</div>
      <div>AI Requests: {aiRequests.value?.count || 0}</div>
    </div>
  );
}

/**
 * EXAMPLE 11: Conditional Tracking Based on User
 */
function Example11_ConditionalTracking() {
  const { trackEvent } = useAnalytics();
  const { profile } = useAuth(); // profile contains Convex userProfile

  const handleAction = () => {
    // Track with user context - userId automatically added from JWT in backend
    trackEvent({
      eventName: "premium_feature_used",
      eventType: "user_action",
      userId: profile?._id, // Convex userProfile ID
      properties: {
        eventType: "user_action",    // Required discriminator
        action: "use_feature",       // Required field
        feature: "advanced_export",
        userPlan: profile?.metadata?.plan || "free", // camelCase
        category: "premium_features",
      },
    });
  };

  return <button onClick={handleAction}>Use Premium Feature</button>;
}

/**
 * EXAMPLE 12: Real-time Active Sessions
 */
function Example12_ActiveSessions() {
  const { count: activeSessions } = useActiveSessions();

  return (
    <div className="active-sessions">
      <span className="indicator"></span>
      <span>{activeSessions} users online</span>
    </div>
  );
}

/**
 * EXAMPLE 13: Track Modal/Dialog Opens
 */
function Example13_TrackModalOpen() {
  const { trackEvent } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    trackEvent({
      eventName: "modal_opened",
      eventType: "user_action",
      properties: {
        eventType: "user_action",  // Required discriminator
        action: "open",            // Required field
        modalType: "settings",     // camelCase
        category: "navigation",
        label: "Settings modal opened",
        target: "nav_menu",
      },
    });
  };

  return <button onClick={openModal}>Open Settings</button>;
}

/**
 * EXAMPLE 14: Track Search Queries
 */
function Example14_TrackSearch() {
  const { trackEvent } = useAnalytics();

  const handleSearch = (query: string, results: number) => {
    trackEvent({
      eventName: "search_performed",
      eventType: "user_action",
      properties: {
        eventType: "user_action",     // Required discriminator
        action: "search",             // Required field
        query,
        resultsCount: results,        // camelCase
        queryLength: query.length,    // camelCase
        category: "search",
        label: `Search: ${query}`,
      },
    });
  };

  return <SearchComponent onSearch={handleSearch} />;
}

/**
 * EXAMPLE 15: Track Navigation
 */
function Example15_TrackNavigation() {
  const { trackEvent } = useAnalytics();
  const navigate = useNavigate();

  const handleNavigation = (destination: string) => {
    trackEvent({
      eventName: "navigation",
      eventType: "user_action",
      properties: {
        eventType: "user_action",           // Required discriminator
        action: "navigate",                 // Required field
        from: window.location.pathname,
        target: destination,
        category: "navigation",
        label: `Navigate to ${destination}`,
      },
    });

    navigate(destination);
  };

  return <button onClick={() => handleNavigation("/dashboard")}>Go to Dashboard</button>;
}

/**
 * EXAMPLE 16: Track Button Click (Convenience Method)
 */
function Example16_ButtonClickConvenience() {
  const handleExport = async () => {
    // Using convenience method
    await analyticsService.trackButtonClick("Export Data", {
      buttonId: "export-btn",
      format: "csv",
      recordCount: 1500,
    });

    // Perform export...
  };

  return <button id="export-btn" onClick={handleExport}>Export Data</button>;
}

/**
 * EXAMPLE 17: Track Form Submit (Convenience Method)
 */
function Example17_FormSubmitConvenience() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await analyticsService.trackFormSubmit("newsletter_signup", {
      formId: "newsletter-form",
      source: "homepage",
      emailDomain: "gmail.com",
    });

    // Handle submission...
  };

  return (
    <form id="newsletter-form" onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}

/**
 * EXAMPLE 18: Track Page View with Duration
 */
function Example18_PageViewWithDuration() {
  const { trackEvent } = useAnalytics();
  const [entryTime] = useState(Date.now());

  // Track page view on mount (handled by EventTracker automatically)
  // Track exit with duration on unmount
  useState(() => {
    return () => {
      const duration = Date.now() - entryTime;
      trackEvent({
        eventName: "page_exit",
        eventType: "page_view",
        properties: {
          eventType: "page_view",
          duration,
          scrollDepth: Math.round((window.scrollY / document.body.scrollHeight) * 100),
          exitPage: true,
        },
      });
    };
  });

  return <div>Page content</div>;
}

/**
 * EXAMPLE 19: Track Errors with Different Severity Levels
 */
function Example19_ErrorSeverity() {
  // Low severity - validation error
  const trackValidationError = () => {
    analyticsService.trackError("Invalid email format", {
      errorType: "validation_error",
      severity: "low",
      componentName: "SignupForm",
    });
  };

  // Medium severity - API error
  const trackApiError = () => {
    analyticsService.trackError("Failed to load data", {
      errorType: "api_error",
      severity: "medium",
      statusCode: 500,
      url: "/api/users",
    });
  };

  // High severity - payment failure
  const trackPaymentError = () => {
    analyticsService.trackError("Payment processing failed", {
      errorType: "payment_error",
      severity: "high",
      componentName: "CheckoutForm",
    });
  };

  // Critical severity - system crash
  const trackSystemError = () => {
    analyticsService.trackError("Database connection lost", {
      errorType: "system_error",
      severity: "critical",
      errorStack: new Error().stack,
    });
  };

  return (
    <div>
      <button onClick={trackValidationError}>Trigger Validation Error</button>
      <button onClick={trackApiError}>Trigger API Error</button>
      <button onClick={trackPaymentError}>Trigger Payment Error</button>
      <button onClick={trackSystemError}>Trigger System Error</button>
    </div>
  );
}

// Note: These are examples only. Import and use as needed in your actual components.
