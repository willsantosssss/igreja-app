import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  buscarCapituloAPI,
  getNovoTestamento,
  limparCacheBiblia,
  getEstatisticasCache,
  CapituloTexto,
} from "./bible-api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    getAllKeys: vi.fn(),
    multiRemove: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("Bible API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getNovoTestamento", () => {
    it("deve retornar 260 capítulos do Novo Testamento", () => {
      const capitulos = getNovoTestamento();
      expect(capitulos).toHaveLength(260);
    });

    it("deve começar com Mateus 1", () => {
      const capitulos = getNovoTestamento();
      expect(capitulos[0]).toBe("Mateus 1");
    });

    it("deve terminar com Apocalipse 22", () => {
      const capitulos = getNovoTestamento();
      expect(capitulos[259]).toBe("Apocalipse 22");
    });

    it("deve incluir todos os 4 evangelhos", () => {
      const capitulos = getNovoTestamento();
      const temMateus = capitulos.some(c => c.startsWith("Mateus"));
      const temMarcos = capitulos.some(c => c.startsWith("Marcos"));
      const temLucas = capitulos.some(c => c.startsWith("Lucas"));
      const temJoao = capitulos.some(c => c.startsWith("João"));

      expect(temMateus).toBe(true);
      expect(temMarcos).toBe(true);
      expect(temLucas).toBe(true);
      expect(temJoao).toBe(true);
    });
  });

  describe("buscarCapituloAPI", () => {
    it("deve buscar capítulo da API e cachear resultado", async () => {
      const mockResponse: CapituloTexto = {
        livro: "Lucas",
        capitulo: 4,
        versao: "NAA",
        texto: "Texto do capítulo Lucas 4",
        referencia: "Lucas 4",
      };

      (AsyncStorage.getItem as any).mockResolvedValueOnce(null);
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          verses: [{ text: "Texto do capítulo Lucas 4" }],
        }),
      });
      (AsyncStorage.setItem as any).mockResolvedValueOnce(undefined);

      const resultado = await buscarCapituloAPI("Lucas", 4, "NAA");

      expect(resultado).toBeDefined();
      expect(resultado?.livro).toBe("Lucas");
      expect(resultado?.capitulo).toBe(4);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("deve retornar dados do cache se disponível", async () => {
      const mockCached: CapituloTexto = {
        livro: "Mateus",
        capitulo: 1,
        versao: "NAA",
        texto: "Texto em cache",
        referencia: "Mateus 1",
      };

      (AsyncStorage.getItem as any).mockResolvedValueOnce(
        JSON.stringify(mockCached)
      );

      const resultado = await buscarCapituloAPI("Mateus", 1, "NAA");

      expect(resultado).toEqual(mockCached);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("deve retornar null se API falhar", async () => {
      (AsyncStorage.getItem as any).mockResolvedValueOnce(null);
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const resultado = await buscarCapituloAPI("Livro", 1, "NAA");

      expect(resultado).toBeNull();
    });
  });

  describe("limparCacheBiblia", () => {
    it("deve limpar todos os itens do cache de bíblia", async () => {
      (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([
        "@biblia_Mateus_1_NAA",
        "@biblia_Lucas_4_NAA",
        "@outro_item",
      ]);
      (AsyncStorage.multiRemove as any).mockResolvedValueOnce(undefined);

      await limparCacheBiblia();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "@biblia_Mateus_1_NAA",
        "@biblia_Lucas_4_NAA",
      ]);
    });
  });

  describe("getEstatisticasCache", () => {
    it("deve retornar estatísticas corretas do cache", async () => {
      (AsyncStorage.getAllKeys as any).mockResolvedValueOnce([
        "@biblia_Mateus_1_NAA",
        "@biblia_Lucas_4_NAA",
      ]);
      (AsyncStorage.getItem as any)
        .mockResolvedValueOnce('{"size": 1000}')
        .mockResolvedValueOnce('{"size": 2000}');

      const stats = await getEstatisticasCache();

      expect(stats.totalCapitulos).toBe(260);
      expect(stats.capitulosEmCache).toBe(2);
      expect(stats.tamanhoCache).toContain("KB");
    });

    it("deve retornar valores padrão se houver erro", async () => {
      (AsyncStorage.getAllKeys as any).mockRejectedValueOnce(
        new Error("Erro")
      );

      const stats = await getEstatisticasCache();

      expect(stats.totalCapitulos).toBe(260);
      expect(stats.capitulosEmCache).toBe(0);
      expect(stats.tamanhoCache).toBe("0 KB");
    });
  });
});
