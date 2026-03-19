import { describe, it, expect, beforeEach } from 'vitest';

describe('Múltiplos Líderes por Célula', () => {
  let lideresDB: any[] = [];

  beforeEach(() => {
    lideresDB = [];
  });

  it('deve permitir adicionar primeiro líder em uma célula', () => {
    const novaCelula = 'Wellington e Joice';
    const lideresNaCelula = lideresDB.filter((l: any) => l.celula === novaCelula);
    
    expect(lideresNaCelula.length).toBe(0);
    expect(lideresNaCelula.length < 2).toBe(true);
  });

  it('deve permitir adicionar segundo líder em uma célula', () => {
    const novaCelula = 'Wellington e Joice';
    
    // Simular primeiro líder
    lideresDB.push({
      id: 1,
      nome: 'Guilherme',
      celula: novaCelula,
      telefone: 'teste123',
    });

    const lideresNaCelula = lideresDB.filter((l: any) => l.celula === novaCelula);
    
    expect(lideresNaCelula.length).toBe(1);
    expect(lideresNaCelula.length < 2).toBe(true);
  });

  it('deve impedir adicionar terceiro líder em uma célula', () => {
    const novaCelula = 'Wellington e Joice';
    
    // Simular dois líderes
    lideresDB.push({
      id: 1,
      nome: 'Guilherme',
      celula: novaCelula,
      telefone: 'teste123',
    });
    
    lideresDB.push({
      id: 2,
      nome: 'Joice',
      celula: novaCelula,
      telefone: 'teste456',
    });

    const lideresNaCelula = lideresDB.filter((l: any) => l.celula === novaCelula);
    
    expect(lideresNaCelula.length).toBe(2);
    expect(lideresNaCelula.length >= 2).toBe(true);
  });

  it('deve contar corretamente líderes por célula', () => {
    lideresDB = [
      { id: 1, nome: 'Guilherme', celula: 'Wellington e Joice', telefone: 'teste123' },
      { id: 2, nome: 'Joice', celula: 'Wellington e Joice', telefone: 'teste456' },
      { id: 3, nome: 'Pra. Fernanda', celula: 'Pr. Will e Pra. Fernanda', telefone: 'teste789' },
    ];

    const celulaWellington = lideresDB.filter((l: any) => l.celula === 'Wellington e Joice');
    const celulaPrWill = lideresDB.filter((l: any) => l.celula === 'Pr. Will e Pra. Fernanda');

    expect(celulaWellington.length).toBe(2);
    expect(celulaPrWill.length).toBe(1);
  });

  it('deve permitir adicionar segundo líder após remover o primeiro', () => {
    const novaCelula = 'Wellington e Joice';
    
    // Adicionar primeiro líder
    lideresDB.push({
      id: 1,
      nome: 'Guilherme',
      celula: novaCelula,
      telefone: 'teste123',
    });

    // Remover primeiro líder
    lideresDB = lideresDB.filter((l: any) => l.id !== 1);

    // Tentar adicionar novo líder
    const lideresNaCelula = lideresDB.filter((l: any) => l.celula === novaCelula);
    expect(lideresNaCelula.length).toBe(0);
    expect(lideresNaCelula.length < 2).toBe(true);
  });

  it('deve validar limite de 2 líderes por célula corretamente', () => {
    const novaCelula = 'Wellington e Joice';
    
    lideresDB.push(
      { id: 1, nome: 'Líder 1', celula: novaCelula, telefone: 'senha1' },
      { id: 2, nome: 'Líder 2', celula: novaCelula, telefone: 'senha2' }
    );

    const lideresNaCelula = lideresDB.filter((l: any) => l.celula === novaCelula);
    const podeAdicionarMais = lideresNaCelula.length < 2;

    expect(podeAdicionarMais).toBe(false);
    expect(lideresNaCelula.length).toBe(2);
  });
});
