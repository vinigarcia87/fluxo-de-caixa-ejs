// Configurar variáveis de ambiente ANTES de tudo
const config = require('./config/environment');

// Imports principais
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Middleware de segurança e logging
const {
  helmetConfig,
  generalLimiter,
  compressionConfig,
  sanitizeHeaders,
  validateOrigin,
  logSuspiciousActivity
} = require('./middleware/security');

const {
  getSessionConfig,
  flashMessages,
  sessionLocals,
  cleanupSession
} = require('./middleware/session');

const { requestLogger, logger } = require('./utils/logger');
const { globalErrorHandler, notFound } = require('./utils/errorHandler');

// Validar configuração de ambiente
const { validateEnv } = require('../config/env-validator');
validateEnv();

// Routes
const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const fluxoCaixaRouter = require('./routes/fluxo-caixa');

// Criar aplicação Express
const app = express();

// ============================================================================
// CONFIGURAÇÃO BÁSICA
// ============================================================================

// View engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Trust proxy (para rate limiting e logging corretos)
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE DE SEGURANÇA
// ============================================================================

// Headers de segurança
app.use(sanitizeHeaders);

// Helmet para security headers
app.use(helmetConfig);

// Compressão
app.use(compressionConfig);

// Rate limiting geral
if (config.isProduction) {
  app.use(generalLimiter);
}

// Log de atividades suspeitas
app.use(logSuspiciousActivity);

// Validação de origem
if (config.isProduction) {
  app.use(validateOrigin);
}

// ============================================================================
// MIDDLEWARE DE REQUEST PROCESSING
// ============================================================================

// Logger de requests
if (config.isDevelopment || config.get('logging.level') === 'debug') {
  app.use(requestLogger);
}

// Parse JSON e URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// ============================================================================
// SESSÃO E FLASH MESSAGES
// ============================================================================

// Configurar sessão
const session = require('express-session');
app.use(session(getSessionConfig()));

// Middleware para mensagens flash
app.use(flashMessages);

// Dados globais da sessão
app.use(sessionLocals);

// ============================================================================
// ARQUIVOS ESTÁTICOS
// ============================================================================

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: config.isProduction ? '1d' : '0', // Cache em produção
  etag: true
}));

// ============================================================================
// ROTAS PRINCIPAIS
// ============================================================================

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/fluxo-caixa', fluxoCaixaRouter);

// ============================================================================
// MIDDLEWARE DE LIMPEZA
// ============================================================================

// Limpar dados temporários da sessão
app.use(cleanupSession);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

// Capturar 404 e enviar para error handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

// ============================================================================
// TRATAMENTO DE SINAIS DO SISTEMA
// ============================================================================

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Recebido SIGTERM, iniciando shutdown graceful...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recebido SIGINT, iniciando shutdown graceful...');
  process.exit(0);
});

// Tratar erros não capturados
process.on('uncaughtException', (err) => {
  logger.error('Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

// ============================================================================
// INFORMAÇÕES DE STARTUP
// ============================================================================

if (config.isDevelopment) {
  logger.info(`🚀 ${config.app.name} v${config.app.version} iniciado`);
  logger.info(`📊 Ambiente: ${config.NODE_ENV}`);
  logger.info(`🌐 Servidor rodando na porta: ${config.PORT}`);

  // Exibir configuração em desenvolvimento
  config.displayConfig();
}

module.exports = app;