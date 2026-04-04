import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { usePersistentStorage } from "@/lib/hooks/use-persistent-storage";

export type Route = "splash" | "login" | "completar-cadastro" | "tabs";

interface AppRouterContextType {
  currentRoute: Route;
  navigateTo: (route: Route) => void;
  isInitialized: boolean;
}

const AppRouterContext = createContext<AppRouterContextType | undefined>(undefined);

export function AppRouterProvider({ children }: { children: ReactNode }) {
  const storage = usePersistentStorage();
  const [currentRoute, setCurrentRoute] = useState<Route>("splash");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on first render (synchronously if possible)
  if (!isInitialized) {
    console.log("[AppRouter] Initializing on first render");
    
    // Try to get auth state synchronously
    const loggedInStr = localStorage?.getItem?.("@is_logged_in");
    const cadastroStr = localStorage?.getItem?.("@cadastro_completo");
    
    console.log("[AppRouter] Storage values:", { loggedInStr, cadastroStr });

    const isLoggedIn = loggedInStr === "true";
    const isCadastroCompleto = cadastroStr === "true";

    let nextRoute: Route = "login";
    if (isLoggedIn && !isCadastroCompleto) {
      nextRoute = "completar-cadastro";
    } else if (isLoggedIn && isCadastroCompleto) {
      nextRoute = "tabs";
    }

    console.log("[AppRouter] Determined route:", nextRoute);
    setCurrentRoute(nextRoute);
    setIsInitialized(true);
  }

  const navigateTo = useCallback((route: Route) => {
    console.log("[AppRouter] Navigating to:", route);
    setCurrentRoute(route);
  }, []);

  return (
    <AppRouterContext.Provider value={{ currentRoute, navigateTo, isInitialized }}>
      {children}
    </AppRouterContext.Provider>
  );
}

export function useAppRouter() {
  const context = useContext(AppRouterContext);
  if (context === undefined) {
    throw new Error("useAppRouter must be used within AppRouterProvider");
  }
  return context;
}
