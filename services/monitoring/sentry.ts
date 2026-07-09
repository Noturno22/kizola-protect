/**
 * Sentry crash reporting configuration.
 *
 * ✅ `@sentry/react-native` ~7.2.0 is installed in package.json.
 * ✅ `initSentry()` is called from `app/_layout.tsx`.
 *
 * Required environment variables (.env):
 *   SENTRY_DSN=https://<key>@sentry.io/<project>
 *   SENTRY_ENVIRONMENT=production
 *   SENTRY_TRACES_SAMPLE_RATE=1.0
 *
 * Sentry is enabled ONLY when NODE_ENV === 'production' (line 49).
 */

let Sentry: any = null;

function loadSentry() {
  try {
    Sentry = require('@sentry/react-native');
  } catch {
    // Sentry not installed — silently skip initialization
  }
}

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] SENTRY_DSN not set — crash reporting disabled');
    return;
  }

  loadSentry();
  if (!Sentry) {
    console.warn('[Sentry] @sentry/react-native not installed — run: npm install @sentry/react-native');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '1.0'),
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    attachStacktrace: true,
    enabled: process.env.NODE_ENV === 'production',
  });
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (Sentry) {
    if (context) {
      Sentry.withScope((scope: any) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (Sentry) {
    Sentry.captureMessage(message, level);
  }
}
