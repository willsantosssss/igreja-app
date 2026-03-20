/**
 * 
 * Em desenvolvimento: todos os logs aparecem
 * Em produção: apenas erros aparecem
 */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Log de debug - só aparece em desenvolvimento
 */
export const logDebug = (tag: string, data?: any) => {
  if (isDev) {
  }
};

/**
 * Log de info - aparece em desenvolvimento e produção
 */
export const logInfo = (tag: string, msg: string) => {
  if (isDev) {
  }
};

/**
 * Log de warning - aparece em desenvolvimento e produção
 */
export const logWarn = (tag: string, msg: string) => {
  if (isDev) {
    console.warn(`[WARN ${tag}]`, msg);
  }
};

/**
 * Log de erro - SEMPRE aparece (importante para debug em produção)
 */
export const logError = (tag: string, error: any) => {
  console.error(`[ERROR ${tag}]`, error);
  // TODO: Enviar para Sentry ou outro serviço de error tracking
};

/**
 * Objeto com métodos para usar como logger.debug(), logger.error(), etc.
 */
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
};
