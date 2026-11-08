import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import type { OgnaPublicConfig } from "@/types/config";

// Read at request time so one prebuilt image works in every deployment.
export const dynamic = "force-dynamic";

type WebClientFile = { issuer?: string; client_id?: string };

/**
 * Public, non-secret settings for the browser.
 *
 * Values come from env vars (OGNA_API_URL, OGNA_AUTH_URL, OGNA_CLIENT_ID) or,
 * when running inside OGNA core, from the file the zitadel-setup job writes
 * (OGNA_WEB_CLIENT_FILE, default /zitadel/public/web-client.json).
 */
export async function GET() {
  let file: WebClientFile = {};
  const path = process.env.OGNA_WEB_CLIENT_FILE ?? "/zitadel/public/web-client.json";
  try {
    file = JSON.parse(await readFile(path, "utf-8")) as WebClientFile;
  } catch {
    // Not running next to OGNA core (e.g. `npm run dev`); rely on env vars
  }

  const config: OgnaPublicConfig = {
    apiUrl: process.env.OGNA_API_URL ?? "",
    issuer: process.env.OGNA_AUTH_URL ?? file.issuer ?? "",
    clientId: process.env.OGNA_CLIENT_ID ?? file.client_id ?? "",
  };

  if (!config.issuer || !config.clientId) {
    return NextResponse.json(
      { error: "OIDC settings missing: set OGNA_AUTH_URL and OGNA_CLIENT_ID, or mount OGNA core's zitadel_public volume" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(config, { headers: { "Cache-Control": "no-store" } });
}
