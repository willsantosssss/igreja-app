import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useCallback } from "react";
import { View } from "react-native";

import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import { trpc, createTRPCClient } from "@/lib/trpc";

// Import all route components
import LoginScreen from "./login";
import CompletarCadastroScreen from "./completar-cadastro";
import TabsLayout from "./(tabs)/_layout";

type Route = "login" | "completar-cadastro" | "tabs";

function RootLayoutContent() {
  console.log('[RootLayoutContent] Rendering...');
  const colors = useColors();
  
  // Initialize route based on localStorage
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    try {
      const loggedInStr = typeof window !== 'undefined' ? localStorage?.getItem?.("@is_logged_in") : null;
      const cadastroStr = typeof window !== 'undefined' ? localStorage?.getItem?.("@cadastro_completo") : null;

      const isLoggedIn = loggedInStr === "true";
      const isCadastroCompleto = cadastroStr === "true";

      console.log("[RootLayout] Initial route determination:", { isLoggedIn, isCadastroCompleto });

      if (isLoggedIn && !isCadastroCompleto) {
        return "completar-cadastro";
      } else if (isLoggedIn && isCadastroCompleto) {
        return "tabs";
      }
      return "login";
    } catch (e) {
      console.warn("[RootLayout] Error reading auth state:", e);
      return "login";
    }
  });

  const navigateTo = useCallback((route: Route) => {
    console.log("[RootLayout] Navigating to:", route);
    setCurrentRoute(route);
  }, []);

  console.log("[RootLayout] Rendering route:", currentRoute);

  // Render based on current route
  switch (currentRoute) {
    case "login":
      return <LoginScreen onNavigate={navigateTo} />;
    case "completar-cadastro":
      return <CompletarCadastroScreen onNavigate={navigateTo} />;
    case "tabs":
      return <TabsLayout onNavigate={navigateTo} />;
    default:
      return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
          <View style={{ padding: 20 }}>
            <View style={{ height: 50, width: 50, backgroundColor: colors.primary, borderRadius: 25 }} />
          </View>
        </View>
      );
  }
}

export default function RootLayout() {
  console.log('[RootLayout] Creating root layout...');
  const queryClient = useMemo(() => {
    console.log('[RootLayout] Creating QueryClient');
    return new QueryClient();
  }, []);
  const trpcClient = useMemo(() => {
    console.log('[RootLayout] Creating tRPC client');
    return createTRPCClient();
  }, []);

  console.log('[RootLayout] Rendering with providers, trpcClient:', !!trpcClient, 'queryClient:', !!queryClient);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemeProvider>
            <RootLayoutContent />
            <StatusBar barStyle="light-content" />
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
