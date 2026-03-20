/**
 * Rate Limiter - Protege a API contra abuso
 * 
 * Implementação simples em memória (adequada para desenvolvimento)
 * Para produção, considere usar Redis
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  // 100 requisições por 15 minutos por IP
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutos
  
  // Endpoints mais restritivos
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 5 tentativas por 15 minutos
  },
  signup: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 tentativas por hora
  },
};

/**
 * Obter chave de identificação do cliente
 * Em produção, use IP real (considere proxy)
 */
function getClientKey(req: any): string {
  // Tentar obter IP real considerando proxies
  const ip = 
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown';
  
  return ip.trim();
}

/**
 * Verificar se cliente excedeu limite
 */
export function checkRateLimit(
  req: any,
  endpoint: string = 'default'
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientKey = getClientKey(req);
  const config = (RATE_LIMIT_CONFIG as any)[endpoint] || RATE_LIMIT_CONFIG;
  const now = Date.now();
  
  // Limpar entrada expirada
  const entry = rateLimitMap.get(clientKey);
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(clientKey);
  }
  
  // Obter ou criar entrada
  const currentEntry = rateLimitMap.get(clientKey) || {
    count: 0,
    resetTime: now + config.windowMs,
  };
  
  // Incrementar contador
  currentEntry.count++;
  rateLimitMap.set(clientKey, currentEntry);
  
  // Verificar limite
  const allowed = currentEntry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - currentEntry.count);
  
  return {
    allowed,
    remaining,
    resetTime: currentEntry.resetTime,
  };
}

/**
 * Middleware Express para rate limiting
 */
export function rateLimitMiddleware(endpoint: string = 'default') {
  return (req: any, res: any, next: any) => {
    const limit = checkRateLimit(req, endpoint);
    
    // Adicionar headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests);
    res.setHeader('X-RateLimit-Remaining', limit.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(limit.resetTime).toISOString());
    
    if (!limit.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
      });
    }
    
    next();
  };
}

/**
 * Limpar rate limit para um cliente (útil para testes)
 */
export function clearRateLimit(clientKey: string): void {
  rateLimitMap.delete(clientKey);
}

/**
 * Limpar todos os rate limits (útil para testes)
 */
export function clearAllRateLimits(): void {
  rateLimitMap.clear();
}

/**
 * Obter estatísticas de rate limiting
 */
export function getRateLimitStats() {
  return {
    activeClients: rateLimitMap.size,
    entries: Array.from(rateLimitMap.entries()).map(([key, value]) => ({
      client: key,
      requests: value.count,
      resetTime: new Date(value.resetTime).toISOString(),
    })),
  };
}
