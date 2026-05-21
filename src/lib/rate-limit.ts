const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  GENERATE: { max: 5, window: 60 * 1000 }, // 5 requests per minute
  CREDITS: { max: 10, window: 60 * 1000 }, // 10 requests per minute
};

export function checkRateLimit(key: string, type: "GENERATE" | "CREDITS"): { allowed: boolean; remaining: number } {
  const limit = RATE_LIMIT[type];
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + limit.window });
    return { allowed: true, remaining: limit.max - 1 };
  }

  entry.count += 1;

  if (entry.count > limit.max) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit.max - entry.count };
}

export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);
