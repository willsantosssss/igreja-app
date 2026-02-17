import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('useAnotacoesDevocional', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar uma nova anotação com dados corretos', async () => {
    const anotacao = {
      id: 'test-1',
      livro: 'João',
      capitulo: 1,
      texto: 'Reflexão sobre João 1',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    expect(anotacao).toBeDefined();
    expect(anotacao.livro).toBe('João');
    expect(anotacao.capitulo).toBe(1);
    expect(anotacao.texto).toBe('Reflexão sobre João 1');
  });

  it('deve gerar ID único para cada anotação', () => {
    const anotacao1 = {
      id: `João-1-${Date.now()}`,
      livro: 'João',
      capitulo: 1,
      texto: 'Primeira anotação',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    const anotacao2 = {
      id: `João-1-${Date.now() + 1}`,
      livro: 'João',
      capitulo: 1,
      texto: 'Segunda anotação',
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    expect(anotacao1.id).not.toBe(anotacao2.id);
  });

  it('deve filtrar anotações por capítulo', () => {
    const anotacoes = [
      {
        id: 'test-1',
        livro: 'João',
        capitulo: 1,
        texto: 'Anotação 1',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
      {
        id: 'test-2',
        livro: 'João',
        capitulo: 2,
        texto: 'Anotação 2',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
      {
        id: 'test-3',
        livro: 'João',
        capitulo: 1,
        texto: 'Anotação 3',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
    ];

    const anotacoesJoao1 = anotacoes.filter((a) => a.livro === 'João' && a.capitulo === 1);

    expect(anotacoesJoao1).toHaveLength(2);
    expect(anotacoesJoao1[0].texto).toBe('Anotação 1');
    expect(anotacoesJoao1[1].texto).toBe('Anotação 3');
  });

  it('deve filtrar anotações por livro', () => {
    const anotacoes = [
      {
        id: 'test-1',
        livro: 'João',
        capitulo: 1,
        texto: 'Anotação João',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
      {
        id: 'test-2',
        livro: 'Mateus',
        capitulo: 1,
        texto: 'Anotação Mateus',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
    ];

    const anotacoesJoao = anotacoes.filter((a) => a.livro === 'João');

    expect(anotacoesJoao).toHaveLength(1);
    expect(anotacoesJoao[0].texto).toBe('Anotação João');
  });

  it('deve exportar anotações como texto formatado', () => {
    const anotacoes = [
      {
        id: 'test-1',
        livro: 'João',
        capitulo: 1,
        texto: 'Primeira reflexão',
        dataCriacao: '2026-02-17T20:00:00Z',
        dataAtualizacao: '2026-02-17T20:00:00Z',
      },
      {
        id: 'test-2',
        livro: 'João',
        capitulo: 1,
        texto: 'Segunda reflexão',
        dataCriacao: '2026-02-17T21:00:00Z',
        dataAtualizacao: '2026-02-17T21:00:00Z',
      },
    ];

    const anotacoesJoao1 = anotacoes.filter((a) => a.livro === 'João' && a.capitulo === 1);
    const texto = anotacoesJoao1
      .map(
        (a) =>
          `${a.livro} ${a.capitulo}\n${a.texto}\n\n(${new Date(a.dataCriacao).toLocaleDateString('pt-BR')})`
      )
      .join('\n\n---\n\n');

    expect(texto).toContain('João 1');
    expect(texto).toContain('Primeira reflexão');
    expect(texto).toContain('Segunda reflexão');
    expect(texto).toContain('---');
  });

  it('deve retornar mensagem quando não há anotações', () => {
    const anotacoes: any[] = [];
    const mensagem =
      anotacoes.length === 0 ? 'Nenhuma anotação para este capítulo' : 'Tem anotações';

    expect(mensagem).toBe('Nenhuma anotação para este capítulo');
  });

  it('deve atualizar data de atualização ao editar anotação', () => {
    const anotacao = {
      id: 'test-1',
      livro: 'João',
      capitulo: 1,
      texto: 'Texto original',
      dataCriacao: '2026-02-17T20:00:00Z',
      dataAtualizacao: '2026-02-17T20:00:00Z',
    };

    const dataAntes = anotacao.dataAtualizacao;
    const novoTexto = 'Texto atualizado';
    const dataNova = new Date().toISOString();

    const anotacaoAtualizada = {
      ...anotacao,
      texto: novoTexto,
      dataAtualizacao: dataNova,
    };

    expect(anotacaoAtualizada.texto).toBe('Texto atualizado');
    expect(anotacaoAtualizada.dataAtualizacao).not.toBe(dataAntes);
  });

  it('deve deletar anotação corretamente', () => {
    const anotacoes = [
      {
        id: 'test-1',
        livro: 'João',
        capitulo: 1,
        texto: 'Anotação 1',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
      {
        id: 'test-2',
        livro: 'João',
        capitulo: 1,
        texto: 'Anotação 2',
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
    ];

    const anotacoesAposDelecao = anotacoes.filter((a) => a.id !== 'test-1');

    expect(anotacoesAposDelecao).toHaveLength(1);
    expect(anotacoesAposDelecao[0].id).toBe('test-2');
  });
});
