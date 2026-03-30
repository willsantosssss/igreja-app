import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Platform, View } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inicializarNotificacoes } from "@/lib/notifications/devocional-notificacao";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Removed unstable_settings - using explicit routing instead

function RootLayoutContent() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [needsCadastro, setNeedsCadastro] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
    checkLoginStatus();
    inicializarNotificacoes();
  }, []);

  const checkLoginStatus = async () => {
    try {
      console.log("[Layout] Checking login status...");
      const loggedIn = await AsyncStorage.getItem("@is_logged_in");
      const cadastroCompleto = await AsyncStorage.getItem("@cadastro_completo");
      console.log("[Layout] Login status:", { loggedIn, cadastroCompleto });
      setIsLoggedIn(loggedIn === "true");
      setNeedsCadastro(loggedIn === "true" && cadastroCompleto !== "true");
    } catch (error) {
      console.error("Error checking login status:", error);
      setIsLoggedIn(false);
      setNeedsCadastro(false);
    } finally {
      setIsLoading(false);
      console.log("[Layout] Login status check completed");
    }
  };

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Show loading screen while checking login status
  if (isLoading) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  // Explicit routing based on authentication state
  if (isLoggedIn === true && needsCadastro === true) {
    // User is logged in but needs to complete registration
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="completar-cadastro">
        <Stack.Screen name="completar-cadastro" options={{ animationEnabled: false }} />
      </Stack>
    );
  }

  if (isLoggedIn === true && needsCadastro === false) {
    // User is fully logged in
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ animationEnabled: false }} />
        <Stack.Screen name="oauth/callback" />
        <Stack.Screen name="event/[id]" options={{ presentation: "modal" }} />
        <Stack.Screen name="contribuicoes" options={{ presentation: "modal" }} />
        <Stack.Screen name="noticias" options={{ presentation: "modal" }} />
        <Stack.Screen name="aniversariantes" options={{ presentation: "modal" }} />
        <Stack.Screen name="notificacoes-preferencias" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/index" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/aniversariantes" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/lideres" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/relatorios" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/eventos" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/inscricoes-eventos" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/oracao" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/celulas" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/contribuicao" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/aniversariantes-gerenciar" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/aviso-importante" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/noticias" options={{ presentation: "modal" }} />
        <Stack.Screen name="admin/anexos" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/index" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/membros" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/relatorio" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/historico" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/lembrete" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/inscritos-eventos" options={{ presentation: "modal" }} />
        <Stack.Screen name="lider/anexos" options={{ presentation: "modal" }} />
      </Stack>
    );
  }

  // Default: User is not logged in - show login screen
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" options={{ animationEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  console.log("[RootLayout] Rendering...");
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const content = (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutContent />
      </QueryClientProvider>
    </trpc.Provider>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={initialFrame}>
            <SafeAreaInsetsContext.Provider value={initialInsets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
