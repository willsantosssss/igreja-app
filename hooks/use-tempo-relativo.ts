import { useState, useEffect } from 'react';

/**
 * Hook para formatar timestamp em tempo relativo (ex: "há 2 min", "há 1 hora")
 * Atualiza automaticamente a cada minuto
 */
export function useTempoRelativo(timestamp: number | undefined): string {
  const [tempoRelativo, setTempoRelativo] = useState<string>('');

  useEffect(() => {
    if (!timestamp) {
      setTempoRelativo('Nunca');
      return;
    }

    const atualizarTempo = () => {
      const agora = Date.now();
      const diferenca = agora - timestamp;
      
      const segundos = Math.floor(diferenca / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);

      if (segundos < 60) {
        setTempoRelativo('Há menos de 1 min');
      } else if (minutos < 60) {
        setTempoRelativo(`Há ${minutos} min`);
      } else if (horas < 24) {
        setTempoRelativo(`Há ${horas} ${horas === 1 ? 'hora' : 'horas'}`);
      } else {
        setTempoRelativo(`Há ${dias} ${dias === 1 ? 'dia' : 'dias'}`);
      }
    };

    atualizarTempo();
    const intervalo = setInterval(atualizarTempo, 60000); // Atualiza a cada minuto

    return () => clearInterval(intervalo);
  }, [timestamp]);

  return tempoRelativo;
}
