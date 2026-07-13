// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export interface Recado {
  id: number;
  titulo: string;
  conteudo: string;
  criado_em: string;
  atualizado_em: string;
  ativo: number;
}

export function useRecados() {
  return trpc.recados.list.useQuery();
}

export function useRecadoById(id: number | null) {
  return useQuery({
    queryKey: ["recado", id],
    queryFn: async () => {
      if (!id) return null;
      return await trpc.recados.getById.query(id);
    },
    enabled: !!id,
  });
}
