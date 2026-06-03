import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// Strict: 5 booking attempts per IP per 10 minutes
const bookingLimiter = new RateLimiterMemory({
  points: 5,
  duration: 600,
});

// Relaxed: 60 reads per IP per minute
const publicReadLimiter = new RateLimiterMemory({
  points: 60,
  duration: 60,
});

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function rateLimit(
  req: NextRequest,
  type: "booking" | "public"
): Promise<NextResponse | null> {
  const limiter = type === "booking" ? bookingLimiter : publicReadLimiter;
  const ip = getIP(req);

  try {
    await limiter.consume(ip);
    return null; // allowed
  } catch {
    return NextResponse.json(
      { error: "Previše zahtjeva. Pokušajte ponovo za nekoliko minuta." },
      {
        status: 429,
        headers: { "Retry-After": type === "booking" ? "600" : "60" },
      }
    );
  }
}
