import { getFirebaseAnalytics } from "./init";
import { logEvent, setUserId, setUserProperties } from "firebase/analytics";

// Analytics event types
export interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

// Real analytics tracking using Firebase Analytics
// Based on: https://support.google.com/firebase/answer/9519624?hl=en

// Page view tracking
export const logPageView = (pageName: string, pageTitle?: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    page_name: pageName,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  };

  // Log to Firebase Analytics
  logEvent(analytics, "page_view", parameters);
};

// Tour view tracking
export const logTourView = (tourId: string, tourName: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    tour_id: tourId,
    tour_name: tourName,
    page_location: window.location.href,
  };

  logEvent(analytics, "view_item", parameters);
};

// Tour booking click tracking
export const logTourBookingClick = (
  tourId: string,
  tourTitle: string,
  tourPrice?: string,
  buttonLocation?: string
) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    tour_id: tourId,
    tour_title: tourTitle,
    tour_price: tourPrice,
    button_location: buttonLocation || "tour_page",
    page_location: window.location.href,
  };

  logEvent(analytics, "tour_booking_click", parameters);
};

// Tour favorite tracking
export const logTourFavorite = (
  tourId: string,
  tourTitle: string,
  action: "add" | "remove"
) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    tour_id: tourId,
    tour_title: tourTitle,
    action: action,
    page_location: window.location.href,
  };

  logEvent(analytics, "tour_favorite", parameters);
};

// Admin login tracking
export const logAdminLogin = (adminEmail: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    admin_email: adminEmail,
    page_location: window.location.href,
  };

  logEvent(analytics, "admin_login", parameters);
};

// Admin action tracking
export const logAdminAction = (action: string, resource: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    action: action,
    resource: resource,
    page_location: window.location.href,
  };

  logEvent(analytics, "admin_action", parameters);
};

// Site configuration events
export const logConfigUpdate = (configType: string, configName: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    config_type: configType,
    config_name: configName,
    page_location: window.location.href,
  };

  logEvent(analytics, "config_update", parameters);
};

// Contact form submission
export const logContactForm = (formType: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    form_type: formType,
    page_location: window.location.href,
  };

  logEvent(analytics, "form_submit", parameters);
};

// Search tracking
export const logSearch = (searchTerm: string, resultsCount?: number) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    search_term: searchTerm,
    results_count: resultsCount || 0,
    page_location: window.location.href,
  };

  logEvent(analytics, "search", parameters);
};

// Button click tracking
export const logButtonClick = (buttonName: string, buttonLocation: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    button_name: buttonName,
    button_location: buttonLocation,
    page_location: window.location.href,
  };

  logEvent(analytics, "button_click", parameters);
};

// User engagement tracking
export const logUserEngagement = (
  engagementType: string,
  duration?: number
) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  const parameters = {
    engagement_type: engagementType,
    duration: duration || 0,
    page_location: window.location.href,
  };

  logEvent(analytics, "user_engagement", parameters);
};

// Session start tracking
export const logSessionStart = () => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, "session_start");
};

// Unique visitor tracking
export const logUniqueVisitor = (userId?: string) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  if (userId) {
    setUserId(analytics, userId);
  }

  logEvent(analytics, "first_visit");
};

// Custom event logging
export const logCustomEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, eventName, parameters);
};

// Initialize analytics for the app
export const initializeAnalytics = () => {
  const analytics = getFirebaseAnalytics();
  if (!analytics) {
    console.warn("Firebase Analytics not available");
    return;
  }

  // Log app start
  const parameters = {
    app_version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    platform: "web",
  };

  logEvent(analytics, "app_start", parameters);

  // Track unique visitor
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  if (!userId) {
    const newUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("userId", newUserId);
    logUniqueVisitor(newUserId);
  } else {
    logUniqueVisitor(userId);
  }

  // Track session start
  logSessionStart();

  console.log("Firebase Analytics initialized");
};
