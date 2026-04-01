/**
 * Retry utility with exponential backoff — Sprint 111 (The Shield)
 * Used for session mutations, API calls, and other async operations.
 */

export interface RetryOptions {
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in ms (default: 500) */
  initialDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffFactor?: number;
  /** Maximum delay cap in ms (default: 10000) */
  maxDelay?: number;
  /** Jitter fraction 0-1 to prevent thundering herd (default: 0.1) */
  jitter?: number;
  /** Return true to abort retries for this error (e.g. 4xx errors) */
  shouldAbort?: (error: unknown, attempt: number) => boolean;
  /** Called before each retry */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: unknown,
    public readonly attempts: number
  ) {
    super(message);
    this.name = "RetryError";
  }
}

/**
 * Execute an async function with exponential backoff retries.
 *
 * @example
 * const result = await withRetry(() => fetch("/api/sessions"), {
 *   maxAttempts: 3,
 *   shouldAbort: (err) => err instanceof Response && err.status < 500,
 * });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 500,
    backoffFactor = 2,
    maxDelay = 10_000,
    jitter = 0.1,
    shouldAbort,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxAttempts) break;

      // Don't retry if the caller says to abort
      if (shouldAbort?.(error, attempt)) break;

      const baseDelay = Math.min(initialDelay * backoffFactor ** (attempt - 1), maxDelay);
      const jitterAmount = baseDelay * jitter * (Math.random() * 2 - 1);
      const delay = Math.max(0, Math.round(baseDelay + jitterAmount));

      onRetry?.(error, attempt, delay);
      await sleep(delay);
    }
  }

  throw new RetryError(
    `Failed after ${maxAttempts} attempts`,
    lastError,
    maxAttempts
  );
}

/** Abort retries for client errors (4xx except 429) */
export function abortOn4xx(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status >= 400 && error.status < 500 && error.status !== 429;
  }
  // Check if it's an object with a status field
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status >= 400 && status < 500 && status !== 429;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
