import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
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
  console.log('[tRPC] Using URL:', trpcUrl);
  console.log('[tRPC] API Base URL:', apiBaseUrl);
  
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: trpcUrl,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        // Use GET for queries to avoid POST issues
        methodOverride: 'GET',
        async headers() {
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        // Custom fetch to include credentials for cookie-based auth
        async fetch(url, options) {
          try {
            console.log('[tRPC] Fetching from:', url);
            const response = await fetch(url, {
              ...options,
              credentials: "include",
            });
            
            if (!response.ok) {
              console.error('[tRPC] Response not OK:', response.status, response.statusText);
            }
            
            return response;
          } catch (error) {
            console.error('[tRPC] Fetch error:', error);
            throw error;
          }
        },
      }),
    ],
  });
}
