"use client";

import { track } from "@vercel/analytics";
import posthog from "posthog-js";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

function clean(properties?: AnalyticsProps) {
  const next: Record<string, string | number | boolean> = {};
  if (!properties) return next;
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    next[key] = value;
  }
  return next;
}

export function capture(event: string, properties?: AnalyticsProps) {
  const props = clean(properties);
  try {
    track(event, props);
  } catch {
    /* Vercel script may not be loaded yet */
  }
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {
    /* PostHog is optional until NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is set */
  }
}

export async function identifySignedIn(email: string) {
  if (!posthog.__loaded) return;
  const distinctId = await hashValue(email.trim().toLowerCase());
  posthog.identify(distinctId);
}

export function resetAnalytics() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

async function hashValue(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
