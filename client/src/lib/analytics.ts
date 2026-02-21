import ReactGA from "react-ga4";

// Initialize Google Analytics 4
// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

let isInitialized = false;

export function initGA() {
  if (isInitialized) return;
  
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
      },
    });
    isInitialized = true;
    console.log("[Analytics] Google Analytics initialized");
  } else {
    console.warn("[Analytics] GA4 Measurement ID not configured");
  }
}

// Track page views
export function trackPageView(path: string, title?: string) {
  if (!isInitialized) return;
  
  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: title || document.title,
  });
}

// Track custom events
export function trackEvent(category: string, action: string, label?: string, value?: number) {
  if (!isInitialized) return;
  
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}

// Track stream views
export function trackStreamView(streamId: number, streamTitle: string, category?: string) {
  trackEvent("Stream", "View", `${streamTitle} (ID: ${streamId})`, streamId);
  
  if (category) {
    trackEvent("Category", "View", category);
  }
}

// Track stream interactions
export function trackStreamInteraction(action: "share" | "follow" | "subscribe" | "donate", streamId: number) {
  trackEvent("Stream Interaction", action, `Stream ID: ${streamId}`, streamId);
}

// Track user actions
export function trackUserAction(action: string, label?: string) {
  trackEvent("User Action", action, label);
}

// Track search
export function trackSearch(searchTerm: string, category?: string) {
  ReactGA.event({
    category: "Search",
    action: "search",
    label: searchTerm,
    ...(category && { dimension1: category }),
  });
}

// Track errors
export function trackError(error: string, fatal: boolean = false) {
  ReactGA.event({
    category: "Error",
    action: error,
    label: fatal ? "Fatal" : "Non-fatal",
  });
}
