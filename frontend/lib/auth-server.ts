// lib/auth-server.ts
import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "./auth";

/**
 * Read the auth token from cookies (server-side only).
 * Returns null if no token is present.
 */
export function getServerToken(): string | null {
  const cookieStore = cookies();
  const cookie = cookieStore.get(TOKEN_COOKIE);
  return cookie?.value ?? null;
}
