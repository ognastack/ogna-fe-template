# OGNA dashboard template

Next.js dashboard for [OGNA core](https://github.com/ognastack/core), using [`@ogna/js`](https://github.com/ognastack/ogna-js).

## Authentication

Users sign in on OGNA's identity provider (Zitadel) with OpenID Connect. The app never sees passwords:

- `/account/login` and `/account/signup` send the user to the hosted login or registration page (`auth.signInWithRedirect` / `auth.signUpWithRedirect`).
- `/auth/callback` finishes sign-in (`auth.handleRedirectCallback`) and continues to `/protected`. This URL must be in core's `OGNA_OIDC_REDIRECT_URIS` (the defaults include `http://localhost:8000/auth/callback` and `http://localhost:3000/auth/callback`).
- Logging out revokes the tokens and ends the identity-provider session.
- `middleware.ts` keeps `/protected/*` behind the `ogna_token` cookie that `@ogna/js` sets (the gateway still checks every API call).

### Configuration (runtime, no rebuild needed)

The browser loads its settings from `GET /ogna-config`:

| Setting | Source |
|---------|--------|
| `issuer`, `clientId` | `OGNA_AUTH_URL` / `OGNA_CLIENT_ID` env vars, or the `web-client.json` that core's `zitadel-setup` writes (`OGNA_WEB_CLIENT_FILE`, default `/zitadel/public/web-client.json`; core mounts it automatically) |
| `apiUrl` | `OGNA_API_URL`, default: same origin as the page (the dashboard is served through the gateway) |

For local development against a running core stack:

```bash
# Values from `make auth-info` in ogna core
OGNA_AUTH_URL=http://auth.localhost:8000 \
OGNA_CLIENT_ID=<ogna-web client id> \
OGNA_API_URL=http://localhost:8000 \
npm run dev
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
