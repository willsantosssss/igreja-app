import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function AdminContribuicaoScreen() {
  const colors = useColors();
  const { data: dados, isLoading, refetch } = trpc.contribuicao.get.useQuery();
  const updateMutation = trpc.contribuicao.update.useMutation();

  const [pixKey, setPixKey] = useState("");
  const [bank, setBank] = useState("");
  const [agency, setAgency] = useState("");
  const [account, setAccount] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [titular, setTitular] = useState("");
  const [mensagemMotivacional, setMensagemMotivacional] = useState("");
  const [versiculoRef, setVersiculoRef] = useState("");
  const [mensagemAgradecimento, setMensagemAgradecimento] = useState("");

  useEffect(() => {
    if (dados) {
      setPixKey(dados.pixKey);
      setBank(dados.bank);
      setAgency(dados.agency);
      setAccount(dados.account);
      setCnpj(dados.cnpj);
      setTitular(dados.titular);
      setMensagemMotivacional(dados.mensagemMotivacional);
      setVersiculoRef(dados.versiculoRef);
      setMensagemAgradecimento(dados.mensagemAgradecimento);
    }
  }, [dados]);

  const handleSalvar = async () => {
    if (!dados) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await updateMutation.mutateAsync({
        id: dados.id,
        data: {
          pixKey,
          bank,
          agency,
          account,
          cnpj,
          titular,
          mensagemMotivacional,
          versiculoRef,
          mensagemAgradecimento,
        },
      });

      await refetch();
      Alert.alert("Sucesso!", "Dados de contribuição atualizados com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted mt-4">Carregando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
            onPress={() => router.back()}
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Editar Contribuição</Text>
            <Text className="text-sm text-muted mt-1">Dados de PIX e banco</Text>
          </View>
        </View>

        {/* Dados PIX */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Dados PIX</Text>
          
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Chave PIX</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={pixKey}
              onChangeText={setPixKey}
              placeholder="Digite a chave PIX"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Dados Bancários */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Dados Bancários</Text>
          
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Titular</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={titular}
              onChangeText={setTitular}
              placeholder="Nome do titular"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Banco</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={bank}
              onChangeText={setBank}
              placeholder="Nome do banco"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="text-sm font-semibold text-foreground">Agência</Text>
              <TextInput
                className="bg-surface rounded-xl p-4 text-foreground border border-border"
                value={agency}
                onChangeText={setAgency}
                placeholder="0000"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="flex-1 gap-2">
              <Text className="text-sm font-semibold text-foreground">Conta</Text>
              <TextInput
                className="bg-surface rounded-xl p-4 text-foreground border border-border"
                value={account}
                onChangeText={setAccount}
                placeholder="00000-0"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">CNPJ</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={cnpj}
              onChangeText={setCnpj}
              placeholder="00.000.000/0000-00"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Mensagens */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Mensagens</Text>
          
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Mensagem Motivacional</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={mensagemMotivacional}
              onChangeText={setMensagemMotivacional}
              placeholder="Digite a mensagem motivacional"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Referência Bíblica</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={versiculoRef}
              onChangeText={setVersiculoRef}
              placeholder="Ex: 2 Coríntios 9:7"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Mensagem de Agradecimento</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-foreground border border-border"
              value={mensagemAgradecimento}
              onChangeText={setMensagemAgradecimento}
              placeholder="Digite a mensagem de agradecimento"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Nota sobre tipos */}
        <View className="bg-primary/10 rounded-2xl p-4 gap-2 border border-primary/20">
          <Text className="text-sm font-semibold text-foreground">ℹ️ Tipos de Contribuição</Text>
          <Text className="text-sm text-muted">
            Os tipos de contribuição (Dízimo, Oferta, Missões, Projetos Especiais) são fixos no aplicativo e não podem ser alterados.
          </Text>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleSalvar}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-base">Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
