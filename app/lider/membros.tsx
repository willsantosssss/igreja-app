import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  obterSessaoLider, getMembrosDaCelula, getAniversariantesDaCelula,
  type MembroCelula,
} from '@/lib/data/lideres';
import { getInscricoesPorCelula, type InscricaoEvento } from '@/lib/data/inscricoes-eventos';

export default function MembrosScreen() {
  const colors = useColors();
  const router = useRouter();
  const [membros, setMembros] = useState<MembroCelula[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'aniversariantes' | 'batismo' | 'eventos'>('todos');
  const [inscricoesEventos, setInscricoesEventos] = useState<InscricaoEvento[]>([]);
  const [celulaNome, setCelulaNome] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarMembros();
  }, []);

  const carregarMembros = async () => {
    const sessao = await obterSessaoLider();
    if (!sessao) {
      router.back();
      return;
    }
    setCelulaNome(sessao.celula);
    const dados = await getMembrosDaCelula(sessao.celula);
    setMembros(dados);
    const insc = await getInscricoesPorCelula(sessao.celula);
    setInscricoesEventos(insc);
    setCarregando(false);
  };

  const membrosFiltrados = () => {
    switch (filtro) {
      case 'aniversariantes':
        return getAniversariantesDaCelula(membros);
      case 'batismo':
        return membros.filter(m => m.inscritoBatismo);
      case 'eventos':
        const nomesInscritos = new Set(inscricoesEventos.map(i => i.nomeCompleto.toLowerCase()));
        return membros.filter(m => nomesInscritos.has(m.nome.toLowerCase()));
      default:
        return membros;
    }
  };

  const formatarData = (data: string) => {
    if (!data) return 'Não informado';
    const parts = data.split(/[\/\-]/);
    if (parts.length >= 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return data;
  };

  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  if (carregando) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-base">Carregando membros...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const lista = membrosFiltrados();

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">Membros</Text>
            <Text className="text-muted text-sm">Célula: {celulaNome}</Text>
          </View>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {[
            { key: 'todos' as const, label: `Todos (${membros.length})` },
            { key: 'aniversariantes' as const, label: `Anivers. ${meses[new Date().getMonth() + 1]}` },
            { key: 'batismo' as const, label: 'Inscritos Batismo' },
            { key: 'eventos' as const, label: `Inscritos Eventos (${inscricoesEventos.length})` },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFiltro(f.key)}
              style={{
                backgroundColor: filtro === f.key ? colors.primary : colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: filtro === f.key ? colors.primary : colors.border,
              }}
            >
              <Text style={{
                color: filtro === f.key ? '#fff' : colors.foreground,
                fontWeight: '600',
                fontSize: 13,
              }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de Membros */}
        {lista.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center">
            <IconSymbol name="person.2.fill" size={40} color={colors.muted} />
            <Text className="text-muted text-center mt-3">
              {filtro === 'todos'
                ? 'Nenhum membro cadastrado nesta célula'
                : filtro === 'aniversariantes'
                ? 'Nenhum aniversariante neste mês'
                : 'Nenhum membro inscrito para batismo'}
            </Text>
          </View>
        ) : (
          lista.map((membro, i) => (
            <View
              key={i}
              className="bg-surface rounded-xl p-4 border border-border mb-3"
            >
              <View className="flex-row items-center mb-2">
                <View
                  style={{
                    backgroundColor: colors.primary + '20',
                    width: 44, height: 44, borderRadius: 22,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                    {membro.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">{membro.nome}</Text>
                  <Text className="text-muted text-xs">
                    Nascimento: {formatarData(membro.dataNascimento)}
                  </Text>
                </View>
              </View>

              {/* Badges */}
              <View className="flex-row flex-wrap gap-2 mt-1">
                {membro.inscritoBatismo && (
                  <View
                    style={{
                      backgroundColor: colors.primary + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                      💧 Inscrito Batismo
                    </Text>
                  </View>
                )}
                {membro.inscritoEventos.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.success + '15',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
                      📅 {membro.inscritoEventos.length} evento{membro.inscritoEventos.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {(() => {
                  const aniv = getAniversariantesDaCelula([membro]);
                  if (aniv.length > 0) {
                    return (
                      <View
                        style={{
                          backgroundColor: colors.warning + '15',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>
                          🎂 Anivers. este mês
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>

              {/* Eventos inscritos */}
              {membro.inscritoEventos.length > 0 && (
                <View className="mt-2 ml-14">
                  <Text className="text-muted text-xs mb-1">Eventos inscritos:</Text>
                  {membro.inscritoEventos.map((evento, j) => (
                    <Text key={j} className="text-foreground text-xs">• {evento}</Text>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
