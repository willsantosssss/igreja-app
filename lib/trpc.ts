import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl, SESSION_TOKEN_KEY } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  // Get API base URL - on web, this converts 8081 (Metro) to 3000 (API Server)
  const apiBaseUrl = getApiBaseUrl();
  const trpcUrl = apiBaseUrl ? `${apiBaseUrl}/api/trpc` : `/api/trpc`;
  
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: trpcUrl,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          // On web, read token directly from localStorage for faster access
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            try {
              const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
              if (token) {
                return { Authorization: `Bearer ${token}` };
              }
            } catch (e) {
              // Ignore localStorage access errors
            }
          }
          
          // On native or if localStorage not available, use Auth.getSessionToken()
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        // Custom fetch to include credentials for cookie-based auth
        async fetch(url, options) {
          const response = await fetch(url, {
            ...options,
            credentials: "include",
          });
          return response;
        }
      }),
    ],
  });
}
