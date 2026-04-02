import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Platform } from "react-native";
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";
import { initManusRuntime } from "@/lib/_core/manus-runtime";
import { inicializarNotificacoes, limparBadge } from "@/lib/notifications/devocional-notificacao";
import * as Notifications from "expo-notifications";

interface AuthContextType {
  isLoggedIn: boolean;
  needsCadastro: boolean;
  isLoading: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setNeedsCadastro: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsCadastro, setNeedsCadastro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const storage = usePersistentStorage();
  const initRef = useRef(false);

  useEffect(() => {
    console.log("[AuthContext] useEffect mounted");
    
    if (initRef.current) {
      console.log("[AuthContext] Already initialized, skipping");
      return;
    }
    
    initRef.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log("[AuthContext] Starting async initialization");
        
        // Initialize Manus runtime (safe on all platforms)
        try {
          initManusRuntime();
          console.log("[AuthContext] Manus runtime initialized");
        } catch (err) {
          console.warn("[AuthContext] Manus runtime init failed:", err);
        }

        // Initialize notifications only on native platforms
        if (Platform.OS !== "web") {
          try {
            inicializarNotificacoes();
            console.log("[AuthContext] Notifications initialized");
          } catch (err) {
            console.warn("[AuthContext] Notifications init failed:", err);
          }
        } else {
          console.log("[AuthContext] Skipping notifications on web platform");
        }

        // Check login status
        console.log("[AuthContext] Checking login status from storage");
        const loggedIn = await storage.getItem("@is_logged_in");
        const cadastroCompleto = await storage.getItem("@cadastro_completo");
        console.log("[AuthContext] Storage values:", { loggedIn, cadastroCompleto });

        const isUserLoggedIn = loggedIn === "true";
        const isCadastroCompleto = cadastroCompleto === "true";

        console.log("[AuthContext] Parsed values:", { isUserLoggedIn, isCadastroCompleto });
        setIsLoggedIn(isUserLoggedIn);
        setNeedsCadastro(isUserLoggedIn && !isCadastroCompleto);
      } catch (error) {
        console.error("[AuthContext] Error during initialization:", error);
        setIsLoggedIn(false);
        setNeedsCadastro(false);
      } finally {
        setIsLoading(false);
        console.log("[AuthContext] Async initialization complete");
      }
    };

    initializeAuth();

    // Setup notification listener only on native platforms
    let subscription: any = null;
    if (Platform.OS !== "web") {
      try {
        subscription = Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            console.log("[AuthContext] Notification opened, clearing badge");
            await limparBadge();
          }
        );
      } catch (err) {
        console.warn("[AuthContext] Failed to setup notification listener:", err);
      }
    }

    return () => {
      console.log("[AuthContext] useEffect cleanup");
      if (subscription) {
        subscription.remove();
      }
    };
  }, []); // Empty dependency array - run only once

  return (
    <AuthContext.Provider value={{ isLoggedIn, needsCadastro, isLoading, setIsLoggedIn, setNeedsCadastro }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
