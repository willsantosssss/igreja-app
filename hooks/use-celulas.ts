import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export function useCelulas() {
  const { data: celulas = [], isLoading, refetch } = trpc.celulas.list.useQuery();

  return {
    celulas,
    isLoading,
    refetch,
  };
}

export function useCelulaById(id: number) {
  const { data: celula, isLoading } = trpc.celulas.getById.useQuery(id);

  return {
    celula,
    isLoading,
  };
}

export function useCreateCelula() {
  const mutation = trpc.celulas.create.useMutation();
  return mutation;
}

export function useUpdateCelula() {
  const mutation = trpc.celulas.update.useMutation();
  return mutation;
}

export function useDeleteCelula() {
  const mutation = trpc.celulas.delete.useMutation();
  return mutation;
}
