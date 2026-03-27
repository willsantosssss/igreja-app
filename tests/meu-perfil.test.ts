import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("Meu Perfil - Navegacao Corrigida", () => {
  it("deve retornar null quando usuario nao tem cadastro", async () => {
    console.log("\n=== TESTE 1: Usuario sem cadastro ===");
    
    const perfil = await db.getUsuarioCadastrado(99999);
    
    console.log(`✅ Perfil retornado: ${perfil ? "existe" : "null"}`);
    expect(perfil).toBeNull();
  });

  it("deve fazer upsert e retornar dados", async () => {
    console.log("\n=== TESTE 2: Upsert cadastro ===");
    
    await db.upsertUsuarioCadastrado({
      nome: "Joao Silva",
      dataNascimento: "1990-05-15",
      celula: "Celula Teste",
    });
    
    const perfil = await db.getUsuarioCadastrado(99998);
    
    console.log(`✅ Perfil criado: ${perfil?.nome}`);
    expect(perfil).not.toBeNull();
    expect(perfil?.nome).toBe("Joao Silva");
    expect(perfil?.celula).toBe("Celula Teste");
  });

  it("deve fazer upsert novamente para atualizar", async () => {
    console.log("\n=== TESTE 3: Atualizar com upsert ===");
    
    await db.upsertUsuarioCadastrado({
      nome: "Joao Silva Atualizado",
      dataNascimento: "1990-05-15",
      celula: "Celula Nova",
    });
    
    const perfilAtualizado = await db.getUsuarioCadastrado(99998);
    
    console.log(`✅ Perfil atualizado: ${perfilAtualizado?.nome}`);
    expect(perfilAtualizado?.nome).toBe("Joao Silva Atualizado");
    expect(perfilAtualizado?.celula).toBe("Celula Nova");
  });
});
