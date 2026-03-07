import { ScrollView, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { BackButton } from '@/components/back-button';
import { trpc } from '@/lib/trpc';
import { obterSessaoLider } from '@/lib/data/lideres';
import { useState, useEffect } from 'react';

export default function MembrosViewScreen() {
  const colors = useColors();
  const [lider, setLider] = useState<any>(null);
  const [membros, setMembros] = useState<any[]>([]);
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
      const membrosDaCelula = membrosDB.filter((m: any) => m.celula === lider.celula);
      setMembros(membrosDaCelula);
    }
  }, [lider, membrosDB]);

  const carregarDados = async () => {
    const sessao = await obterSessaoLider();
    if (sessao) {
      setLider(sessao);
    }
    setCarregando(false);
  };

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const renderMembro = ({ item }: { item: any }) => (
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
          {item.nome.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-semibold">{item.nome}</Text>
        <Text className="text-xs text-muted">
          {item.dataNascimento ? new Date(item.dataNascimento).toLocaleDateString('pt-BR') : 'Data não informada'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Membros</Text>
            <Text className="text-sm text-muted">Célula: {lider?.celula}</Text>
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
            Total de membros: {membros.length}
          </Text>
        </View>

        {/* Lista de Membros */}
        {membros.length > 0 ? (
          <FlatList
            data={membros}
            renderItem={renderMembro}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-muted text-center">Nenhum membro cadastrado nesta célula</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
