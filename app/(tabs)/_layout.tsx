import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useAppInit } from "@/lib/contexts/initialize-app";

export default function TabLayout({ onNavigate }: { onNavigate?: (route: string) => void } = {}) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;
  
  // Get auth state with fallback
  let isInitialized = false;
  let isLoggedIn = false;
  try {
    const context = useAppInit();
    isInitialized = context.isInitialized;
    isLoggedIn = context.isLoggedIn;
  } catch (err) {
    console.warn("[TabLayout] Could not get AppInit context:", err);
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("[TabLayout] Checking auth:", { isInitialized, isLoggedIn });
    if (isInitialized && !isLoggedIn) {
      console.log("[TabLayout] Not logged in, redirecting to login");
      router.replace("/login");
    }
  }, [isInitialized, isLoggedIn]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="celulas"
        options={{
          title: "Células",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="devocional"
        options={{
          title: "Devocional",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="oracao"
        options={{
          title: "Oração",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hands.sparkles.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
