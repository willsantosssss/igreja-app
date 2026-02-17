import { trpc } from "@/lib/trpc";

// ============ CELULAS ============

export function useCelulas() {
  const { data: celulas = [], isLoading, refetch } = trpc.celulas.list.useQuery();
  return { celulas, isLoading, refetch };
}

export function useCelulaById(id: number) {
  const { data: celula, isLoading } = trpc.celulas.getById.useQuery(id);
  return { celula, isLoading };
}

export function useCreateCelula() {
  return trpc.celulas.create.useMutation();
}

export function useUpdateCelula() {
  return trpc.celulas.update.useMutation();
}

export function useDeleteCelula() {
  return trpc.celulas.delete.useMutation();
}

// ============ BATISMO ============

export function useInscricoesBatismo() {
  const { data: inscricoes = [], isLoading, refetch } = trpc.batismo.list.useQuery();
  return { inscricoes, isLoading, refetch };
}

export function useInscricoesBatismoPendentes() {
  const { data: pendentes = [], isLoading, refetch } = trpc.batismo.listPendentes.useQuery();
  return { pendentes, isLoading, refetch };
}

export function useCreateInscricaoBatismo() {
  return trpc.batismo.create.useMutation();
}

export function useUpdateStatusBatismo() {
  return trpc.batismo.updateStatus.useMutation();
}

export function useDeleteInscricaoBatismo() {
  return trpc.batismo.delete.useMutation();
}

// ============ USUARIOS CADASTRADOS ============

export function useUsuariosCadastrados() {
  const { data: usuarios = [], isLoading, refetch } = trpc.usuarios.list.useQuery();
  return { usuarios, isLoading, refetch };
}

export function useUsuarioCadastradoByUserId() {
  const { data: usuario, isLoading } = trpc.usuarios.getByUserId.useQuery();
  return { usuario, isLoading };
}

export function useAniversariantes(mes: number) {
  const { data: aniversariantes = [], isLoading } = trpc.usuarios.getAniversariantes.useQuery(mes);
  return { aniversariantes, isLoading };
}

export function useMembrosPorCelula(celula: string) {
  const { data: membros = [], isLoading } = trpc.usuarios.getMembrosPorCelula.useQuery(celula);
  return { membros, isLoading };
}

export function useCreateUsuarioCadastrado() {
  return trpc.usuarios.create.useMutation();
}

export function useUpdateUsuarioCadastrado() {
  return trpc.usuarios.update.useMutation();
}

// ============ PEDIDOS DE ORACAO ============

export function usePedidosOracao() {
  const { data: pedidos = [], isLoading, refetch } = trpc.oracao.list.useQuery();
  return { pedidos, isLoading, refetch };
}

export function usePedidoOracaoById(id: number) {
  const { data: pedido, isLoading } = trpc.oracao.getById.useQuery(id);
  return { pedido, isLoading };
}

export function useCreatePedidoOracao() {
  return trpc.oracao.create.useMutation();
}

export function useIncrementarContadorOracao() {
  return trpc.oracao.incrementarContador.useMutation();
}

export function useUpdatePedidoOracao() {
  return trpc.oracao.update.useMutation();
}

export function useDeletePedidoOracao() {
  return trpc.oracao.delete.useMutation();
}
