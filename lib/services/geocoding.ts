/**
 * Serviço de Geocodificação
 * Converte endereços em coordenadas geográficas (latitude/longitude)
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocodifica um endereço usando a API do OpenStreetMap (Nominatim)
 * Gratuita e sem necessidade de API key
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': '2IEQ-Connect-App',
      },
    });

    if (!response.ok) {
      console.error('[Geocoding] Erro na API:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.length === 0) {
      console.warn('[Geocoding] Endereço não encontrado:', address);
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.error('[Geocoding] Erro ao geocodificar:', error);
    return null;
  }
}

/**
 * Geocodifica múltiplos endereços em lote
 * Adiciona delay entre requisições para respeitar rate limit
 */
export async function geocodeAddresses(addresses: string[]): Promise<(Coordinates | null)[]> {
  const results: (Coordinates | null)[] = [];
  
  for (const address of addresses) {
    const coords = await geocodeAddress(address);
    results.push(coords);
    
    // Delay de 1 segundo entre requisições (rate limit do Nominatim)
    if (addresses.indexOf(address) < addresses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Calcula o centro geográfico de um conjunto de coordenadas
 */
export function calculateCenter(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    // Coordenadas padrão: Rondonópolis, MT
    return { latitude: -16.4709, longitude: -54.6354 };
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
}

/**
 * Calcula o delta (zoom) apropriado para mostrar todos os pontos
 */
export function calculateDelta(coordinates: Coordinates[]): { latitudeDelta: number; longitudeDelta: number } {
  if (coordinates.length === 0) {
    return { latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }

  const lats = coordinates.map(c => c.latitude);
  const lngs = coordinates.map(c => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latDelta = (maxLat - minLat) * 1.5; // 1.5x para padding
  const lngDelta = (maxLng - minLng) * 1.5;

  return {
    latitudeDelta: Math.max(latDelta, 0.02), // Mínimo 0.02 para zoom adequado
    longitudeDelta: Math.max(lngDelta, 0.02),
  };
}
