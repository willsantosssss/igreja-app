import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';
import { obterSessaoLider } from '@/lib/data/lideres';
import {
  obterConfigLembrete,
  agendarLembreteSemanal,
  cancelarLembrete,
  verificarLembreteAgendado,
  DIAS_SEMANA,
  formatarHorario,
  type LembreteConfig,
} from '@/lib/services/lembrete-lider';

export default function LembreteScreen() {
  const colors = useColors();
  const router = useRouter();
  const [config, setConfig] = useState<LembreteConfig>({
    ativo: true,
    diaSemana: 7,
    hora: 18,
    minuto: 0,
  });
  const [agendado, setAgendado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    const configSalva = await obterConfigLembrete();
    setConfig(configSalva);
    const status = await verificarLembreteAgendado();
    setAgendado(status);
    setCarregando(false);
  };

  const handleToggle = async (valor: boolean) => {
    const novaConfig = { ...config, ativo: valor };
    setConfig(novaConfig);

    if (!valor) {
      await cancelarLembrete();
      setAgendado(false);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleDiaSemana = (dia: number) => {
    setConfig(prev => ({ ...prev, diaSemana: dia }));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleHora = (delta: number) => {
    setConfig(prev => {
      let novaHora = prev.hora + delta;
      if (novaHora < 0) novaHora = 23;
      if (novaHora > 23) novaHora = 0;
      return { ...prev, hora: novaHora };
    });
  };

  const handleMinuto = (delta: number) => {
    setConfig(prev => {
      let novoMinuto = prev.minuto + delta;
      if (novoMinuto < 0) novoMinuto = 45;
      if (novoMinuto > 45) novoMinuto = 0;
      return { ...prev, minuto: novoMinuto };
    });
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const sessao = await obterSessaoLider();
      if (!sessao) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        router.back();
        return;
      }

      if (config.ativo) {
        const sucesso = await agendarLembreteSemanal(sessao.nome, sessao.celula, config);
        if (sucesso) {
          setAgendado(true);
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          Alert.alert(
            'Lembrete Configurado',
            `Você receberá um lembrete toda ${DIAS_SEMANA.find(d => d.valor === config.diaSemana)?.nome} às ${formatarHorario(config.hora, config.minuto)}.`,
          );
        } else {
          Alert.alert(
            'Permissão Necessária',
            'Para receber lembretes, permita notificações nas configurações do seu dispositivo.',
          );
        }
      } else {
        await cancelarLembrete();
        setAgendado(false);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert('Lembrete Desativado', 'Você não receberá mais lembretes semanais.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
    } finally {
      setSalvando(false);
    }
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Lembrete Semanal</Text>
            <Text className="text-muted text-sm">
              Receba um lembrete para preencher o relatório
            </Text>
          </View>
        </View>

        {/* Status */}
        <View
          className="rounded-2xl p-4 flex-row items-center justify-between"
          style={{
            backgroundColor: agendado ? colors.success + '10' : colors.muted + '10',
            borderWidth: 1,
            borderColor: agendado ? colors.success + '20' : colors.border,
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <IconSymbol
              name={agendado ? 'bell.fill' : 'bell.slash.fill'}
              size={24}
              color={agendado ? colors.success : colors.muted}
            />
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-sm">
                {agendado ? 'Lembrete Ativo' : 'Lembrete Inativo'}
              </Text>
              <Text className="text-muted text-xs">
                {agendado
                  ? `${DIAS_SEMANA.find(d => d.valor === config.diaSemana)?.nome} às ${formatarHorario(config.hora, config.minuto)}`
                  : 'Nenhum lembrete agendado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Ativar/Desativar */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-base">Ativar Lembrete</Text>
              <Text className="text-muted text-xs mt-1">
                Receba uma notificação semanal para preencher o relatório da célula
              </Text>
            </View>
            <Switch
              value={config.ativo}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={config.ativo ? colors.primary : colors.muted}
            />
          </View>
        </View>

        {/* Configurações (apenas se ativo) */}
        {config.ativo && (
          <>
            {/* Dia da Semana */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-foreground font-semibold text-base">Dia do Lembrete</Text>
              <Text className="text-muted text-xs">
                Escolha o dia da semana para receber o lembrete
              </Text>
              <View className="flex-row flex-wrap gap-2 mt-1">
                {DIAS_SEMANA.map((dia) => (
                  <TouchableOpacity
                    key={dia.valor}
                    onPress={() => handleDiaSemana(dia.valor)}
                    style={{
                      backgroundColor: config.diaSemana === dia.valor ? colors.primary : colors.background,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: config.diaSemana === dia.valor ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: config.diaSemana === dia.valor ? '#fff' : colors.foreground,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {dia.nome.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Horário */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <Text className="text-foreground font-semibold text-base">Horário</Text>
              <Text className="text-muted text-xs">
                Defina o horário do lembrete
              </Text>
              <View className="flex-row items-center justify-center gap-4 mt-2">
                {/* Hora */}
                <View className="items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleHora(1)}
                    style={{
                      backgroundColor: colors.primary + '15',
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 2,
                      borderColor: colors.primary,
                      borderRadius: 12,
                      width: 64,
                      height: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: '800' }}>
                      {String(config.hora).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleHora(-1)}
                    style={{
                      backgroundColor: colors.primary + '15',
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>−</Text>
                  </TouchableOpacity>
                  <Text className="text-muted text-xs">Hora</Text>
                </View>

                <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: '800' }}>:</Text>

                {/* Minuto */}
                <View className="items-center gap-2">
                  <TouchableOpacity
                    onPress={() => handleMinuto(15)}
                    style={{
                      backgroundColor: colors.primary + '15',
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 2,
                      borderColor: colors.primary,
                      borderRadius: 12,
                      width: 64,
                      height: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: '800' }}>
                      {String(config.minuto).padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleMinuto(-15)}
                    style={{
                      backgroundColor: colors.primary + '15',
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>−</Text>
                  </TouchableOpacity>
                  <Text className="text-muted text-xs">Minuto</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleSalvar}
          disabled={salvando}
          style={{
            backgroundColor: salvando ? colors.muted : colors.primary,
            borderRadius: 24,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
            {salvando ? 'Salvando...' : 'Salvar Configuração'}
          </Text>
        </TouchableOpacity>

        {/* Aviso Web */}
        {Platform.OS === 'web' && (
          <View
            className="rounded-xl p-3"
            style={{ backgroundColor: colors.warning + '10', borderWidth: 1, borderColor: colors.warning + '20' }}
          >
            <Text style={{ color: colors.warning, fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
              Notificações locais não são suportadas na versão web.
              Use o app no celular para receber lembretes.
            </Text>
          </View>
        )}

        {/* Info */}
        <View
          className="rounded-xl p-4"
          style={{ backgroundColor: colors.primary + '08', borderWidth: 1, borderColor: colors.primary + '15' }}
        >
          <Text className="text-xs text-muted leading-relaxed">
            O lembrete é uma notificação local no seu dispositivo. Não requer internet para funcionar.
            Certifique-se de que as notificações do app estão permitidas nas configurações do seu celular.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
