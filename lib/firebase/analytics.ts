import { analytics } from "./config";
import { logEvent, setUserId, setUserProperties } from "firebase/analytics";

// Analytics event types
export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

// Page view tracking
export const logPageView = (pageName: string, pageTitle?: string) => {
  if (!analytics) return;

  logEvent(analytics, "page_view", {
    page_name: pageName,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

// Tour-related events
export const logTourView = (
  tourId: string,
  tourTitle: string,
  tourPrice?: string
) => {
  if (!analytics) return;

  logEvent(analytics, "tour_view", {
    tour_id: tourId,
    tour_title: tourTitle,
    tour_price: tourPrice,
    page_location: window.location.href,
  });
};

export const logTourSearch = (searchQuery: string, resultsCount: number) => {
  if (!analytics) return;

  logEvent(analytics, "tour_search", {
    search_term: searchQuery,
    results_count: resultsCount,
  });
};

export const logTourFilter = (filterType: string, filterValue: string) => {
  if (!analytics) return;

  logEvent(analytics, "tour_filter", {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// User interaction events
export const logButtonClick = (buttonName: string, buttonLocation: string) => {
  if (!analytics) return;

  logEvent(analytics, "button_click", {
    button_name: buttonName,
    button_location: buttonLocation,
  });
};

export const logFormSubmission = (formName: string, formType: string) => {
  if (!analytics) return;

  logEvent(analytics, "form_submit", {
    form_name: formName,
    form_type: formType,
  });
};

// AI Chat events
export const logAIChatStart = (query: string) => {
  if (!analytics) return;

  logEvent(analytics, "ai_chat_start", {
    query: query,
  });
};

export const logAIChatResponse = (query: string, responseLength: number) => {
  if (!analytics) return;

  logEvent(analytics, "ai_chat_response", {
    query: query,
    response_length: responseLength,
  });
};

// Admin events
export const logAdminLogin = (adminEmail: string) => {
  if (!analytics) return;

  logEvent(analytics, "admin_login", {
    admin_email: adminEmail,
  });
};

export const logAdminAction = (action: string, resource: string) => {
  if (!analytics) return;

  logEvent(analytics, "admin_action", {
    action: action,
    resource: resource,
  });
};

// Site configuration events
export const logConfigUpdate = (configType: string, configName: string) => {
  if (!analytics) return;

  logEvent(analytics, "config_update", {
    config_type: configType,
    config_name: configName,
  });
};

// Error tracking
export const logError = (
  errorType: string,
  errorMessage: string,
  errorLocation?: string
) => {
  if (!analytics) return;

  logEvent(analytics, "error", {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation || window.location.href,
  });
};

// Performance tracking
export const logPerformance = (metricName: string, value: number) => {
  if (!analytics) return;

  logEvent(analytics, "performance", {
    metric_name: metricName,
    value: value,
  });
};

// User engagement
export const logUserEngagement = (
  engagementType: string,
  duration?: number
) => {
  if (!analytics) return;

  logEvent(analytics, "user_engagement", {
    engagement_type: engagementType,
    duration: duration,
  });
};

// Set user properties
export const setUserAnalytics = (
  userId: string,
  userProperties: Record<string, any>
) => {
  if (!analytics) return;

  setUserId(analytics, userId);
  setUserProperties(analytics, userProperties);
};

// Custom event logging
export const logCustomEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (!analytics) return;

  logEvent(analytics, eventName, parameters);
};

// Initialize analytics for the app
export const initializeAnalytics = () => {
  if (!analytics) {
    console.warn("Firebase Analytics not available");
    return;
  }

  // Log app start
  logEvent(analytics, "app_start", {
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    platform: "web",
  });

  console.log("Firebase Analytics initialized");
};
