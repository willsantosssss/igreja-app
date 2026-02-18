import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import {
  autenticarLider, salvarSessaoLider, obterSessaoLider, encerrarSessaoLider,
  getEstatisticasCelula,
  type LiderCelula,
} from '@/lib/data/lideres';
import {
  agendarLembreteSemanal,
  cancelarLembrete,
  verificarLembreteAgendado,
  obterConfigLembrete,
  DIAS_SEMANA,
  formatarHorario,
} from '@/lib/services/lembrete-lider';

export default function LiderScreen() {
  const colors = useColors();
  const router = useRouter();
  const [lider, setLider] = useState<LiderCelula | null>(null);
  const [senhaInput, setSenhaInput] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [autenticando, setAutenticando] = useState(false);
  const [stats, setStats] = useState({
    totalMembros: 0,
    aniversariantesMes: 0,
    inscritosEventos: 0,
    totalRelatorios: 0,
    mediaPresenca: 0,
    mediaVisitantes: 0,
  });
  const [lembreteAtivo, setLembreteAtivo] = useState(false);

  useEffect(() => {
    verificarSessao();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lider) {
        carregarEstatisticas(lider.celula);
      }
    }, [lider])
  );

  const verificarSessao = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
      await carregarEstatisticas(sessao.celula);
      const status = await verificarLembreteAgendado();
      setLembreteAtivo(status);
    }
    setCarregando(false);
  };

  const carregarEstatisticas = async (celulaNome: string) => {
    const estatisticas = await getEstatisticasCelula(celulaNome);
    setStats(estatisticas);
  };

  const handleLogin = async () => {
    if (!senhaInput.trim()) {
      Alert.alert('Atenção', 'Digite a senha de acesso.');
      return;
    }

    setAutenticando(true);
    try {
      const resultado = await autenticarLider(senhaInput.trim());
      if (resultado) {
        await salvarSessaoLider(resultado);
        setLider(resultado);
        await carregarEstatisticas(resultado.celula);
        setSenhaInput('');
        // Agendar lembrete automaticamente no primeiro login
        if (Platform.OS !== 'web') {
          const config = await obterConfigLembrete();
          if (config.ativo) {
            await agendarLembreteSemanal(resultado.nome, resultado.celula, config);
            setLembreteAtivo(true);
          }
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Erro', 'Senha incorreta. Solicite a senha ao administrador da igreja.');
        setSenhaInput('');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível autenticar. Tente novamente.');
    } finally {
      setAutenticando(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair do painel de líder?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await cancelarLembrete();
          await encerrarSessaoLider();
          setLider(null);
          setSenhaInput('');
          setLembreteAtivo(false);
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Tela de Login
  if (!lider) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Área do Líder</Text>
            <Text className="text-base text-muted">2ª Igreja Quadrangular de Rondonópolis</Text>
          </View>

          {/* Card de Login */}
          <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
            <View className="items-center gap-2 mb-2">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 64, height: 64, borderRadius: 32,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="lock.fill" size={30} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold text-foreground">Autenticação</Text>
              <Text className="text-sm text-muted text-center">
                Digite a senha fornecida pelo administrador
              </Text>
            </View>

            <TextInput
              value={senhaInput}
              onChangeText={setSenhaInput}
              placeholder="Senha de acesso"
              placeholderTextColor={colors.muted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.foreground,
              }}
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={autenticando}
              style={{
                backgroundColor: autenticando ? colors.muted : colors.primary,
                borderRadius: 24,
                padding: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                {autenticando ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View
            style={{
              backgroundColor: colors.primary + '10',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary + '20',
            }}
          >
            <Text className="text-sm font-semibold text-foreground mb-1">
              Como obter acesso?
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Cada líder de célula possui uma senha exclusiva criada pelo administrador da igreja.
              Se você é líder e ainda não tem acesso, entre em contato com a liderança.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Dashboard do Líder
  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const mesAtual = meses[new Date().getMonth() + 1];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Olá, {lider.nome}!</Text>
            <Text className="text-sm text-muted">Líder da célula "{lider.celula}"</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: colors.error + '20',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.error,
            }}
          >
            <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View className="flex-row gap-2">
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 1,
              borderColor: colors.primary + '20',
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>
              {stats.totalMembros}
            </Text>
            <Text className="text-xs text-muted text-center">Membros</Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{
              backgroundColor: colors.warning + '10',
              borderWidth: 1,
              borderColor: colors.warning + '20',
            }}
          >
            <Text style={{ color: colors.warning, fontSize: 28, fontWeight: '800' }}>
              {stats.aniversariantesMes}
            </Text>
            <Text className="text-xs text-muted text-center">Anivers. {mesAtual}</Text>
          </View>
          <View
            className="flex-1 rounded-2xl p-4 items-center"
            style={{
              backgroundColor: colors.success + '10',
              borderWidth: 1,
              borderColor: colors.success + '20',
            }}
          >
            <Text style={{ color: colors.success, fontSize: 28, fontWeight: '800' }}>
              {stats.inscritosEventos}
            </Text>
            <Text className="text-xs text-muted text-center">Eventos</Text>
          </View>
        </View>

        {/* Ações Principais */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-muted uppercase">Ações</Text>

          <TouchableOpacity
            onPress={() => router.push('/lider/membros' as any)}
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
          >
            <View
              style={{
                backgroundColor: colors.primary + '20',
                width: 48, height: 48, borderRadius: 24,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Membros da Célula</Text>
              <Text className="text-sm text-muted">
                {stats.totalMembros} membros cadastrados
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/relatorio' as any)}
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
          >
            <View
              style={{
                backgroundColor: colors.success + '20',
                width: 48, height: 48, borderRadius: 24,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconSymbol name="doc.text.fill" size={24} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Novo Relatório</Text>
              <Text className="text-sm text-muted">
                Registrar encontro da célula
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/historico' as any)}
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
          >
            <View
              style={{
                backgroundColor: colors.warning + '20',
                width: 48, height: 48, borderRadius: 24,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <IconSymbol name="calendar" size={24} color={colors.warning} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Historico de Relatorios</Text>
              <Text className="text-sm text-muted">
                {stats.totalRelatorios} relatorios enviados
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/inscritos-eventos' as any)}
            className="bg-surface rounded-2xl p-5 flex-row items-center gap-4 border border-border"
          >
            <View
              style={{
                backgroundColor: colors.primary + '20',
                width: 48, height: 48, borderRadius: 24,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text className="text-2xl">📋</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">Inscritos em Eventos</Text>
              <Text className="text-sm text-muted">
                {stats.inscritosEventos} membros inscritos
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Resumo de Relatórios */}
        {stats.totalRelatorios > 0 && (
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-base font-bold text-foreground">Resumo dos Relatórios</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>
                  {stats.mediaPresenca}
                </Text>
                <Text className="text-xs text-muted">Média Presença</Text>
              </View>
              <View className="items-center">
                <Text style={{ color: colors.success, fontSize: 20, fontWeight: '800' }}>
                  {stats.mediaVisitantes}
                </Text>
                <Text className="text-xs text-muted">Média Visitantes</Text>
              </View>
              <View className="items-center">
                <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '800' }}>
                  {stats.totalRelatorios}
                </Text>
                <Text className="text-xs text-muted">Total Relatórios</Text>
              </View>
            </View>
          </View>
        )}

        {/* Lembrete Semanal */}
        <TouchableOpacity
          onPress={() => router.push('/lider/lembrete' as any)}
          className="bg-surface rounded-2xl p-4 flex-row items-center gap-3 border border-border"
        >
          <View
            style={{
              backgroundColor: lembreteAtivo ? colors.success + '20' : colors.muted + '15',
              width: 44, height: 44, borderRadius: 22,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconSymbol
              name={lembreteAtivo ? 'bell.fill' : 'bell.slash.fill'}
              size={22}
              color={lembreteAtivo ? colors.success : colors.muted}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-foreground">Lembrete Semanal</Text>
            <Text className="text-xs text-muted">
              {lembreteAtivo ? 'Ativo — toque para configurar' : 'Desativado — toque para ativar'}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </TouchableOpacity>

        {/* Card motivacional */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>
            Continue o bom trabalho!
          </Text>
          <Text style={{ color: '#fff', opacity: 0.9, fontSize: 13, lineHeight: 20 }}>
            "Apascentai o rebanho de Deus que está entre vós, tendo cuidado dele, não por força, mas voluntariamente." — 1 Pedro 5:2
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
