import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Platform } from "react-native";
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";
import { initManusRuntime } from "@/lib/_core/manus-runtime";
import { inicializarNotificacoes, limparBadge } from "@/lib/notifications/devocional-notificacao";
import * as Notifications from "expo-notifications";

interface AppInitContextType {
  isInitialized: boolean;
  isLoggedIn: boolean;
  needsCadastro: boolean;
}

const AppInitContext = createContext<AppInitContextType | undefined>(undefined);

export function AppInitProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsCadastro, setNeedsCadastro] = useState(false);
  const storage = usePersistentStorage();

  useEffect(() => {
    console.log("[AppInit] useEffect running");
    
    (async () => {
      try {
        console.log("[AppInit] Starting initialization");

        // Initialize Manus runtime
        try {
          initManusRuntime();
          console.log("[AppInit] Manus runtime initialized");
        } catch (err) {
          console.warn("[AppInit] Manus runtime init failed:", err);
        }

        // Initialize notifications only on native
        if (Platform.OS !== "web") {
          try {
            inicializarNotificacoes();
            console.log("[AppInit] Notifications initialized");
          } catch (err) {
            console.warn("[AppInit] Notifications init failed:", err);
          }
        }

        // Check login status
        console.log("[AppInit] Checking login status");
        const loggedIn = await storage.getItem("@is_logged_in");
        const cadastroCompleto = await storage.getItem("@cadastro_completo");
        console.log("[AppInit] Storage values:", { loggedIn, cadastroCompleto });

        const isUserLoggedIn = loggedIn === "true";
        const isCadastroCompleto = cadastroCompleto === "true";

        console.log("[AppInit] Setting auth state:", { isUserLoggedIn, isCadastroCompleto });
        setIsLoggedIn(isUserLoggedIn);
        setNeedsCadastro(isUserLoggedIn && !isCadastroCompleto);
        setIsInitialized(true);
        console.log("[AppInit] Initialization complete");
      } catch (error) {
        console.error("[AppInit] Error during initialization:", error);
        setIsLoggedIn(false);
        setNeedsCadastro(false);
        setIsInitialized(true);
      }
    })();

    // Setup notification listener
    let subscription: any = null;
    if (Platform.OS !== "web") {
      try {
        subscription = Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            console.log("[AppInit] Notification opened");
            await limparBadge();
          }
        );
      } catch (err) {
        console.warn("[AppInit] Failed to setup notification listener:", err);
      }
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <AppInitContext.Provider value={{ isInitialized, isLoggedIn, needsCadastro }}>
      {children}
    </AppInitContext.Provider>
  );
}

export function useAppInit() {
  const context = useContext(AppInitContext);
  if (context === undefined) {
    throw new Error("useAppInit must be used within AppInitProvider");
  }
  return context;
}
