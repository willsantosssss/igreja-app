import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { BackButton } from "@/components/back-button";
import { trpc } from "@/lib/trpc";
import { obterSessaoLider } from "@/lib/data/lideres";

export default function MudarSenhaScreen() {
  const colors = useColors();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });

  const mudarSenhaMutation = trpc.lideres.updatePassword.useMutation();

  const handleMudarSenha = async () => {
    // Validações
    if (!senhaAtual.trim()) {
      Alert.alert("Erro", "Digite sua senha atual");
      return;
    }

    if (!novaSenha.trim()) {
      Alert.alert("Erro", "Digite uma nova senha");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert("Erro", "A nova senha deve ser diferente da atual");
      return;
    }

    try {
      setCarregando(true);
      const lider = await obterSessaoLider();

      if (!lider) {
        Alert.alert("Erro", "Sessão expirada. Faça login novamente");
        return;
      }

      await mudarSenhaMutation.mutateAsync({
        liderId: parseInt(lider.id),
        senhaAtual,
        novaSenha,
      });

      Alert.alert("Sucesso", "Senha alterada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error.message || "Erro ao alterar senha. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">
              Mudar Senha
            </Text>
            <Text className="text-sm text-muted mt-1">
              Altere sua senha de acesso
            </Text>
          </View>
          <BackButton />
        </View>

        {/* Card de Aviso */}
        <View
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: colors.warning + "15",
            borderColor: colors.warning + "30",
          }}
        >
          <Text className="text-sm text-foreground font-semibold mb-1">
            ⚠️ Segurança
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            Use uma senha forte com letras, números e caracteres especiais.
            Nunca compartilhe sua senha com outras pessoas.
          </Text>
        </View>

        {/* Senha Atual */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Senha Atual *
          </Text>
          <View className="flex-row items-center border border-border rounded-lg overflow-hidden">
            <TextInput
              className="flex-1 p-3 text-foreground"
              placeholder="Digite sua senha atual"
              placeholderTextColor={colors.muted}
              secureTextEntry={!mostrarSenhas.atual}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              editable={!carregando}
            />
            <TouchableOpacity
              onPress={() =>
                setMostrarSenhas({ ...mostrarSenhas, atual: !mostrarSenhas.atual })
              }
              className="px-3"
            >
              <Text className="text-primary font-semibold text-sm">
                {mostrarSenhas.atual ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nova Senha */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Nova Senha *
          </Text>
          <View className="flex-row items-center border border-border rounded-lg overflow-hidden">
            <TextInput
              className="flex-1 p-3 text-foreground"
              placeholder="Digite uma nova senha"
              placeholderTextColor={colors.muted}
              secureTextEntry={!mostrarSenhas.nova}
              value={novaSenha}
              onChangeText={setNovaSenha}
              editable={!carregando}
            />
            <TouchableOpacity
              onPress={() =>
                setMostrarSenhas({ ...mostrarSenhas, nova: !mostrarSenhas.nova })
              }
              className="px-3"
            >
              <Text className="text-primary font-semibold text-sm">
                {mostrarSenhas.nova ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>
          {novaSenha && novaSenha.length < 6 && (
            <Text className="text-xs text-error">
              Mínimo 6 caracteres (você tem {novaSenha.length})
            </Text>
          )}
        </View>

        {/* Confirmar Senha */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Confirmar Senha *
          </Text>
          <View className="flex-row items-center border border-border rounded-lg overflow-hidden">
            <TextInput
              className="flex-1 p-3 text-foreground"
              placeholder="Confirme a nova senha"
              placeholderTextColor={colors.muted}
              secureTextEntry={!mostrarSenhas.confirmar}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              editable={!carregando}
            />
            <TouchableOpacity
              onPress={() =>
                setMostrarSenhas({
                  ...mostrarSenhas,
                  confirmar: !mostrarSenhas.confirmar,
                })
              }
              className="px-3"
            >
              <Text className="text-primary font-semibold text-sm">
                {mostrarSenhas.confirmar ? "Ocultar" : "Mostrar"}
              </Text>
            </TouchableOpacity>
          </View>
          {confirmarSenha &&
            novaSenha &&
            novaSenha !== confirmarSenha && (
              <Text className="text-xs text-error">As senhas não conferem</Text>
            )}
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleMudarSenha}
          disabled={carregando || !senhaAtual || !novaSenha || !confirmarSenha}
          className="rounded-lg p-4 items-center mt-4"
          style={{
            backgroundColor:
              carregando || !senhaAtual || !novaSenha || !confirmarSenha
                ? colors.muted
                : colors.primary,
          }}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Alterar Senha
            </Text>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View
          className="rounded-lg p-4 border"
          style={{
            backgroundColor: colors.primary + "10",
            borderColor: colors.primary + "20",
          }}
        >
          <Text className="text-sm font-semibold text-foreground mb-2">
            💡 Dicas de Segurança
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            • Use uma combinação de letras maiúsculas e minúsculas{"\n"}
            • Inclua números e símbolos (!@#$%){"\n"}
            • Evite datas de nascimento ou nomes{"\n"}
            • Não reutilize senhas antigas
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
