// Logger com fallback para ES modules
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Determinar o diretório de logs
const logDir = path.join(process.cwd(), 'logs');

// Criar configuração de transports
const transports = [
  // Console sempre ativo
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  })
];

// Adicionar arquivo apenas em produção ou se especificado
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
  transports.push(
    // Arquivo para todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Arquivo apenas para erros
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      format: logFormat,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: logFormat
    })
  ]
});

/**
 * Middleware de logging detalhado para requests HTTP
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Preparar dados da requisição
  const requestData = {
    method: req.method,
    url: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    timestamp: new Date().toISOString()
  };

  // Log da requisição de entrada (apenas em debug)
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('→ Incoming Request', requestData);
  }

  // Override do método send para capturar resposta
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const responseSize = data ? Buffer.byteLength(data, 'utf8') : 0;

    // Dados da resposta
    const responseData = {
      ...requestData,
      status: res.statusCode,
      duration: `${duration}ms`,
      responseSize: `${responseSize} bytes`,
      headers: {
        contentType: res.get('Content-Type'),
        contentLength: res.get('Content-Length')
      }
    };

    // Log completo da request/response
    const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
    const statusIcon = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';

    logger[logLevel](`${statusIcon} HTTP ${req.method} ${req.originalUrl}`, responseData);

    // Log adicional para requisições lentas (>1s)
    if (duration > 1000) {
      logger.warn('⏳ Slow Request Detected', {
        ...responseData,
        slowRequestThreshold: '1000ms'
      });
    }

    // Log de body para requisições POST/PUT/PATCH em debug
    if (process.env.LOG_LEVEL === 'debug' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyData = { ...req.body };

      // Remover dados sensíveis do log
      if (bodyData.password) bodyData.password = '[HIDDEN]';
      if (bodyData.token) bodyData.token = '[HIDDEN]';
      if (bodyData.secret) bodyData.secret = '[HIDDEN]';

      logger.debug('📝 Request Body', {
        method: req.method,
        url: req.originalUrl,
        body: bodyData,
        files: req.files ? Object.keys(req.files) : req.file ? [req.file.originalname] : null
      });
    }

    // Chamar método original
    originalSend.call(this, data);
  };

  next();
};

/**
 * Wrapper para adicionar contexto aos logs
 */
const logWithContext = (level, message, context = {}) => {
  logger[level](message, {
    ...context,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
};

/**
 * Função utilitária para logging de performance
 */
const logPerformance = (operation, startTime, additionalData = {}) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    operation,
    ...additionalData
  });
};

/**
 * Função para logging de erros estruturados
 */
const logError = (error, context = {}) => {
  logger.error('💥 Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    ...context
  });
};

/**
 * Log específico para operações de usuário
 */
const logUserOperation = (operation, userId, data = {}) => {
  logger.info(`👤 User ${operation}`, {
    operation,
    userId,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Log específico para operações de fluxo de caixa
 */
const logCashFlowOperation = (operation, amount, account, data = {}) => {
  logger.info(`💰 CashFlow ${operation}`, {
    operation,
    amount,
    account,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Log específico para uploads de arquivos
 */
const logFileUpload = (filename, size, mimetype, user = null) => {
  logger.info('📤 File Upload', {
    filename,
    size: `${size} bytes`,
    mimetype,
    user,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log específico para validações que falharam
 */
const logValidationError = (field, value, rule, req) => {
  logger.warn('⚠️ Validation Failed', {
    field,
    value: typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : value,
    rule,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log de login/logout/auth events
 */
const logAuthEvent = (event, user, req, additionalData = {}) => {
  logger.info(`🔐 Auth ${event}`, {
    event,
    user: user?.id || user?.email || 'unknown',
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    url: req?.originalUrl,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};

/**
 * Log de queries de banco de dados (desenvolvimento)
 */
const logDatabaseQuery = (query, params, duration) => {
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('🗄️ Database Query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware de cleanup para logs em desenvolvimento
 */
const developmentCleanup = () => {
  if (process.env.NODE_ENV === 'development') {
    // Em desenvolvimento, não deixar logs acumularem muito
    setInterval(() => {
      // Aqui poderia implementar limpeza automática se necessário
    }, 24 * 60 * 60 * 1000); // Uma vez por dia
  }
};

// Inicializar cleanup se estiver em desenvolvimento
developmentCleanup();

export {
  logger,
  requestLogger,
  logWithContext,
  logPerformance,
  logError,
  logUserOperation,
  logCashFlowOperation,
  logFileUpload,
  logValidationError,
  logAuthEvent,
  logDatabaseQuery
};

export default logger;