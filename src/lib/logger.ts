/**
 * Centralized error logging utility.
 * In production, errors are suppressed from the browser console to prevent
 * information leakage (database schema, API details, internal paths).
 * In development, full error details are logged for debugging.
 */
export const logError = (context: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, errors are silently handled.
  // User-facing feedback should be provided via toast notifications.
};
