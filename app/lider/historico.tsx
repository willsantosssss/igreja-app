import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  obterSessaoLider, getRelatorios, removerRelatorio,
  type RelatorioCelula,
} from '@/lib/data/lideres';

export default function HistoricoScreen() {
  const colors = useColors();
  const router = useRouter();
  const [relatorios, setRelatorios] = useState<RelatorioCelula[]>([]);
  const [celulaNome, setCelulaNome] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarRelatorios();
  }, []);

  const carregarRelatorios = async () => {
    const sessao = await obterSessaoLider();
    if (!sessao) {
      router.back();
      return;
    }
    setCelulaNome(sessao.celula);
    const dados = await getRelatorios(sessao.celula);
    setRelatorios(dados.sort((a, b) =>
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    ));
    setCarregando(false);
  };

  const handleRemover = (relatorio: RelatorioCelula) => {
    Alert.alert(
      'Remover Relatório',
      `Deseja remover o relatório de ${relatorio.data}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerRelatorio(relatorio.id);
            await carregarRelatorios();
          },
        },
      ]
    );
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

  // Calcular totais
  const totalPresenca = relatorios.reduce((acc, r) => acc + r.totalPessoas, 0);
  const totalVisitantes = relatorios.reduce((acc, r) => acc + r.visitantes, 0);
  const mediaPresenca = relatorios.length > 0 ? Math.round(totalPresenca / relatorios.length) : 0;
  const mediaVisitantes = relatorios.length > 0 ? Math.round(totalVisitantes / relatorios.length) : 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Histórico</Text>
            <Text className="text-muted text-sm">Célula: {celulaNome}</Text>
          </View>
        </View>

        {/* Resumo Geral */}
        {relatorios.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
            <Text className="text-foreground font-bold mb-3">Resumo Geral</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted text-sm">Total de relatórios:</Text>
              <Text className="text-foreground font-bold">{relatorios.length}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted text-sm">Média de presença:</Text>
              <Text className="text-foreground font-bold">{mediaPresenca} pessoas</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted text-sm">Média de visitantes:</Text>
              <Text className="text-foreground font-bold">{mediaVisitantes} visitantes</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted text-sm">Total de visitantes:</Text>
              <Text style={{ color: colors.success, fontWeight: '700' }}>{totalVisitantes}</Text>
            </View>
          </View>
        )}

        {/* Lista de Relatórios */}
        {relatorios.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <IconSymbol name="doc.text.fill" size={40} color={colors.muted} />
            <Text className="text-muted text-center mt-3">
              Nenhum relatório enviado ainda
            </Text>
          </View>
        ) : (
          relatorios.map((r, i) => (
            <View
              key={i}
              className="bg-surface rounded-xl p-4 border border-border mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-foreground font-bold text-base">{r.data}</Text>
                <TouchableOpacity
                  onPress={() => handleRemover(r)}
                  style={{ padding: 4 }}
                >
                  <Text style={{ color: colors.error, fontSize: 12 }}>Remover</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-row items-center">
                  <View
                    style={{
                      backgroundColor: colors.primary + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                      {r.totalPessoas} pessoas
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View
                    style={{
                      backgroundColor: colors.success + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                      {r.visitantes} visitante{r.visitantes !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-muted text-xs mt-2">
                Enviado por: {r.liderNome}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
