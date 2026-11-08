"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/api/OgnaContext";

/** Redirect URI registered in Zitadel: finishes OIDC sign-in and continues to the app. */
export default function AuthCallbackPage() {
  const client = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // The authorization code is single-use; React StrictMode runs effects twice in dev
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    client.auth.handleRedirectCallback().then(({ data, error }) => {
      if (error) {
        setError(error.msg);
        return;
      }
      const returnTo = data?.returnTo;
      // Only follow same-site relative paths
      router.replace(returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/protected");
    });
  }, [client, router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 text-sm">
      {error ? (
        <div className="space-y-2 text-center">
          <p className="text-red-600">Sign-in failed: {error}</p>
          <a href="/account/login" className="underline underline-offset-4">
            Try again
          </a>
        </div>
      ) : (
        <p className="text-muted-foreground">Signing you in…</p>
      )}
    </div>
  );
}
