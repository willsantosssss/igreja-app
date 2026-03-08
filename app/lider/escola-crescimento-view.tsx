import { ScrollView, Text, View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';

export default function EscolaCrescimentoViewScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [inscritos, setInscritos] = useState<any[]>([]);
  const [filtroSelecionado, setFiltroSelecionado] = useState<string>('Todos');
  const [carregando, setCarregando] = useState(true);

  // Buscar dados do banco
  const { data: inscritosDB = [] } = trpc.escolaCrescimento.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (lider && inscritosDB.length > 0) {
      const inscritorsDaCelula = inscritosDB.filter((i: any) => i.celula === lider.celula);
      
      if (filtroSelecionado === 'Todos') {
        setInscritos(inscritorsDaCelula);
      } else {
        setInscritos(inscritorsDaCelula.filter((i: any) => i.curso === filtroSelecionado));
      }
    }
  }, [lider, inscritosDB, filtroSelecionado]);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregando(false);
  };

  const cursos = ['Todos', 'Conecte', 'Lidere 1', 'Lidere 2', 'Avance'];

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const renderInscrito = ({ item }: { item: any }) => {
    const statusColor = item.status === 'confirmado' ? colors.success : colors.error;
    const statusTexto = item.status === 'confirmado' ? 'Confirmado' : 'Cancelado';

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
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
            📚
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-semibold">{item.nome}</Text>
          <View className="flex-row gap-2 mt-1">
            <Text className="text-xs text-muted">{item.curso}</Text>
            <Text style={{ color: statusColor }} className="text-xs font-semibold">
              {statusTexto}
            </Text>
          </View>
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
            <Text className="text-2xl font-bold text-foreground">Escola de Crescimento</Text>
            <Text className="text-sm text-muted">Inscritos da célula</Text>
          </View>
          <BackButton />
        </View>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.primary + '10',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.primary + '20',
          }}
        >
          <Text className="text-sm font-semibold text-foreground">
            Total de inscritos: {inscritos.length}
          </Text>
        </View>

        {/* Filtro de Cursos */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Filtrar por curso:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {cursos.map((curso) => (
              <Pressable
                key={curso}
                onPress={() => setFiltroSelecionado(curso)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      filtroSelecionado === curso
                        ? colors.primary
                        : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      filtroSelecionado === curso
                        ? colors.primary
                        : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={{
                    color:
                      filtroSelecionado === curso
                        ? '#fff'
                        : colors.foreground,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {curso}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Lista de Inscritos */}
        {inscritos.length > 0 ? (
          <FlatList
            data={inscritos}
            renderItem={renderInscrito}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-muted text-center">
              Nenhum inscrito em {filtroSelecionado === 'Todos' ? 'Escola de Crescimento' : filtroSelecionado}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
