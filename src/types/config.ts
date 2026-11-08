/** Public, non-secret settings served by /ogna-config. */
export type OgnaPublicConfig = {
  /** Gateway URL for /api, /storage, /graphql. Empty = same origin as the page. */
  apiUrl: string;
  /** OIDC issuer (Zitadel), e.g. http://auth.localhost:8000 */
  issuer: string;
  /** OIDC client id of the "ogna-web" app */
  clientId: string;
};
