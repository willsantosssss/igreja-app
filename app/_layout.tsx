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
import { AuthProvider } from "@/lib/auth-context";
import { useAuthEmail } from "@/hooks/use-auth-email";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Removed unstable_settings - using explicit routing instead

function RootLayoutContentWithAuth() {
  const { state: authState } = useAuthEmail();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth state to be restored
    if (!authState.isLoading) {
      setIsLoading(false);
    }
  }, [authState.isLoading]);

  if (isLoading || authState.isLoading) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
      </Stack>
    );
  }

  // User is authenticated
  if (authState.token && authState.user) {
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

  // User is not authenticated - show login
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(auth)">
      <Stack.Screen name="(auth)" options={{ animationEnabled: false }} />
    </Stack>
  );
}

function RootLayoutContent() {
  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {}, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Initialize Manus runtime
  useEffect(() => {
    initManusRuntime();
    inicializarNotificacoes();
  }, []);

  return <RootLayoutContentWithAuth />;
}

export default function RootLayout() {
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
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";
  const [trpcClient] = useState(() => createTRPCClient(apiBaseUrl));

  const content = (
    <AuthProvider apiBaseUrl={process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000"}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutContent />
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
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
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        <StatusBar style="auto" />
        {content}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
