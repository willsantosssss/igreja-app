import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

import {
  getLideres,
  adicionarLider,
  removerLider,
  atualizarSenhaLider,
  autenticarLider,
  salvarSessaoLider,
  obterSessaoLider,
  encerrarSessaoLider,
  getRelatorios,
  adicionarRelatorio,
  removerRelatorio,
  getMembrosDaCelula,
  getAniversariantesDaCelula,
  getEstatisticasCelula,
  type LiderCelula,
  type MembroCelula,
} from '../lib/data/lideres';

beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
});

describe('Módulo de Líderes de Células', () => {
  describe('CRUD de Líderes', () => {
    it('deve retornar lista vazia quando não há líderes', async () => {
      const lideres = await getLideres();
      expect(lideres).toEqual([]);
    });

    it('deve adicionar um novo líder', async () => {
      const lider = await adicionarLider({
        nome: 'João Silva',
        celula: 'Vida Nova',
        senha: 'lider123',
      });

      expect(lider.nome).toBe('João Silva');
      expect(lider.celula).toBe('Vida Nova');
      expect(lider.senha).toBe('lider123');
      expect(lider.id).toBeDefined();
      expect(lider.criadoEm).toBeDefined();

      const lideres = await getLideres();
      expect(lideres).toHaveLength(1);
    });

    it('deve remover um líder', async () => {
      const lider = await adicionarLider({
        nome: 'Maria Santos',
        celula: 'Esperança',
        senha: 'maria456',
      });

      await removerLider(lider.id);
      const lideres = await getLideres();
      expect(lideres).toHaveLength(0);
    });

    it('deve atualizar a senha de um líder', async () => {
      const lider = await adicionarLider({
        nome: 'Pedro Costa',
        celula: 'Fé e Graça',
        senha: 'antiga123',
      });

      await atualizarSenhaLider(lider.id, 'nova456');
      const lideres = await getLideres();
      expect(lideres[0].senha).toBe('nova456');
    });
  });

  describe('Autenticação', () => {
    it('deve autenticar com senha correta', async () => {
      await adicionarLider({
        nome: 'Ana Oliveira',
        celula: 'Renovo',
        senha: 'ana2024',
      });

      const resultado = await autenticarLider('ana2024');
      expect(resultado).not.toBeNull();
      expect(resultado?.nome).toBe('Ana Oliveira');
      expect(resultado?.celula).toBe('Renovo');
    });

    it('deve rejeitar senha incorreta', async () => {
      await adicionarLider({
        nome: 'Ana Oliveira',
        celula: 'Renovo',
        senha: 'ana2024',
      });

      const resultado = await autenticarLider('senhaerrada');
      expect(resultado).toBeNull();
    });
  });

  describe('Sessão do Líder', () => {
    it('deve salvar e recuperar sessão', async () => {
      const lider: LiderCelula = {
        id: '123',
        nome: 'Carlos Lima',
        celula: 'Amor Perfeito',
        senha: 'carlos123',
        criadoEm: new Date().toISOString(),
      };

      await salvarSessaoLider(lider);
      const sessao = await obterSessaoLider();
      expect(sessao).not.toBeNull();
      expect(sessao?.nome).toBe('Carlos Lima');
    });

    it('deve encerrar sessão', async () => {
      const lider: LiderCelula = {
        id: '123',
        nome: 'Carlos Lima',
        celula: 'Amor Perfeito',
        senha: 'carlos123',
        criadoEm: new Date().toISOString(),
      };

      await salvarSessaoLider(lider);
      await encerrarSessaoLider();
      const sessao = await obterSessaoLider();
      expect(sessao).toBeNull();
    });
  });

  describe('Relatórios de Célula', () => {
    it('deve adicionar um relatório', async () => {
      const relatorio = await adicionarRelatorio({
        celulaId: '1',
        celulaNome: 'Vida Nova',
        liderNome: 'João Silva',
        data: '17/02/2026',
        totalPessoas: 15,
        visitantes: 3,
      });

      expect(relatorio.totalPessoas).toBe(15);
      expect(relatorio.visitantes).toBe(3);
      expect(relatorio.id).toBeDefined();
    });

    it('deve filtrar relatórios por célula', async () => {
      await adicionarRelatorio({
        celulaId: '1',
        celulaNome: 'Vida Nova',
        liderNome: 'João',
        data: '10/02/2026',
        totalPessoas: 12,
        visitantes: 2,
      });
      await adicionarRelatorio({
        celulaId: '2',
        celulaNome: 'Esperança',
        liderNome: 'Maria',
        data: '10/02/2026',
        totalPessoas: 8,
        visitantes: 1,
      });

      const vidaNova = await getRelatorios('Vida Nova');
      expect(vidaNova).toHaveLength(1);
      expect(vidaNova[0].celulaNome).toBe('Vida Nova');

      const todos = await getRelatorios();
      expect(todos).toHaveLength(2);
    });

    it('deve remover um relatório', async () => {
      const relatorio = await adicionarRelatorio({
        celulaId: '1',
        celulaNome: 'Vida Nova',
        liderNome: 'João',
        data: '17/02/2026',
        totalPessoas: 10,
        visitantes: 2,
      });

      await removerRelatorio(relatorio.id);
      const relatorios = await getRelatorios();
      expect(relatorios).toHaveLength(0);
    });
  });

  describe('Aniversariantes da Célula', () => {
    it('deve filtrar aniversariantes do mês atual', () => {
      const mesAtual = new Date().getMonth() + 1;
      const membros: MembroCelula[] = [
        {
          nome: 'João',
          dataNascimento: `15/${String(mesAtual).padStart(2, '0')}/1990`,
          celula: 'Vida Nova',
          inscritoBatismo: false,
          inscritoEventos: [],
        },
        {
          nome: 'Maria',
          dataNascimento: '20/12/1985',
          celula: 'Vida Nova',
          inscritoBatismo: false,
          inscritoEventos: [],
        },
      ];

      const aniversariantes = getAniversariantesDaCelula(membros);
      
      if (mesAtual === 12) {
        expect(aniversariantes).toHaveLength(2);
      } else {
        expect(aniversariantes).toHaveLength(1);
        expect(aniversariantes[0].nome).toBe('João');
      }
    });

    it('deve lidar com datas vazias', () => {
      const membros: MembroCelula[] = [
        {
          nome: 'Sem Data',
          dataNascimento: '',
          celula: 'Vida Nova',
          inscritoBatismo: false,
          inscritoEventos: [],
        },
      ];

      const aniversariantes = getAniversariantesDaCelula(membros);
      expect(aniversariantes).toHaveLength(0);
    });
  });

  describe('Estatísticas da Célula', () => {
    it('deve calcular estatísticas corretamente', async () => {
      // Adicionar relatórios
      await adicionarRelatorio({
        celulaId: '1',
        celulaNome: 'Vida Nova',
        liderNome: 'João',
        data: '03/02/2026',
        totalPessoas: 10,
        visitantes: 2,
      });
      await adicionarRelatorio({
        celulaId: '1',
        celulaNome: 'Vida Nova',
        liderNome: 'João',
        data: '10/02/2026',
        totalPessoas: 14,
        visitantes: 4,
      });

      const stats = await getEstatisticasCelula('Vida Nova');
      expect(stats.totalRelatorios).toBe(2);
      expect(stats.mediaPresenca).toBe(12); // (10+14)/2
      expect(stats.mediaVisitantes).toBe(3); // (2+4)/2
    });
  });
});
