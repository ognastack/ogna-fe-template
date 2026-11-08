"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { OgnaClient } from "@ogna/js";
import type { OgnaPublicConfig } from "@/types/config";

export const OgnaContext = createContext<OgnaClient | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(OgnaContext);
  if (!ctx) throw new Error("useAuth must be used inside OgnaProvider");
  return ctx;
};

/**
 * Loads the public OGNA settings at runtime (see /ogna-config) and provides an
 * OgnaClient configured for OIDC sign-in through the identity provider.
 */
export function OgnaProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<OgnaClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/ogna-config", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
        return body as OgnaPublicConfig;
      })
      .then((config) => {
        if (cancelled) return;
        setClient(
          new OgnaClient(config.apiUrl || window.location.origin, {
            // "cookie" mirrors the access token into the `ogna_token` cookie read by middleware.ts
            storageStrategy: "cookie",
            auth: {
              issuer: config.issuer,
              clientId: config.clientId,
              redirectUri: `${window.location.origin}/auth/callback`,
              postLogoutRedirectUri: `${window.location.origin}/`,
            },
          })
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-sm text-red-600">
        Could not load OGNA settings: {error}
      </div>
    );
  }
  if (!client) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <OgnaContext.Provider value={client}>{children}</OgnaContext.Provider>;
}
