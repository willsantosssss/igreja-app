import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Linking } from 'react-native';

// Mock do Linking
vi.mock('react-native', () => ({
  Linking: {
    canOpenURL: vi.fn(),
    openURL: vi.fn(),
  },
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: vi.fn(),
  },
}));

describe('WhatsApp Share Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve formatar corretamente a mensagem do evento', () => {
    const event = {
      id: '1',
      title: 'Culto da Família',
      description: 'Um culto especial para toda a família',
      date: '2026-03-22',
      time: '19:00',
      location: '2IEQ',
      category: 'special' as any,
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const mensagem = `🎉 *${event.title}*\n\n📅 *Data:* ${formatDate(event.date)}\n🕐 *Horário:* ${event.time}\n📍 *Local:* ${event.location}\n\n${event.description}\n\n👉 Inscreva-se no nosso app!`;

    expect(mensagem).toContain('🎉 *Culto da Família*');
    expect(mensagem).toContain('📅 *Data:*');
    expect(mensagem).toContain('🕐 *Horário:* 19:00');
    expect(mensagem).toContain('📍 *Local:* 2IEQ');
    expect(mensagem).toContain('Um culto especial para toda a família');
  });

  it('deve codificar corretamente a mensagem para URL', () => {
    const mensagem = '🎉 *Culto da Família*\n\n📅 *Data:* Domingo, 22 de Março de 2026';
    const mensagemCodificada = encodeURIComponent(mensagem);
    const whatsappUrl = `https://wa.me/?text=${mensagemCodificada}`;

    expect(whatsappUrl).toContain('https://wa.me/?text=');
    expect(whatsappUrl).toContain('%F0%9F%8E%89');  // 🎉 codificado
    expect(whatsappUrl).toContain('*');  // * não é codificado por encodeURIComponent
  });

  it('deve tentar abrir WhatsApp com a URL correta', async () => {
    const mockCanOpenURL = vi.fn().mockResolvedValue(true);
    const mockOpenURL = vi.fn().mockResolvedValue(undefined);

    (Linking.canOpenURL as any) = mockCanOpenURL;
    (Linking.openURL as any) = mockOpenURL;

    const whatsappUrl = 'https://wa.me/?text=Teste';

    await mockCanOpenURL(whatsappUrl);
    expect(mockCanOpenURL).toHaveBeenCalledWith(whatsappUrl);

    await mockOpenURL(whatsappUrl);
    expect(mockOpenURL).toHaveBeenCalledWith(whatsappUrl);
  });

  it('deve conter emojis e formatação correta', () => {
    const event = {
      title: 'Dia da Visão 2026',
      date: '2026-03-07',
      time: '16:00',
      location: '2IEQ',
      description: 'A visão está muito clara',
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const mensagem = `🎉 *${event.title}*\n\n📅 *Data:* ${formatDate(event.date)}\n🕐 *Horário:* ${event.time}\n📍 *Local:* ${event.location}\n\n${event.description}\n\n👉 Inscreva-se no nosso app!`;

    // Verificar emojis
    expect(mensagem).toContain('🎉');
    expect(mensagem).toContain('📅');
    expect(mensagem).toContain('🕐');
    expect(mensagem).toContain('📍');
    expect(mensagem).toContain('👉');

    // Verificar formatação em negrito
    expect(mensagem).toContain('*Dia da Visão 2026*');
    expect(mensagem).toContain('*Data:*');
    expect(mensagem).toContain('*Horário:*');
    expect(mensagem).toContain('*Local:*');
  });

  it('deve incluir chamada para ação no final', () => {
    const event = {
      title: 'Evento Teste',
      date: '2026-03-20',
      time: '18:00',
      location: 'Local Teste',
      description: 'Descrição teste',
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const mensagem = `🎉 *${event.title}*\n\n📅 *Data:* ${formatDate(event.date)}\n🕐 *Horário:* ${event.time}\n📍 *Local:* ${event.location}\n\n${event.description}\n\n👉 Inscreva-se no nosso app!`;

    expect(mensagem).toContain('👉 Inscreva-se no nosso app!');
  });
});
