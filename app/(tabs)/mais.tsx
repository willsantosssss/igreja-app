import { ScrollView, Text, View, TouchableOpacity, Alert, Linking, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

export default function MaisScreen() {
  const colors = useColors();

  const handleContribuir = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/contribuicoes" as any);
  };

  const handleNoticias = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/noticias" as any);
  };

  const handleAniversariantes = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/aniversariantes" as any);
  };

  const handleConfiguracoes = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Configurações",
      "Preferências e ajustes do aplicativo",
      [{ text: "OK" }]
    );
  };

  const handleSobre = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Sobre o App",
      "2IEQ Connect v1.0\n\nAplicativo desenvolvido para conectar você à comunidade da igreja.\n\n© 2026 2IEQ Connect",
      [{ text: "OK" }]
    );
  };

  const { data: contatosIgreja, isLoading: contatosLoading } = trpc.contatosIgreja.get.useQuery();

  const handleContato = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!contatosIgreja) {
      Alert.alert("Carregando", "Carregando dados de contato...");
      return;
    }

    Alert.alert(
      "Contato da Igreja",
      "Entre em contato conosco:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "WhatsApp", 
          onPress: () => Linking.openURL(`https://wa.me/${contatosIgreja.whatsapp.replace(/\D/g, '')}`)
        },
        { 
          text: "Email", 
          onPress: () => Linking.openURL(`mailto:${contatosIgreja.email}`)
        },
      ]
    );
  };

  const handleFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Enviar Feedback",
      "Sua opinião é muito importante para nós! Em breve você poderá enviar sugestões e relatar problemas.",
      [{ text: "OK" }]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Mais</Text>
          <Text className="text-base text-muted">
            Recursos adicionais e configurações
          </Text>
        </View>

        {/* Seção Principal */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted uppercase">Principal</Text>
          
          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/perfil" as any);
            }}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="person.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Meu Perfil</Text>
              <Text className="text-sm text-muted">Editar dados pessoais</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleContribuir}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.secondary}20` }}
            >
              <IconSymbol name="heart.fill" size={24} color={colors.secondary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Contribuições</Text>
              <Text className="text-sm text-muted">Dízimos, ofertas e doações</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleNoticias}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="newspaper.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Notícias e Avisos</Text>
              <Text className="text-sm text-muted">Fique por dentro das novidades</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleAniversariantes}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.secondary}20` }}
            >
              <Text className="text-2xl">\ud83c\udf82</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Aniversariantes</Text>
              <Text className="text-sm text-muted">Celebre com a comunidade</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Seção Configurações */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted uppercase">Configurações</Text>
          
          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={() => router.push("/lider" as any)}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.success}20` }}
            >
              <IconSymbol name="person.2.fill" size={24} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Área do Líder</Text>
              <Text className="text-sm text-muted">Painel para líderes de células</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={() => router.push("/admin" as any)}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-2xl">⚙️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Painel Admin</Text>
              <Text className="text-sm text-muted">Gerenciar inscrições e membros</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={() => router.push("/notificacoes-preferencias" as any)}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-2xl">🔔</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Notificações</Text>
              <Text className="text-sm text-muted">Devocional e lembretes</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleConfiguracoes}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <IconSymbol name="gear" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Preferências</Text>
              <Text className="text-sm text-muted">Tema e configurações</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Seção Suporte */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted uppercase">Suporte</Text>
          
          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleContato}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-2xl">📞</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Contato da Igreja</Text>
              <Text className="text-sm text-muted">Fale conosco</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleFeedback}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-2xl">💬</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Enviar Feedback</Text>
              <Text className="text-sm text-muted">Sugestões e problemas</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
            onPress={handleSobre}
          >
            <View 
              className="w-12 h-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Text className="text-2xl">ℹ️</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Sobre o App</Text>
              <Text className="text-sm text-muted">Versão e informações</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <View className="items-center py-4">
          <Text className="text-xs text-muted text-center">
            2IEQ Connect © 2026
          </Text>
          <Text className="text-xs text-muted text-center mt-1">
            Conectando você à comunidade
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
