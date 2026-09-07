import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { rateLimitedError } from "@/shared/errors";

// Config per endpoint sensitif docs/TASK.md:1365
export const RATE_LIMITS = {
  login: { limit: 5, window: "15 m", message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
  register: { limit: 5, window: "1 h", message: "Terlalu banyak percobaan daftar. Coba lagi dalam 1 jam." },
  forgot: { limit: 3, window: "1 h", message: "Terlalu banyak permintaan reset. Coba lagi dalam 1 jam." },
  reset: { limit: 5, window: "1 h", message: "Terlalu banyak percobaan reset. Coba lagi dalam 1 jam." },
} as const;

type LimitConfig = { limit: number; window: string; message: string };

// In-memory fallback untuk dev / ketika Upstash tidak dikonfigurasi
// Pisahkan logic rate limiting dari business logic docs/TASK.md:1382
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getWindowMs(window: string): number {
  const [num, unit] = window.split(" ");
  const n = Number(num);
  if (unit.startsWith("m")) return n * 60 * 1000;
  if (unit.startsWith("h")) return n * 60 * 60 * 1000;
  if (unit.startsWith("s")) return n * 1000;
  return n * 60 * 1000;
}

async function memoryRateLimit(
  key: string,
  config: LimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const windowMs = getWindowMs(config.window);
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.limit - 1, reset: resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return { success: true, remaining: config.limit - entry.count, reset: entry.resetAt };
}

// Upstash Redis client (opsional — jika tidak ada env, fallback memory)
let redis: Redis | null = null;
let limiters: Record<string, Ratelimit> | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    redis = new Redis({ url, token });
    return redis;
  } catch {
    return null;
  }
}

function getLimiter(key: string, config: LimitConfig): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;
  if (!limiters) limiters = {};
  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(config.limit, config.window as `${number} ${"s" | "m" | "h" | "d"}`),
      analytics: true,
      prefix: `ratelimit:${key}`,
    });
  }
  return limiters[key];
}

export async function checkRateLimit(
  endpoint: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<void> {
  const config = RATE_LIMITS[endpoint];
  const key = `${endpoint}:${identifier}`;

  // Coba Upstash dulu
  const limiter = getLimiter(endpoint, config);
  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(key);
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        throw rateLimitedError(`${config.message} (sisa ${remaining}, reset ${retryAfter}s)`);
      }
      return;
    } catch (err: unknown) {
      // Jika error adalah rateLimitedError, throw
      if ((err as { code?: string })?.code === "RATE_LIMITED") throw err;
      // Jika Redis error, fallback ke memory
      console.warn("[Ratelimit] Upstash error, fallback memory", (err as Error)?.message);
    }
  }

  // Fallback in-memory (juga untuk multi-instance warning docs/TASK.md:1383 — Upstash disarankan)
  const { success } = await memoryRateLimit(key, config);
  if (!success) {
    throw rateLimitedError(config.message);
  }
}

// Helper untuk ambil IP dari headers
export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const realIp = h.get("x-real-ip");
    if (realIp) return realIp;
    return "unknown";
  } catch {
    return "unknown";
  }
}

// Untuk testing: reset memory store
export function _resetMemoryStore(): void {
  memoryStore.clear();
}
