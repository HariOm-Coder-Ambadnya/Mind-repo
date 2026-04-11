// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * This page handles the case where the Java backend redirects to
 * {FRONTEND_URL}/auth/callback?token=<jwt>.
 *
 * The Next.js API route at /api/auth/callback handles storing the cookie
 * when invoked as an API route. This page acts as a client-side fallback
 * that calls that API route with the token.
 */
function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/?error=missing_token");
      return;
    }

    // Delegate to the API route which sets the httpOnly cookie
    router.replace(`/api/auth/callback?token=${encodeURIComponent(token)}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-sm text-slate-500">Signing you in…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
