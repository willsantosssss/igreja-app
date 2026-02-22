import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Event Redirect Fix", () => {
  let eventos: any[] = [];

  beforeAll(async () => {
    // Buscar eventos do banco
    eventos = await db.getEventos();
    console.log("[Test] Eventos no banco:", eventos.length);
    eventos.forEach((e: any) => {
      console.log(`  - ID: ${e.id}, Título: ${e.titulo}`);
    });
  });

  it("deve ter função getEventoById no db.ts", async () => {
    expect(typeof db.getEventoById).toBe("function");
  });

  it("deve buscar evento por ID corretamente", async () => {
    if (eventos.length === 0) {
      console.log("[Test] Pulando teste - nenhum evento no banco");
      return;
    }

    const primeiroEvento = eventos[0];
    const eventoEncontrado = await db.getEventoById(primeiroEvento.id);

    expect(eventoEncontrado).toBeDefined();
    expect(eventoEncontrado?.id).toBe(primeiroEvento.id);
    expect(eventoEncontrado?.titulo).toBe(primeiroEvento.titulo);
  });

  it("deve retornar null para ID inválido", async () => {
    const eventoInvalido = await db.getEventoById(99999);
    expect(eventoInvalido).toBeNull();
  });

  it("deve retornar eventos com dados corretos", async () => {
    if (eventos.length === 0) {
      console.log("[Test] Pulando teste - nenhum evento no banco");
      return;
    }

    eventos.forEach((evento: any) => {
      expect(evento.id).toBeDefined();
      expect(evento.titulo).toBeDefined();
      expect(evento.descricao).toBeDefined();
      expect(evento.data).toBeDefined();
      expect(evento.horario).toBeDefined();
      expect(evento.local).toBeDefined();
      expect(evento.tipo).toBeDefined();
    });
  });

  it("cada evento deve ter um ID único", async () => {
    if (eventos.length === 0) {
      console.log("[Test] Pulando teste - nenhum evento no banco");
      return;
    }

    const ids = eventos.map((e: any) => e.id);
    const idsUnicos = new Set(ids);
    expect(idsUnicos.size).toBe(ids.length);
  });

  it("deve buscar cada evento por seu ID específico", async () => {
    if (eventos.length === 0) {
      console.log("[Test] Pulando teste - nenhum evento no banco");
      return;
    }

    for (const evento of eventos) {
      const encontrado = await db.getEventoById(evento.id);
      expect(encontrado?.id).toBe(evento.id);
      expect(encontrado?.titulo).toBe(evento.titulo);
      console.log(`  ✓ Evento ID ${evento.id} (${evento.titulo}) encontrado corretamente`);
    }
  });
});
