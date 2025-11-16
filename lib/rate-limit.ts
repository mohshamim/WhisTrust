// Simple in-memory rate limiter for local/dev and single-instance deploys.
// For production at scale, replace with a shared store (Upstash Redis or Supabase RPC).

type Bucket = {
  tokens: number;
  updatedAt: number;
};

const buckets = new Map<string, Bucket>();
const attemptBuckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { tokens: 1, updatedAt: now });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }

  // Reset window if expired
  if (now - bucket.updatedAt > windowMs) {
    bucket.tokens = 0;
    bucket.updatedAt = now;
  }

  if (bucket.tokens >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.updatedAt + windowMs };
  }

  bucket.tokens += 1;
  return { allowed: true, remaining: Math.max(0, limit - bucket.tokens), resetAt: bucket.updatedAt + windowMs };
}

export function getClientIp(req: Request | { headers: Headers }): string {
  const headers = "headers" in req ? req.headers : (req as any).headers;
  const xfwd = headers.get?.("x-forwarded-for") || (headers as any)["x-forwarded-for"];
  if (typeof xfwd === "string" && xfwd.length > 0) {
    return xfwd.split(",")[0].trim();
  }
  const ip = headers.get?.("x-real-ip") || (headers as any)["x-real-ip"];
  return typeof ip === "string" && ip.length > 0 ? ip : "unknown";
}

/**
 * Record an attempt within a fixed window and report lockout state.
 * Use this when you want to lock a client out after N attempts in M ms.
 *
 * Example:
 *  const attempt = recordAttempt(`users-create:${ip}`, 10 * 60_000, 15)
 *  if (attempt.locked) {
 *    // deny request
 *  }
 */
export function recordAttempt(
  key: string,
  windowMs: number,
  maxAttempts: number
): { locked: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let bucket = attemptBuckets.get(key);

  // Initialize or reset window
  if (!bucket || now - bucket.updatedAt > windowMs) {
    bucket = { tokens: 0, updatedAt: now };
    attemptBuckets.set(key, bucket);
  }

  bucket.tokens += 1;
  const locked = bucket.tokens >= maxAttempts;
  const remaining = Math.max(0, maxAttempts - bucket.tokens);
  const resetAt = bucket.updatedAt + windowMs;

  return { locked, remaining, resetAt };
}


