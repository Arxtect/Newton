import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://be2ed981d76d94acef2fa6a36c52e768@o4507900355936256.ingest.us.sentry.io/4507900425863168",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/arxtect\.com\/api\/v1/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

window.onerror = function (message, source, lineno, colno, error) {
  Sentry.captureException(error);
  console.error("Global error handler:", error);
};

window.onunhandledrejection = function (event) {
  Sentry.captureException(event.reason);
  console.error("Unhandled promise rejection:", event.reason);
};
