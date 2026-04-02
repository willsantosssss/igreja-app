import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

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
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";
import { inicializarNotificacoes, limparBadge } from "@/lib/notifications/devocional-notificacao";
import * as Notifications from "expo-notifications";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Removed unstable_settings - using explicit routing instead

function RootLayoutContent() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [needsCadastro, setNeedsCadastro] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage first (before using it in checkLoginStatus)
  const storage = usePersistentStorage();

  // Initialize Manus runtime and check login status
  useLayoutEffect(() => {
    console.log("[Layout] useEffect running on mount");
    console.log("[Layout] storage initialized:", typeof storage, Object.keys(storage || {}));
    const initializeApp = async () => {
      try {
        console.log("[Layout] initializeApp started");
        initManusRuntime();
        inicializarNotificacoes();

        // Check login status
        console.log("[Layout] Checking login status...");
        console.log("[Layout] storage object:", typeof storage, storage ? "exists" : "null");
        if (!storage) {
          throw new Error("Storage is not initialized");
        }
        const loggedIn = await storage.getItem("@is_logged_in");
        const cadastroCompleto = await storage.getItem("@cadastro_completo");
        console.log("[Layout] Login status:", { loggedIn, cadastroCompleto });
        
        // Treat null or anything other than "true" as not logged in
        const isUserLoggedIn = loggedIn === "true";
        const isCadastroCompleto = cadastroCompleto === "true";
        
        console.log("[Layout] Parsed login state:", { isUserLoggedIn, isCadastroCompleto });
        setIsLoggedIn(isUserLoggedIn);
        setNeedsCadastro(isUserLoggedIn && !isCadastroCompleto);
      } catch (error) {
        console.error("[Layout] Error initializing app:", error);
        console.error("[Layout] Error stack:", (error as Error).stack);
        setIsLoggedIn(false);
        setNeedsCadastro(false);
      } finally {
        console.log("[Layout] finally block: setting isLoading to false");
        setIsLoading(false);
        console.log("[Layout] Login status check completed, isLoading set to false");
      }
    };

    console.log("[Layout] calling initializeApp()");
    initializeApp();
    console.log("[Layout] initializeApp() called");

    // Limpar badge quando usuario abre a notificacao
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log("[Layout] Notificacao aberta, limpando badge");
        await limparBadge();
      }
    );

    return () => subscription.remove();
  }, []); // Run only once on mount - using useLayoutEffect to ensure it runs before render

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
  console.log("[Layout] render: isLoading=", isLoading, "isLoggedIn=", isLoggedIn, "needsCadastro=", needsCadastro);
  if (isLoading) {
    console.log("[Layout] Still loading, showing login screen");
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }
  
  // console.log("[Layout] Rendering with state:", { isLoggedIn, needsCadastro, isLoading });

  // Explicit routing based on authentication state
  // Default: Always show login first unless explicitly logged in
  if (isLoggedIn && needsCadastro) {
    // User is logged in but needs to complete registration
    console.log("[Layout] Case 1: User logged in but needs to complete registration");
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="completar-cadastro">
        <Stack.Screen name="completar-cadastro" options={{ animationEnabled: false }} />
      </Stack>
    );
  }

  if (isLoggedIn && !needsCadastro) {
    // User is fully logged in
    console.log("[Layout] Case 2: User fully logged in, showing tabs");
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
  console.log("[Layout] Default case: User not logged in, showing login screen");
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" options={{ animationEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <RootLayoutContent />
          <StatusBar barStyle="light-content" />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
