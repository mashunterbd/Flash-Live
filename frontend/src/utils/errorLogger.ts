export interface FrontendErrorEntry {
  id: string;
  level: 'error' | 'warning';
  message: string;
  source: string;
  count: number;
  first_seen: string;
  last_seen: string;
  stack?: string;
}

class FrontendErrorLogger {
  private initialized = false;

  public init(): void {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Global error listener
    window.addEventListener('error', (event) => {
      this.sendReport('error', event.message, event.filename || 'window.onerror', event.error?.stack);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;
      this.sendReport('error', msg, 'unhandledrejection', stack);
    });

    // Intercept console.error
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map(a => (a instanceof Error ? a.message : typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      const errObj = args.find(a => a instanceof Error) as Error | undefined;
      this.sendReport('error', msg, 'console.error', errObj?.stack);
    };

    // Intercept console.warn
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      origWarn.apply(console, args);
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      this.sendReport('warning', msg, 'console.warn');
    };
  }

  private sendReport(level: 'error' | 'warning', message: string, source: string, stack?: string): void {
    try {
      fetch('/api/logs/frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, source, stack })
      }).catch(() => {
        // Silent catch to prevent recursion
      });
    } catch {
      // Ignore network errors in logger
    }
  }
}

export const frontendLogger = new FrontendErrorLogger();
