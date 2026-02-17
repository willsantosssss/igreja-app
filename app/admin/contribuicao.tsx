import { useState, useCallback } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  getDadosContribuicao, salvarDadosContribuicao,
  type DadosContribuicao, type TipoContribuicao,
} from '@/lib/data/contribuicao';

export default function AdminContribuicaoScreen() {
  const colors = useColors();
  const router = useRouter();
  const [dados, setDados] = useState<DadosContribuicao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [showNovoTipo, setShowNovoTipo] = useState(false);

  // Form state
  const [pixKey, setPixKey] = useState('');
  const [bank, setBank] = useState('');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [titular, setTitular] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [versiculo, setVersiculo] = useState('');
  const [agradecimento, setAgradecimento] = useState('');

  // Novo tipo
  const [novoNome, setNovoNome] = useState('');
  const [novoEmoji, setNovoEmoji] = useState('💝');
  const [novoDescricao, setNovoDescricao] = useState('');

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    setCarregando(true);
    const d = await getDadosContribuicao();
    setDados(d);
    preencherForm(d);
    setCarregando(false);
  };

  const preencherForm = (d: DadosContribuicao) => {
    setPixKey(d.pixKey); setBank(d.bank); setAgency(d.agency);
    setAccount(d.account); setCnpj(d.cnpj); setTitular(d.titular);
    setMensagem(d.mensagemMotivacional); setVersiculo(d.versiculoRef);
    setAgradecimento(d.mensagemAgradecimento);
  };

  const handleSalvar = async () => {
    if (!dados) return;

    const novoDados: DadosContribuicao = {
      ...dados,
      pixKey: pixKey.trim(),
      bank: bank.trim(),
      agency: agency.trim(),
      account: account.trim(),
      cnpj: cnpj.trim(),
      titular: titular.trim(),
      mensagemMotivacional: mensagem.trim(),
      versiculoRef: versiculo.trim(),
      mensagemAgradecimento: agradecimento.trim(),
    };

    await salvarDadosContribuicao(novoDados);
    setDados(novoDados);
    setEditando(false);
    Alert.alert('Sucesso', 'Dados de contribuição atualizados!');
  };

  const handleAdicionarTipo = async () => {
    if (!novoNome.trim() || !dados) {
      Alert.alert('Atenção', 'Preencha pelo menos o nome do tipo de contribuição.');
      return;
    }

    const novoTipo: TipoContribuicao = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      emoji: novoEmoji.trim() || '💝',
      descricao: novoDescricao.trim(),
      ativo: true,
    };

    const novoDados = { ...dados, tiposContribuicao: [...dados.tiposContribuicao, novoTipo] };
    await salvarDadosContribuicao(novoDados);
    setDados(novoDados);
    setNovoNome(''); setNovoEmoji('💝'); setNovoDescricao('');
    setShowNovoTipo(false);
    Alert.alert('Sucesso', 'Tipo de contribuição adicionado!');
  };

  const handleRemoverTipo = (id: string, nome: string) => {
    Alert.alert('Remover', `Deseja remover "${nome}"?`, [
      { text: 'Cancelar' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          if (!dados) return;
          const novoDados = { ...dados, tiposContribuicao: dados.tiposContribuicao.filter(t => t.id !== id) };
          await salvarDadosContribuicao(novoDados);
          setDados(novoDados);
        },
      },
    ]);
  };

  const handleToggleTipo = async (id: string) => {
    if (!dados) return;
    const novoDados = {
      ...dados,
      tiposContribuicao: dados.tiposContribuicao.map(t =>
        t.id === id ? { ...t, ativo: !t.ativo } : t
      ),
    };
    await salvarDadosContribuicao(novoDados);
    setDados(novoDados);
  };

  if (carregando || !dados) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Gerenciar Contribuição</Text>
            <Text className="text-muted text-sm">Dados de PIX, banco e tipos</Text>
          </View>
          {!editando && (
            <TouchableOpacity
              onPress={() => setEditando(true)}
              style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== MODO VISUALIZAÇÃO ===== */}
        {!editando ? (
          <>
            {/* PIX */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <Text className="text-base font-bold text-foreground">Chave PIX</Text>
              <View style={{ backgroundColor: colors.primary + '10', padding: 12, borderRadius: 12 }}>
                <Text className="text-base font-semibold text-foreground text-center">{dados.pixKey}</Text>
              </View>
            </View>

            {/* Dados Bancários */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <Text className="text-base font-bold text-foreground">Dados Bancários</Text>
              <View className="gap-2">
                {[
                  ['Titular', dados.titular],
                  ['Banco', dados.bank],
                  ['Agência', dados.agency],
                  ['Conta', dados.account],
                  ['CNPJ', dados.cnpj],
                ].map(([label, value]) => (
                  <View key={label} className="flex-row justify-between items-center">
                    <Text className="text-xs text-muted">{label}</Text>
                    <Text className="text-sm font-semibold text-foreground">{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Mensagens */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-border">
              <Text className="text-base font-bold text-foreground">Mensagens</Text>
              <View className="gap-2">
                <Text className="text-xs text-muted">Motivacional:</Text>
                <Text className="text-sm text-foreground italic">{dados.mensagemMotivacional}</Text>
                <Text className="text-xs text-muted">— {dados.versiculoRef}</Text>
              </View>
              <View className="gap-2">
                <Text className="text-xs text-muted">Agradecimento:</Text>
                <Text className="text-sm text-foreground">{dados.mensagemAgradecimento}</Text>
              </View>
            </View>

            {/* Tipos de Contribuição */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-foreground">Tipos de Contribuição</Text>
                <TouchableOpacity
                  onPress={() => setShowNovoTipo(true)}
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>+ Novo</Text>
                </TouchableOpacity>
              </View>

              {showNovoTipo && (
                <View className="bg-surface rounded-2xl p-4 gap-3 border border-primary">
                  <Text className="text-sm font-bold text-foreground">Novo Tipo</Text>
                  <TextInput
                    className="bg-background rounded-xl px-4 py-3 text-foreground border"
                    style={{ borderColor: colors.border }}
                    placeholder="Nome (ex: Campanha)"
                    placeholderTextColor={colors.muted}
                    value={novoNome}
                    onChangeText={setNovoNome}
                  />
                  <TextInput
                    className="bg-background rounded-xl px-4 py-3 text-foreground border"
                    style={{ borderColor: colors.border }}
                    placeholder="Emoji (ex: 💝)"
                    placeholderTextColor={colors.muted}
                    value={novoEmoji}
                    onChangeText={setNovoEmoji}
                  />
                  <TextInput
                    className="bg-background rounded-xl px-4 py-3 text-foreground border"
                    style={{ borderColor: colors.border, minHeight: 60, textAlignVertical: 'top' }}
                    placeholder="Descrição..."
                    placeholderTextColor={colors.muted}
                    value={novoDescricao}
                    onChangeText={setNovoDescricao}
                    multiline
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{ backgroundColor: colors.primary }}
                      onPress={handleAdicionarTipo}
                    >
                      <Text className="text-white font-semibold text-sm">Adicionar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-2 rounded-lg items-center"
                      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                      onPress={() => setShowNovoTipo(false)}
                    >
                      <Text className="text-foreground font-semibold text-sm">Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {dados.tiposContribuicao.map(tipo => (
                <View key={tipo.id} className="bg-surface rounded-2xl p-4 gap-2 border border-border">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-xl">{tipo.emoji}</Text>
                      <Text className="text-sm font-bold text-foreground">{tipo.nome}</Text>
                      {!tipo.ativo && (
                        <View style={{ backgroundColor: colors.muted + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '600' }}>Inativo</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleToggleTipo(tipo.id)}
                        style={{ backgroundColor: tipo.ativo ? colors.success + '15' : colors.muted + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                      >
                        <Text style={{ color: tipo.ativo ? colors.success : colors.muted, fontSize: 11, fontWeight: '600' }}>
                          {tipo.ativo ? 'Ativo' : 'Inativo'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoverTipo(tipo.id, tipo.nome)}
                        style={{ backgroundColor: colors.error + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                      >
                        <Text style={{ color: colors.error, fontSize: 11, fontWeight: '600' }}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text className="text-xs text-muted">{tipo.descricao}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* ===== MODO EDIÇÃO ===== */
          <>
            {/* PIX */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-primary">
              <Text className="text-base font-bold text-foreground">Chave PIX</Text>
              <TextInput
                className="bg-background rounded-xl px-4 py-3 text-foreground border"
                style={{ borderColor: colors.border }}
                placeholder="Chave PIX"
                placeholderTextColor={colors.muted}
                value={pixKey}
                onChangeText={setPixKey}
              />
            </View>

            {/* Dados Bancários */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-primary">
              <Text className="text-base font-bold text-foreground">Dados Bancários</Text>
              {[
                ['Titular', titular, setTitular],
                ['Banco', bank, setBank],
                ['Agência', agency, setAgency],
                ['Conta', account, setAccount],
                ['CNPJ', cnpj, setCnpj],
              ].map(([label, value, setter]) => (
                <View key={label as string} className="gap-1">
                  <Text className="text-xs text-muted">{label as string}</Text>
                  <TextInput
                    className="bg-background rounded-xl px-4 py-3 text-foreground border"
                    style={{ borderColor: colors.border }}
                    value={value as string}
                    onChangeText={setter as (text: string) => void}
                  />
                </View>
              ))}
            </View>

            {/* Mensagens */}
            <View className="bg-surface rounded-2xl p-4 gap-3 border border-primary">
              <Text className="text-base font-bold text-foreground">Mensagens</Text>
              <View className="gap-1">
                <Text className="text-xs text-muted">Mensagem Motivacional</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border, minHeight: 60, textAlignVertical: 'top' }}
                  value={mensagem}
                  onChangeText={setMensagem}
                  multiline
                />
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">Referência Bíblica</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border }}
                  value={versiculo}
                  onChangeText={setVersiculo}
                />
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">Mensagem de Agradecimento</Text>
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-foreground border"
                  style={{ borderColor: colors.border, minHeight: 60, textAlignVertical: 'top' }}
                  value={agradecimento}
                  onChangeText={setAgradecimento}
                  multiline
                />
              </View>
            </View>

            {/* Botões */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleSalvar}
              >
                <Text className="text-white font-bold text-base">Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
                onPress={() => { setEditando(false); if (dados) preencherForm(dados); }}
              >
                <Text className="text-foreground font-bold text-base">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
