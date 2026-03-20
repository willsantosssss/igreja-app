import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { obterSessaoLider } from '@/lib/data/lideres';
import { getInscricoesPorCelula } from '@/lib/data/inscricoes-eventos';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

interface Inscricao {
  eventoId: string;
  eventoTitulo: string;
  eventoData: string;
  nomeCompleto: string;
  celula: string;
  telefone: string;
}

export default function LiderInscritosEventosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [inscritos, setInscritos] = useState<Inscricao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [celulaNome, setCelulaNome] = useState('');

  useEffect(() => {
    carregarInscritos();
  }, []);

  const carregarInscritos = async () => {
    try {
      const sessao = await obterSessaoLider();
      if (sessao) {
        setCelulaNome(sessao.celula);
        const lista = await getInscricoesPorCelula(sessao.celula);
        setInscritos(lista);
      }
    } catch (err) {
      console.error('Erro ao carregar inscritos:', err);
    } finally {
      setCarregando(false);
    }
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]}`;
  };

  const agruparPorEvento = () => {
    const agrupado: Record<string, Inscricao[]> = {};
    inscritos.forEach((inscricao) => {
      if (!agrupado[inscricao.eventoTitulo]) {
        agrupado[inscricao.eventoTitulo] = [];
      }
      agrupado[inscricao.eventoTitulo].push(inscricao);
    });
    return agrupado;
  };

  const exportarParaExcel = async () => {
    try {
      setCarregando(true);
      
      // Criar CSV com BOM (Byte Order Mark) para UTF-8 e separador ponto-e-vírgula
      const BOM = '\uFEFF';
      let csv = BOM + "Nome;Célula;Evento;Data\n";
      
      inscritos.forEach((inscricao) => {
        // Escapar aspas duplas e usar ponto-e-vírgula como separador
        const nome = inscricao.nomeCompleto.replace(/"/g, '""');
        const celula = inscricao.celula.replace(/"/g, '""');
        const evento = inscricao.eventoTitulo.replace(/"/g, '""');
        const data = formatarData(inscricao.eventoData);
        csv += `"${nome}";"${celula}";"${evento}";"${data}"\n`;
      });
      
      // Salvar arquivo
      const fileName = `inscritos_eventos_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Compartilhar arquivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: "Exportar Inscritos em Eventos",
        });
      } else {
        alert("Compartilhamento não disponível neste dispositivo");
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar dados");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-surface"
          >
            <Text className="text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Inscritos em Eventos</Text>
            <Text className="text-sm text-muted">Célula: {celulaNome}</Text>
          </View>
        </View>

        {carregando ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : inscritos.length === 0 ? (
          <View className="items-center justify-center py-10 gap-2">
            <Text className="text-2xl">📋</Text>
            <Text className="text-muted text-center">Nenhum membro da célula inscrito em eventos especiais</Text>
          </View>
        ) : (
          <>
            {/* Botão de Exportar */}
            <TouchableOpacity
              className="bg-primary rounded-lg py-3 px-4 flex-row items-center justify-center gap-2"
              onPress={exportarParaExcel}
              disabled={carregando}
            >
              <Text className="text-white font-semibold">📊 Exportar para Excel</Text>
            </TouchableOpacity>

            {/* Lista de Inscritos por Evento */}
            {Object.entries(agruparPorEvento()).map(([evento, membros]) => (
              <View key={evento} className="bg-surface rounded-2xl p-4 border border-border gap-3">
                <View className="gap-1">
                  <Text className="text-lg font-bold text-foreground">{evento}</Text>
                  <Text className="text-sm text-muted">{membros.length} membro(s) inscrito(s)</Text>
                </View>

                <View className="gap-2 pt-2 border-t border-border">
                  {membros.map((inscricao, idx) => (
                    <View key={idx} className="bg-background rounded-xl p-3 gap-1">
                      <Text className="text-base font-semibold text-foreground">{inscricao.nomeCompleto}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-muted">📅 {formatarData(inscricao.eventoData)}</Text>
                        {inscricao.telefone && (
                          <Text className="text-xs text-muted">📞 {inscricao.telefone}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
