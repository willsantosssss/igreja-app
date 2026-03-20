import { trpc } from '@/lib/trpc';

export interface Celula {
  id: string;
  name: string;
  leader: { name: string; phone: string };
  schedule: { day: string; time: string };
  address: { street: string; neighborhood: string; city: string };
  description: string;
  latitude?: string;
  longitude?: string;
}

/**
 * Busca todas as células do banco de dados via tRPC
 * Sincroniza automaticamente com o backend
 */
export async function getCelulas(): Promise<Celula[]> {
  try {
    // Nota: Esta função é async mas tRPC queries são síncronas
    // Para uso em componentes, use o hook useQuery diretamente
    // Para uso em funções async, use fetch direto na API
    const response = await fetch('/api/trpc/celulas.list');
    if (!response.ok) {
      console.error('Erro ao buscar células:', response.statusText);
      return [];
    }
    const data = await response.json();
    return data.result?.data || [];
  } catch (error) {
    console.error('Erro ao buscar células:', error);
    return [];
  }
}

/**
 * Busca uma célula específica por ID
 */
export async function getCelulaById(id: number): Promise<Celula | null> {
  try {
    const response = await fetch(`/api/trpc/celulas.getById?input=${id}`);
    if (!response.ok) {
      console.error('Erro ao buscar célula:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data.result?.data || null;
  } catch (error) {
    console.error('Erro ao buscar célula:', error);
    return null;
  }
}

/**
 * Hook para usar em componentes React
 * Busca células do banco com refetch automático
 */
export function useCelulas() {
  return trpc.celulas.list.useQuery();
}

/**
 * Hook para buscar célula específica
 */
export function useCelulaById(id: number) {
  return trpc.celulas.getById.useQuery(id);
}

/**
 * Criar nova célula
 */
export function useCreateCelula() {
  return trpc.celulas.create.useMutation();
}

/**
 * Editar célula existente
 */
export function useUpdateCelula() {
  return trpc.celulas.update.useMutation();
}

/**
 * Remover célula
 */
export function useDeleteCelula() {
  return trpc.celulas.delete.useMutation();
}

// Para compatibilidade com código legado
export const mockCelulas: Celula[] = [];
