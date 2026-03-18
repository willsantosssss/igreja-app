import { describe, it, expect, beforeAll } from "vitest";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";

describe("Upload de Documentos", () => {
  let client: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(() => {
    client = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
          transformer: superjson,
        }),
      ],
    });
  });

  it("deve fazer upload de um documento com sucesso", async () => {
    const resultado = await client.documentoslideres.create.mutate({
      titulo: "Teste de Upload",
      descricao: "Arquivo de teste",
      nomeArquivo: "teste.txt",
      arquivoBase64: "VGVzdGUgZGUgYXJxdWl2byBkZSB0ZXN0ZQ==",
      tipo: "arquivo",
      ativo: 1,
    });

    expect(resultado).toBeDefined();
    expect(resultado.id).toBeGreaterThan(0);
    expect(resultado.titulo).toBe("Teste de Upload");
    expect(resultado.nomeArquivo).toBe("teste.txt");
  });

  it("deve listar documentos", async () => {
    const documentos = await client.documentoslideres.list.query();
    expect(Array.isArray(documentos)).toBe(true);
  });
});
