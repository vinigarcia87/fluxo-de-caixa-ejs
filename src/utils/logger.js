// Verificar se winston está disponível, senão usar fallback
let winston;
let logger;

try {
  winston = require('winston');
} catch (error) {
  console.warn('Winston não encontrado, usando logger de fallback');
  winston = null;
}

const path = require('path');

if (winston) {
  // Definir formato customizado para logs
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  // Formato para console (desenvolvimento)
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  );

  // Configurar transports
  const transports = [];

  // Console transport (sempre ativo)
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    })
  );

  // File transports (apenas em produção ou se especificado)
  if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    // Criar diretório de logs se não existir
    const logsDir = path.join(__dirname, '../../logs');

    // Log de erro
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
      })
    );

    // Log combinado
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
      })
    );
  }

  // Criar instância do logger
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: logFormat,
    defaultMeta: {
      service: 'fluxo-caixa',
      environment: process.env.NODE_ENV || 'development'
    },
    transports,
    exceptionHandlers: [
      new winston.transports.Console({ format: consoleFormat })
    ],
    rejectionHandlers: [
      new winston.transports.Console({ format: consoleFormat })
    ]
  });
} else {
  // Logger de fallback simples
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    log: (level, message, meta) => {
      console[level] ? console[level](message, meta || '') : console.log(message, meta || '');
    }
  };
}

// Middleware para log de requests HTTP
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log da requisição
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('user-agent') || 'unknown',
    ip: req.ip || 'unknown',
    sessionId: req.sessionID || 'no-session'
  });

  // Log da resposta quando terminar
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    if (logger.log && typeof logger.log === 'function') {
      logger.log(level, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip || 'unknown',
        sessionId: req.sessionID || 'no-session'
      });
    } else {
      logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });

  next();
};

// Função utilitária para log de operações de banco/modelo
const logModelOperation = (operation, model, data = {}) => {
  logger.debug(`${operation} - ${model}`, {
    operation,
    model,
    data: process.env.NODE_ENV === 'development' ? data : '[HIDDEN]'
  });
};

// Função para log de performance
const logPerformance = (operation, startTime, additionalData = {}) => {
  const duration = Date.now() - startTime;
  const level = duration > 1000 ? 'warn' : 'debug';

  if (logger.log && typeof logger.log === 'function') {
    logger.log(level, `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...additionalData
    });
  } else {
    logger[level](`Performance: ${operation} took ${duration}ms`);
  }
};

module.exports = {
  logger,
  requestLogger,
  logModelOperation,
  logPerformance
};