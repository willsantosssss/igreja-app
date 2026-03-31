import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInscricoesPorCelula } from './inscricoes-eventos';

// Tipos
export interface LiderCelula {
  id: string;
  nome: string;
  celula: string;
  senha: string;
  criadoEm: string;
}

export interface RelatorioCelula {
  id: string;
  celulaId: string;
  celulaNome: string;
  liderNome: string;
  data: string;
  totalPessoas: number;
  visitantes: number;
  criadoEm: string;
}

export interface MembroCelula {
  nome: string;
  dataNascimento: string;
  celula: string;
  inscritoBatismo: boolean;
  inscritoEventos: string[];
}

// Chaves de armazenamento
const LIDERES_KEY = '@lideres_celulas';
const RELATORIOS_KEY = '@relatorios_celulas';
const LIDER_LOGADO_KEY = '@lider_logado';

// ==================== LÍDERES ====================

export async function getLideres(): Promise<LiderCelula[]> {
  try {
    const data = await AsyncStorage.getItem(LIDERES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function adicionarLider(lider: Omit<LiderCelula, 'id' | 'criadoEm'>): Promise<LiderCelula> {
  const lideres = await getLideres();
  const novoLider: LiderCelula = {
    ...lider,
    id: Date.now().toString(),
    criadoEm: new Date().toISOString(),
  };
  lideres.push(novoLider);
  await AsyncStorage.setItem(LIDERES_KEY, JSON.stringify(lideres));
  return novoLider;
}

export async function removerLider(id: string): Promise<void> {
  const lideres = await getLideres();
  const filtrados = lideres.filter(l => l.id !== id);
  await AsyncStorage.setItem(LIDERES_KEY, JSON.stringify(filtrados));
}

export async function atualizarSenhaLider(id: string, novaSenha: string): Promise<void> {
  const lideres = await getLideres();
  const index = lideres.findIndex(l => l.id === id);
  if (index >= 0) {
    lideres[index].senha = novaSenha;
    await AsyncStorage.setItem(LIDERES_KEY, JSON.stringify(lideres));
  }
}

export async function autenticarLider(senha: string): Promise<LiderCelula | null> {
  const lideres = await getLideres();
  return lideres.find(l => l.senha === senha) || null;
}

// ==================== SESSÃO DO LÍDER ====================

export async function salvarSessaoLider(lider: LiderCelula): Promise<void> {
  await AsyncStorage.setItem(LIDER_LOGADO_KEY, JSON.stringify(lider));
}

export async function obterSessaoLider(): Promise<LiderCelula | null> {
  try {
    const data = await AsyncStorage.getItem(LIDER_LOGADO_KEY);
    if (!data) return null;
    
    const lider = JSON.parse(data) as LiderCelula;
    
    // Se o ID for uma string timestamp do AsyncStorage antigo, buscar do banco
    if (typeof lider.id === 'string' && lider.id.length > 10) {
      // Buscar lider real do banco via API
      try {
        const response = await fetch('/api/trpc/lideres.list');
        if (response.ok) {
          const result = await response.json();
          const lideresBanco = result.result?.data || [];
          const liderBanco = lideresBanco.find((l: any) => l.celula === lider.celula);
          
          if (liderBanco) {
            // Atualizar sessão com ID real do banco
            const liderAtualizado = { ...lider, id: String(liderBanco.id) };
            await AsyncStorage.setItem(LIDER_LOGADO_KEY, JSON.stringify(liderAtualizado));
            return liderAtualizado;
          }
        }
      } catch (error) {
        console.warn('[Lider] Erro ao buscar lider do banco:', error);
      }
    }
    
    return lider;
  } catch (error) {
    console.error('[Lider] Erro ao obter sessão:', error);
    return null;
  }
}

export async function encerrarSessaoLider(): Promise<void> {
  await AsyncStorage.removeItem(LIDER_LOGADO_KEY);
  // Também limpar localStorage para web
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(LIDER_LOGADO_KEY);
  }
}

// ==================== RELATÓRIOS ====================

export async function getRelatorios(celulaNome?: string): Promise<RelatorioCelula[]> {
  try {
    const data = await AsyncStorage.getItem(RELATORIOS_KEY);
    const relatorios: RelatorioCelula[] = data ? JSON.parse(data) : [];
    if (celulaNome) {
      return relatorios.filter(r => r.celulaNome === celulaNome);
    }
    return relatorios;
  } catch {
    return [];
  }
}

export async function adicionarRelatorio(relatorio: Omit<RelatorioCelula, 'id' | 'criadoEm'>): Promise<RelatorioCelula> {
  const relatorios = await getRelatorios();
  const novoRelatorio: RelatorioCelula = {
    ...relatorio,
    id: Date.now().toString(),
    criadoEm: new Date().toISOString(),
  };
  relatorios.push(novoRelatorio);
  await AsyncStorage.setItem(RELATORIOS_KEY, JSON.stringify(relatorios));
  return novoRelatorio;
}

export async function removerRelatorio(id: string): Promise<void> {
  const relatorios = await getRelatorios();
  const filtrados = relatorios.filter(r => r.id !== id);
  await AsyncStorage.setItem(RELATORIOS_KEY, JSON.stringify(filtrados));
}

// ==================== MEMBROS DA CÉLULA ====================

export async function getMembrosDaCelula(celulaNome: string): Promise<MembroCelula[]> {
  try {
    // Buscar todos os usuários cadastrados
    const usersData = await AsyncStorage.getItem('@registered_users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    // Filtrar membros da célula
    const membros = users.filter((u: any) => u.celula === celulaNome);
    
    // Buscar inscrições de batismo
    const batismoData = await AsyncStorage.getItem('@batismo_inscricoes');
    const batismos = batismoData ? JSON.parse(batismoData) : [];
    
    // Buscar inscrições de eventos
    const eventosData = await AsyncStorage.getItem('@evento_inscricoes');
    const eventos = eventosData ? JSON.parse(eventosData) : [];
    
    return membros.map((m: any) => ({
      nome: m.nome || m.name || 'Sem nome',
      dataNascimento: m.dataNascimento || m.birthDate || '',
      celula: m.celula || celulaNome,
      inscritoBatismo: batismos.some((b: any) => 
        b.nome === (m.nome || m.name) || b.nomeCompleto === (m.nome || m.name)
      ),
      inscritoEventos: eventos
        .filter((e: any) => e.nome === (m.nome || m.name) || e.nomeCompleto === (m.nome || m.name))
        .map((e: any) => e.evento || e.eventoNome || 'Evento'),
    }));
  } catch {
    return [];
  }
}

// ==================== ANIVERSARIANTES DA CÉLULA ====================

export function getAniversariantesDaCelula(membros: MembroCelula[], mes?: number): MembroCelula[] {
  const mesAtual = mes ?? new Date().getMonth() + 1;
  
  return membros.filter(m => {
    if (!m.dataNascimento) return false;
    try {
      const parts = m.dataNascimento.split(/[\/\-]/);
      let mesMembro: number;
      
      // Tenta formato DD/MM/YYYY ou DD-MM-YYYY
      if (parts.length >= 2) {
        mesMembro = parseInt(parts[1], 10);
      } else {
        return false;
      }
      
      return mesMembro === mesAtual;
    } catch {
      return false;
    }
  });
}

// ==================== ESTATÍSTICAS ====================

export async function getEstatisticasCelula(celulaNome: string): Promise<{
  totalMembros: number;
  aniversariantesMes: number;
  inscritosEventos: number;
  totalRelatorios: number;
  mediaPresenca: number;
  mediaVisitantes: number;
}> {
  const membros = await getMembrosDaCelula(celulaNome);
  const aniversariantes = getAniversariantesDaCelula(membros);
  const relatorios = await getRelatorios(celulaNome);
  
  const inscricoes = await getInscricoesPorCelula(celulaNome);
  const inscritosEventos = inscricoes.length;
  
  const mediaPresenca = relatorios.length > 0
    ? Math.round(relatorios.reduce((acc, r) => acc + r.totalPessoas, 0) / relatorios.length)
    : 0;
    
  const mediaVisitantes = relatorios.length > 0
    ? Math.round(relatorios.reduce((acc, r) => acc + r.visitantes, 0) / relatorios.length)
    : 0;
  
  return {
    totalMembros: membros.length,
    aniversariantesMes: aniversariantes.length,
    inscritosEventos,
    totalRelatorios: relatorios.length,
    mediaPresenca,
    mediaVisitantes,
  };
}
