import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "house.fill",
    title: "Bem-vindo ao App da Igreja!",
    description: "Fique conectado com a comunidade, acompanhe eventos, participe de células e fortaleça sua fé.",
    color: "#06B6D4",
  },
  {
    icon: "calendar",
    title: "Agenda de Eventos",
    description: "Veja todos os cultos, reuniões e atividades da igreja. Nunca perca um evento importante!",
    color: "#10B981",
  },
  {
    icon: "location.fill",
    title: "Células",
    description: "Encontre uma célula perto de você. Conecte-se com outros membros e cresça na fé em comunidade.",
    color: "#F59E0B",
  },
  {
    icon: "heart.fill",
    title: "Pedidos de Oração",
    description: "Compartilhe seus pedidos e ore pelos outros. Juntos somos mais fortes!",
    color: "#EF4444",
  },
  {
    icon: "book.fill",
    title: "Devocional Diário",
    description: "Receba uma mensagem inspiradora todos os dias para fortalecer sua caminhada espiritual.",
    color: "#8B5CF6",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentSlide = slides[currentIndex];

  return (
    <View className="flex-1 bg-background">
      {/* Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Icon */}
        <View
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: currentSlide.color + "20" }}
        >
          <IconSymbol
            name={currentSlide.icon as any}
            size={64}
            color={currentSlide.color}
            style={{}}
          />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-foreground text-center mb-4">
          {currentSlide.title}
        </Text>

        {/* Description */}
        <Text className="text-base text-muted text-center leading-relaxed">
          {currentSlide.description}
        </Text>
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center items-center gap-2 mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className="rounded-full"
            style={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              backgroundColor: index === currentIndex ? colors.primary : colors.muted + "40",
            }}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className="px-8 pb-8 gap-3">
        {/* Next/Finish Button */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-base">
            {currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
          </Text>
        </TouchableOpacity>

        {/* Skip/Previous Buttons */}
        <View className="flex-row gap-3">
          {currentIndex > 0 && (
            <TouchableOpacity
              className="flex-1 rounded-full py-3 items-center border"
              style={{ borderColor: colors.border }}
              onPress={handlePrevious}
            >
              <Text className="text-foreground font-semibold">Anterior</Text>
            </TouchableOpacity>
          )}
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity
              className="flex-1 rounded-full py-3 items-center"
              onPress={handleSkip}
            >
              <Text className="text-muted font-semibold">Pular</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
