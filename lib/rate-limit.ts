import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Upstash sliding-window rate limiters per brain.md §11.2 + §12.4.
 *
 *   /api/audit   — 5 / hour / ip
 *   /api/summary — 1 / 60s / ip   (Gemini free tier guard, §11.2)
 *   /api/lead    — 3 / hour / ip
 *
 * If Upstash env vars are missing (local dev without Redis), the limiter
 * is a no-op that always allows. Production (Vercel) wires the envs.
 */

type LimiterKey = "audit" | "summary" | "lead";

const LIMITER_CONFIG: Record<
  LimiterKey,
  { tokens: number; window: `${number} s` | `${number} m` | `${number} h` }
> = {
  audit: { tokens: 5, window: "1 h" },
  summary: { tokens: 1, window: "60 s" },
  lead: { tokens: 3, window: "1 h" },
};

let warned = false;
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warned) {
      // Single dev-only warning. Production should always have these set.
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN unset — limits are no-ops.",
      );
      warned = true;
    }
    return null;
  }
  return new Redis({ url, token });
}

const cache: Partial<Record<LimiterKey, Ratelimit>> = {};

function getLimiter(key: LimiterKey): Ratelimit | null {
  if (cache[key]) return cache[key]!;
  const redis = getRedis();
  if (!redis) return null;
  const cfg = LIMITER_CONFIG[key];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
    prefix: `basis:rl:${key}`,
    analytics: false,
  });
  cache[key] = limiter;
  return limiter;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  ip: string;
  ipHash: string;
}

/**
 * Read the client IP from the request. Vercel sets `x-forwarded-for`; the
 * left-most entry is the original client. Fall back to a sentinel for local
 * dev so the rate limit key isn't `undefined`.
 */
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

/**
 * Salt is read from env. The default is a fixed dev string — it preserves
 * the hash-the-ip discipline locally without requiring any setup, but
 * Vercel must set IP_HASH_SALT for real privacy in prod.
 */
function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "basis-dev-salt-v1";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function checkRateLimit(
  key: LimiterKey,
  request: NextRequest,
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  const limiter = getLimiter(key);
  if (!limiter) {
    return { allowed: true, remaining: Infinity, reset: 0, ip, ipHash };
  }
  const { success, remaining, reset } = await limiter.limit(ipHash);
  return { allowed: success, remaining, reset, ip, ipHash };
}
