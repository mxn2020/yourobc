// src/features/boilerplate/analytics/hooks/useAnalytics.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { analyticsService } from "../services/AnalyticsService";
import { AnalyticsContextValue, TrackEventParams, PageViewParams, UserTraits } from "../types";
import { Id } from "@/convex/_generated/dataModel";
import { analyticsConfig } from "../config/analytics-config";

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

/**
 * Analytics Provider Component
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize analytics service
    analyticsService
      .initialize()
      .then(() => {
        setIsInitialized(true);
      })
      .catch((error) => {
        console.error("Failed to initialize analytics:", error);
      });
  }, []);

  const trackEvent = async (params: TrackEventParams) => {
    if (!isInitialized) return;
    await analyticsService.trackEvent(params);
  };

  const trackPageView = async (params: PageViewParams) => {
    if (!isInitialized) return;
    await analyticsService.trackPageView(params);
  };

  const identifyUser = async (userId: Id<"userProfiles">, traits?: UserTraits) => {
    if (!isInitialized) return;
    await analyticsService.identifyUser(userId, traits);
  };

  const value: AnalyticsContextValue = {
    provider: analyticsService.getProvider(),
    isInitialized,
    trackEvent,
    trackPageView,
    identifyUser,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to use analytics
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }

  return context;
}

/**
 * Hook to track page views automatically
 */
export function usePageTracking(enabled: boolean = analyticsConfig.autoTrackPageViews) {
  const { trackPageView, isInitialized } = useAnalytics();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    if (!enabled || !isInitialized) return;

    // Track initial page view
    trackPageView({
      path: window.location.pathname,
      title: document.title,
    });

    // Listen for navigation changes (for SPAs)
    const handleNavigation = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        trackPageView({
          path: newPath,
          title: document.title,
        });
      }
    };

    // Listen for both pushState and popState
    window.addEventListener("popstate", handleNavigation);

    // Intercept pushState and replaceState
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleNavigation();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      handleNavigation();
    };

    return () => {
      window.removeEventListener("popstate", handleNavigation);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [enabled, isInitialized, currentPath, trackPageView]);
}

/**
 * Hook to identify user when they log in
 */
export function useUserIdentification(userId?: Id<"userProfiles">, traits?: UserTraits) {
  const { identifyUser, isInitialized } = useAnalytics();

  useEffect(() => {
    if (!isInitialized || !userId) return;

    identifyUser(userId, traits);
  }, [isInitialized, userId, traits, identifyUser]);
}
