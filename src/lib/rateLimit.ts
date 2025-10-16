// Simple in-memory rate limiter
type RateLimitStore = {
  [key: string]: {
    count: number;
    lastReset: number;
  };
};

const store: RateLimitStore = {};
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 username changes per hour

export const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; reset: number } => {
  const now = Date.now();
  
  // Initialize or reset the rate limit for this IP if needed
  if (!store[ip] || now - store[ip].lastReset > RATE_LIMIT_WINDOW_MS) {
    store[ip] = {
      count: 0,
      lastReset: now,
    };
  }

  // Increment the request count
  store[ip].count++;

  // Calculate remaining requests and reset time
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - store[ip].count);
  const reset = store[ip].lastReset + RATE_LIMIT_WINDOW_MS;

  return {
    allowed: store[ip].count <= MAX_REQUESTS_PER_WINDOW,
    remaining,
    reset,
  };
};
