import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";
import { initManusRuntime } from "@/lib/_core/manus-runtime";
import { inicializarNotificacoes, limparBadge } from "@/lib/notifications/devocional-notificacao";
import * as Notifications from "expo-notifications";

function RootLayoutContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsCadastro, setNeedsCadastro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const storage = usePersistentStorage();

  // Initialize on first mount
  useEffect(() => {
    console.log("[RootLayout] useEffect mounted");

    const initializeApp = async () => {
      try {
        console.log("[RootLayout] Starting app initialization");

        // Initialize Manus runtime
        try {
          initManusRuntime();
          console.log("[RootLayout] Manus runtime initialized");
        } catch (err) {
          console.warn("[RootLayout] Manus runtime init failed:", err);
        }

        // Initialize notifications only on native
        if (Platform.OS !== "web") {
          try {
            inicializarNotificacoes();
            console.log("[RootLayout] Notifications initialized");
          } catch (err) {
            console.warn("[RootLayout] Notifications init failed:", err);
          }
        }

        // Check login status
        console.log("[RootLayout] Checking login status");
        const loggedIn = await storage.getItem("@is_logged_in");
        const cadastroCompleto = await storage.getItem("@cadastro_completo");
        console.log("[RootLayout] Storage values:", { loggedIn, cadastroCompleto });

        const isUserLoggedIn = loggedIn === "true";
        const isCadastroCompleto = cadastroCompleto === "true";

        console.log("[RootLayout] Setting auth state:", { isUserLoggedIn, isCadastroCompleto });
        setIsLoggedIn(isUserLoggedIn);
        setNeedsCadastro(isUserLoggedIn && !isCadastroCompleto);
      } catch (error) {
        console.error("[RootLayout] Error during initialization:", error);
        setIsLoggedIn(false);
        setNeedsCadastro(false);
      } finally {
        setIsLoading(false);
        console.log("[RootLayout] Initialization complete");
      }
    };

    initializeApp();

    // Setup notification listener
    let subscription: any = null;
    if (Platform.OS !== "web") {
      try {
        subscription = Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            console.log("[RootLayout] Notification opened");
            await limparBadge();
          }
        );
      } catch (err) {
        console.warn("[RootLayout] Failed to setup notification listener:", err);
      }
    }

    return () => {
      console.log("[RootLayout] useEffect cleanup");
      if (subscription) {
        subscription.remove();
      }
    };
  }, [storage]);

  console.log("[RootLayout] Rendering with state:", { isLoading, isLoggedIn, needsCadastro });

  // Show loading screen while checking login status
  if (isLoading) {
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
        <Stack.Screen name="splash" options={{ animationEnabled: false }} />
      </Stack>
    );
  }

  // User is logged in but needs to complete registration
  if (isLoggedIn && needsCadastro) {
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="completar-cadastro">
        <Stack.Screen name="completar-cadastro" options={{ animationEnabled: false }} />
      </Stack>
    );
  }

  // User is fully logged in
  if (isLoggedIn && !needsCadastro) {
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
