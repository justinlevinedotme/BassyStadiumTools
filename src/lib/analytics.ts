import { PostHog } from "tauri-plugin-posthog-api";
import { getVersion } from "@tauri-apps/api/app";

const CONSENT_KEY = "analytics_consent";

export type ConsentStatus = "enabled" | "disabled" | null;

export function getConsentStatus(): ConsentStatus {
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "enabled" || value === "disabled") {
    return value;
  }
  return null;
}

export function isAnalyticsEnabled(): boolean {
  return getConsentStatus() === "enabled";
}

export function setAnalyticsEnabled(enabled: boolean): void {
  localStorage.setItem(CONSENT_KEY, enabled ? "enabled" : "disabled");
}

export function hasAskedForConsent(): boolean {
  return getConsentStatus() !== null;
}

export async function trackEvent(
  name: string,
  props?: Record<string, string | number>
): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  try {
    await PostHog.capture(name, props);
  } catch {
    // Silently fail - analytics should never break the app
  }
}

export async function initAnalytics(): Promise<void> {
  if (!isAnalyticsEnabled()) {
    return;
  }

  // Get app version for tracking
  let appVersion = "unknown";
  try {
    appVersion = await getVersion();
  } catch {
    // Fallback if version can't be retrieved
  }

  // Track uncaught errors with version
  window.addEventListener("error", (event) => {
    trackEvent("error_occurred", {
      type: "uncaught_error",
      message: event.message || "Unknown error",
      filename: event.filename || "unknown",
      lineno: event.lineno || 0,
      version: appVersion,
    });
  });

  // Track unhandled promise rejections with version
  window.addEventListener("unhandledrejection", (event) => {
    const message =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason);
    trackEvent("error_occurred", {
      type: "unhandled_rejection",
      message: message.slice(0, 500),
      version: appVersion,
    });
  });

  // Track app launch with version
  trackEvent("app_launched", { version: appVersion });
}
