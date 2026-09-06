import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const eu = ingestHost.includes("eu.");

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: eu ? "https://eu.posthog.com" : "https://us.posthog.com",
    defaults: "2026-05-30",
    capture_exceptions: true,
    disable_session_recording: true,
    autocapture: {
      css_selector_allowlist: ["a", "button", "[data-ph]"],
    },
  });
}
