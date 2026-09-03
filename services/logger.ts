import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class LoggerService {
  /**
   * Log informational event and add breadcrumb to Sentry.
   */
  public info(category: string, message: string, data?: Record<string, any>) {
    console.log(`[${category.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');

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
    console.warn(`[${category.toUpperCase()}] ${message}`, data ? JSON.stringify(data) : '');

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
    console.error(`[${category.toUpperCase()}] ${message}`, error, data ? JSON.stringify(data) : '');

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
    console.log(`[EVENT] ${eventName}`, data ? JSON.stringify(data) : '');

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
