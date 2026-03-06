import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function BackButton() {
  const router = useRouter();
  const colors = useColors();

  const handleGoBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <TouchableOpacity
      onPress={handleGoBack}
      className="active:opacity-60"
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
    </TouchableOpacity>
  );
}
