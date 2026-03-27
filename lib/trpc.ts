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
  console.log('[tRPC] Creating client...');
  console.log('[tRPC] API_BASE_URL env:', process.env.EXPO_PUBLIC_API_BASE_URL);
  console.log('[tRPC] Using URL:', trpcUrl);
  console.log('[tRPC] API Base URL:', apiBaseUrl);
  
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: trpcUrl,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          // On web, read token directly from localStorage for faster access
          if (typeof window !== 'undefined' && window.localStorage) {
            const token = window.localStorage.getItem('app_session_token');
            console.log('[tRPC] Token from localStorage:', token ? `${token.substring(0, 30)}...` : 'none');
            return token ? { Authorization: `Bearer ${token}` } : {};
          }
          
          // On native, use Auth.getSessionToken()
          const token = await Auth.getSessionToken();
          console.log('[tRPC] Token from Auth:', token ? `${token.substring(0, 30)}...` : 'none');
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
            
            console.log('[tRPC] Response status:', response.status);
            if (!response.ok) {
              console.error('[tRPC] Response not OK:', response.status, response.statusText);
              const text = await response.text();
              console.error('[tRPC] Response body:', text);
            }
            
            return response;
          } catch (error) {
            console.error('[tRPC] Fetch error:', error);
            throw error;
          }
        }
      }),
    ],
  });
}
