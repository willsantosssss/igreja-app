export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  // Use CUSTOM_JWT_SECRET if available (from Railway), otherwise fall back to JWT_SECRET (from Manus)
  cookieSecret: (process.env.CUSTOM_JWT_SECRET || process.env.JWT_SECRET) ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
