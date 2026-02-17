import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerCategory = "saude" | "familia" | "trabalho" | "espiritual" | "outros";

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  author: string;
  date: string;
  prayingCount: number;
  isAnswered: boolean;
  testimony?: string;
}

export const categoryLabels: Record<PrayerCategory, string> = {
  saude: "Saúde",
  familia: "Família",
  trabalho: "Trabalho",
  espiritual: "Espiritual",
  outros: "Outros",
};

export const categoryEmojis: Record<PrayerCategory, string> = {
  saude: "🏥",
  familia: "👨‍👩‍👧‍👦",
  trabalho: "💼",
  espiritual: "✨",
  outros: "🙏",
};

// Dados iniciais (seed)
const PEDIDOS_INICIAIS: PrayerRequest[] = [
  {
    id: "1",
    title: "Cura para minha mãe",
    description: "Peço orações pela saúde da minha mãe que está internada. Que Deus a fortaleça e restaure sua saúde.",
    category: "saude",
    author: "Maria S.",
    date: "2026-02-17",
    prayingCount: 45,
    isAnswered: false,
  },
  {
    id: "2",
    title: "Reconciliação familiar",
    description: "Oro pela restauração do relacionamento com meu irmão. Que Deus traga paz e perdão aos nossos corações.",
    category: "familia",
    author: "João P.",
    date: "2026-02-16",
    prayingCount: 32,
    isAnswered: false,
  },
  {
    id: "3",
    title: "Nova oportunidade de emprego",
    description: "Estou desempregado há 3 meses. Peço orações para que Deus abra portas e me guie ao trabalho certo.",
    category: "trabalho",
    author: "Carlos M.",
    date: "2026-02-15",
    prayingCount: 67,
    isAnswered: false,
  },
  {
    id: "4",
    title: "Crescimento espiritual",
    description: "Peço orações para ter mais intimidade com Deus e crescer na fé. Que Ele me ensine a ouvir Sua voz.",
    category: "espiritual",
    author: "Ana L.",
    date: "2026-02-14",
    prayingCount: 28,
    isAnswered: false,
  },
  {
    id: "5",
    title: "Gravidez saudável",
    description: "Estou grávida de 5 meses. Oro por uma gestação tranquila e um bebê saudável. Glória a Deus!",
    category: "saude",
    author: "Paula R.",
    date: "2026-02-13",
    prayingCount: 89,
    isAnswered: false,
  },
  {
    id: "6",
    title: "Testemunho: Emprego conquistado!",
    description: "Louvado seja Deus! Depois de 6 meses desempregado, consegui um excelente emprego. Obrigado pelas orações!",
    category: "trabalho",
    author: "Roberto S.",
    date: "2026-02-12",
    prayingCount: 124,
    isAnswered: true,
    testimony: "Deus é fiel! Recebi uma proposta melhor do que esperava. Toda glória a Ele!",
  },
];

const PEDIDOS_KEY = '@pedidos_oracao';
const PEDIDOS_INICIALIZADOS_KEY = '@pedidos_oracao_init';

// ==================== LEITURA ====================

export async function getPedidosOracao(): Promise<PrayerRequest[]> {
  try {
    const init = await AsyncStorage.getItem(PEDIDOS_INICIALIZADOS_KEY);
    if (!init) {
      await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(PEDIDOS_INICIAIS));
      await AsyncStorage.setItem(PEDIDOS_INICIALIZADOS_KEY, 'true');
      return PEDIDOS_INICIAIS;
    }
    const data = await AsyncStorage.getItem(PEDIDOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return PEDIDOS_INICIAIS;
  }
}

export async function getPedidoById(id: string): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  return todos.find(p => p.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarPedido(dados: Omit<PrayerRequest, 'id' | 'prayingCount' | 'isAnswered'>): Promise<PrayerRequest> {
  const todos = await getPedidosOracao();
  const novo: PrayerRequest = {
    ...dados,
    id: Date.now().toString(),
    prayingCount: 0,
    isAnswered: false,
  };
  todos.push(novo);
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return novo;
}

// ==================== EDIÇÃO ====================

export async function editarPedido(id: string, dados: Partial<PrayerRequest>): Promise<PrayerRequest | null> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return null;
  todos[index] = { ...todos[index], ...dados };
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return todos[index];
}

export async function marcarRespondido(id: string, testimony?: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const index = todos.findIndex(p => p.id === id);
  if (index < 0) return false;
  todos[index].isAnswered = true;
  if (testimony) todos[index].testimony = testimony;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(todos));
  return true;
}

// ==================== REMOÇÃO ====================

export async function removerPedido(id: string): Promise<boolean> {
  const todos = await getPedidosOracao();
  const filtrados = todos.filter(p => p.id !== id);
  if (filtrados.length === todos.length) return false;
  await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(filtrados));
  return true;
}

// Compatibilidade
export const mockPrayerRequests: PrayerRequest[] = PEDIDOS_INICIAIS;
