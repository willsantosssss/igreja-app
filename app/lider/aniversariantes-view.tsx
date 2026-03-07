import { ScrollView, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';

export default function AniversariantesViewScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Buscar dados do banco
  const { data: membrosDB = [] } = trpc.usuarios.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (lider && membrosDB.length > 0) {
      const mesAtual = new Date().getMonth() + 1;
      const membrosDaCelula = membrosDB.filter((m: any) => m.celula === lider.celula);
      const aniversariantesDoCelula = membrosDaCelula.filter((m: any) => {
        if (!m.dataNascimento) return false;
        const dataNasc = new Date(m.dataNascimento);
        return dataNasc.getMonth() + 1 === mesAtual;
      });
      setAniversariantes(aniversariantesDoCelula);
    }
  }, [lider, membrosDB]);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregando(false);
  };

  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const mesAtual = meses[new Date().getMonth() + 1];

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const renderAniversariante = ({ item }: { item: any }) => {
    const dataNasc = new Date(item.dataNascimento);
    const dia = dataNasc.getDate();
    const mes = dataNasc.toLocaleString('pt-BR', { month: 'long' });

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.warning + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '700' }}>
            🎂
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{item.nome}</Text>
          <Text className="text-xs text-muted">
            {dia} de {mes}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Aniversariantes</Text>
            <Text className="text-sm text-muted">Mês de {mesAtual}</Text>
          </View>
          <BackButton />
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.warning + '10',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.warning + '20',
          }}
        >
          <Text className="text-sm font-semibold text-foreground">
            Total de aniversariantes: {aniversariantes.length}
          </Text>
        </View>

        {/* Lista de Aniversariantes */}
        {aniversariantes.length > 0 ? (
          <FlatList
            data={aniversariantes}
            renderItem={renderAniversariante}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-muted text-center">Nenhum aniversariante em {mesAtual}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
