import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Celula {
  id: string;
  name: string;
  leader: {
    name: string;
    phone: string;
  };
  schedule: {
    day: string;
    time: string;
  };
  address: {
    street: string;
    neighborhood: string;
    city: string;
  };
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Dados iniciais (seed)
const CELULAS_INICIAIS: Celula[] = [
  {
    id: "1",
    name: "Célula Vida Nova",
    leader: { name: "João Silva", phone: "+55 66 98765-4321" },
    schedule: { day: "Terça-feira", time: "19:30" },
    address: { street: "Rua das Flores, 123", neighborhood: "Centro", city: "Rondonópolis - MT" },
    description: "Célula focada em jovens e adultos, com estudos bíblicos profundos e momentos de comunhão.",
  },
  {
    id: "2",
    name: "Célula Esperança",
    leader: { name: "Maria Santos", phone: "+55 66 99876-5432" },
    schedule: { day: "Quinta-feira", time: "20:00" },
    address: { street: "Av. Brasil, 456", neighborhood: "Vila Aurora", city: "Rondonópolis - MT" },
    description: "Célula acolhedora para famílias, com atividades para crianças e adultos.",
  },
  {
    id: "3",
    name: "Célula Fé e Graça",
    leader: { name: "Pedro Oliveira", phone: "+55 66 97654-3210" },
    schedule: { day: "Sexta-feira", time: "19:00" },
    address: { street: "Rua da Paz, 789", neighborhood: "Jardim Tropical", city: "Rondonópolis - MT" },
    description: "Célula voltada para jovens profissionais, com foco em crescimento espiritual.",
  },
  {
    id: "4",
    name: "Célula Amor Perfeito",
    leader: { name: "Ana Costa", phone: "+55 66 96543-2109" },
    schedule: { day: "Quarta-feira", time: "20:30" },
    address: { street: "Rua do Amor, 321", neighborhood: "Vila Operária", city: "Rondonópolis - MT" },
    description: "Célula para casais, com estudos sobre relacionamentos à luz da Bíblia.",
  },
  {
    id: "5",
    name: "Célula Renovo",
    leader: { name: "Carlos Mendes", phone: "+55 66 95432-1098" },
    schedule: { day: "Sábado", time: "18:00" },
    address: { street: "Rua Nova Vida, 654", neighborhood: "Parque Sagrada Família", city: "Rondonópolis - MT" },
    description: "Célula com foco em restauração e cura interior, aberta a todos que buscam renovação espiritual.",
  },
];

const CELULAS_KEY = '@celulas_igreja';
const CELULAS_INIT_KEY = '@celulas_init';

// ==================== LEITURA ====================

export async function getCelulas(): Promise<Celula[]> {
  try {
    const init = await AsyncStorage.getItem(CELULAS_INIT_KEY);
    if (!init) {
      await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(CELULAS_INICIAIS));
      await AsyncStorage.setItem(CELULAS_INIT_KEY, 'true');
      return CELULAS_INICIAIS;
    }
    const data = await AsyncStorage.getItem(CELULAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return CELULAS_INICIAIS;
  }
}

export async function getCelulaById(id: string): Promise<Celula | null> {
  const todas = await getCelulas();
  return todas.find(c => c.id === id) || null;
}

// ==================== CRIAÇÃO ====================

export async function criarCelula(dados: Omit<Celula, 'id'>): Promise<Celula> {
  const todas = await getCelulas();
  const nova: Celula = { ...dados, id: Date.now().toString() };
  todas.push(nova);
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
  return nova;
}

// ==================== EDIÇÃO ====================

export async function editarCelula(id: string, dados: Partial<Omit<Celula, 'id'>>): Promise<Celula | null> {
  const todas = await getCelulas();
  const index = todas.findIndex(c => c.id === id);
  if (index < 0) return null;

  // Merge profundo para objetos aninhados
  const atual = todas[index];
  todas[index] = {
    ...atual,
    ...dados,
    leader: { ...atual.leader, ...(dados.leader || {}) },
    schedule: { ...atual.schedule, ...(dados.schedule || {}) },
    address: { ...atual.address, ...(dados.address || {}) },
  };
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
  return todas[index];
}

// ==================== REMOÇÃO ====================

export async function removerCelula(id: string): Promise<boolean> {
  const todas = await getCelulas();
  const filtradas = todas.filter(c => c.id !== id);
  if (filtradas.length === todas.length) return false;
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(filtradas));
  return true;
}

// ==================== COORDENADAS ====================

export async function updateCelulaCoordinates(
  id: string,
  coordinates: { latitude: number; longitude: number }
): Promise<boolean> {
  const todas = await getCelulas();
  const index = todas.findIndex(c => c.id === id);
  if (index < 0) return false;

  todas[index].coordinates = coordinates;
  await AsyncStorage.setItem(CELULAS_KEY, JSON.stringify(todas));
  return true;
}

// Compatibilidade
export const mockCelulas: Celula[] = CELULAS_INICIAIS;
