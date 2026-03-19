import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView, Text, View, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator, Modal,
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
  const [liderSelecionadoId, setLiderSelecionadoId] = useState<number | null>(null);
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
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  // Buscar dados do banco de dados
  const { data: membrosDB = [], isLoading: carregandoMembros } = trpc.usuarios.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar líderes do banco
  const { data: lideresDB = [] } = trpc.lideres.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });

  // Buscar inscrições em eventos
  const { data: inscricoesEventosDB = [] } = trpc.inscricoesEventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Buscar relatórios
  const { data: relatoriosDB = [] } = trpc.relatorios.getByLiderIdWithFilters.useQuery(
    {
      liderId: lider?.id ? parseInt(lider.id) : 0,
      dataInicio: '',
      dataFim: '',
      limite: 1000,
    },
    {
      enabled: !!lider?.id,
      refetchOnWindowFocus: true,
      refetchInterval: 30000,
    }
  );

  // Mutation para atualizar líder (senha)
  const atualizarLiderMutation = trpc.lideres.update.useMutation();

  useEffect(() => {
    verificarSessao();
  }, []);

  // Usar useMemo para evitar recalcular stats desnecessariamente
  const statsCalculadas = useMemo(() => {
    if (!lider || membrosDB.length === 0) {
      return {
        totalMembros: 0,
        aniversariantesMes: 0,
        inscritosEventos: 0,
        totalRelatorios: 0,
        mediaPresenca: 0,
        mediaVisitantes: 0,
      };
    }

    const membrosDaCelula = membrosDB.filter((m: any) => m.celula === lider.celula);
    const mesAtual = new Date().getMonth() + 1;
    const aniversariantes = membrosDaCelula.filter((m: any) => {
      if (!m.dataNascimento) return false;
      const dataNasc = new Date(m.dataNascimento);
      return dataNasc.getMonth() + 1 === mesAtual;
    });

    const inscricoesEventosDaCelula = inscricoesEventosDB.filter((i: any) => i.celula === lider.celula);

    let mediaPresenca = 0;
    let mediaVisitantes = 0;
    if (relatoriosDB.length > 0) {
      mediaPresenca = Math.round(
        relatoriosDB.reduce((acc: number, r: any) => acc + (r.presentes || 0), 0) / relatoriosDB.length
      );
      mediaVisitantes = Math.round(
        relatoriosDB.reduce((acc: number, r: any) => acc + (r.novosVisitantes || 0), 0) / relatoriosDB.length
      );
    }

    return {
      totalMembros: membrosDaCelula.length,
      aniversariantesMes: aniversariantes.length,
      inscritosEventos: inscricoesEventosDaCelula.length,
      totalRelatorios: relatoriosDB.length,
      mediaPresenca,
      mediaVisitantes,
    };
  }, [lider, membrosDB, inscricoesEventosDB, relatoriosDB]);

  const verificarSessao = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
      const status = await verificarLembreteAgendado();
      setLembreteAtivo(status);
    }
    setCarregando(false);
  };

  // Obter lista única de células
  const celulasUnicas = Array.from(new Set(lideresDB.map((l: any) => l.celula))).sort();

  // Obter líderes da célula selecionada
  const lideresDaCelula = celulaInput
    ? lideresDB.filter((l: any) => l.celula === celulaInput)
    : [];

  const handleLogin = async () => {
    if (!celulaInput.trim()) {
      Alert.alert('Atenção', 'Selecione uma célula.');
      return;
    }
    if (liderSelecionadoId === null) {
      Alert.alert('Atenção', 'Selecione seu nome.');
      return;
    }
    if (!senhaInput.trim()) {
      Alert.alert('Atenção', 'Digite a senha de acesso.');
      return;
    }

    setAutenticando(true);
    try {
      // Buscar líder específico do banco
      const liderBanco = lideresDB.find((l: any) => l.id === liderSelecionadoId);
      
      if (!liderBanco) {
        Alert.alert('Erro', 'Líder não encontrado. Verifique e tente novamente.');
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
      setSenhaInput('');
      setCelulaInput('');
      setLiderSelecionadoId(null);

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
          setLiderSelecionadoId(null);
          setLembreteAtivo(false);
          setMostrarModalSenha(false);
          setSenhaAtual('');
          setNovaSenha('');
          setConfirmarSenha('');
        },
      },
    ]);
  };

  const handleMudarSenha = async () => {
    if (!senhaAtual.trim()) {
      Alert.alert('Atenção', 'Digite sua senha atual.');
      return;
    }
    if (!novaSenha.trim()) {
      Alert.alert('Atenção', 'Digite a nova senha.');
      return;
    }
    if (!confirmarSenha.trim()) {
      Alert.alert('Atenção', 'Confirme a nova senha.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }
    if (novaSenha.length < 4) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (senhaAtual === novaSenha) {
      Alert.alert('Erro', 'A nova senha deve ser diferente da atual.');
      return;
    }

    setAlterandoSenha(true);
    try {
      // Validar senha atual
      if (senhaAtual !== lider?.senha) {
        Alert.alert('Erro', 'Senha atual incorreta.');
        setSenhaAtual('');
        setAlterandoSenha(false);
        return;
      }

      // Atualizar senha no banco de dados via tRPC
      const liderBanco = lideresDB.find((l: any) => l.id === parseInt(lider!.id));
      if (!liderBanco) {
        Alert.alert('Erro', 'Líder não encontrado.');
        setAlterandoSenha(false);
        return;
      }

      // Atualizar senha no banco de dados via tRPC
      const liderId = parseInt(lider!.id);
      
      // Chamar endpoint tRPC para atualizar a senha no banco de dados
      await atualizarLiderMutation.mutateAsync({
        id: liderId,
        data: {
          telefone: novaSenha, // A senha é armazenada no campo telefone
        },
      });

      // Atualizar sessão local com a nova senha
      const liderAtualizado: LiderCelula = {
        ...lider,
        senha: novaSenha,
      };
      await salvarSessaoLider(liderAtualizado);
      setLider(liderAtualizado);
      
      console.log('[MudarSenha] Senha atualizada com sucesso no banco de dados');

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setMostrarModalSenha(false);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      console.error('[MudarSenha] Erro:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setAlterandoSenha(false);
    }
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
                  {celulasUnicas.map((celula: string) => (
                    <TouchableOpacity
                      key={celula}
                      onPress={() => {
                        setCelulaInput(celula);
                        setLiderSelecionadoId(null); // Resetar seleção de líder
                        setSenhaInput(''); // Limpar senha
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginRight: 8,
                        borderRadius: 8,
                        backgroundColor: celulaInput === celula ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: celulaInput === celula ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: celulaInput === celula ? '#fff' : colors.foreground,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {celula}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Seletor de Líder (aparece após selecionar célula) */}
            {celulaInput && lideresDaCelula.length > 0 && (
              <View>
                <Text className="text-foreground font-semibold mb-2">Seu Nome *</Text>
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
                    {lideresDaCelula.map((l: any) => (
                      <TouchableOpacity
                        key={l.id}
                        onPress={() => {
                          setLiderSelecionadoId(l.id);
                          setSenhaInput(''); // Limpar senha ao trocar líder
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          marginRight: 8,
                          borderRadius: 8,
                          backgroundColor: liderSelecionadoId === l.id ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: liderSelecionadoId === l.id ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: liderSelecionadoId === l.id ? '#fff' : colors.foreground,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {l.nome}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

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
              disabled={autenticando || !celulaInput || liderSelecionadoId === null}
              style={{
                backgroundColor: autenticando || !celulaInput || liderSelecionadoId === null ? colors.muted : colors.primary,
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
              Cada líder de célula possui uma senha exclusiva criada pelo administrador da igreja. Se você é líder e ainda não tem acesso, entre em contato com a liderança.
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Tela do Dashboard do Líder (quando logado)
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header com Logout */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">Bem-vindo, {lider.nome}</Text>
            <Text className="text-base text-muted mt-1">{lider.celula}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: colors.error + '20',
              width: 44, height: 44, borderRadius: 22,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconSymbol name="power" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Menu de Ações */}
        <View className="gap-3 mt-4">
          <TouchableOpacity
            onPress={() => router.push('/lider/membros-view')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="person.2" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Membros</Text>
                <Text className="text-xs text-muted">Ver lista de membros</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/aniversariantes-view')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="birthday.cake" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Aniversariantes</Text>
                <Text className="text-xs text-muted">Aniversários do mês</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/eventos-view')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="calendar" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Eventos</Text>
                <Text className="text-xs text-muted">Inscrições em eventos</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/relatorio')}
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '30',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="doc.badge.plus" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary">Novo Relatório</Text>
                <Text className="text-xs text-muted">Registrar relatório da célula</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/lider/historico')}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="doc.text" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Histórico</Text>
                <Text className="text-xs text-muted">Ver relatórios anteriores</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Botão Mudar Senha */}
          <TouchableOpacity
            onPress={() => setMostrarModalSenha(true)}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  width: 44, height: 44, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSymbol name="lock" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Mudar Senha</Text>
                <Text className="text-xs text-muted">Alterar sua senha de acesso</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Mudar Senha */}
      <Modal
        visible={mostrarModalSenha}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalSenha(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 40,
              maxHeight: '80%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-foreground">Mudar Senha</Text>
                <TouchableOpacity
                  onPress={() => setMostrarModalSenha(false)}
                  style={{
                    backgroundColor: colors.surface,
                    width: 36, height: 36, borderRadius: 18,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <IconSymbol name="xmark" size={18} color={colors.foreground} />
                </TouchableOpacity>
              </View>

              {/* Senha Atual */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Senha Atual *</Text>
                <TextInput
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  editable={!alterandoSenha}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Nova Senha */}
              <View className="mb-4">
                <Text className="text-foreground font-semibold mb-2">Nova Senha *</Text>
                <TextInput
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  placeholder="Digite a nova senha (mínimo 4 caracteres)"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  editable={!alterandoSenha}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Confirmar Senha */}
              <View className="mb-6">
                <Text className="text-foreground font-semibold mb-2">Confirmar Senha *</Text>
                <TextInput
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  editable={!alterandoSenha}
                  returnKeyType="done"
                  onSubmitEditing={handleMudarSenha}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                />
              </View>

              {/* Botões */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setMostrarModalSenha(false)}
                  disabled={alterandoSenha}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMudarSenha}
                  disabled={alterandoSenha}
                  style={{
                    flex: 1,
                    backgroundColor: alterandoSenha ? colors.muted : colors.primary,
                    borderRadius: 12,
                    padding: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text className="text-white font-semibold">
                    {alterandoSenha ? 'Alterando...' : 'Alterar Senha'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
