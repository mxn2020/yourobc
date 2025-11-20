// src/features/system/analytics/components/EventTracker.tsx

import { useEffect } from "react";
import { useAnalytics, usePageTracking, useUserIdentification } from "../hooks/useAnalytics";
import { useAuth } from "@/features/system/auth/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";

interface EventTrackerProps {
  /**
   * Enable automatic page view tracking
   */
  enablePageViews?: boolean;

  /**
   * Enable automatic user action tracking (clicks, form submissions)
   */
  enableUserActions?: boolean;

  /**
   * Enable automatic error tracking
   */
  enableErrorTracking?: boolean;
}

/**
 * EventTracker Component
 * Automatically tracks page views, user actions, and errors
 * Place this component at the root of your app
 */
export function EventTracker({
  enablePageViews = true,
  enableUserActions = false,
  enableErrorTracking = true,
}: EventTrackerProps) {
  const { trackEvent } = useAnalytics();
  const { profile } = useAuth();

  // Auto-track page views
  usePageTracking(enablePageViews);

  // Auto-identify user - use Convex userProfileId (Id<"userProfiles">)
  // Analytics stores userId as Id<"userProfiles"> for relational integrity
  useUserIdentification(profile?._id, {
    name: profile?.name ?? undefined,
    email: profile?.email,
    role: profile?.role ?? undefined,
  });

  // Track user actions (clicks, form submissions)
  useEffect(() => {
    if (!enableUserActions) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Track button clicks
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.getAttribute("role") === "button"
      ) {
        const button = target.closest("button") || target;
        const buttonText =
          button.textContent?.trim() || button.getAttribute("aria-label") || "Unknown";

        trackEvent({
          eventName: "button_clicked",
          eventType: "user_action",
          userId: profile?._id,
          properties: {
            eventType: "user_action",
            action: "click",
            buttonName: buttonText,
            buttonId: button.id || undefined,
            buttonClass: button.className || undefined,
          },
        });
      }

      // Track link clicks
      if (target.tagName === "A" || target.closest("a")) {
        const link = (target.closest("a") || target) as HTMLAnchorElement;
        trackEvent({
          eventName: "link_clicked",
          eventType: "user_action",
          userId: profile?._id,
          properties: {
            eventType: "user_action",
            action: "click",
            linkText: link.textContent?.trim(),
            target: link.href,
            linkTarget: link.target || undefined,
          },
        });
      }
    };

    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      trackEvent({
        eventName: "form_submitted",
        eventType: "user_action",
        userId: profile?._id,
        properties: {
          eventType: "user_action",
          action: "submit",
          formId: form.id || undefined,
          formName: form.getAttribute("name") || undefined,
          formAction: form.action || undefined,
        },
      });
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, [enableUserActions, trackEvent]);

  // Track errors
  useEffect(() => {
    if (!enableErrorTracking) return;

    const handleError = (event: ErrorEvent) => {
      trackEvent({
        eventName: "error",
        eventType: "error",
        userId: profile?._id,
        properties: {
          eventType: "error",
          errorType: "runtime_error",
          errorMessage: event.message,
          severity: "high",
          errorStack: event.error?.stack,
          url: event.filename,
          componentName: event.filename ? event.filename.split('/').pop() : undefined,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent({
        eventName: "unhandled_rejection",
        eventType: "error",
        userId: profile?._id,
        properties: {
          eventType: "error",
          errorType: "promise_rejection",
          errorMessage: event.reason?.toString() || "Unhandled promise rejection",
          severity: "critical",
          errorStack: event.reason?.stack,
        },
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [enableErrorTracking, trackEvent]);

  // This component doesn't render anything
  return null;
}
