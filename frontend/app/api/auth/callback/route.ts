// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth";

const ONE_DAY_SECONDS = 60 * 60 * 24;

/**
 * GET /api/auth/callback?token=<jwt>
 *
 * Called by the Java backend after successful GitHub OAuth.
 * Stores the JWT in an httpOnly cookie and redirects to /dashboard.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: false, // Must be readable by client-side JS to attach to Authorization header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });

  return response;
}
