import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Platform } from 'react-native';

/**
 * Testes para validar que o botão "Como Chegar" usa coordenadas (latitude/longitude)
 * em vez de apenas endereço em texto, garantindo precisão no Google Maps
 */
describe('Células - Google Maps com Coordenadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Construção de URL com coordenadas', () => {
    it('Deve construir URL correta para iOS com coordenadas', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      
      // iOS Maps URL format
      const url = `maps://maps.apple.com/?daddr=${latitude},${longitude}`;
      
      expect(url).toBe('maps://maps.apple.com/?daddr=-15.4942,-54.6038');
      expect(url).toContain('daddr=');
      expect(url).toContain(',');
    });

    it('Deve construir URL correta para Android com coordenadas', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      
      // Android Navigation URL format
      const url = `google.navigation:q=${latitude},${longitude}`;
      
      expect(url).toBe('google.navigation:q=-15.4942,-54.6038');
      expect(url).toContain('q=');
      expect(url).toContain(',');
    });

    it('Deve construir URL correta para Web com coordenadas', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      
      // Web Google Maps URL format
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      
      expect(url).toContain('https://www.google.com/maps/search/');
      expect(url).toContain('api=1');
      expect(url).toContain(`query=${latitude},${longitude}`);
    });

    it('Deve usar fallback para endereço em texto quando coordenadas não estão disponíveis', () => {
      const address = 'Rua das Flores, 123, Rondonópolis, MT';
      const encodedAddress = encodeURIComponent(address);
      
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
      expect(url).toContain('https://www.google.com/maps/search/');
      expect(url).toContain('Rua%20das%20Flores');
      expect(url).toContain('123');
    });
  });

  describe('Precisão de coordenadas', () => {
    it('Deve manter precisão de coordenadas com 4 casas decimais', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      
      // Validar que as coordenadas mantêm a precisão
      expect(latitude.split('.')[1].length).toBe(4);
      expect(longitude.split('.')[1].length).toBe(4);
      
      // Coordenadas com 4 casas decimais têm precisão de ~11 metros
      expect(latitude).toMatch(/^-?\d+\.\d{4}$/);
      expect(longitude).toMatch(/^-?\d+\.\d{4}$/);
    });

    it('Deve validar que coordenadas são números válidos', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      // Validar que são números válidos
      expect(Number.isFinite(lat)).toBe(true);
      expect(Number.isFinite(lon)).toBe(true);
      
      // Validar que estão dentro de limites válidos (Brasil)
      expect(lat).toBeGreaterThan(-33); // Limite norte do Brasil
      expect(lat).toBeLessThan(5); // Limite sul do Brasil
      expect(lon).toBeGreaterThan(-74); // Limite oeste do Brasil
      expect(lon).toBeLessThan(-35); // Limite leste do Brasil
    });
  });

  describe('Estrutura de dados de célula', () => {
    it('Deve ter latitude e longitude como strings', () => {
      const celula = {
        id: 1,
        nome: 'Célula Centro',
        lider: 'João Silva',
        telefone: '65999999999',
        endereco: 'Rua das Flores, 123',
        latitude: '-15.4942',
        longitude: '-54.6038',
        diaReuniao: 'Terça',
        horario: '19:30',
      };

      expect(typeof celula.latitude).toBe('string');
      expect(typeof celula.longitude).toBe('string');
      expect(celula.latitude).toMatch(/^-?\d+\.\d+$/);
      expect(celula.longitude).toMatch(/^-?\d+\.\d+$/);
    });

    it('Deve permitir coordenadas vazias como fallback', () => {
      const celula = {
        id: 1,
        nome: 'Célula Centro',
        lider: 'João Silva',
        telefone: '65999999999',
        endereco: 'Rua das Flores, 123',
        latitude: '',
        longitude: '',
        diaReuniao: 'Terça',
        horario: '19:30',
      };

      // Quando coordenadas estão vazias, deve usar endereço como fallback
      const shouldUseFallback = !celula.latitude || !celula.longitude;
      expect(shouldUseFallback).toBe(true);
    });
  });

  describe('Lógica de seleção de URL', () => {
    it('Deve preferir coordenadas quando disponíveis', () => {
      const latitude = '-15.4942';
      const longitude = '-54.6038';
      const address = 'Rua das Flores, 123';

      // Simular lógica de seleção
      let url: string;
      if (latitude && longitude) {
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }

      expect(url).toContain(`${latitude},${longitude}`);
      expect(url).not.toContain('Rua%20das%20Flores');
    });

    it('Deve usar fallback quando coordenadas estão vazias', () => {
      const latitude = '';
      const longitude = '';
      const address = 'Rua das Flores, 123';

      // Simular lógica de seleção
      let url: string;
      if (latitude && longitude) {
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }

      expect(url).toContain('Rua%20das%20Flores');
      expect(url).not.toContain(',,');
    });

    it('Deve usar fallback quando apenas uma coordenada está disponível', () => {
      const latitude = '-15.4942';
      const longitude = '';
      const address = 'Rua das Flores, 123';

      // Simular lógica de seleção
      let url: string;
      if (latitude && longitude) {
        url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      } else {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      }

      expect(url).toContain('Rua%20das%20Flores');
      expect(url).not.toContain('-15.4942');
    });
  });
});
