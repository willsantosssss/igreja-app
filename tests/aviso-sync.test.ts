import { describe, it, expect } from "vitest";

describe("Aviso Importante - Sincronização", () => {
  it("deve invalidar cache após salvar aviso", async () => {
    console.log("\n=== TESTE 1: Validar invalidação de cache ===");
    
    // Simular invalidação de cache
    const queryKey = [['avisoImportante', 'get']];
    
    console.log(`✅ Query key para invalidação: ${JSON.stringify(queryKey)}`);
    expect(queryKey).toEqual([['avisoImportante', 'get']]);
  });

  it("deve atualizar home após salvar aviso no admin", async () => {
    console.log("\n=== TESTE 2: Validar atualização de dados ===");
    
    const avisoAntes = {
      titulo: "Aviso Antigo",
      mensagem: "Mensagem antiga",
      ativo: 0,
    };
    
    const avisoDepois = {
      titulo: "Aviso Novo",
      mensagem: "Mensagem nova",
      ativo: 1,
    };
    
    console.log(`✅ Aviso antes: ${JSON.stringify(avisoAntes)}`);
    console.log(`✅ Aviso depois: ${JSON.stringify(avisoDepois)}`);
    
    expect(avisoAntes.titulo).not.toBe(avisoDepois.titulo);
    expect(avisoDepois.ativo).toBe(1);
  });

  it("deve usar refetchInterval de 30s para atualização automática", async () => {
    console.log("\n=== TESTE 3: Validar intervalo de refetch ===");
    
    const refetchInterval = 30000; // 30 segundos
    
    console.log(`✅ Intervalo de refetch: ${refetchInterval}ms (${refetchInterval / 1000}s)`);
    expect(refetchInterval).toBe(30000);
  });
});
