import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { router } from 'expo-router';
import { useDevocionaiProgressivo } from '@/hooks/use-devocional-progressivo';
import { Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { type AvisoImportante } from '@/lib/data/aviso-importante';
import { trpc } from '@/lib/trpc';


interface Usuario {
  nome: string;
  dataNascimento: string;
  celula: string;
}

interface ProximoEvento {
  nome: string;
  data: string;
  hora: string;
  local: string;
}

interface AvisoState {
  titulo: string;
  mensagem: string;
  ativo: boolean;
}

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [aniversariantesHoje, setAniversariantesHoje] = useState<Usuario[]>([]);
  const [proximoEvento, setProximoEvento] = useState<ProximoEvento | null>(null);
  const [aviso, setAviso] = useState<AvisoState>({
    titulo: "Aviso Importante",
    mensagem: "Inscrições abertas para o retiro espiritual de março! Vagas limitadas.",
    ativo: true,
  });

  const { data: avisoData, dataUpdatedAt } = trpc.avisoImportante.get.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });


  const { capitulo, loading, carregarCapituloDoDia } = useDevocionaiProgressivo('NAA');

  const mesAtual = new Date().getMonth() + 1;
  const { data: aniversariantesData } = trpc.usuarios.getAniversariantes.useQuery(mesAtual as any, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    carregarCapituloDoDia();
  }, []);

  useEffect(() => {
    carregarAniversariantes();
  }, [aniversariantesData]);

  const carregarAniversariantes = () => {
    if (aniversariantesData) {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const mesHoje = hoje.getMonth() + 1;

      const aniversariantes = (aniversariantesData as any[]).filter((user) => {
        // Suportar ambos formatos: YYYY-MM-DD e DD/MM/YYYY
        let dia, mes;
        if ((user.dataNascimento as string).includes("-")) {
          const [ano, m, d] = (user.dataNascimento as string).split("-");
          dia = parseInt(d);
          mes = parseInt(m);
        } else {
          const [d, m] = (user.dataNascimento as string).split("/");
          dia = parseInt(d);
          mes = parseInt(m);
        }
        return dia === diaHoje && mes === mesHoje;
      });
      setAniversariantesHoje(aniversariantes as Usuario[]);
    }
  };

  const { data: eventosData } = trpc.eventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (eventosData && eventosData.length > 0) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Filtrar eventos futuros e ordenar por data
      const eventosFuturos = (eventosData as any[])
        .filter((e: any) => {
          const dataEvento = new Date(e.data);
          dataEvento.setHours(0, 0, 0, 0);
          return dataEvento >= hoje;
        })
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime());

      if (eventosFuturos.length > 0) {
        const evento = eventosFuturos[0];
        const data = new Date(evento.data as string);
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const diaSemana = diasSemana[data.getDay()];
        
        setProximoEvento({
          nome: evento.titulo as string,
          data: `${diaSemana}, ${data.getDate()}/${data.getMonth() + 1}`,
          hora: evento.horario as string,
          local: evento.local as string
        });
      } else {
        setProximoEvento(null);
      }
    }
  }, [eventosData]);

  useEffect(() => {
    if (avisoData) {
      setAviso({
        titulo: (avisoData as any)?.titulo || "Aviso Importante",
        mensagem: (avisoData as any)?.mensagem || "",
        ativo: (avisoData as any)?.ativo ?? true,
      });
    }
  }, [avisoData]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarCapituloDoDia();
    carregarAniversariantes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScreenContainer>
      <ScrollView 
        contentContainerStyle={{ padding: 20, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header com saudação */}
        <View className="gap-2">
          <Text className="text-4xl font-bold text-foreground">Bem-vindo!</Text>
          <Text className="text-base text-muted leading-relaxed">
            Uma igreja em células, que vive o amor de Cristo e cumpre a grande comissão com paixão e persistência.
          </Text>
        </View>

        {/* Card de Devocional do Dia */}
        <View className="bg-primary rounded-2xl p-6 gap-3">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="book.fill" size={24} color="#FFFFFF" />
            <Text className="text-lg font-semibold text-white">Devocional do Dia</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : capitulo ? (
            <>
              <Text className="text-sm text-white opacity-90" numberOfLines={2}>
                "{capitulo.versos[0]?.texto}"
              </Text>
              <Text className="text-xs text-white opacity-75">{capitulo.livro} {capitulo.numero}:{capitulo.versos[0]?.numero}</Text>
            </>
          ) : (
            <Text className="text-sm text-white opacity-90">Carregando devocional...</Text>
          )}
          <TouchableOpacity 
            className="bg-white rounded-full px-4 py-2 self-start mt-2"
            onPress={() => router.push("/devocional")}
            style={{ opacity: 0.95 }}
          >
            <Text className="text-primary font-semibold text-sm">Ler capítulo</Text>
          </TouchableOpacity>
        </View>

        {/* Card de Próximo Evento */}
        <View className="bg-surface rounded-2xl p-6 gap-3 border border-border">
          <View className="flex-row items-center gap-2">
            <IconSymbol name="calendar" size={24} color={colors.primary} />
            <Text className="text-lg font-semibold text-foreground">Próximo Evento</Text>
          </View>
          {proximoEvento ? (
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">{proximoEvento.nome}</Text>
              <Text className="text-sm text-muted">{proximoEvento.data}, {proximoEvento.hora}</Text>
              <Text className="text-sm text-muted">📍 {proximoEvento.local}</Text>
            </View>
          ) : (
            <View className="gap-1">
              <Text className="text-base font-semibold text-foreground">Nenhum evento próximo</Text>
              <Text className="text-sm text-muted">Confira a agenda para mais detalhes</Text>
            </View>
          )}
          <TouchableOpacity 
            className="border-2 rounded-full px-4 py-2 self-start mt-2"
            style={{ borderColor: colors.primary }}
            onPress={() => router.push("/agenda")}
          >
            <Text className="font-semibold text-sm" style={{ color: colors.primary }}>Ver agenda</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Acesso Rápido — 4 itens */}
        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">Acesso Rápido</Text>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/celulas")}
            >
              <IconSymbol name="map.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Células</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/oracao")}
            >
              <IconSymbol name="hands.sparkles.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Oração</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/contribuicoes" as any)}
            >
              <IconSymbol name="heart.fill" size={32} color={colors.secondary} />
              <Text className="text-sm font-semibold text-foreground text-center">Contribuir</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-surface rounded-2xl p-5 items-center gap-3 border border-border"
              onPress={() => router.push("/noticias" as any)}
            >
              <IconSymbol name="newspaper.fill" size={32} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground text-center">Notícias</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avisos Importantes */}
        {aviso.ativo && (
          <View className="bg-warning/10 rounded-2xl p-5 gap-2 border border-warning/20">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">📢</Text>
              <Text className="text-base font-semibold text-foreground">{aviso.titulo}</Text>
            </View>
            <Text className="text-sm text-foreground">
              {aviso.mensagem}
            </Text>
          </View>
        )}

        {/* Aniversariantes do Dia */}
        <View className="bg-surface rounded-2xl p-5 gap-3 border border-border">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">🎂</Text>
            <Text className="text-base font-bold text-foreground">Aniversariantes do Dia</Text>
          </View>

          {aniversariantesHoje.length > 0 ? (
            <View className="gap-2">
              {aniversariantesHoje.map((user, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-3 bg-background rounded-xl p-3 border border-border"
                >
                  <View
                    className="w-10 h-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.primary + '15' }}
                  >
                    <Text className="text-lg">🎉</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{user.nome}</Text>
                    <Text className="text-xs text-muted">{user.celula || 'Sem célula'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted">
              Nenhum aniversariante hoje. Confira os próximos na aba Mais.
            </Text>
          )}
        </View>

        {/* Redes Sociais */}
        <View className="bg-surface rounded-2xl p-5 gap-4 border border-border">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">📱</Text>
            <Text className="text-base font-bold text-foreground">Acesse nossas redes sociais</Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-4 items-center justify-center bg-white"
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openURL('https://www.instagram.com/2ieqroo/');
              }}
            >
              <Image
                source={require('@/assets/images/instagram-icon.png')}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl py-4 items-center justify-center bg-white"
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openURL('https://www.youtube.com/@2ieqroo');
              }}
            >
              <Image
                source={require('@/assets/images/youtube-icon.png')}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
