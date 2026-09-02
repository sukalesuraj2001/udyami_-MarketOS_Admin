import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

const SENSITIVE_KEY_PATTERN = /token|password|secret|authorization/i;

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(message: string, context?: unknown): void {
    if (!environment.production) console.debug(`[debug] ${message}`, this.redact(context));
  }

  info(message: string, context?: unknown): void {
    if (!environment.production) console.info(`[info] ${message}`, this.redact(context));
  }

  warn(message: string, context?: unknown): void {
    console.warn(`[warn] ${message}`, this.redact(context));
  }

  error(message: string, context?: unknown): void {
    console.error(`[error] ${message}`, this.redact(context));
    // In production this is the seam where a monitoring SDK (Sentry, etc.)
    // would be called instead of / in addition to console.error.
  }

  /** Strips anything that looks like a credential before it ever reaches a log sink. */
  private redact(context: unknown): unknown {
    if (!context || typeof context !== 'object') return context;
    const clone: Record<string, unknown> = { ...(context as Record<string, unknown>) };
    for (const key of Object.keys(clone)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) clone[key] = '[redacted]';
    }
    return clone;
  }
}
