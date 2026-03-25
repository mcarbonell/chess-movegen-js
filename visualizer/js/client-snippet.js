/**
 * Client Logger - Inyectar en tu web app
 * 
 * Opción 1: Copiar todo este archivo como <script> antes de tu código
 * Opción 2: Importar como módulo y usar las funciones exportadas
 * 
 * Configuración: Cambiar LOG_ENDPOINT si el puerto es diferente
 */

// ============== CONFIGURACIÓN ==============
const LOG_ENDPOINT = 'http://localhost:9876';
// ===========================================

// Crear endpoint global para logging
window.__loggerReady = false;

(function() {
  // Cola de logs mientras se inicializa
  const logQueue = [];
  
  // Función principal de logging
  function sendLog(level, message, ...args) {
    // Construir objeto de log
    const logData = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: String(message),
    };
    
    // Añadir metadatos si hay argumentos extra
    if (args.length > 0) {
      logData.meta = args.map(arg => {
        if (arg instanceof Error) {
          return { type: 'Error', message: arg.message, stack: arg.stack };
        }
        if (typeof arg === 'object') {
          try { return JSON.parse(JSON.stringify(arg)); } 
          catch { return String(arg); }
        }
        return arg;
      });
    }
    
    // Si hay un error como primer argumento extra, extraer stack
    const errorArg = args.find(a => a instanceof Error);
    if (errorArg) {
      logData.stack = errorArg.stack;
    }
    
    // Enviar o encolar
    if (!window.__loggerReady) {
      logQueue.push(logData);
    } else {
      flushLog(logData);
    }
    
    // También enviar a console original para depuración
    const consoleMethod = console[level] || console.log;
    // consoleMethod.call(console, `[${level.toUpperCase()}]`, message, ...args);
  }
  
  // Enviar log al servidor
  function flushLog(logData) {
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
      // fire-and-forget, no bloquear la app
      keepalive: true
    }).catch(() => {
      // Silenciar errores del logger para no crear loops
    });
  }
  
  // API pública
  window.logger = {
    info: (msg, ...args) => sendLog('info', msg, ...args),
    warn: (msg, ...args) => sendLog('warn', msg, ...args),
    error: (msg, ...args) => sendLog('error', msg, ...args),
    debug: (msg, ...args) => sendLog('debug', msg, ...args),
    log: (msg, ...args) => sendLog('log', msg, ...args),
    
    // Log de eventos del DOM
    event: (element, eventType, data) => sendLog('info', `Event: ${eventType} on ${element}`, data),
    
    // Log de peticiones HTTP
    fetch: (url, options, response) => sendLog('info', `Fetch: ${options?.method || 'GET'} ${url}`, { 
      status: response?.status,
      ok: response?.ok 
    }),
    
    // Log de errores de red
    networkError: (url, error) => sendLog('error', `Network Error: ${url}`, { error: String(error) }),
  };
  
  // Interceptar errores globales no capturados
  window.onerror = (msg, url, line, col, error) => {
    sendLog('error', `Uncaught: ${msg}`, {
      url,
      line,
      col,
      stack: error?.stack
    });
    return false; // No prevenir comportamiento por defecto
  };
  
  // Interceptar promesas rechazadas
  window.onunhandledrejection = (event) => {
    sendLog('error', `Unhandled Promise Rejection`, {
      reason: String(event.reason),
      stack: event.reason?.stack
    });
  };
  
  // Interceptar fetch para logging automÃ¡tico (opcional)
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [resource, options] = args;
    let url = "";
    if (typeof resource === 'string') {
        url = resource;
    } else if (resource && resource.url) {
        url = resource.url;
    }

    const method = options?.method || 'GET';

    // Prevent infinite loop by not logging requests to the logger itself
    if (url && url.startsWith(LOG_ENDPOINT)) {
        return originalFetch.apply(this, args);
    }

    try {
      const response = await originalFetch.apply(this, args);
      sendLog('debug', `Fetch: ${method} ${url}`, {
        status: response.status,
        ok: response.ok
      });
      return response;
    } catch (error) {
      sendLog('error', `Fetch Error: ${method} ${url}`, { error: String(error) });
      throw error;
    }
  };
  
  // Marcar como listo y enviar logs en cola
  window.__loggerReady = true;
  logQueue.forEach(log => flushLog(log));
  
  // Log de inicio
  sendLog('info', 'Client Logger initialized');
})();
