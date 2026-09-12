import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Detects harmless network/lifecycle cancellations (unmounted components, aborted queries, iOS NSURLSession cancellation).
 */
export function isCancellationError(error: unknown): boolean {
  if (!error) return false;

  const err = error as any;

  if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
    return true;
  }

  const checkText = (text: unknown): boolean => {
    if (typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    return (
      lower.includes('unexpectedexception: cancelled') ||
      lower.includes('expomodulescore/promise.swift') ||
      lower.includes('the operation was cancelled') ||
      lower.includes('the operation was canceled') ||
      lower.includes('nsurlerrordomain error -999') ||
      lower.includes('aborterror') ||
      lower.includes('the user aborted a request') ||
      lower.includes('operation aborted') ||
      (lower.includes('fetch failed') && lower.includes('cancelled'))
    );
  };

  if (checkText(err.message)) return true;
  if (checkText(err.description)) return true;
  if (checkText(err.reason)) return true;
  if (checkText(String(error))) return true;

  if (err.cause && isCancellationError(err.cause)) {
    return true;
  }

  return false;
}

class LoggerService {
  /**
   * Log informational event and add breadcrumb to Sentry.
   */
  public info(category: string, message: string, data?: Record<string, any>) {
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true') {
      console.log(`[${category.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');
    }

    try {
      if ((Sentry as any).logger?.info) {
        (Sentry as any).logger.info(`[${category}] ${message}`, data);
      }
    } catch (_) {}

    Sentry.addBreadcrumb({
      category,
      message,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Log warning event, send breadcrumb and warning capture to Sentry.
   */
  public warn(category: string, message: string, data?: Record<string, any>) {
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true') {
      console.warn(`[${category.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');
    }

    try {
      if ((Sentry as any).logger?.warn) {
        (Sentry as any).logger.warn(`[${category}] ${message}`, data);
      }
    } catch (_) {}

    Sentry.addBreadcrumb({
      category,
      message,
      level: 'warning',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Log error and immediately report exception to Sentry with attached context.
   */
  public error(
    category: string,
    message: string,
    error?: unknown,
    data?: Record<string, any>
  ) {
    if (isCancellationError(error)) {
      if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true') {
        console.log(`[${category.toUpperCase()}] Ignored cancellation: ${message}`);
      }
      return;
    }

    console.error(`[${category.toUpperCase()}] ${message}`, error, data ? JSON.stringify(data) : '');

    try {
      if ((Sentry as any).logger?.error) {
        (Sentry as any).logger.error(`[${category}] ${message}`, { error, ...data });
      }
    } catch (_) {}

    Sentry.addBreadcrumb({
      category,
      message,
      level: 'error',
      data,
      timestamp: Date.now() / 1000,
    });

    const errorToCapture =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : message);

    Sentry.captureException(errorToCapture, {
      extra: {
        category,
        message,
        ...data,
      },
    });
  }

  /**
   * Track high-level user or lifecycle events (e.g., match_created, filter_applied).
   */
  public event(eventName: string, data?: Record<string, any>) {
    if (__DEV__ && process.env.EXPO_PUBLIC_DEBUG_LOGS === 'true') {
      console.log(`[EVENT] ${eventName}`, data ? JSON.stringify(data) : '');
    }

    Sentry.addBreadcrumb({
      category: 'user_action',
      message: eventName,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Associate subsequent Sentry logs and errors with an authenticated user.
   */
  public setUser(user: { id: string; email?: string; username?: string; [key: string]: any } | null) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
      Sentry.setTag('is_staff', String(Boolean(user.is_staff)));
      this.info('auth', `User context set for ${user.username || user.email || user.id}`);
    } else {
      Sentry.setUser(null);
      this.info('auth', 'User context cleared');
    }
  }

  /**
   * Clear user context on logout.
   */
  public clearUser() {
    this.setUser(null);
  }
}

export const logger = new LoggerService();
export default logger;
