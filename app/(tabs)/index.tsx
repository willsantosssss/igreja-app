import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Linking } from "react-native";
import { trpc } from "@/lib/trpc";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useDevocionaiProgressivo } from "@/hooks/use-devocional-progressivo";

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

type CardProps = {
  title: string;
  description: string;
  icon: string;
  image: number;
  onPress: () => void;
};

const logo2IEQ = require("@/assets/images/logo-2ieq.png");
const imageDevocional = require("@/assets/images/home-card-devocional.jpg");
const imageEventos = require("@/assets/images/home-card-eventos.jpg");
const imageCelulas = require("@/assets/images/home-card-celulas.jpg");
const imageOracao = require("@/assets/images/home-card-oracao.jpg");
const imageNoticias = require("@/assets/images/home-card-noticias.jpg");
const imageAniversariantes = require("@/assets/images/home-card-aniversariantes.jpg");

function VisualCard({ title, description, icon, image, onPress }: CardProps) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.card}>
      <Image source={image} style={styles.cardBackground} resizeMode="cover" />
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{icon}</Text>
          </View>
          <View style={styles.cardTextBlock}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {description}
            </Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [aniversariantesHoje, setAniversariantesHoje] = useState<Usuario[]>([]);
  const [proximoEvento, setProximoEvento] = useState<ProximoEvento | null>(null);
  const { capitulo, loading, carregarCapituloDoDia } = useDevocionaiProgressivo("NAA");

  const mesAtual = new Date().getMonth() + 1;
  const { data: aniversariantesData } = trpc.usuarios.getAniversariantes.useQuery(mesAtual as any, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
  const { data: eventosData } = trpc.eventos.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const carregarAniversariantes = () => {
    if (!aniversariantesData) return;
    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;
    const aniversariantes = (aniversariantesData as any[]).filter((user) => {
      const data = user.dataNascimento as string;
      if (data.includes("-")) {
        const [, mes, dia] = data.split("-");
        return Number(dia) === diaHoje && Number(mes) === mesHoje;
      }
      const [dia, mes] = data.split("/");
      return Number(dia) === diaHoje && Number(mes) === mesHoje;
    });
    setAniversariantesHoje(aniversariantes as Usuario[]);
  };

  useEffect(() => {
    carregarCapituloDoDia();
  }, []);

  useEffect(() => {
    carregarAniversariantes();
  }, [aniversariantesData]);

  useEffect(() => {
    if (!eventosData?.length) {
      setProximoEvento(null);
      return;
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const eventosFuturos = (eventosData as any[])
      .filter((evento) => {
        const data = new Date((evento.data as string).includes("T") ? evento.data : `${evento.data}T00:00:00`);
        data.setHours(0, 0, 0, 0);
        return data >= hoje;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    const evento = eventosFuturos[0];
    if (!evento) {
      setProximoEvento(null);
      return;
    }
    const data = new Date((evento.data as string).includes("T") ? evento.data : `${evento.data}T00:00:00`);
    const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    setProximoEvento({
      nome: evento.titulo as string,
      data: `${diasSemana[data.getDay()]}, ${data.getDate()}/${data.getMonth() + 1}`,
      hora: evento.horario as string,
      local: evento.local as string,
    });
  }, [eventosData]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarCapituloDoDia();
    carregarAniversariantes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const devotionalDescription = useMemo(() => {
    if (loading) return "Carregando o capítulo do dia...";
    if (!capitulo) return "Separe um tempo para sua leitura e reflexão.";
    return `${capitulo.livro} ${capitulo.numero} · ${capitulo.versos[0]?.texto ?? "Leia o capítulo do dia."}`;
  }, [capitulo, loading]);

  const eventDescription = proximoEvento
    ? `${proximoEvento.data}, ${proximoEvento.hora} · ${proximoEvento.local}`
    : "Confira a agenda para ver os próximos eventos.";

  const birthdayDescription = aniversariantesHoje.length
    ? aniversariantesHoje.map((user) => `${user.nome}${user.celula ? ` · ${user.celula}` : ""}`).join("\n")
    : "Nenhum aniversariante hoje. Confira os próximos na aba Mais.";

  return (
    <ScreenContainer containerClassName="bg-black" safeAreaClassName="bg-black">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Image source={logo2IEQ} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerActions}>
            <Text style={styles.headerIcon}>⌕</Text>
            <Text style={styles.headerIcon}>◉</Text>
          </View>
        </View>

        <Text style={styles.greeting}>Olá,</Text>
        <Text style={styles.heading}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Juntos na fé, conectados em Cristo.</Text>

        <VisualCard
          title="Devocional do Dia"
          description={devotionalDescription}
          icon="▤"
          image={imageDevocional}
          onPress={() => router.push("/devocional")}
        />
        <VisualCard
          title="Próximo Evento"
          description={eventDescription}
          icon="◷"
          image={imageEventos}
          onPress={() => router.push("/agenda")}
        />
        <VisualCard
          title="Notícias"
          description="Fique por dentro do que está acontecendo na igreja."
          icon="▤"
          image={imageNoticias}
          onPress={() => router.push("/noticias" as any)}
        />
        <VisualCard
          title="Células"
          description="Encontre sua célula e viva a comunhão."
          icon="⌖"
          image={imageCelulas}
          onPress={() => router.push("/celulas")}
        />
        <VisualCard
          title="Aniversariantes"
          description={birthdayDescription}
          icon="♧"
          image={imageAniversariantes}
          onPress={() => router.push("/aniversariantes" as any)}
        />
        <VisualCard
          title="Oração"
          description="Compartilhe, ore e seja parte dessa corrente."
          icon="♧"
          image={imageOracao}
          onPress={() => router.push("/oracao")}
        />
        <VisualCard
          title="Contribuir"
          description="Apoie a missão e os projetos da igreja."
          icon="♡"
          image={imageDevocional}
          onPress={() => router.push("/contribuicoes" as any)}
        />

        <Text style={styles.socialTitle}>Redes sociais</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} onPress={() => Linking.openURL("https://www.instagram.com/2ieqroo/")}>
            <Image source={require("@/assets/images/instagram-icon.png")} style={styles.socialIcon} resizeMode="contain" />
            <Text style={styles.socialLabel}>Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={() => Linking.openURL("https://www.youtube.com/@2ieqroo")}>
            <Image source={require("@/assets/images/youtube-icon.png")} style={styles.socialIcon} resizeMode="contain" />
            <Text style={styles.socialLabel}>YouTube</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerIcon: {
    color: "#27E2B4",
    fontSize: 22,
  },
  greeting: {
    color: "#9AAA A6".replace(" ", ""),
    fontSize: 14,
    marginBottom: 4,
  },
  heading: {
    color: "#F2F8F6",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#A6B9B5",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 22,
  },
  card: {
    height: 124,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(90, 180, 160, 0.18)",
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 26, 25, 0.12)",
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    zIndex: 2,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(28, 207, 166, 0.24)",
    borderWidth: 1,
    borderColor: "rgba(52, 233, 190, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIconText: {
    color: "#27E2B4",
    fontSize: 21,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 22,
  },
  cardTitle: {
    color: "#F1F7F5",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 1,
    marginBottom: 5,
  },
  cardDescription: {
    color: "#BDCECA",
    fontSize: 12,
    lineHeight: 17,
  },
  cardArrow: {
    position: "absolute",
    right: 15,
    top: 43,
    color: "#27E2B4",
    fontSize: 31,
    fontWeight: "300",
  },
  socialTitle: {
    color: "#9FC0BB",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 7,
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 54,
    borderRadius: 13,
    backgroundColor: "#EFF6F3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  socialLabel: {
    color: "#152526",
    fontSize: 12,
    fontWeight: "800",
  },
});
