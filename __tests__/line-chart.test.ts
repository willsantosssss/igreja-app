import { describe, it, expect } from 'vitest';

// Testar a lógica de preparação de dados para gráficos (sem renderizar componentes React)
describe('Lógica de dados para gráficos de relatórios', () => {
  const parseData = (d: string) => {
    const parts = d.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    }
    return 0;
  };

  const relatoriosMock = [
    { id: '1', celulaId: '1', celulaNome: 'Vida Nova', liderNome: 'João', data: '03/02/2026', totalPessoas: 10, visitantes: 2, criadoEm: '2026-02-03' },
    { id: '2', celulaId: '1', celulaNome: 'Vida Nova', liderNome: 'João', data: '10/02/2026', totalPessoas: 14, visitantes: 4, criadoEm: '2026-02-10' },
    { id: '3', celulaId: '1', celulaNome: 'Vida Nova', liderNome: 'João', data: '17/02/2026', totalPessoas: 12, visitantes: 3, criadoEm: '2026-02-17' },
    { id: '4', celulaId: '2', celulaNome: 'Esperança', liderNome: 'Maria', data: '03/02/2026', totalPessoas: 8, visitantes: 1, criadoEm: '2026-02-03' },
    { id: '5', celulaId: '2', celulaNome: 'Esperança', liderNome: 'Maria', data: '10/02/2026', totalPessoas: 11, visitantes: 3, criadoEm: '2026-02-10' },
    { id: '6', celulaId: '2', celulaNome: 'Esperança', liderNome: 'Maria', data: '17/02/2026', totalPessoas: 9, visitantes: 2, criadoEm: '2026-02-17' },
  ];

  it('deve parsear datas DD/MM/YYYY corretamente', () => {
    const ts = parseData('17/02/2026');
    const date = new Date(ts);
    expect(date.getDate()).toBe(17);
    expect(date.getMonth()).toBe(1); // Fevereiro = 1
    expect(date.getFullYear()).toBe(2026);
  });

  it('deve retornar 0 para datas inválidas', () => {
    expect(parseData('invalido')).toBe(0);
    expect(parseData('')).toBe(0);
  });

  it('deve ordenar datas cronologicamente', () => {
    const datas = ['17/02/2026', '03/02/2026', '10/02/2026'];
    const ordenadas = datas.sort((a, b) => parseData(a) - parseData(b));
    expect(ordenadas).toEqual(['03/02/2026', '10/02/2026', '17/02/2026']);
  });

  it('deve agrupar relatórios por data', () => {
    const agrupados = relatoriosMock.reduce<Record<string, typeof relatoriosMock>>((acc, r) => {
      if (!acc[r.data]) acc[r.data] = [];
      acc[r.data].push(r);
      return acc;
    }, {});

    expect(Object.keys(agrupados)).toHaveLength(3);
    expect(agrupados['03/02/2026']).toHaveLength(2);
    expect(agrupados['10/02/2026']).toHaveLength(2);
    expect(agrupados['17/02/2026']).toHaveLength(2);
  });

  it('deve extrair células únicas', () => {
    const celulasUnicas = [...new Set(relatoriosMock.map(r => r.celulaNome))].sort();
    expect(celulasUnicas).toEqual(['Esperança', 'Vida Nova']);
  });

  it('deve calcular dados de presença por célula e data', () => {
    const datasUnicas = [...new Set(relatoriosMock.map(r => r.data))]
      .sort((a, b) => parseData(a) - parseData(b));

    const presencaVidaNova = datasUnicas.map(data => {
      const rels = relatoriosMock.filter(r => r.celulaNome === 'Vida Nova' && r.data === data);
      return rels.reduce((acc, r) => acc + r.totalPessoas, 0);
    });

    expect(presencaVidaNova).toEqual([10, 14, 12]);
  });

  it('deve calcular dados de visitantes por célula e data', () => {
    const datasUnicas = [...new Set(relatoriosMock.map(r => r.data))]
      .sort((a, b) => parseData(a) - parseData(b));

    const visitantesEsperanca = datasUnicas.map(data => {
      const rels = relatoriosMock.filter(r => r.celulaNome === 'Esperança' && r.data === data);
      return rels.reduce((acc, r) => acc + r.visitantes, 0);
    });

    expect(visitantesEsperanca).toEqual([1, 3, 2]);
  });

  it('deve formatar labels como DD/MM', () => {
    const datasUnicas = ['03/02/2026', '10/02/2026', '17/02/2026'];
    const labels = datasUnicas.map(d => {
      const parts = d.split('/');
      return `${parts[0]}/${parts[1]}`;
    });

    expect(labels).toEqual(['03/02', '10/02', '17/02']);
  });

  it('deve limitar a 10 datas para legibilidade', () => {
    const muitasDatas = Array.from({ length: 15 }, (_, i) => {
      const dia = String(i + 1).padStart(2, '0');
      return `${dia}/01/2026`;
    });

    const datasExibidas = muitasDatas.slice(-10);
    expect(datasExibidas).toHaveLength(10);
    expect(datasExibidas[0]).toBe('06/01/2026');
    expect(datasExibidas[9]).toBe('15/01/2026');
  });

  it('deve filtrar relatórios por célula específica', () => {
    const filtrados = relatoriosMock.filter(r => r.celulaNome === 'Vida Nova');
    expect(filtrados).toHaveLength(3);
    expect(filtrados.every(r => r.celulaNome === 'Vida Nova')).toBe(true);
  });

  it('deve calcular totais para uma célula filtrada', () => {
    const filtrados = relatoriosMock.filter(r => r.celulaNome === 'Vida Nova');
    const totalPessoas = filtrados.reduce((acc, r) => acc + r.totalPessoas, 0);
    const totalVisitantes = filtrados.reduce((acc, r) => acc + r.visitantes, 0);

    expect(totalPessoas).toBe(36); // 10 + 14 + 12
    expect(totalVisitantes).toBe(9); // 2 + 4 + 3
  });

  it('deve atribuir cores únicas para cada célula', () => {
    const paleta = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
    const celulasUnicas = ['Esperança', 'Vida Nova'];
    const cores: Record<string, string> = {};
    celulasUnicas.forEach((cel, i) => {
      cores[cel] = paleta[i % paleta.length];
    });

    expect(cores['Esperança']).toBe('#06B6D4');
    expect(cores['Vida Nova']).toBe('#10B981');
    expect(Object.values(cores).length).toBe(2);
  });
});
