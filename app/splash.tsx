import { View, Text, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function SplashScreen() {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.foreground, fontSize: 16 }}>Carregando...</Text>
    </View>
  );
}
