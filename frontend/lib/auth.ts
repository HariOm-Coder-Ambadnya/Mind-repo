// lib/auth.ts

export const TOKEN_COOKIE = "mr_token";

/**
 * Client-side: read the token from document.cookie.
 * Falls back to null when called in SSR context.
 */
export function getClientToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Client-side: clear the auth cookie by expiring it.
 */
export function clearClientToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
