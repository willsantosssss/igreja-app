import { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { salvarSessaoLider, obterSessaoLider, encerrarSessaoLider, type LiderCelula } from '@/lib/data/lideres';
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
  const [celulaInput, setCelulaInput] = useState('');
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

  // Buscar dados do banco de dados
  const { data: membrosDB = [], isLoading: carregandoMembros } = trpc.usuarios.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar líderes do banco
  const { data: lideresDB = [] } = trpc.lideres.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    verificarSessao();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (lider && membrosDB.length > 0) {
        carregarEstatisticas(lider.celula);
      }
    }, [lider, membrosDB])
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
    const membrosDaCelula = membrosDB.filter((m: any) => m.celula === celulaNome);
    const mesAtual = new Date().getMonth() + 1;
    const aniversariantes = membrosDaCelula.filter((m: any) => {
      if (!m.dataNascimento) return false;
      const dataNasc = new Date(m.dataNascimento);
      return dataNasc.getMonth() + 1 === mesAtual;
    });

    setStats({
      totalMembros: membrosDaCelula.length,
      aniversariantesMes: aniversariantes.length,
      inscritosEventos: 0,
      totalRelatorios: 0,
      mediaPresenca: 0,
      mediaVisitantes: 0,
    });
  };

  const handleLogin = async () => {
    if (!celulaInput.trim()) {
      Alert.alert('Atenção', 'Selecione uma célula.');
      return;
    }
    if (!senhaInput.trim()) {
      Alert.alert('Atenção', 'Digite a senha de acesso.');
      return;
    }

    setAutenticando(true);
    try {
      // Buscar líder do banco pela célula
      const liderBanco = lideresDB.find((l: any) => l.celula === celulaInput);
      
      if (!liderBanco) {
        Alert.alert('Erro', 'Célula não encontrada. Verifique e tente novamente.');
        setAutenticando(false);
        return;
      }

      // Validar senha (usando telefone como senha temporária)
      if (liderBanco.telefone !== senhaInput.trim()) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert('Erro', 'Senha incorreta. Solicite a senha ao administrador da igreja.');
        setSenhaInput('');
        setAutenticando(false);
        return;
      }

      // Converter para LiderCelula com ID do banco
      const resultado: LiderCelula = {
        id: String(liderBanco.id), // ID real do banco
        nome: liderBanco.nome,
        celula: liderBanco.celula,
        senha: senhaInput,
        criadoEm: new Date().toISOString(),
      };

      console.log('[Login] Autenticado:', {
        id: resultado.id,
        nome: resultado.nome,
        celula: resultado.celula,
        idType: typeof resultado.id,
      });

      await salvarSessaoLider(resultado);
      setLider(resultado);
      await carregarEstatisticas(resultado.celula);
      setSenhaInput('');
      setCelulaInput('');

      if (Platform.OS !== 'web') {
        const config = await obterConfigLembrete();
        if (config.ativo) {
          await agendarLembreteSemanal(resultado.nome, resultado.celula, config);
          setLembreteAtivo(true);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('[Login] Erro:', error);
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
          setCelulaInput('');
          setLembreteAtivo(false);
        },
      },
    ]);
  };

  if (carregando || (lider && carregandoMembros)) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted text-base mt-4">Carregando dados da célula...</Text>
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
                Selecione sua célula e digite a senha
              </Text>
            </View>

            {/* Seletor de Célula */}
            <View>
              <Text className="text-foreground font-semibold mb-2">Célula *</Text>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {lideresDB.map((l: any) => (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => setCelulaInput(l.celula)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginRight: 8,
                        borderRadius: 8,
                        backgroundColor: celulaInput === l.celula ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: celulaInput === l.celula ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: celulaInput === l.celula ? '#fff' : colors.foreground,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {l.celula}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Senha */}
            <View>
              <Text className="text-foreground font-semibold mb-2">Senha *</Text>
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
            </View>

            {/* Botão Login */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={autenticando || !celulaInput}
              style={{
                backgroundColor: autenticando || !celulaInput ? colors.muted : colors.primary,
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
          <BackButton />
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
            onPress={() => router.push('/lider/relatorio')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: colors.primary + '20',
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">Novo Relatório</Text>
              <Text className="text-xs text-muted">Registre os dados da célula</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/lider/historico')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: colors.success + '20',
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="doc.text.fill" size={24} color={colors.success} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">Histórico</Text>
              <Text className="text-xs text-muted">Veja relatórios anteriores</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/lider/anexos')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: colors.warning + '20',
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="paperclip" size={24} color={colors.warning} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">Anexos</Text>
              <Text className="text-xs text-muted">Baixe documentos e materiais</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
