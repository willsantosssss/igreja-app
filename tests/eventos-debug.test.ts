import { describe, it, expect } from "vitest";
import { getEventos } from "@/server/db";

describe("Eventos Debug", () => {
  it("deve listar todos os eventos do banco de dados", async () => {
    const eventos = await getEventos();
    console.log("Eventos no banco:", JSON.stringify(eventos, null, 2));
    expect(eventos).toBeDefined();
  });

  it("deve encontrar evento 'Encontro com Deus Kids'", async () => {
    const eventos = await getEventos();
    const encontro = eventos.find((e: any) => e.titulo?.includes("Encontro"));
    console.log("Encontro encontrado:", encontro);
    if (!encontro) {
      console.log("Evento nao encontrado. Eventos disponiveis:", eventos.map((e: any) => e.titulo));
    }
  });

  it("deve verificar IDs dos eventos", async () => {
    const eventos = await getEventos();
    console.log("IDs dos eventos:", eventos.map((e: any) => ({ id: e.id, titulo: e.titulo })));
    expect(eventos.length).toBeGreaterThan(0);
  });
});
